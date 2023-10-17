import Link from 'next/link'

import { Container } from '@/components/Container'
import { Logo } from '@/components/Logo'
import { NavLink } from '@/components/NavLink'

export function Footer() {
  return (
    <footer className="bg-slate-50">
      <Container>
        <div className="py-16 flex align-center justify-center">
          <Logo className="h-10 w-auto" />
          <p className='mt-2 ml-3'>Study faster with Courser</p>
        </div>
      </Container>
    </footer>
  )
}
