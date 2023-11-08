'use client';
import ChatInput from "./components/ChatInput";
import ChatMessage from "./components/ChatMessage";
import Loading from "./components/Loading";
import { useState, useRef, useEffect } from "react";

import constants from '@/helpers/constants';

export default function Chatbot({id}) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const handleSubmit = async (msg) => {
    const newUserMessage = { text: msg, isUser: true };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setLoading(true);
    const response = await fetch(`${constants.url}/answer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: msg }),
    });
    const res = await response.json();
    handleResponse(res);
    setLoading(false);
  };

  const handleResponse = (res) => {
    console.log(res);
    const newResponseMessage = { text: res.answer, isUser: false, sources: res.sources };
    setMessages((prevMessages) => [...prevMessages, newResponseMessage]);
  };

  useEffect(() => {
    messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <main className="flex min-h-full flex-col items-center justify-center">
      {/* <img
        src="/static/images/bucks.png"
        alt="bucks"
        className="w-1/2 md:w-1/4 fixed top-1/3 z-[-10] opacity-40"
      /> */}
      <div id='chatSection' className="max-w-3xl w-full flex-1 justify-start items-center flex flex-col overflow-y-scroll px-2 md:px-0 ">
        {messages.map((msg, i) => (
          <ChatMessage key={i} message={msg.text} isUser={msg.isUser} sources={msg.sources}/>
        ))}
        {loading ? <Loading/> : null}
        <div ref={messagesEndRef} />{" "}
        {/* This empty div acts as a reference to scroll to */}
      </div>
      <ChatInput handleSubmit={handleSubmit} />
    </main>
  );
}
