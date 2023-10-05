'use client'

// pages/client-rendered-page.js
import React, { useState, useEffect, useMemo, useRef } from 'react'
import React, { useState, useMemo, useRef, useEffect } from 'react'
import isLoggedIn from '@/helpers/isLoggedIn';
import { Loader } from './Loader';
import { Plan } from './Plan';
import messagesHook from '@/helpers/useMessage';
import Dropdown from './Dropdown';
import ToolTip from './ToolTip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';

let isLocal = false;
try {
  isLocal = window.location.href.includes('localhost');
} catch (e) {}
// const TESTING = false;
console.log('isLocal');
console.log(isLocal);

const constants = {
  url: isLocal ? "http://localhost:8000" : "https://courser-production.up.railway.app",
};

import constants from '@/helpers/constants';
import { redirect } from 'next/dist/server/api-utils';

export function Main() {
  const [user, setUser] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [messages, addMessage] = messagesHook();
  const [showYTModal, setShowYTModal] = useState(false);

  const myRef = useRef(null);

  const getVersion = () => {
    if (!user.canvasToken) return 'canvasToken';
    if (messages.length === 0) return 'firstQuestion';
    return 'chatWindow'
  }
  const version = getVersion();

  const file = (user && user.files) ? user.files : [];

  const auth = async () => {
    const res = await isLoggedIn(constants.clientUrl, '/home');
    setIsLoading(false);
    if (res) setUser({...res.user});
  };
  
  useEffect(() => {
    auth();
  }, []);


  const scrollToBottom = () => {
    if (myRef.current) {
      myRef.current.scrollTo({
        top: myRef.current.scrollHeight,
        behavior: 'smooth', // Add smooth scrolling behavior
      });
    }
  };

  const setCanvasToken = async (token) => {
    setIsLoading(true);
    const data = new FormData();
    data.append('canvasToken', token);
    const response = await fetch(`${constants.url}/addCanvasToken`, {
      method: 'POST',
      body: data,
      headers: { "x-access'courser-auth-token": window.localStorage.getItem(constants.authToken) }

    });
    if (response.ok) {
      const res = await response.json();
      console.log('response');
      console.log(res);
      setUser({...user, canvasToken: res.user.canvasToken});
    }
    setIsLoading(false);

  }

  const sendNextQuestion = async (nextQuestion) => {
    scrollToBottom();
    const nxtValue = { "type": "human", "text": nextQuestion }
    const data = new FormData();
    data.append('prompt', nextQuestion);
    const response = await fetch(`${constants.url}/answer`, {
      method: 'POST',
      body: data,
      headers: { "x-access'courser-auth-token": window.localStorage.getItem(constants.authToken) }
    });
    const res = await response.json();
    // addMessage([{...nxtValue}, {"type": "AI", "plans": res.plans, "text": "", "startText": "Here is a revised set of courses", "endText": "Does this meet your expectations better?" }], scrollToBottom);
    addMessage([{ ...nxtValue }, { "type": "human", "text": "We received your question. Thank you kind beta tester!" }], scrollToBottom);
  }

  const handleFileUpload = async (e) => {
    const newFiles = e.target.files;
    console.log(newFiles)
    setIsLoading(true);
    const data = new FormData();
    for (let i = 0; i < newFiles.length; i++) {
      data.append('file', newFiles[i]);
    }
    const response = await fetch(`${constants.url}/upload`, {
      method: 'POST',
      body: data,
      headers: { "x-access'courser-auth-token": window.localStorage.getItem(constants.authToken) }

    });
    const res = await response.json();
    console.log(res);
    setIsLoading(false);
    const resFiles = res.files ? res.files : [];
    setUser({ ...user, files: [...file, ...resFiles] });
  }

  const toggleYTModal = (e) => {
    e.stopPropagation();
    setShowYTModal(!showYTModal);
  };

  const handleOutsideClickYTModal = (e) => {
    const clickedOnFontAwesomeIcon = e.target.closest('.fa-question-circle');
    console.log(clickedOnFontAwesomeIcon)
    if (showYTModal && !clickedOnFontAwesomeIcon) {
      setShowYTModal(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClickYTModal);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClickYTModal);
    };
  }, [showYTModal]);

  if (isLoading) return <Loader />;

  if (version === 'chatWindow') {
    return (
      <div className="py-8 h-[90%]">
        <div className="mx-auto max-w-7xl h-full flex flex-col items-center justify-between">
          <div style={{
            alignItems: 'center',
            flexDirection: 'column',
            display: 'flex',
            justifyContent: 'flex-start',
          }}
            ref={myRef}
            className='w-full flex-col items-center justify-center h-[80%] overflow-auto'>
            {messages.map((plan, i) => {
              return (<Plan plan={plan} key={i} />)
            })}
          </div>
          <CommentForm sendNextQuestion={sendNextQuestion} file={file} addFile={handleFileUpload} />
        </div>
      </div>
    )
  }

  if (version === 'firstQuestion') {
    return (
      <div className="py-10 h-[90%]">
        <header>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">What are you wondering?</h1>
          </div>
        </header>
        <main className='h-full'>
          <div className="mx-auto max-w-7xl h-full">
            <div className="w-full h-[70%] flex flex-col items-center justify-center">
              <CommentForm sendNextQuestion={sendNextQuestion} file={file} addFile={handleFileUpload} />

              <CommentForm sendNextQuestion={sendNextQuestion} placeholder={`e.g. "what should I study for my networks exam?"`} file={file} addFile={handleFileUpload}/>
            </div>
          </div>
        </main>
      </div>
    );
  }
  return (
    <div className="py-10 h-[80%] flex flex-col items-center justify-center">
      {showYTModal ?
        <div className="absolute z-10 overflow-y-auto p-5 bg-iowaYellow-500 rounded-lg flex justify-center items-center" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <iframe width="600" height="400" src="https://www.youtube.com/embed/phzp5RBNYNs?si=o8z-dcrt7M-HjUYH" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
        </div>
        : null}
      <header>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">What is your Canvas Token</h1>
        </div>
      </header>
      <main className='h-full'>
        <div className="mx-auto max-w-7xl h-full">
          <div className="w-full h-[70%] flex flex-col items-center justify-center">
            <CommentForm
              sendNextQuestion={setCanvasToken}
              placeholder={"Ex: 1234~1234~1234~1234"}
              buttonText={"Submit"}
            />
          </div>
        </div>
      </main>
      <footer className="flex justify-center items-center group w-auto">
        <ToolTip text="Help?">
          <FontAwesomeIcon
            icon={faQuestionCircle}
            size="2x"
            color="#FBBF24"
            onClick={(e) => toggleYTModal(e)}
            className="cursor-pointer transition-colors duration-300 hover:text-yellow-400 cursor-pointer fa-question-circle"
          />
        </ToolTip>
      </footer>
    </div>
  );
}


