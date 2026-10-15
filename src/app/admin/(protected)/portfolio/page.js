import PortfolioDashboard from "@/components/admin/portfolio/PortfolioDashboard";

export const metadata = {
  title: "Portfolio CMS — Admin",
  robots: { index: false, follow: false },
};

export default function AdminPortfolioPage() {
  return <PortfolioDashboard />;
}
