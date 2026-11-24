"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ITEM_KEYS } from "@/data/products";
import { requireAdmin } from "@/lib/admin";
import { db, getProductRow, MAX_PHOTOS, PHOTO_BUCKET, photoUrlPrefix, slugify, uniqueSlug } from "@/lib/adminProducts";
import { categories } from "@/lib/categories";

export type ProductFormState = { error?: string; fields?: Record<string, string> };

const optionalText = (max: number, msg: string) =>
  z
    .string()
    .trim()
    .max(max, msg)
    .transform((v) => (v === "" ? null : v));

const money = (msg: string) =>
  z
    .string()
    .trim()
    .transform((v) => v.replace(",", "."))
    .refine((v) => /^\d{1,6}(\.\d{1,2})?$/.test(v) && Number(v) > 0, msg)
    .transform(Number);

const productSchema = z
  .object({
    name_ar: z.string().trim().min(2, "اكتب اسم المنتج بالعربية (حرفان على الأقل).").max(80, "الاسم طويل جدًا."),
    name_fr: optionalText(80, "الاسم الفرنسي طويل جدًا."),
    name_en: optionalText(80, "الاسم الإنجليزي طويل جدًا."),
    category: z.enum(categories, "اختر المجموعة."),
    price: money("اكتب ثمنًا صحيحًا بالدرهم، مثلًا 189."),
    compare_at: z
      .string()
      .trim()
      .transform((v) => v.replace(",", "."))
      .refine((v) => v === "" || (/^\d{1,6}(\.\d{1,2})?$/.test(v) && Number(v) > 0), "الثمن القديم غير صحيح.")
      .transform((v) => (v === "" ? null : Number(v))),
    description_ar: optionalText(1000, "الوصف طويل جدًا (1000 حرف كحد أقصى)."),
    description_fr: optionalText(1000, "الوصف طويل جدًا (1000 حرف كحد أقصى)."),
    description_en: optionalText(1000, "الوصف طويل جدًا (1000 حرف كحد أقصى)."),
    includes: z.array(z.enum(ITEM_KEYS)).max(ITEM_KEYS.length),
    images: z.array(z.string().url()).max(MAX_PHOTOS, `${MAX_PHOTOS} صور كحد أقصى.`),
    colors: z
      .array(
        z.object({
          id: z.string().regex(/^c[a-z0-9]{3,12}$/, "لون غير صالح، أعد إضافته."),
          name_ar: z.string().trim().min(1, "اكتب اسم كل لون بالعربية.").max(40, "اسم اللون طويل جدًا."),
          name_fr: optionalText(40, "اسم اللون طويل جدًا."),
          name_en: optionalText(40, "اسم اللون طويل جدًا."),
          images: z.array(z.string().url()).max(MAX_PHOTOS, `${MAX_PHOTOS} صور كحد أقصى لكل لون.`),
          in_stock: z.boolean(),
        }),
      )
      .max(12, "12 لونًا كحد أقصى."),
    in_stock: z.boolean(),
    is_active: z.boolean(),
  })
  .refine((p) => p.compare_at === null || p.compare_at > p.price, {
    path: ["compare_at"],
    message: "الثمن القديم خاصو يكون أكبر من الثمن الحالي (ولا خليه فارغ).",
  });

function readForm(formData: FormData) {
  const json = (k: string): unknown => {
    try {
      return JSON.parse(String(formData.get(k) ?? "[]"));
    } catch {
      return [];
    }
  };
  const images = json("images");
  const colors = json("colors");
  const s = (k: string) => String(formData.get(k) ?? "");
  return {
    name_ar: s("name_ar"),
    name_fr: s("name_fr"),
    name_en: s("name_en"),
    category: s("category"),
    price: s("price"),
    compare_at: s("compare_at"),
    description_ar: s("description_ar"),
    description_fr: s("description_fr"),
    description_en: s("description_en"),
    includes: formData.getAll("includes").map(String),
    images,
    colors,
    in_stock: formData.get("in_stock") === "on",
    is_active: formData.get("is_active") === "on",
  };
}

const photoPath = (url: string) => (url.startsWith(photoUrlPrefix()) ? url.slice(photoUrlPrefix().length) : null);

