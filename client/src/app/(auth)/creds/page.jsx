'use client'

// pages/client-rendered-page.js

import React from 'react';
import { Main } from '@/components/Main'

function Creds() {
  return (
    <div className="min-h-screen flex flex-col justify-between items-center">
      <Navbar/>
      <Main />
    </div>
  );
}

export default Creds;