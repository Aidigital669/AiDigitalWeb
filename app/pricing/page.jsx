import PricingClientPage from "./PricingClientPage";

export const metadata = {
  title: "Pricing Plans | BizzMaker",
  description:
    "Explore our premium, AI-powered digital marketing pricing plans for Ads, Website Design, Creative Packs, and AI Video Solutions.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "Pricing Plans | BizzMaker",
    description:
      "Explore our premium, AI-powered digital marketing pricing plans for Ads, Website Design, Creative Packs, and AI Video Solutions.",
    type: "website",
  }
};

export default function PricingPage() {
  return (
    <>
      <PricingClientPage />
    </>
  );
}
