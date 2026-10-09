"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LuChartBar, LuExternalLink, LuFileText, LuLogOut, LuMoon, LuSun } from "react-icons/lu";
import { useTheme } from "@/contexts/ThemeContext";
import { useDataContext } from "@/contexts/useAllContext";
import { AdminUIProvider } from "./AdminUI";
import styles from "./admin.module.css";

export default function AdminShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isDarkMode, toggleTheme } = useTheme();
  const { logout } = useDataContext();

  // The editor and the preview run full-screen with their own bars.
  const isEditor =
    (/^\/admin\/posts\/[^/]+\/?$/.test(pathname || "") && !pathname.endsWith("/new/")) ||
    pathname?.startsWith("/admin/preview/");

  const signOut = async () => {
    await logout();
    router.replace("/admin/login/");
  };

  return (
    <AdminUIProvider>
      <div className={styles.shell}>
        {isEditor ? null : (
          <header className={styles.topbar}>
            <Link href="/admin/posts/" className={styles.brand}>
              <span className={styles.brandMark}>
                <span>&lt;</span>Mahbub<span>/&gt;</span>
              </span>
              <span className={styles.brandTag}>Admin</span>
            </Link>
            <nav className={styles.nav} aria-label="Admin">
              <Link
                href="/admin/posts/"
                className={`${styles.navLink} ${pathname?.startsWith("/admin/posts") ? styles.navLinkActive : ""}`}
              >
                <LuFileText aria-hidden="true" />
                <span className={styles.navLabel}>Posts</span>
              </Link>
              <Link href="/analytics/" className={styles.navLink}>
                <LuChartBar aria-hidden="true" />
                <span className={styles.navLabel}>Analytics</span>
              </Link>
            </nav>
            <div className={styles.topbarEnd}>
              <a href="/blog/" target="_blank" rel="noopener noreferrer" className={`${styles.btn} ${styles.btnGhost} ${styles.btnSmall}`}>
                <LuExternalLink aria-hidden="true" />
                <span className={styles.navLabel}>View blog</span>
              </a>
              <button
                type="button"
                className={styles.iconBtn}
                onClick={toggleTheme}
                aria-label={isDarkMode ? "Switch to light theme" : "Switch to dark theme"}
                title={isDarkMode ? "Light theme" : "Dark theme"}
              >
                {isDarkMode ? <LuSun /> : <LuMoon />}
              </button>
              <button type="button" className={styles.iconBtn} onClick={signOut} aria-label="Log out" title="Log out">
                <LuLogOut />
              </button>
            </div>
          </header>
        )}
        {children}
      </div>
    </AdminUIProvider>
  );
}
