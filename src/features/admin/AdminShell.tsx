"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Bell,
  ChartColumn,
  ChevronDown,
  FileText,
  Inbox,
  KeyRound,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircleQuestion,
  Search,
  Settings,
  TriangleAlert,
  X,
} from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { CSRF_HEADER } from "@/lib/auth/session";
import { formatDateTime } from "@/lib/format";
import type { EnquirySummary } from "@/types/api";
import styles from "./admin.module.css";

const NAV = [
  { href: "/admin", label: "Overview", Icon: LayoutDashboard, exact: true },
  { href: "/admin/enquiries", label: "Enquiries", Icon: Inbox },
  { href: "/admin/services", label: "Services", Icon: Layers },
  { href: "/admin/faqs", label: "FAQs", Icon: MessageCircleQuestion },
  { href: "/admin/content", label: "Website Content", Icon: FileText },
  { href: "/admin/analytics", label: "Analytics", Icon: ChartColumn },
  { href: "/admin/settings", label: "Settings", Icon: Settings },
];

interface ShellProps {
  admin: { displayName: string; username: string; email: string; mustChangePassword: boolean };
  notifications: { newEnquiries: number; syncFailed: number; recent: EnquirySummary[] };
  children: React.ReactNode;
}

export function AdminShell({ admin, notifications, children }: ShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // Close the mobile drawer after navigation (state reset during render, not in an effect)
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setSidebarOpen(false);
  }

  const isActive = (href: string, exact?: boolean) => (exact ? pathname === href : pathname.startsWith(href));

  const logout = async () => {
    setSigningOut(true);
    await fetch("/api/auth/logout", { method: "POST", headers: { [CSRF_HEADER]: "1" } }).catch(() => undefined);
    // Full navigation: guarantees no cached admin UI survives sign-out
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign("/admin/login");
  };

  const onSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = new FormData(event.currentTarget).get("q")?.toString().trim() ?? "";
    router.push(query ? `/admin/enquiries?search=${encodeURIComponent(query)}` : "/admin/enquiries");
  };

  const initials = admin.displayName
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const notificationCount = notifications.newEnquiries + (notifications.syncFailed > 0 ? 1 : 0);

  return (
    <div className={styles.shell}>
      <a href="#admin-main" className="skip-link">
        Skip to content
      </a>

      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""}`} aria-label="Admin navigation">
        <div className={styles.sidebarHead}>
          <Logo href="/admin" tone="light" />
          <button type="button" className={styles.sidebarClose} onClick={() => setSidebarOpen(false)} aria-label="Close navigation">
            <X size={20} aria-hidden />
          </button>
        </div>
        <nav>
          <ul className={styles.navList}>
            {NAV.map(({ href, label, Icon, exact }) => (
              <li key={href}>
                <Link href={href} className={styles.navLink} aria-current={isActive(href, exact) ? "page" : undefined}>
                  <Icon size={19} aria-hidden />
                  {label}
                  {href === "/admin/enquiries" && notifications.newEnquiries > 0 && (
                    <span className={styles.navBadge}>
                      {notifications.newEnquiries}
                      <span className="visually-hidden"> new</span>
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.sidebarFoot}>
          <button type="button" className={styles.navLink} onClick={logout} disabled={signingOut}>
            <LogOut size={19} aria-hidden />
            {signingOut ? "Signing out…" : "Logout"}
          </button>
          <Link href="/" className={styles.viewSite} target="_blank">
            View website ↗
          </Link>
        </div>
      </aside>
      {sidebarOpen && <div className={styles.scrim} onClick={() => setSidebarOpen(false)} aria-hidden />}

      <div className={styles.main}>
        <header className={styles.topbar}>
          <button type="button" className={styles.menuButton} onClick={() => setSidebarOpen(true)} aria-label="Open navigation">
            <Menu size={20} aria-hidden />
          </button>
          <form role="search" className={styles.search} onSubmit={onSearch}>
            <Search size={18} aria-hidden />
            <label htmlFor="admin-search" className="visually-hidden">
              Search enquiries
            </label>
            <input id="admin-search" name="q" type="search" placeholder="Search enquiries by name, email, company or ID…" />
          </form>
          <div className={styles.topbarActions}>
            <Dropdown
              label={`Notifications${notificationCount ? `, ${notificationCount} new` : ""}`}
              trigger={
                <span className={styles.iconButton}>
                  <Bell size={20} aria-hidden />
                  {notificationCount > 0 && <span className={styles.dot} aria-hidden />}
                </span>
              }
            >
              <div className={styles.menuHeader}>Notifications</div>
              {notifications.syncFailed > 0 && (
                <Link href="/admin/settings#integrations" className={styles.menuItem}>
                  <TriangleAlert size={16} aria-hidden className={styles.warnIcon} />
                  <span>
                    {notifications.syncFailed} enquir{notifications.syncFailed === 1 ? "y" : "ies"} not synced to Google Sheets
                  </span>
                </Link>
              )}
              {notifications.recent.map((enquiry) => (
                <Link key={enquiry.id} href={`/admin/enquiries/${enquiry.id}`} className={styles.menuItem}>
                  <Inbox size={16} aria-hidden />
                  <span>
                    <strong>{enquiry.fullName}</strong> — {enquiry.serviceInterest}
                    <small>{formatDateTime(enquiry.createdAt)}</small>
                  </span>
                </Link>
              ))}
              {notifications.recent.length === 0 && notifications.syncFailed === 0 && (
                <p className={styles.menuEmpty}>You&apos;re all caught up.</p>
              )}
              {notifications.newEnquiries > 0 && (
                <Link href="/admin/enquiries?status=NEW" className={styles.menuFooter}>
                  View all {notifications.newEnquiries} new enquiries
                </Link>
              )}
            </Dropdown>

            <Dropdown
              label="Account menu"
              trigger={
                <span className={styles.profile}>
                  <span className={styles.avatar} aria-hidden>
                    {initials}
                  </span>
                  <span className={styles.profileText}>
                    <strong>{admin.displayName}</strong>
                    <small>{admin.username}</small>
                  </span>
                  <ChevronDown size={16} aria-hidden />
                </span>
              }
            >
              <div className={styles.menuHeader}>
                {admin.displayName}
                <small>{admin.email}</small>
              </div>
              <Link href="/admin/settings" className={styles.menuItem}>
                <Settings size={16} aria-hidden /> Profile &amp; settings
              </Link>
              <Link href="/admin/settings#password" className={styles.menuItem}>
                <KeyRound size={16} aria-hidden /> Change password
              </Link>
              <button type="button" className={styles.menuItem} onClick={logout}>
                <LogOut size={16} aria-hidden /> Logout
              </button>
            </Dropdown>
          </div>
        </header>

        {admin.mustChangePassword && (
          <div className={`alert alert-warning ${styles.banner}`} role="status">
            <KeyRound size={18} aria-hidden />
            <span>
              You are using the initial bootstrap password. <Link href="/admin/settings#password">Change it now</Link> before
              using this site in production.
            </span>
          </div>
        )}

        <main id="admin-main" className={styles.content} tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}

/** Small accessible disclosure menu (closes on outside click and Escape). */
function Dropdown({ label, trigger, children }: { label: string; trigger: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }
  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        ref.current?.querySelector<HTMLButtonElement>("button")?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className={styles.dropdown} ref={ref}>
      <button type="button" className={styles.dropdownTrigger} aria-expanded={open} aria-label={label} onClick={() => setOpen((v) => !v)}>
        {trigger}
      </button>
      {open && <div className={styles.menu}>{children}</div>}
    </div>
  );
}
