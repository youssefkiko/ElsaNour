import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { OrderButton } from "@/components/catalog/OrderButton";
import { ColorGallery, ColorPicker, ColorProvider } from "@/components/catalog/ProductColors";
import { PixelEvent } from "@/components/MetaPixel";
import { Price } from "@/components/catalog/Price";
import { ProductCard } from "@/components/catalog/ProductCard";
import { ProductGallery } from "@/components/catalog/ProductGallery";
import { ProductPlaceholder } from "@/components/catalog/ProductPlaceholder";
import { CashIcon, GiftIcon, TruckIcon } from "@/components/icons";
import { discountPercent, mainImage } from "@/data/products";
import { getCatalog, getProduct, productsInCategory } from "@/lib/catalog";
import { getDictionary } from "@/i18n/dictionaries";
import { categoryHref } from "@/lib/categories";
import { getDeliverySettings } from "@/lib/settings";
import { breadcrumbJsonLd, productJsonLd } from "@/lib/jsonLd";
import { pageMetadata } from "@/lib/seo";
import { fill, formatPrice } from "@/lib/site";

// Known products are prerendered; an unknown slug shows the friendly 404 page.
export const instant = false;

export async function generateStaticParams() {
  return (await getCatalog()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const { locale, dict } = await getDictionary();
  const product = await getProduct(slug);
  if (!product) return {};
  const name = product.name[locale];
  const description = `${formatPrice(product.price, locale)} · ${product.description[locale] ?? dict.catalog.blurb[product.category]} ${dict.meta.suffix}`;
  return pageMetadata({
    locale,
    path: `/product/${product.slug}`,
    title: `${name} | Elsanour`,
    description: description.length > 200 ? `${description.slice(0, 197)}…` : description,
    // The product photo is the share preview on WhatsApp / Instagram / Facebook.
    images: [mainImage(product)].filter((u): u is string => !!u).map((url) => ({ url, alt: name })),
  });
}

// Product page: gallery, name, price, what is inside, delivery note, order button.
export default async function ProductPage({ params }: PageProps<"/[lang]/product/[slug]">) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  const { locale, dict } = await getDictionary();

  const name = product.name[locale];
  const categoryName = dict.collections.items[product.category];
  const off = discountPercent(product);
  const related = (await productsInCategory(product.category)).filter((p) => p.slug !== product.slug).slice(0, 3);
  const delivery = await getDeliverySettings();
  const freeFrom = delivery.freeDeliveryThreshold;
  const description = product.description[locale] ?? dict.catalog.blurb[product.category];

  // 3 placeholder slides until the real photos are added.
  const slides =
    product.images.length > 0
      ? product.images.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt={`${name} – ${categoryName} Elsanour ${i + 1}`}
            fill
            preload={i === 0}
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        ))
      : [0, 1, 2].map((i) => (
          <ProductPlaceholder
            key={i}
            category={product.category}
            index={i}
            label={dict.product.photoSoon}
            className="absolute inset-0"
          />
        ));

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-6 pb-28 sm:px-6 md:pb-16">
      {/* Product card for Google: photo, price, "in stock", delivery in Morocco. */}
      <JsonLd
        data={productJsonLd({
          product,
          locale,
          name,
          description,
          categoryName,
          deliveryFee: Math.max(delivery.deliveryFeeCasablanca, delivery.deliveryFeeOther),
          deliveryFreeFrom: freeFrom,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Elsanour", path: `/${locale}` },
          { name: categoryName, path: categoryHref(locale, product.category) },
          { name, path: `/${locale}/product/${product.slug}` },
        ])}
      />
      <PixelEvent
        event="ViewContent"
        params={{ content_ids: [product.slug], content_type: "product", content_name: product.name.ar, value: product.price, currency: "MAD" }}
      />
      <Link
        href={categoryHref(locale, product.category)}
        className="inline-flex min-h-11 items-center gap-2 text-sm text-gold-300 hover:text-gold-200"
      >
        <span aria-hidden="true" className="rtl:rotate-180">←</span>
        {fill(dict.product.back, { category: categoryName })}
      </Link>

      <ColorProvider colors={product.colors}>
      <div className="mt-4 grid gap-8 md:grid-cols-2 md:gap-12">
        {product.colors.length > 0 ? (
          <ColorGallery
            slug={product.slug}
            name={`${name} – ${categoryName} Elsanour`}
            locale={locale}
            category={product.category}
            fallbackImages={product.images}
            photoLabel={dict.product.photo}
            photoSoon={dict.product.photoSoon}
          />
        ) : (
          <ProductGallery photoLabel={dict.product.photo} flySource={product.slug}>
            {slides}
          </ProductGallery>
        )}

        <div>
          <p className="text-sm font-semibold text-gold-400">{categoryName}</p>
          <h1 className="mt-2 font-heading text-3xl font-bold text-ivory sm:text-4xl">{name}</h1>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Price locale={locale} price={product.price} compareAt={product.compareAt} size="lg" />
            {off > 0 && (
              <span className="gem gem-chip">
                <span className="gem-face text-sm">{fill(dict.product.save, { n: off })}</span>
              </span>
            )}
          </div>

          <p className="mt-4 text-base leading-8 whitespace-pre-line text-muted">{description}</p>

          <ColorPicker locale={locale} labels={{ color: dict.basket.color, soldOut: dict.basket.soldOutColor }} />

          <OrderButton
            slug={product.slug}
            price={product.price}
            inStock={product.inStock}
            labels={{
              add: dict.basket.add,
              added: dict.basket.added,
              max: dict.basket.max,
              full: dict.basket.full,
              outOfStock: dict.product.outOfStock,
            }}
            priceText={formatPrice(product.price, locale)}
          />

          <section className="mt-6 rounded-2xl border border-gold-400/15 bg-noir-800 p-5">
            <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-ivory">
              <GiftIcon className="size-5 text-gold-300" />
              {dict.product.inside}
            </h2>
            <ul className="mt-3 flex flex-col gap-2">
              {product.includes.map((item) => (
                <li key={item} className="flex items-center gap-3 text-ivory/90">
                  <span aria-hidden="true" className="size-1.5 rotate-45 bg-gold-400" />
                  {dict.product.items[item]}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-4 rounded-2xl border border-gold-400/15 bg-noir-800 p-5">
            <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-ivory">
              <TruckIcon className="size-5 text-gold-300" />
              {dict.product.deliveryTitle}
            </h2>
            <p className="mt-2 flex items-start gap-2 text-sm leading-7 text-muted">
              <CashIcon className="mt-1 size-5 shrink-0 text-gold-300" />
              {dict.product.deliveryText}
            </p>
            {freeFrom !== null && (
              <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-gold-200">
                <GiftIcon className="size-5 shrink-0 text-gold-300" />
                {fill(dict.basket.freeFrom, { amount: formatPrice(freeFrom, locale) })}
              </p>
            )}
          </section>
        </div>
      </div>
      </ColorProvider>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-center font-heading text-2xl font-bold text-ivory">{dict.product.more}</h2>
          <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-6">
            {related.map((p) => (
              <li key={p.slug}>
                <ProductCard locale={locale} dict={dict} product={p} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