function CommentForm({ sendNextQuestion, placeholder, file, addFile }) {
  const [nextQuestion, setNextQuestion] = useState('');
  return (
    <div className="flex items-start space-x-4 w-[90%] md:w-[600px]">
      <div className="min-w-0 flex-1">
        <div>
          <div className="border-b border-gray-200 focus-within:border-iowaYellow-600">
            <textarea
              rows={1}
              value={nextQuestion}
              onChange={(e) => setNextQuestion(e.target.value)}
              className="block w-full resize-none border-0 border-b border-transparent p-0 pb-2 text-gray-900 placeholder:text-gray-400 focus:border-iowaYellow-600 focus:ring-0 sm:text-sm sm:leading-6"
              placeholder={placeholder}
            ></textarea>
          </div>
          <div className={`flex ${file ? 'justify-between align-center' : 'justify-end'} pt-2`}>
            {file && (
              <div className="flex items-center space-x-5">
                <div className="flow-root">
                  <label htmlFor="fileInput" type="button" className="-m-2 inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-400 hover:text-gray-500">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                    </svg>
                    <input id="fileInput" type="file" className="sr-only" onChange={addFile} multiple />
                  </label>
                </div>
                {file.length > 0 && (
                  <div className="flow-root">
                    <Dropdown files={file} text={'Your Files'} />
                  </div>
                )}
              </div>
            )}
            <button
              className="inline-flex items-center rounded-md bg-iowaYellow-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-iowaYellow-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-iowaYellow-600"
              onClick={() => {
                sendNextQuestion(nextQuestion);
                setNextQuestion('');
              }}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}