/** Creates a product (id = null) or saves the changes of an existing one. */
export async function saveProduct(id: string | null, _prev: ProductFormState, formData: FormData): Promise<ProductFormState> {
  await requireAdmin();
  const parsed = productSchema.safeParse(readForm(formData));
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fields[key] ??= issue.message;
    }
    return { error: "المرجو تصحيح الخانات المشار إليها.", fields };
  }
  const p = parsed.data;

  // Only photos stored in our own bucket are accepted.
  const allPhotos = [...p.images, ...p.colors.flatMap((c) => c.images)];
  if (allPhotos.some((u) => photoPath(u) === null)) return { error: "إحدى الصور غير صالحة، أعد رفعها." };
  if (new Set(p.colors.map((c) => c.name_ar)).size !== p.colors.length) {
    return { error: "المرجو تصحيح الخانات المشار إليها.", fields: { colors: "كل لون خاصو يكون عندو اسم مختلف." } };
  }

  const values = {
    name_ar: p.name_ar,
    name_fr: p.name_fr,
    name_en: p.name_en,
    category: p.category,
    price: p.price,
    compare_at: p.compare_at,
    description_ar: p.description_ar,
    description_fr: p.description_fr,
    description_en: p.description_en,
    includes: p.includes,
    images: p.images,
    colors: p.colors,
    in_stock: p.in_stock,
    is_active: p.is_active,
    updated_at: new Date().toISOString(),
  };

  let removedPhotos: string[] = [];
  if (id) {
    const before = await getProductRow(id);
    if (!before) return { error: "هذا المنتج لم يعد موجودًا." };
    const beforePhotos = [...(before.images ?? []), ...(before.colors ?? []).flatMap((c) => c.images ?? [])];
    removedPhotos = beforePhotos.filter((u) => !allPhotos.includes(u));
    const { error } = await db().from("products").update(values).eq("id", id);
    if (error) {
      console.error("[admin] product update failed:", error.message);
      return { error: "لم يتم الحفظ، حاول مرة أخرى." };
    }
  } else {
    const slug = await uniqueSlug(slugify(p.name_fr, p.name_en));
    const { data: last } = await db()
      .from("products")
      .select("sort_order")
      .eq("category", p.category)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    const { error } = await db()
      .from("products")
      .insert({ ...values, slug, sort_order: (last?.sort_order ?? 0) + 1 });
    if (error) {
      console.error("[admin] product insert failed:", error.message);
      return { error: "لم يتم الحفظ، حاول مرة أخرى." };
    }
  }

  // Photos taken out of the product are deleted from the storage too.
  const paths = removedPhotos.map(photoPath).filter((x): x is string => !!x);
  if (paths.length) await db().storage.from(PHOTO_BUCKET).remove(paths);

  updateTag("products");
  redirect("/admin/products?saved=1");
}

/** Quick switches from the list: in stock / shown on the site. */
export async function toggleProduct(id: string, field: "in_stock" | "is_active", value: boolean) {
  await requireAdmin();
  if (!["in_stock", "is_active"].includes(field)) return;
  const { error } = await db()
    .from("products")
    .update({ [field]: value, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) console.error("[admin] product toggle failed:", error.message);
  updateTag("products");
  revalidatePath("/admin/products");
}

/** Moves a product one place up or down inside its collection. */
export async function moveProduct(id: string, direction: "up" | "down") {
  await requireAdmin();
  const row = await getProductRow(id);
  if (!row) return;
  const { data, error } = await db()
    .from("products")
    .select("id, sort_order")
    .eq("category", row.category)
    .order("sort_order")
    .order("created_at");
  if (error || !data) return;
  const list = data.map((r) => r.id as string);
  const i = list.indexOf(id);
  const j = direction === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= list.length) return;
  [list[i], list[j]] = [list[j], list[i]];
  // Renumber the whole collection 1, 2, 3... (simple and always consistent).
  await Promise.all(list.map((pid, idx) => db().from("products").update({ sort_order: idx + 1 }).eq("id", pid)));
  updateTag("products");
  revalidatePath("/admin/products");
}

/**
 * A one-time upload link for a new photo. The browser shrinks the photo first, then
 * sends it straight to Supabase Storage with this link (no size limit of our server).
 */
export async function createPhotoUpload(kind: "webp" | "jpeg") {
  await requireAdmin();
  const ext = kind === "webp" ? "webp" : "jpg";
  const path = `p/${crypto.randomUUID()}.${ext}`;
  const { data, error } = await db().storage.from(PHOTO_BUCKET).createSignedUploadUrl(path);
  if (error || !data) {
    console.error("[admin] upload link failed:", error?.message);
    return { error: "تعذر تحضير رفع الصورة. هل تم تشغيل ملف SQL الخاص بالمرحلة 5؟" } as const;
  }
  return { signedUrl: data.signedUrl, publicUrl: `${photoUrlPrefix()}${path}` } as const;
}
