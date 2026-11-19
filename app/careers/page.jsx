import CareersClientPage from "./CareersClientPage";

export const metadata = {
  title: "Careers | Join BizzMaker",
  description:
    "Explore open roles and career opportunities at BizzMaker. We are looking for creative and passionate individuals to join our digital marketing team.",
  alternates: {
    canonical: "/careers",
  },
  openGraph: {
    title: "Careers | Join BizzMaker",
    description:
      "Explore open roles and career opportunities at BizzMaker. We are looking for creative and passionate individuals to join our digital marketing team.",
    type: "website",
  }
};

export default function CareersPage() {
  return (
    <>
      <CareersClientPage />
    </>
  );
}
