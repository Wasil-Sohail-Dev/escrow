import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

const Footer = () => {
  return (
    <section className='w-full px-8 lg:px-20 '>
        {/* Logo and Copyright */}
    <div className='flex flex-col md:flex-row justify-between gap-6'>
        <div className='flex flex-col items-start'>
            <Image
              src="/assets/logo.png"
              alt="ThirdParty Logo"
              width={99}
              height={99}
            />
            <p className="text-[#596780] font-normal text-[18px] leading-[27px]">
              Secure & Transparent <br /> Contract Management
            </p>
          
        </div>

        {/* Legal Links */}
        <div className='flex flex-col items-start gap-4 md:gap-8'>
            <p className="font-semibold text-[20px] leading-[30px]">
              Legal
            </p>
          <Link 
            href="/term-condition" 
            className='text-gray-500 hover:text-gray-900 transition-colors text-sm'
          >
            Privacy Policy
          </Link>
          <Link 
            href="/term-condition" 
            className='text-gray-500 hover:text-gray-900 transition-colors text-sm'
          >
            Terms & Conditions
          </Link>
        </div>
    </div>

        <div className="text-[#596780] font-normal text-[16px] leading-[24px] border-t border-[#CEBEFE] my-4 text-center pt-4">
        © Third Party 2025. All rights reserved.
        </div>
    </section>
  )
}

export default Footer