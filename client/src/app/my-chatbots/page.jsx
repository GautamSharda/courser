'use client'
import Navbar from '@/components/Navbar'
import { useState, useEffect } from 'react';
import constants from '@/helpers/constants';
import isLoggedIn from '@/helpers/isLoggedIn';
import Link from 'next/link'

function MyChatbots() {
  const [chatbots, setChatbots] = useState([]); // {id: #, name: '', image: '', color: ''}

  const getData = async () => {
    const { courses } = await isLoggedIn(constants.clientUrl, 'chatbot/getAllCourses');
    //replaces _id with id
    courses.forEach((course) => {
      course.id = course._id;
      delete course._id;
    });
    setChatbots(courses);
  }

  useEffect(() => {
    getData();
  }, []);

  // const [chatbots, setChatbots] = useState([])

  return (
    <div className="h-screen w-full">
      <Navbar />
      <div className="my-10 flex h-full w-full flex-col items-center justify-start gap-10">
        <h1 className="text-3xl font-bold text-zinc-600">Your Chatbots</h1>
        {chatbots.length ? (
          <>
            <div className="grid grid-cols-3 gap-4">
              {chatbots.map((chatbot) => (
              <Link
                  key={chatbot.id}
                  href={`/chatbot/${chatbot.id}/chat`}
                  className={`relative flex h-40 w-40 cursor-pointer items-center justify-center rounded-md border-2 border-zinc-300 bg-zinc-100 text-center text-zinc-600 transition duration-200 hover:bg-zinc-200 hover:text-zinc-700`}
                >
                  {chatbot.image ? (
                  <img
                    src={chatbot.image}
                    // src="https://picsum.photos/200/300"
                    alt={chatbot.name}
                    className="absolute left-0 top-0 z-[40] h-full w-full rounded-md object-cover"
                  />
                  ) : null}
                  <p className="w-40 overflow-hidden text-ellipsis whitespace-nowrap z-50">
                    {chatbot.name ? chatbot.name : chatbot.id}
                  </p>
                  </Link>
              ))}
            </div>
            <div className="flex items-center justify-center">
              <Link
                href="/create-chatbot"
                className="rounded-md bg-zinc-700 px-4 py-2 text-zinc-200 transition duration-200 hover:bg-zinc-600 hover:text-zinc-300"
              >
                Add Chatbot
              </Link>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center">
            <Link
              href="/create-chatbot"
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
