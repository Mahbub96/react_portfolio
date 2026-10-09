import { Source_Serif_4 } from "next/font/google";
import "@/components/blog/syntax.css";
import blogTheme from "@/components/blog/blogTheme.module.css";

// The editor shows posts in the same typography as the public blog.
// Variable font (one file per style) and not preloaded: it is only fetched
// when a post or block actually uses the serif presets, so it never competes
// with the cover image for bandwidth.
const serif = Source_Serif_4({
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
  variable: "--font-source-serif",
});

export const metadata = {
  title: { default: "Admin", template: "%s · Admin" },
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }) {
  return <div className={`${serif.variable} ${blogTheme.theme}`}>{children}</div>;
}
