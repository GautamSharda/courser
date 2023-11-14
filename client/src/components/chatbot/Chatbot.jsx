'use client'
import ChatInput from './components/ChatInput'
import ChatMessage from './components/ChatMessage'
import Loading from './components/Loading'
import { useState, useRef, useEffect } from 'react'
import constants from '@/helpers/constants'

export default function Chatbot({ id, color, image }) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [threadID, setThreadID] = useState('')
  const [currentColor, setCurrentColor] = useState(color)
  const [currentPlaceHolder, setCurrentPlaceHolder] = useState(
    'What is significant about horseshoe crabs?',
  )
  const [currentImage, setCurrentImage] = useState(constants.courserLogoLarge)
  const messagesEndRef = useRef(null)

  const handleSubmit = async (msg) => {
    const newUserMessage = { text: msg, isUser: true }
    setMessages((prevMessages) => [...prevMessages, newUserMessage])
    //    const { courseID, thread_id, query } = req.body;
    setLoading(true)
    const response = await fetch(`${constants.url}/chatbot/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        courseID: id,
        thread_id: threadID,
        query: msg,
      }),
    })
    const res = await response.json()
    handleResponse(res)
    setLoading(false)
  }

  const handleResponse = (res) => {
    if (res.thread_id) {
      setThreadID(res.thread_id)
    }
    const newResponseMessage = { text: res.answer, isUser: false, sources: [] }
    setMessages((prevMessages) => [...prevMessages, newResponseMessage])
  }

  const getChatbotSpecificData = async () => {
    const newId = id || 'asdf'
    const endpoint = `${constants.url}/course/getCourse/${newId}`
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    if (response.status !== 200) {
      return
    }
    const res = await response.json()
    setCurrentColor(res.color)
    setCurrentPlaceHolder(res.placeholder)
    setCurrentImage(res.backgroundImg || constants.courserLogoLarge)
  }

  useEffect(() => {
    getChatbotSpecificData()
  }, [])

  useEffect(() => {
    messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <main className="flex min-h-full h-20 w-full flex-col items-center justify-center bg-white p-4">
      <img
        src={currentImage}
        alt="course-logo"
        className="fixed top-1/3 z-[0] w-1/2 max-w-[200px] opacity-40 md:w-1/4"
      />
      <div
        id="chatSection"
        className="flex w-full max-w-[800px] flex-1 flex-col items-center justify-start overflow-y-scroll px-2 md:px-0 z-50 "
      >
        {messages.map((msg, i) => (
          <ChatMessage
            key={i}
            message={msg.text}
            isUser={msg.isUser}
            sources={msg.sources}
            color={currentColor}
          />
        ))}
        {loading ? <Loading /> : null}
        <div ref={messagesEndRef} />{' '}
        {/* This empty div acts as a reference to scroll to */}
      </div>
      <ChatInput
        handleSubmit={handleSubmit}
        color={currentColor}
        placeholder={currentPlaceHolder}
        disabled={loading}
      />
    </main>
  )
}
