'use client';
import ChatInput from "./components/ChatInput";
import ChatMessage from "./components/ChatMessage";
import Loading from "./components/Loading";
import { useState, useRef, useEffect } from "react";

import constants from '@/helpers/constants';

export default function Chatbot({id, color, image}) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [threadID, setThreadID] = useState("");
  const messagesEndRef = useRef(null);

  const handleSubmit = async (msg) => {
    const newUserMessage = { text: msg, isUser: true };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    //    const { courseID, thread_id, query } = req.body;
    setLoading(true);
    const response = await fetch(`${constants.url}/chatbot/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        courseID: id,
        thread_id: threadID,
        query: msg,
      }),
    });
    const res = await response.json();
    handleResponse(res);
    setLoading(false);
  };

  const handleResponse = (res) => {
    if (res.thread_id) {
      setThreadID(res.thread_id);
    }
    const newResponseMessage = { text: res.answer, isUser: false, sources: [] };
    setMessages((prevMessages) => [...prevMessages, newResponseMessage]);
  };

  const getChatbotSpecificData = async () => {
    const newId = id || 'asdf';
    const endpoint = `${constants.url}/chatbot/getCourse/${newId}`;
    const response = await fetch(endpoint, {method: "GET", headers: { "Content-Type": "application/json"}});
    const res = await response.json();
    console.log(res);
  }

  useEffect(() => {
    getChatbotSpecificData();
  }, []);

  useEffect(() => {
    messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <main className="flex min-h-full flex-col items-center justify-center w-full bg-white p-4">
      {/* <img
        src={image ? image : '/static/images/bucks.png'}
        alt="course-logo"
        className="w-1/2 md:w-1/4 fixed top-1/3 z-[-10] opacity-40"
      /> */}
      <div id='chatSection' className="max-w-3xl w-full flex-1 justify-start items-center flex flex-col overflow-y-scroll px-2 md:px-0 ">
        {messages.map((msg, i) => (
          <ChatMessage key={i} message={msg.text} isUser={msg.isUser} sources={msg.sources} color={color}/>
        ))}
        {loading ? <Loading/> : null}
        <div ref={messagesEndRef} />{" "}
        {/* This empty div acts as a reference to scroll to */}
      </div>
      <ChatInput handleSubmit={handleSubmit} color={color} />
    </main>
  );
}
