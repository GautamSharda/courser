import React from 'react'
import logo from '@/images/logo192.png'
import Image from 'next/image'
import Link from 'next/link'
import constants from '@/helpers/constants'
import { usePathname } from 'next/navigation'

const navSections = [
  {name: 'Chatbot', pathEnding: 'chat'},
  {name: 'Datasets', pathEnding: 'datasets'},
  {name: 'Embed Website', pathEnding: 'embed'},
  {name: 'Settings', pathEnding: 'settings'}
]

function Navbar() {
  return (
    <nav className="z-50 w-full border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link href="/my-chatbots">
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
              {navSections.map((section, index) => {
                return (
                  <NavLink key={index} name={section.name} pathEnding={section.pathEnding} />
                )
              })}
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

const NavLink = ({name, pathEnding}) => {
  const currentUrl = usePathname();
  const lastTick = currentUrl.split('/').pop();
  const path = `${constants.clientUrl}/chatbot/${pathEnding}`;
  if (lastTick !== pathEnding) {
    return (
      <Link href={pathEnding} className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium">{name}</Link>
    )
  }
  return (<Link href={pathEnding} className="inline-flex items-center border-b-2 border-iowaYellow-500 px-1 pt-1 text-sm font-medium text-gray-900" aria-current="page">{name}</Link>)
}

export default Navbar