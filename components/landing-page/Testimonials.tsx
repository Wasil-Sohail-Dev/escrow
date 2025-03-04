import React, { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from 'lucide-react'
const testimonials = [
  {
    title: "A Game-Changer for My Business!",
    text: "“Managing contracts and payments has never been easier. The escrow system ensures security, and the milestone tracking helps keep projects on schedule. I finally feel in control of my payments and contracts!”",
    author: "Jimmy Bartney",
    position: "Product Manager at PickoLab",
    avatar: "/assets/testimonial1.png",
  },
  {
    title: "Effortless & Secure!",
    text: "“As a freelancer, I used to struggle with unclear payment terms and delayed approvals. Now, every milestone is tracked, and I get paid on time. This platform has made my workflow so much smoother!”",
    author: "Sophia Martinez",
    position: "Freelance Web Developer",
    avatar: "/assets/testimonial2.png",
  },
  {
    title: "Highly Recommended!",
    text: "“We manage multiple contracts simultaneously, and this platform has streamlined our process. The automated payments, secure escrow, and real-time updates make everything more efficient. Perfect for growing teams!”",
    author: "James Carter",
    position: "Manager at Build Contractors",
    avatar: "/assets/testimonial3.png",
  },
  {
    title: "Reliable & Transparent!",
    text: "“Tracking project payments and expenses used to be a headache, but now I have complete visibility. Payments are always on time, and the automated system reduces manual errors. It's a must-have for financial oversight!”",
    author: "Emily Zhao",
    position: "Finance Manager at Swift Solutions",
    avatar: "/assets/testimonial4.png",
  },
  {
    title: "Perfect for Clients & Contractors!",
    text: "“I've been using this platform for six months, and it has transformed the way I hire contractors. The escrow system ensures fairness, and the built-in dispute resolution feature gives me peace of mind. It's a win-win!”",
    author: "Michael Evans",
    position: "Real Estate Developer",
    avatar: "/assets/testimonial5.png",
  },
];

const Testimonials = () => {
  const [currentPage, setCurrentPage] = useState(0);

  // Adjust items per page based on screen size
  const getItemsPerPage = () => {
    if (typeof window !== "undefined") {
      if (window.innerWidth < 768) return 1; // mobile
      if (window.innerWidth < 1024) return 2; // tablet
      return 3; // desktop
    }
    return 3; // default for SSR
  };

  const [itemsPerPage, setItemsPerPage] = useState(getItemsPerPage());
  const totalPages = Math.ceil(testimonials.length / itemsPerPage);

  // Update items per page on window resize
  React.useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(getItemsPerPage());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const nextSlide = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevSlide = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  return (
    <section className="w-full px-8 lg:px-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <span className="text-primary uppercase font-semibold tracking-wider block text-base sm:text-xl">
            WHAT THEY SAY
          </span>
          <h2 className="text-2xl sm:text-[32px] lg:text-[40px] font-bold mb-3 sm:mb-4">
            Trusted by Clients, Contractors, and Finance Professionals
          </h2>
          <p className="text-gray-400 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto">
            Here are some testimonials from our users after using ThirdParty to
            manage their business expenses.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 transition-all duration-500 ease-in-out">
            {testimonials
              .slice(
                currentPage * itemsPerPage,
                currentPage * itemsPerPage + itemsPerPage
              )
              .map((testimonial, index) => (
                <div
                  key={index}
                  className="bg-[#1A1A1A] rounded-2xl p-4 sm:p-6 transition-all"
                >
                  <h3 className="text-white font-bold text-lg sm:text-xl mb-3 sm:mb-4">
                    {testimonial.title}
                  </h3>
                  <p className="text-white text-sm sm:text-base lg:text-lg mb-4 sm:mb-6 min-h-[80px] sm:min-h-[120px]">
                    {testimonial.text}
                  </p>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="relative w-10 h-10 sm:w-12 sm:h-12">
                      <Image
                        src={testimonial.avatar}
                        alt={testimonial.author}
                        fill
                        className="rounded-xl object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold text-sm sm:text-base">
                        {testimonial.author}
                      </h4>
                      <p className="text-gray-400 text-xs sm:text-sm">
                        {testimonial.position}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Navigation Arrows */}
          <div className="flex justify-center items-center gap-4 mt-12">
            <button
              onClick={prevSlide}
              className="w-12 h-12 rounded-full bg-[#1A1A1A] hover:bg-primary flex items-center justify-center text-white"
              aria-label="Previous testimonials"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextSlide}
              className="w-12 h-12 rounded-full bg-primary hover:bg-primary-500 flex items-center justify-center text-white"
              aria-label="Next testimonials"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
