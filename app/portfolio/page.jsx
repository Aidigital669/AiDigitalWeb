import PortfolioClientPage from "./PortfolioClientPage";

export const metadata = {
  title: "Portfolio | BizzMaker",
  description:
    "Featured BizzMaker projects across websites, SEO, campaigns, AI videos, creative content, and reels.",
  alternates: {
    canonical: "/portfolio",
  }
};

export default function PortfolioPage() {
  return <PortfolioClientPage />;
}
