'use client'
import Link from 'next/link'
import { Button } from '@/components/Button'
import { useState } from 'react'
import { TextField } from '@/components/Fields'
import { SlimLayout } from '@/components/SlimLayout'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (event) => {
    
  }
  
  return (
    <SlimLayout>
      <h2 className="mt-20 text-lg font-semibold text-gray-900">
        Get started with Courser
      </h2>
      <p className="mt-2 text-sm text-gray-700">
        Already registered?{' '}
        <Link
          href="/login"
          className="font-medium text-iowaYellow-600 hover:underline"
        >
          Sign in
        </Link>{' '}
        to your account.
      </p>
      <div
        className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2"
      >
        <TextField
          className="col-span-full"
          label="Email address"
          name="email"
          type="email"
          placeholder="johndoe@uiowa.edu"
          autoComplete="email"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          required
        />
        <TextField
          className="col-span-full"
          label="Password"
          name="password"
          type="password"
          placeholder="********"
          autoComplete="new-password"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          required
        />
        <div className="col-span-full">
          <Button type="submit" variant="solid" color="iowaYellow" className="w-full">
            <span>
              Sign up <span aria-hidden="true">&rarr;</span>
            </span>
          </Button>
        </div>
      </div>
    </SlimLayout>
  )
}
