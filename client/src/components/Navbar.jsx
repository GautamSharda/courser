import React from 'react'
import logo from '@/images/logo192.png'
import Image from 'next/image'
import Link from 'next/link'
import constants from '@/helpers/constants'

function Navbar() {
  return (
    <nav className="z-50 w-full border-b border-gray-200 bg-white h-[64px]">
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
                Courses
              </a>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
          <button className="inline-block rounded-lg px-2 py-1 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900"
          onClick={() => {
            localStorage.removeItem(constants.authToken)
            window.location.href = '/'
          }}
          >
              <p>Logout</p>
          </button>
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar