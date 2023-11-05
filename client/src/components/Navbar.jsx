import React from 'react'
import logo from '@/images/logo192.png'
import Image from 'next/image'
import Link from 'next/link'

function Navbar() {
  return (
    <nav className="z-50 w-full border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link href="/">
                <Image
                  className="block h-8 w-auto lg:hidden"
                  src={logo}
                  alt="Your Company"
                />
                <Image
                  className="hidden h-8 w-auto lg:block"
                  src={logo}
                  alt="Your Company"
                />
              </Link>
            </div>
            <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
              <a
                href="#"
                className="inline-flex items-center border-b-2 border-iowaYellow-500 px-1 pt-1 text-sm font-medium text-gray-900"
                aria-current="page"
              >
                Dashboard
              </a>
              <a
                href="https://www.patrickrfoster.com"
                target="_blank"
                className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
              >
                About Us
              </a>
              <a
                href="https:liaozhu.dev"
                target="_blank"
                className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
              >
                Contact
              </a>
              <a
                href="https://twitter.com/gautam_sharda_"
                target="_blank"
                className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
              >
                Our Socials
              </a>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center"></div>
          <div className="-mr-2 flex items-center sm:hidden"></div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar