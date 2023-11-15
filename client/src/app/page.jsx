'use client'
import { PrimaryFeatures } from '@/components/homepage/PrimaryFeatures';
import { Footer } from '@/components/homepage/Footer'
import { Header } from '@/components/homepage/Header'
import { Hero } from '@/components/homepage/Hero'

export default function HomePage() {
  return (
    <>
      <Header/>
      <main>
        <Hero/>
        {/* <PrimaryFeatures/> */}
        <Footer/>
      </main>
    </>
  )
  
}

