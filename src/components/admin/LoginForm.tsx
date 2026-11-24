"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/app/admin/actions";
import { AlertIcon } from "../icons";

const input =
  "block h-13 w-full border border-ivory/15 bg-noir-800 px-4 text-base text-ivory outline-none transition-colors focus:border-gold-300 focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--c-gold-400)_16%,transparent)]";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={action} className="mt-8 flex flex-col gap-4 border border-gold-400/20 bg-noir-900 p-6">
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-semibold">
          البريد الإلكتروني
        </label>
        <input id="email" name="email" type="email" dir="ltr" autoComplete="username" required className={input} />
      </div>
      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-semibold">
          كلمة السر
        </label>
        <input
          id="password"
          name="password"
          type="password"
          dir="ltr"
          autoComplete="current-password"
          required
          className={input}
        />
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
