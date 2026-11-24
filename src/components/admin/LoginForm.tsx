"use client";

import { useActionState, useState } from "react";
import { login, type LoginState } from "@/app/admin/actions";
import { AlertIcon } from "../icons";

const input =
  "block h-13 w-full border border-ivory/15 bg-noir-800 px-4 text-base text-ivory outline-none transition-colors focus:border-gold-300 focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--c-gold-400)_16%,transparent)]";

// Phones like to add a capital letter or fix "spelling": not in login fields.
const noAutoFix = { autoCapitalize: "none", autoCorrect: "off", spellCheck: false } as const;

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={action} className="mt-8 flex flex-col gap-4 border border-gold-400/20 bg-noir-900 p-6">
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-semibold">
          البريد الإلكتروني
        </label>
        <input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          dir="ltr"
          autoComplete="username"
          required
          {...noAutoFix}
          className={input}
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-semibold">
          كلمة السر
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            dir="ltr"
            autoComplete="current-password"
            required
            {...noAutoFix}
            className={`${input} pr-14`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "إخفاء كلمة السر" : "إظهار كلمة السر"}
            aria-pressed={showPassword}
            className="absolute inset-y-0 right-0 flex w-13 items-center justify-center text-muted hover:text-gold-200"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
              <circle cx="12" cy="12" r="3" />
              {showPassword && <path d="M4 4l16 16" />}
            </svg>
          </button>
        </div>
      </div>
      {state.error && (
        <p role="alert" className="flex items-start gap-2 border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
          <AlertIcon className="mt-0.5 size-4 shrink-0" />
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="gem mt-2 w-full disabled:opacity-80">
        <span className="gem-face text-base">{pending ? "جارٍ الدخول…" : "دخول"}</span>
      </button>
    </form>
  );
}
