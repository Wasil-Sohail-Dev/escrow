import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const LandingHero = () => {
  const router = useRouter();
  return (
    <div className="bg-[#0B0B0B] w-full relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-[200px] h-[200px] md:w-[300px] md:h-[300px] lg:w-[400px] lg:h-[400px]">
        <Image
          src="/assets/Ellipseright.svg"
          alt="Hero"
          fill
          className="object-contain"
        />
      </div>
      <div className="absolute top-0 left-0 w-[250px] h-[250px] md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px]">
        <Image
          src="/assets/Ellipseleft.svg"
          alt="Hero"
          fill
          className="object-contain cursor-pointer"
        />
      </div>
      <div className="absolute bottom-0 left-0 w-[250px] h-[250px] md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px]">
        <Image
          src="/assets/Ellipsebottomleft.svg"
          alt="Hero"
          fill
          className="object-contain"
        />
      </div>

      {/* Navigation */}
      <nav className="w-full py-2 border-b border-[#FFFFFF29] px-8 lg:px-20">
        <div className="w-full mx-auto flex items-center justify-between">
          <Image
            src="/assets/landingLogo.png"
            alt="Logo"
            width={80}
            height={80}
            className="w-16 h-16 md:w-20 md:h-20 lg:w-[80px] lg:h-[80px] object-contain"
          />
          <div className="flex items-center gap-4 md:gap-6 z-50">
            <Link
              href="/sign-in"
              className="text-white hover:text-gray-300 text-sm md:text-base lg:text-[18px] font-medium cursor-pointer"
            >
              Login
            </Link>
            <Link
              href="/user-register"
              className="bg-primary hover:bg-primary-500 text-white rounded-3xl px-4 py-2 md:px-6 md:py-3 lg:px-7 lg:py-3 text-sm md:text-base lg:text-[16px] font-semibold transition-colors cursor-pointer"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Content */}
      <section className="mx-auto pt-16 lg:pt-20 px-8 lg:px-20">
        <div className="text-center">
          <h1
            className="text-white font-bold text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-[72px] 
            leading-[1.2] md:leading-[1.3] lg:leading-[1.25] xl:leading-[1.3] 2xl:leading-[90px] 
            mb-4 md:mb-6 lg:mb-8"
          >
            Secure Contracts &<br className="hidden md:block" />
            Hassle-Free Payments
          </h1>
          <p
            className="text-gray-400 font-normal text-base md:text-lg lg:text-xl xl:text-2xl 
            leading-normal md:leading-relaxed lg:leading-[36px] 
            max-w-[90%] md:max-w-3xl lg:max-w-4xl mx-auto mb-6 md:mb-8 lg:mb-10"
          >
            Manage contracts, track milestones, and ensure secure payments with
            our escrow-backed platform—built for trust and transparency.
          </p>
          <button
            className="bg-primary hover:bg-primary-500 text-white font-semibold 
            text-sm md:text-base lg:text-[16px] 
            rounded-full px-8 py-3 md:px-10 md:py-4 transition-colors"
            onClick={() => router.push("/user-register")}
          >
            Get Started
          </button>
        </div>
      </section>

      {/* Screenshot Image */}
      <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] mt-2 ">
        <Image
          src="/assets/screenshort1.svg"
          alt="Hero"
          fill
          className=" px-8 lg:px-20"
          priority
        />
      </div>
    </div>
  );
};

export default LandingHero;
