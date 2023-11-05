'use client'

// pages/client-rendered-page.js

import React from 'react';
import { Main } from '@/components/Main'
import Navbar from '@/components/Navbar'

function Home() {


  return (
    <div className="h-screen items-center justify-between flex flex-col">
      <Navbar />
      <Main />
    </div>
  );
}

export default Home;