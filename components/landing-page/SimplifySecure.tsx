import React from "react";
import Image from "next/image";

const SimplifySecure = () => {
  return (
    <section className="w-full bg-[#0B0B0B] px-8 lg:px-20 overflow-hidden">
      <div className="flex flex-col lg:flex-row gap-6 md:gap-8 lg:gap-12 xl:gap-16">
        {/* Left Side - Content */}
        <div className="lg:w-1/2 w-full flex flex-col justify-between pb-0 py-12 lg:py-16 xl:py-24">
          <span className="text-primary uppercase text-xs md:text-sm lg:text-base xl:text-[20px] 
            font-semibold tracking-wide md:tracking-wider mb-2 md:mb-3 lg:mb-4 block">
            GET STARTED NOW
          </span>

          <h2 className="text-white font-bold text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-[40px]
            leading-[1.2] md:leading-[1.3] lg:leading-[1.25] xl:leading-[60px]
            mb-3 md:mb-4 lg:mb-5">
            Simplify & Secure Your Contract Management Today
          </h2>

          <p className="text-[#596780] font-normal text-sm md:text-base lg:text-lg xl:text-[20px]
            leading-relaxed md:leading-normal lg:leading-[30px]
            mb-4 md:mb-6 lg:mb-8 max-w-full lg:max-w-xl">
            Are you ready to streamline your projects, ensure secure payments,
            and manage contracts effortlessly? Start using Third Party now and
            take control of your business operations!
          </p>

          <button className="bg-primary hover:bg-primary-500 text-white font-semibold
            text-sm md:text-base lg:text-[16px]
            rounded-full px-6 py-2 md:px-8 md:py-3 lg:px-10 lg:py-4 transition-colors
            w-fit transform hover:scale-105 active:scale-95">
            Get a Free Demo
          </button>
        </div>

        {/* Right Side - Image */}
        <div className="lg:w-1/2 relative w-full aspect-square md:aspect-video lg:aspect-auto
          h-[300px] md:h-[400px] lg:h-auto lg:min-h-[500px] mx-auto lg:mx-0">
          <div className="absolute inset-0 w-full h-full lg:w-[115%] lg:-right-[20%]">
            <Image
              src="/assets/contactdetails.svg"
              alt="Contract Management Preview"
              fill
              className="object-contain object-right-bottom lg:object-bottom"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SimplifySecure;