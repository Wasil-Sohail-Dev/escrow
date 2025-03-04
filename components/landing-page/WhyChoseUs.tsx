import Image from 'next/image'
import React from 'react'

const WhyChoseUs = () => {
  return (
    <section className='w-full px-8 lg:px-20 mx-auto'>
      {/* Section Header */}
      <p className='text-primary font-semibold uppercase text-sm md:text-base lg:text-[20px] 
        tracking-wide mb-4'>
        Why Choose Our Platform?
      </p>

      <div className='flex flex-col gap-8 lg:gap-12'>
        {/* Header Content */}
        <div className='flex flex-col md:flex-row gap-6 md:gap-12 lg:gap-24'>
          <h2 className='text-3xl md:text-4xl lg:text-5xl xl:text-[40px] font-bold 
            leading-[1.2] md:leading-[1.3] lg:leading-[60px] '>
            Easy, Secure,<br /> and Transparent
          </h2>
          <p className='text-[#596780] font-normal text-base md:text-lg lg:text-xl xl:text-[20px]
            leading-relaxed md:leading-normal lg:leading-[30px]
            max-w-full md:max-w-lg flex-1 mt-3'>
            Our platform ensures secure contract management and hassle-free payments. Heres why businesses and professionals trust us:
          </p>
        </div>

        {/* Features Grid */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {/* Feature 1 */}
          <div className='flex flex-col gap-3 md:gap-4'>
            <div className='relative w-full aspect-square max-w-[300px] md:max-w-none mx-auto'>
              <Image 
                src={'/assets/choseus1.svg'} 
                alt='Automated Contract Execution' 
                fill
                className='object-contain'
              />
            </div>
            <h3 className='text-xl md:text-2xl lg:text-[24px] font-semibold 
              leading-[1.2] md:leading-[1.3] lg:leading-[36px]
              text-center md:text-left'>
              Automated Contract Execution
            </h3>
            <p className='text-[#596780] font-normal text-sm md:text-base lg:text-[16px]
              leading-relaxed md:leading-normal lg:leading-[24px]
              text-center md:text-left'>
              Say goodbye to manual contracts! Our system streamlines contract creation, milestone tracking, and secure payments—all in one place.
            </p>
          </div>

          {/* Feature 2 */}
          <div className='flex flex-col gap-3 md:gap-4'>
            <div className='relative w-full aspect-square max-w-[300px] md:max-w-none mx-auto'>
              <Image 
                src={'/assets/choseus2.svg'} 
                alt='Transparent Payment Tracking' 
                fill
                className='object-contain'
              />
            </div>
            <h3 className='text-xl md:text-2xl lg:text-[24px] font-semibold 
              leading-[1.2] md:leading-[1.3] lg:leading-[36px]
              text-center md:text-left'>
              Transparent Payment Tracking
            </h3>
            <p className='text-[#596780] font-normal text-sm md:text-base lg:text-[16px]
              leading-relaxed md:leading-normal lg:leading-[24px]
              text-center md:text-left'>
              Get real-time updates on your project milestones, payment releases, and escrow balances to keep everything on track.
            </p>
          </div>

          {/* Feature 3 */}
          <div className='flex flex-col gap-3 md:gap-4'>
            <div className='relative w-full aspect-square max-w-[300px] md:max-w-none mx-auto'>
              <Image 
                src={'/assets/choseus3.svg'} 
                alt='Secure Escrow Payments' 
                fill
                className='object-contain'
              />
            </div>
            <h3 className='text-xl md:text-2xl lg:text-[24px] font-semibold 
              leading-[1.2] md:leading-[1.3] lg:leading-[36px]
              text-center md:text-left'>
              Secure Escrow Payments
            </h3>
            <p className='text-[#596780] font-normal text-sm md:text-base lg:text-[16px]
              leading-relaxed md:leading-normal lg:leading-[24px]
              text-center md:text-left'>
              Payments are held securely until both parties agree that the work is completed—ensuring fairness and protection for everyone.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default WhyChoseUs