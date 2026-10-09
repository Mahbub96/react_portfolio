import Link from "next/link";

/**
 * Custom 404.
 *
 * Exists mainly for crawlers: Next itself injects `<meta name="robots"
 * content="noindex">` for not-found responses, and this page adds nothing
 * that contradicts it (no canonical, no inherited "index, follow", no
 * JSON-LD). It also gives visitors a way back into the site instead of a
 * dead end.
 */
export const metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <main
      className="container"
      style={{ minHeight: "60vh", padding: "8rem 1.5rem 4rem", textAlign: "center" }}
    >
      <h1>Page not found</h1>
      <p style={{ color: "var(--text-secondary)", margin: "1rem 0 2rem" }}>
        The page you were looking for does not exist or has moved.
      </p>
      <nav aria-label="Helpful links" style={{ display: "flex", gap: "1.5rem", justifyContent: "center", flexWrap: "wrap" }}>
        <Link href="/">Home</Link>
        <Link href="/projects/">Projects</Link>
        <Link href="/resume/">Resume</Link>
        <Link href="/contact/">Contact</Link>
      </nav>
    </main>
  );
}
