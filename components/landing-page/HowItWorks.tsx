import React from 'react'
import Image from 'next/image'

const HowItWorks = () => {
  return (
    <section className='w-full bg-black py-12 md:py-16 lg:py-24 px-8 lg:px-20'>
      <div className='flex flex-col lg:flex-row gap-8 md:gap-12 lg:gap-16'>
        {/* Left Side - Image */}
        <div className='relative w-full lg:w-1/2 h-[300px] md:h-[400px] lg:h-[500px]'>
          <Image
            src="/assets/Content.svg"
            alt="Dashboard Preview"
            fill
            className='object-contain object-left'
            priority
          />
        </div>

        {/* Right Side - Content */}
        <div className='lg:w-1/2 text-left w-full flex flex-col justify-between'>
          <span className='text-primary uppercase text-sm md:text-base lg:text-[20px] font-semibold tracking-wide md:tracking-wider mb-2 md:mb-4 block'>
            HOW IT WORKS
          </span>
          
          <h2 className='text-white text-3xl md:text-4xl lg:text-5xl xl:text-[40px] font-bold 
            leading-[1.2] md:leading-[1.3] lg:leading-[60px] 
            mb-3 md:mb-4'>
            Few Easy Steps and Done
          </h2>
          
          <p className='text-[#90A3BF] font-normal text-base md:text-lg lg:text-[20px]
            leading-relaxed md:leading-normal lg:leading-[30px]
            mb-6 md:mb-8 max-w-full lg:max-w-xl'>
            Managing contracts and payments has never been easier. Just follow these simple steps:
          </p>

          {/* Steps */}
          <div className='flex flex-col gap-6 md:gap-8 lg:gap-10 bg-[#1A202C] p-4 md:p-6 rounded-lg max-w-full lg:max-w-xl'>
            {/* Step 1 */}
            <div className='flex items-center gap-3 md:gap-4 relative'>
              <div className='w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm md:text-base'>
                1
              </div>
              <span className='text-white text-base md:text-lg'>Register Your Account</span>
              <div className='absolute left-[12px] md:left-[16px] -translate-x-1/2 top-[110%] w-[2px] h-full bg-primary hidden md:block' />
            </div>

            {/* Step 2 */}
            <div className='flex items-center gap-3 md:gap-4 relative'>
              <div className='w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm md:text-base'>
                2
              </div>
              <span className='text-white text-base md:text-lg'>Set Up Your Project & Expenses</span>
              <div className='absolute left-[12px] md:left-[16px] -translate-x-1/2 top-[110%] w-[2px] h-full bg-[#E7DEFE] border-dotted border-l-2 border-[#E7DEFE] hidden md:block' />
            </div>

            {/* Step 3 */}
            <div className='flex items-center gap-3 md:gap-4'>
              <div className='w-7 h-7 md:w-8 md:h-8 rounded-full bg-white text-black flex items-center justify-center font-semibold text-sm md:text-base'>
                3
              </div>
              <span className='text-white text-base md:text-lg'>Get Paid & Track Everything</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks