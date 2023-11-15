'use client';
import clsx from 'clsx'
import Head from 'next/head'
import '@/styles/tailwind.css'
import React from "react";
import { useEffect } from "react";
import constants from '@/helpers/constants';
import isLoggedIn from '@/helpers/isLoggedIn';
import Navbar from '@/components/config/Navbar'




export default function Layout({ children }) {
  useEffect(() => {
    isLoggedIn(constants.clientUrl);
  }, []);

  return (
    <div className='h-full w-full flex flex-col justify-center items-center bg-green'>
        <Navbar />
        {children}
    </div>
  )
}
