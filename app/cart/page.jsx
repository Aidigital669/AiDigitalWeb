"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useVisibility } from "../context/VisibilityContext";
import PageHiddenNotice from "../components/PageHiddenNotice";

export default function CartPageRedirect() {
  const router = useRouter();
  const { isPageVisible } = useVisibility();

  useEffect(() => {
    if (isPageVisible("cart")) {
      router.replace("/checkout");
    }
  }, [router, isPageVisible]);

  if (!isPageVisible("cart")) {
    return <PageHiddenNotice pageName="Cart" />;
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", color: "#666" }}>
      <p>Redirecting to secure checkout...</p>
    </div>
  );
}
