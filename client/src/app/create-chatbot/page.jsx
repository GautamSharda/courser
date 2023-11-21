'use client'

import Navbar from '@/components/Navbar'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink, faDeleteLeft, faTrash} from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';
import ModifyChatbot from '@/components/modifychatbot/page';


function CreateChatbot() {
  return (
    <div className="h-full w-full">
      <Navbar />
      <div className='w-full config-container'>
        <ModifyChatbot create={true} />
      </div>
    </div>
  )
}

export default CreateChatbot;
