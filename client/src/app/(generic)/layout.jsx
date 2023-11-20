'use client';
import React from "react";
import { Header } from '@/components/homepage/Header'

export default function Layout({ children }) {

  return (
    <>
      <Header/>
      <main>
        {children}
       </main>
    </>
  )
}
