import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "تسجيل الدخول" };

// Admin login. The proxy sends a logged-in admin straight to /admin.
export default function AdminLoginPage() {
  return (
    <main className="flex min-h-svh items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <p className="font-display text-2xl tracking-[0.18em] text-gold-300" dir="ltr">
            ELSANOUR
          </p>
          <h1 className="mt-3 font-heading text-2xl font-bold">لوحة الإدارة</h1>
          <p className="mt-2 text-sm text-muted">ادخل بحساب الإدارة لرؤية الطلبات.</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
