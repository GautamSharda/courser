'use client'
import Navbar from '@/components/Navbar'
import { useState } from 'react'
import Link from 'next/link'

function MyChatbots() {
  // This is just for my testing purposes - Liao
  // const [chatbots, setChatbots] = useState([
  //   { id: 1, name: 'Chatbot 1' },
  //   { id: 2, name: 'Chatbot 2' },
  //   { id: 3, name: 'Chatbot 3' },
  // ])
  const [chatbots, setChatbots] = useState([])

  return (
    <div className="h-screen w-full">
      <Navbar />
      <div className="my-10 flex h-full w-full flex-col items-center justify-start gap-10">
        <h1 className="text-3xl font-bold text-zinc-600">Your Chatbots</h1>
        {chatbots.length ? (
          <>
            <div className="grid grid-cols-3 gap-4">
              {chatbots.map((chatbot) => (
                <div
                  key={chatbot.id}
                  className="flex h-40 w-40 cursor-pointer items-center justify-center rounded-md border-2 border-zinc-300 bg-zinc-100 text-center text-zinc-600 transition duration-200 hover:bg-zinc-200 hover:text-zinc-700"
                >
                  {chatbot.name}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center">
              <Link
                href="#"
                className="rounded-md bg-zinc-700 px-4 py-2 text-zinc-200 transition duration-200 hover:bg-zinc-600 hover:text-zinc-300"
              >
                Add Chatbot
              </Link>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center">
            <Link
              href="#"
              className="rounded-md bg-zinc-700 px-4 py-2 text-zinc-200 transition duration-200 hover:bg-zinc-600 hover:text-zinc-300"
            >
              Create new chatbot
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyChatbots
