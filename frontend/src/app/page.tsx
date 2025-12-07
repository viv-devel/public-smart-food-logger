import { Suspense } from "react";

import LandingPageContent from "@/components/LandingPageContent";

export default function FitbitLandingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-900" />}>
      <LandingPageContent />
    </Suspense>
  );
}
