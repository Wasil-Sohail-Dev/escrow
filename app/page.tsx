"use client";

import HowItWorks from "@/components/landing-page/HowItWorks";
import LandingHero from "../components/landing-page/LandingHero";
import WhyChoseUs from "../components/landing-page/WhyChoseUs";
import Testimonials from "@/components/landing-page/Testimonials";
import SimplifySecure from "@/components/landing-page/SimplifySecure";
import Footer from "@/components/landing-page/Footer";
export default function Page() {
  return (
    <div className="flex flex-col gap-20 w-full bg-white">
      <LandingHero />
      <WhyChoseUs />
      <HowItWorks />
      <Testimonials />
      <SimplifySecure />
      <Footer />
    </div>
  );
}
