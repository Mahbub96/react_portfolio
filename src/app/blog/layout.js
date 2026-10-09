import { Source_Serif_4 } from "next/font/google";
import "@/components/blog/syntax.css";
import styles from "@/components/blog/blogTheme.module.css";

// Loaded only on blog routes (and the admin editor), never on the homepage.
const serif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-source-serif",
});

export default function BlogLayout({ children }) {
  return <div className={`${serif.variable} ${styles.theme}`}>{children}</div>;
}
