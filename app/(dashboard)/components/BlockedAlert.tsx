import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const BlockedAlert = () => {
  return (
    <div className="bg-gray-50 py-4 px-6 mb-6 flex items-center gap-6 bg-[#DADADA33]
    lg:flex-row md:flex-row max-md:text-center
    lg:px-6 md:px-5 max-md:px-4">
    <Image 
      src="/assets/warning.svg" 
      alt="warning" 
      width={28} 
      height={28}
    />
    <p className="lg:text-body-normal md:text-base-regular max-md:text-small-regular">
      Your Account has been blocked. Contact{" "}
      <Link href="/support" className="text-primary hover:underline">
        Customer service support
      </Link>
    </p>
  </div>
  )
}

export default BlockedAlert