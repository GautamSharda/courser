'use client';
import Link from 'next/link'
import { Button } from '@/components/Button';
import { useState, useEffect } from 'react';
import { TextField } from '@/components/Fields';
import { SlimLayout } from '@/components/SlimLayout';
import { handleGoogle, successfulLogin } from '@/helpers/firebase';
import isLoggedIn from '@/helpers/isLoggedIn';
import constants from '@/helpers/constants';
import Error from '@/components/alerts/Error';


export default function Register() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('');
  const [error, setError] = useState('')

  const auth = async () => {
    const res = await isLoggedIn(false);
    if (res) {
      window.location.href = '/my-chatbots';
    }
  };

  useEffect(() => {
    auth();
  }, []);


  const handleSubmit = async () => {
    const res = await fetch(`${constants.url}/auth/signup-email`, {
      body: JSON.stringify({email, name, password}),
      headers: {'Content-Type': 'application/json'},
      method: 'POST',
    })
    if (res.status === 200) {
      const data = await res.json()
      successfulLogin(data.token)
    } else if (res.status === 409) {
      setError('Account with that email already exists')
    } else {
      setError('Failed to create account')
    }
  }

  const canSubmit = email.length > 0 && password.length > 0 && name.length > 0;
  return (
    <SlimLayout>
      <h2 className="mt-20 text-lg font-semibold text-gray-900">
        Get started with Courser
      </h2>
      <p className="mt-2 text-sm text-gray-700 mb-5">
        Already registered?{' '}
        <Link
          href="/login"
          className="font-medium text-iowaYellow-600 hover:underline"
        >
          Sign in
        </Link>{' '}
        to your account.
      </p>
      {error && <Error mainText={error}/>}
      <div
        className="mt-5 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2"
      >
          <TextField
          className="col-span-full"
          label="Name"
          name="name"
          type="name"
          placeholder="John Doe"
          autoComplete="email"
          onChange={(e) => setName(e.target.value)}
          value={name}
          require
        />
        <TextField
          className="col-span-full"
          label="Email address"
          name="email"
          type="email"
          placeholder="johndoe@uiowa.edu"
          autoComplete="email"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          require
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
          <Button disabled={!canSubmit} type="submit" variant="solid" color="iowaYellow" className="w-full" onClick={handleSubmit}>
            <span>
              Sign up <span aria-hidden="true">&rarr;</span>
            </span>
          </Button>
        </div>
        <div className="col-span-full">        
          <button className="login-with-google-btn" onClick={() => {handleGoogle(setError)}}>
            Google Sign Up 
          </button>
        </div>

      </div>
    </SlimLayout>
  )
}
