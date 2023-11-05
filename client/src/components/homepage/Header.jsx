'use client'

import { Fragment } from 'react'
import Link from 'next/link'
import { Popover, Transition } from '@headlessui/react'
import clsx from 'clsx'

import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { Logo } from '@/components/Logo'
import { NavLink } from '@/components/NavLink'
import logo from '@/images/logo192.png'
import Image from 'next/image'

function MobileNavigation() {
  return (
    <></>
  )
}

const enterpriseLetsChat = () => {
  const recipient = "patrick.123.foster@gmail.com"
  const subject = encodeURIComponent("Hello 👋");
  const body = encodeURIComponent(
    "Hey Patrick,\n\nI'd love to hear more about Courser!"
  );
  const mailtoLink = `mailto:${recipient}?subject=${subject}&body=${body}`;
  window.open(mailtoLink, "_blank");
}

export function Header({signUpButton}) {
  return (
    <header className="py-10">
      <Container>
        <nav className="relative z-50 flex justify-between">
          <div className="flex items-center md:gap-x-12">
            <Link href="#" aria-label="Home">
              <Image
                // width={50}
                // height={50}
                className='h-10 w-auto'
                alt='asdf'
                src={logo}
              />
            </Link>
            <div className="hidden md:flex md:gap-x-6">
            <a onClick={enterpriseLetsChat}
                className="inline-block rounded-lg px-2 py-1 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900">
                Get in touch
              </a>
              {/* <a href="https://www.patrickrfoster.com" target='_blank'     
                className="inline-block rounded-lg px-2 py-1 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900">
                  About Us
              </a>
              <a href="https://www.linkedin.com/in/liao-zhu/" target='_blank'     
                className="inline-block rounded-lg px-2 py-1 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900">
                  Contact
              </a>
              <a href="https://twitter.com/gautam_sharda_" target='_blank'     
                className="inline-block rounded-lg px-2 py-1 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900">
                  Our Socials
              </a> */}
            </div>
          </div>
          <div className="flex items-center gap-x-5 md:gap-x-8">
            <div className="hidden md:block">
              <NavLink href="/login">Log in</NavLink>
            </div>
            <Button href={'/register'} color="iowaYellow">
              <span>
                Sign{' '}<span className="hidden lg:inline">Up →</span>
              </span>
            </Button>
            <div className="-mr-1 md:hidden">
              <MobileNavigation />
            </div>
          </div>
        </nav>
      </Container>
    </header>
  )
}