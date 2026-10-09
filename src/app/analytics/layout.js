/**
 * The analytics dashboard is an owner-only tool (its data APIs already return
 * 401 without auth). This layout only exists to keep the page itself out of
 * search results — it is a client component, so it cannot export metadata.
 */
export const metadata = {
  title: "Analytics",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function AnalyticsLayout({ children }) {
  return children;
}
