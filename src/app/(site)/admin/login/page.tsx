import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { safeAdminRedirect, secondsUntilExpiry, SESSION_COOKIE } from "@/lib/auth/session";
import { LoginForm } from "./LoginForm";
import styles from "./login.module.css";

export const metadata: Metadata = { title: "Sign in" };

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const next = safeAdminRedirect(params.next);
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (token && secondsUntilExpiry(token) > 0 && !params.expired) {
    redirect(next);
  }

  return (
    <main className={styles.page}>
      <section className={styles.panel} aria-labelledby="login-title">
        <Logo href="/" />
        <div className={styles.heading}>
          <h1 id="login-title">Admin sign in</h1>
          <p>Manage enquiries, content and settings for the Jovens Buzz website.</p>
        </div>
        <LoginForm next={next} expired={Boolean(params.expired)} />
        <p className={styles.secure}>
          <ShieldCheck size={16} aria-hidden /> Authorised staff only. Sign-in attempts are rate limited and audited.
        </p>
      </section>
      <aside className={styles.aside} aria-hidden>
        <div className={styles.asideInner}>
          <p className="eyebrow">Jovens Buzz</p>
          <p className={styles.asideTitle}>Every enquiry, in one place.</p>
          <p className={styles.asideText}>Track leads from first message to signed client, with every change recorded.</p>
        </div>
      </aside>
    </main>
  );
}
