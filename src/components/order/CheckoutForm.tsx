"use client";

import Link from "next/link";
import { startTransition, useActionState, useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import type { OrderState } from "@/app/[lang]/checkout/actions";
import type { Product } from "@/data/products";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { removeFromCart, useCart, useCartReady } from "@/lib/cart";
import { track } from "@/lib/pixel";
import { cartPayload, cartSubtotal, resolveCart } from "@/lib/cartProducts";
import { computeTotals, fieldErrors, orderSchema, type DeliverySettings, type OrderField } from "@/lib/order";
import { fill, formatPrice } from "@/lib/site";
import { BasketIcon } from "../cart/BasketIcon";
import { BasketLines } from "../cart/BasketLines";
import { FreeDeliveryMeter } from "../cart/FreeDeliveryMeter";
import { TrustRow } from "../cart/TrustRow";
import { AlertIcon, ChevronDownIcon, HomeIcon, NoteIcon, PhoneIcon, ShieldIcon, UserIcon } from "../icons";
import { CityCombobox } from "./CityCombobox";
import { fieldIcon, fieldInput, fieldLabel } from "./fieldStyles";

type Props = {
  /** Visible products (from the server). */
  catalog: Product[];
  action: (state: OrderState, formData: FormData) => Promise<OrderState>;
  locale: Locale;
  t: Dictionary["order"];
  tb: Dictionary["basket"];
  categoryNames: Dictionary["collections"]["items"];
  settings: DeliverySettings;
};

type Values = { name: string; phone: string; city: string; address: string; note: string };

const FIELD_ORDER: OrderField[] = ["name", "phone", "city", "address", "note"];

/**
 * Cash-on-delivery checkout for the whole basket. Checks the fields in the browser first
 * (instant messages), then the server checks everything again, saves the order with all
 * its products and opens the thank-you page.
 */
export function CheckoutForm({ catalog, action, locale, t, tb, categoryNames, settings }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const [values, setValues] = useState<Values>({ name: "", phone: "", city: "", address: "", note: "" });
  const [errors, setErrors] = useState<Partial<Record<OrderField, string>>>({});
  const [clientInvalid, setClientInvalid] = useState(false);
  const sending = useRef(false);

  const ready = useCartReady();
  const lines = resolveCart(useCart(), catalog);
  const pieces = lines.reduce((n, l) => n + l.qty, 0);

  // Allow a new try once the previous one has finished (e.g. after a server error).
  useEffect(() => {
    if (!pending) sending.current = false;
  }, [pending]);

  // Meta Pixel "InitiateCheckout", once, when the checkout opens with products in it.
  const checkoutTracked = useRef(false);
  useEffect(() => {
    if (!ready || lines.length === 0 || checkoutTracked.current) return;
    checkoutTracked.current = true;
    // Not cancelled on re-render (the guard above makes it run only once).
    window.setTimeout(
      () =>
        track("InitiateCheckout", {
          content_ids: lines.map((l) => l.product.slug),
          content_type: "product",
          num_items: lines.reduce((n, l) => n + l.qty, 0),
          value: cartSubtotal(lines),
          currency: "MAD",
        }),
      600,
    );
  }, [ready, lines]);

  // The server says some products can no longer be ordered: take them out of the basket.
  useEffect(() => {
    state.unavailable?.forEach((key) => {
      const [slug, color] = key.split("|");
      removeFromCart(slug, color || undefined);
    });
  }, [state]);

  const { subtotal, deliveryFee, total } = computeTotals(cartSubtotal(lines), values.city, settings);
  const hasCity = values.city.trim().length >= 2;
  const price = (n: number) => formatPrice(n, locale);

  // Errors from the browser check, or else from the server.
  const shown: Partial<Record<OrderField, string>> =
    Object.keys(errors).length > 0 ? errors : pending ? {} : (state.fields ?? {});
  const formError = clientInvalid ? "form" : pending ? undefined : state.formError;

  const set = (field: keyof Values) => (value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    setErrors((e) => {
      if (!e[field]) return e;
      const next = { ...e };
      delete next[field];
      return next;
    });
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pending || sending.current || lines.length === 0) return; // no double submit

    const parsed = orderSchema.safeParse(values);
    if (!parsed.success) {
      const found = fieldErrors(parsed.error);
      setErrors(found);
      setClientInvalid(true);
      const first = FIELD_ORDER.find((f) => found[f]);
      if (first) document.getElementById(`order-${first}`)?.focus();
      return;
    }

    setErrors({});
    setClientInvalid(false);
    sending.current = true;
    const formData = new FormData(e.currentTarget);
    startTransition(() => formAction(formData));
  };

  const errorText = (field: OrderField) => {
    const key = shown[field] as keyof Dictionary["order"]["errors"] | undefined;
    return key ? (t.errors[key] ?? t.errors.form) : undefined;
  };

  const describe = (field: OrderField, hint = false) =>
    (shown[field] ? `order-${field}-error` : hint ? `order-${field}-hint` : "") || undefined;

  // Before the basket is read from the phone: a quiet placeholder (no "empty" flash).
  if (!ready) return <div aria-hidden="true" className="mt-8 h-96 animate-pulse rounded-none bg-noir-800/50" />;

  if (lines.length === 0) {
    return (
      <div className="mt-8 flex flex-col items-center gap-2 rounded-none border border-gold-400/15 bg-noir-800/60 px-6 py-14 text-center">
        <span className="mb-2 flex size-20 items-center justify-center bg-noir-900 ring-1 ring-gold-400/20">
          <BasketIcon className="size-11" />
        </span>
        <p className="font-heading text-xl font-bold text-ivory">{tb.empty}</p>
        <p className="max-w-xs text-sm leading-6 text-muted">
          {state.formError === "unavailable" ? t.errors.unavailable : tb.emptyHint}
        </p>
        <Link href={`/${locale}#collections`} className="gem gem-sm mt-4">
          <span className="gem-face">{tb.browse}</span>
        </Link>
      </div>
    );
  }

  const deliveryText = !hasCity ? t.deliveryPick : deliveryFee === 0 ? t.deliveryFree : price(deliveryFee);

  const summaryBody = (
    <>
      <BasketLines lines={lines} locale={locale} t={tb} categoryNames={categoryNames} />
      <div className="border-t border-gold-400/10 pt-5">
        <FreeDeliveryMeter subtotal={subtotal} threshold={settings.freeDeliveryThreshold} locale={locale} t={tb} />
      </div>
      <dl className="mt-5 space-y-2.5 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted">{fill(t.subtotal, { n: pieces })}</dt>
          <dd className="text-ivory tabular-nums">{price(subtotal)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">{t.delivery}</dt>
          <dd className={deliveryFee === 0 && hasCity ? "font-semibold text-gold-200" : "text-ivory tabular-nums"}>
            {deliveryText}
          </dd>
        </div>
        {!hasCity && (settings.freeDeliveryThreshold === null || subtotal < settings.freeDeliveryThreshold) && (
          <p className="text-xs leading-5 text-muted">
            {fill(t.deliveryRates, {
              casa: price(settings.deliveryFeeCasablanca),
              other: price(settings.deliveryFeeOther),
            })}
          </p>
        )}
        <div className="flex items-baseline justify-between gap-4 border-t border-gold-400/15 pt-4">
          <dt className="font-semibold text-ivory">{t.total}</dt>
          <dd aria-live="polite" className="font-heading text-2xl font-bold text-gold-200 tabular-nums">
            {hasCity ? price(total) : `${price(subtotal)} +`}
          </dd>
        </div>
      </dl>
    </>
  );

  return (
    <div className="mt-8 grid gap-6 md:grid-cols-[minmax(0,1fr)_24rem] md:items-start md:gap-12">
      {/* Phones: the summary folds into one bar that shows the total. */}
      <details className="group rounded-none border border-gold-400/15 bg-noir-800/60 md:hidden">
        <summary className="flex min-h-15 cursor-pointer list-none items-center justify-between gap-3 px-4 [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-2.5 text-sm font-semibold text-gold-300">
            <BasketIcon className="size-7" />
            {t.summary}
            <span className="font-normal text-muted">({fill(tb.countChip, { n: pieces })})</span>
            <ChevronDownIcon className="size-4 transition-transform duration-300 group-open:rotate-180" />
          </span>
          <span className="font-heading text-lg font-bold text-ivory tabular-nums">
            {price(hasCity ? total : subtotal)}
          </span>
        </summary>
        <div className="border-t border-gold-400/10 px-4 pb-5">{summaryBody}</div>
      </details>

      {/* Computers: the summary stays visible beside the form. */}
      <aside
        aria-labelledby="order-summary-title"
        className="hidden rounded-none border border-gold-400/15 bg-noir-800/60 p-6 md:sticky md:top-24 md:order-2 md:block"
      >
        <h2 id="order-summary-title" className="flex items-center gap-2.5 font-heading text-xl font-bold text-ivory">
          <BasketIcon className="size-8" />
          {t.summary}
        </h2>
        {summaryBody}
      </aside>

      <form id="order-form" noValidate onSubmit={onSubmit} className="flex flex-col gap-8 md:order-1">
        <Section step={1} title={t.sectionContact}>
          <Field id="order-name" error={errorText("name")}>
            <input
              id="order-name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder=" "
              aria-invalid={!!shown.name || undefined}
              aria-describedby={describe("name")}
              value={values.name}
              onChange={(e) => set("name")(e.target.value)}
              className={fieldInput(!!shown.name)}
            />
            <FieldDecor id="order-name" label={t.fields.name} Icon={UserIcon} />
          </Field>

          <Field id="order-phone" hint={t.hints.phone} error={errorText("phone")}>
            <input
              id="order-phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              dir="ltr"
              placeholder=" "
              aria-invalid={!!shown.phone || undefined}
              aria-describedby={describe("phone", true)}
              value={values.phone}
              onChange={(e) => set("phone")(e.target.value)}
              className={`${fieldInput(!!shown.phone, false, locale === "ar")} tracking-wide`}
            />
            <FieldDecor id="order-phone" label={t.fields.phone} Icon={PhoneIcon} />
          </Field>
        </Section>

        <Section step={2} title={t.sectionDelivery}>
          <Field id="order-city" error={errorText("city")}>
            <CityCombobox
              id="order-city"
              name="city"
              label={t.fields.city}
              value={values.city}
              onChange={set("city")}
              locale={locale}
              listLabel={t.cityList}
              notListedText={t.cityNotListed}
              invalid={!!shown.city}
              describedBy={describe("city")}
            />
          </Field>

          <Field id="order-address" hint={t.hints.address} error={errorText("address")}>
            <textarea
              id="order-address"
              name="address"
              rows={2}
              autoComplete="street-address"
              placeholder=" "
              aria-invalid={!!shown.address || undefined}
              aria-describedby={describe("address", true)}
              value={values.address}
              onChange={(e) => set("address")(e.target.value)}
              className={fieldInput(!!shown.address, true)}
            />
            <FieldDecor id="order-address" label={t.fields.address} Icon={HomeIcon} multiline />
          </Field>

          <Field id="order-note" hint={t.hints.note} error={errorText("note")}>
            <textarea
              id="order-note"
              name="note"
              rows={2}
              placeholder=" "
              aria-invalid={!!shown.note || undefined}
              aria-describedby={describe("note", true)}
              value={values.note}
              onChange={(e) => set("note")(e.target.value)}
              className={fieldInput(!!shown.note, true)}
            />
            <FieldDecor id="order-note" label={`${t.fields.note} ${t.optional}`} Icon={NoteIcon} multiline />
          </Field>
        </Section>

        <input
          type="hidden"
          name="items"
          value={JSON.stringify(cartPayload(lines))}
        />

        {/* Honeypot: invisible to people, bots fill it and are ignored. */}
        <div aria-hidden="true" className="pointer-events-none fixed top-0 size-px overflow-hidden opacity-0">
          <label htmlFor="order-company">Company</label>
          <input id="order-company" name="company" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
        </div>

        <div>
          {formError && (
            <p
              role="alert"
              className="mb-4 flex items-start gap-2.5 rounded-none border border-danger/40 bg-danger/10 px-4 py-3 text-sm leading-6 text-danger"
            >
              <AlertIcon className="mt-1 size-4 shrink-0" />
              {t.errors[formError as keyof Dictionary["order"]["errors"]] ?? t.errors.server}
            </p>
          )}
          <button
            type="submit"
            disabled={pending}
            aria-busy={pending || undefined}
            className="gem w-full disabled:cursor-wait disabled:opacity-80"
          >
            <span className="gem-face text-base">
              {pending ? (
                <>
                  <span
                    aria-hidden="true"
                    className="size-4 animate-spin rounded-full border-2 border-current border-e-transparent"
                  />
                  {t.sending}
                </>
              ) : (
                <>
                  {t.submit}
                  <span aria-hidden="true" className="opacity-60">
                    ·
                  </span>
                  <span className="tabular-nums">{price(hasCity ? total : subtotal)}</span>
                </>
              )}
            </span>
          </button>
          <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs leading-5 text-muted">
            <ShieldIcon className="size-4 shrink-0 text-gold-400" />
            {t.secure}
          </p>
          <div className="mt-5 border-t border-gold-400/10 pt-5">
            <TrustRow t={tb} />
          </div>
        </div>
      </form>
    </div>
  );
}

/** A numbered group of fields: "1 · Your details", "2 · Delivery address". */
function Section({ step, title, children }: { step: number; title: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="mb-4 flex w-full items-center gap-3">
        <span className="flex size-7 items-center justify-center border border-gold-400/50 font-display text-sm text-gold-300">
          {step}
        </span>
        <span className="font-heading text-lg font-bold text-ivory">{title}</span>
        <span
          aria-hidden="true"
          className="h-px flex-1 bg-gradient-to-r from-gold-400/25 to-transparent rtl:bg-gradient-to-l"
        />
      </legend>
      {children}
    </fieldset>
  );
}

/** Field wrapper: the input + its hint or error line (linked by id for screen readers). */
function Field({ id, hint, error, children }: { id: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <div className="relative">{children}</div>
      {error ? (
        <p id={`${id}-error`} className="mt-2 flex items-start gap-1.5 ps-1 text-[13px] leading-5 font-semibold text-danger">
          <AlertIcon className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="mt-2 ps-1 text-xs leading-5 text-muted">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

/** Icon + floating label placed after the input (so they can react to its focus/filled state). */
function FieldDecor({
  id,
  label,
  Icon,
  multiline = false,
}: {
  id: string;
  label: string;
  Icon: ComponentType<{ className?: string }>;
  multiline?: boolean;
}) {
  return (
    <>
      <Icon className={fieldIcon(multiline)} />
      <label htmlFor={id} className={fieldLabel(multiline)}>
        {label}
      </label>
    </>
  );
}
