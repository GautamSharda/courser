'use client';
import clsx from 'clsx'
import Head from 'next/head'
import '@/styles/tailwind.css'
import Navbar from '@/components/config/Navbar'


export default function Layout({ children }) {
  return (
    <div
        className='h-full w-full'
    >
        <Navbar />
        {children}
    </div>
  )
}
