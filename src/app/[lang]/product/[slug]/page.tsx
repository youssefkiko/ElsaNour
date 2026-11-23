import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderButton } from "@/components/catalog/OrderButton";
import { Price } from "@/components/catalog/Price";
import { ProductCard } from "@/components/catalog/ProductCard";
import { ProductGallery } from "@/components/catalog/ProductGallery";
import { ProductPlaceholder } from "@/components/catalog/ProductPlaceholder";
import { CashIcon, GiftIcon, TruckIcon } from "@/components/icons";
import { activeProducts, discountPercent, getProduct, productsInCategory } from "@/data/products";
import { getDictionary } from "@/i18n/dictionaries";
import { categoryHref } from "@/lib/categories";
import { fill, formatPrice } from "@/lib/site";

// Known products are prerendered; an unknown slug shows the friendly 404 page.
export const instant = false;

export async function generateStaticParams() {
  return activeProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const { locale, dict } = await getDictionary();
  const product = getProduct(slug);
  if (!product) return {};
  return {
    title: `${product.name[locale]} | Elsanour`,
    description: dict.catalog.blurb[product.category],
  };
}

// Product page: gallery, name, price, what is inside, delivery note, order button.
export default async function ProductPage({ params }: PageProps<"/[lang]/product/[slug]">) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  const { locale, dict } = await getDictionary();

  const name = product.name[locale];
  const categoryName = dict.collections.items[product.category];
  const off = discountPercent(product);
  const related = productsInCategory(product.category).filter((p) => p.slug !== product.slug).slice(0, 3);

  // 3 placeholder slides until the real photos are added.
  const slides =
    product.images.length > 0
      ? product.images.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt={`${name} ${i + 1}`}
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
      <Link
        href={categoryHref(locale, product.category)}
        className="inline-flex min-h-11 items-center gap-2 text-sm text-gold-300 hover:text-gold-200"
      >
        <span aria-hidden="true" className="rtl:rotate-180">←</span>
        {fill(dict.product.back, { category: categoryName })}
      </Link>

      <div className="mt-4 grid gap-8 md:grid-cols-2 md:gap-12">
        <ProductGallery photoLabel={dict.product.photo}>{slides}</ProductGallery>

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

          <p className="mt-4 text-base leading-8 text-muted">{dict.catalog.blurb[product.category]}</p>

          <OrderButton
            label={dict.product.order}
            soonMessage={dict.product.orderSoon}
            outOfStockLabel={dict.product.outOfStock}
            inStock={product.inStock}
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
          </section>
        </div>
      </div>

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
