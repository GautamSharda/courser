'use client'

// pages/client-rendered-page.js
import React, { useState, useEffect, useMemo, useRef } from 'react'
import isLoggedIn from '@/helpers/isLoggedIn';
import { Loader } from './Loader';
import { AIResponse } from './AIResponse';
import messagesHook from '@/helpers/useMessage';
import Dropdown from './Dropdown';
import ToolTip from './ToolTip';
import UpdateToken from './UpdateToken';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import Cooking from './Cooking';

import constants from '@/helpers/constants';
import { redirect } from 'next/dist/server/api-utils';
import { Asap } from 'next/font/google';

export function Main() {
  const [user, setUser] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [messages, addMessage] = messagesHook();
  const [showYTModal, setShowYTModal] = useState(false);
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const [userFiles, setUserFiles] = useState([]);
  const [showUpdateToken, setShowUpdateToken] = useState(false)

  const myRef = useRef(null);

  const getVersion = () => {
    if (!user.canvasToken) return 'canvasToken';
    if (messages.length === 0) return 'firstQuestion';
    return 'chatWindow'
  }
  const version = getVersion();

  const file = (user && user.personalFiles) ? user.personalFiles : [];

  const auth = async () => {
    console.log('in auth');
    const res = await isLoggedIn(constants.clientUrl, '/home');
    setIsLoading(false);
    if (res) {
      setUser({ ...res.user })

      // Use the callback provided to setUserFiles to ensure you have the updated state
      setUserFiles(() => {
        return res.user.personalFiles
      })
    }
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

    const toggleShowUpdateToken = () => {
      setShowUpdateToken(!showUpdateToken)
    }

  const setCanvasToken = async (token) => {
    setIsLoading(true);
    const data = new FormData();
    data.append('canvasToken', token);
    const response = await fetch(`${constants.url}/addCanvasToken`, {
      method: 'POST',
      body: data,
      headers: { "x-access'courser-auth-token": window.localStorage.getItem(constants.authToken) }
    });

    // Response is 401 if user's token is invalid  

    if (response.ok) {
      const res = await response.json();
      console.log('response');
      console.log(res);
      setUser({ ...user, canvasToken: res.user.canvasToken });
    }else{
      if (response.status==401){
        alert('Invalid Canvas Token');
      } else{
        alert(`Sorry, we ran into an error setting up your account! We'll have it fixed ASAP.`)
      }
    }
    setIsLoading(false);

  }

  const sendNextQuestion = async (nextQuestion) => {
    scrollToBottom();
    setIsLoadingResponse(true);
    const nxtValue = { "type": "human", "text": nextQuestion }
    addMessage([{ ...nxtValue }], scrollToBottom);
    const data = new FormData();
    data.append('prompt', nextQuestion);
    const response = await fetch(`${constants.url}/answer`, {
      method: 'POST',
      body: data,
      headers: { "x-access'courser-auth-token": window.localStorage.getItem(constants.authToken) }
    });
    const res = await response.json();
    addMessage([{ ...nxtValue }, { "type": "AI", "text": res.finalAnswer, "sources": res.sources }], scrollToBottom);
    setIsLoadingResponse(false);
    // scroll to bottom of chat window
    scrollToBottom();
  }

  const handleFileUpload = async (e) => {
    const newFiles = e.target.files;
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
    setIsLoading(false);
    const resFiles = res.files ? res.files : [];
    setUser({ ...user, personalFiles: [...user.personalFiles, ...resFiles] });
  }

  // =====> Function to delete files <======
  // const deleteFile = async (file) => {
  //   setIsLoading(true);
  //   const data = new FormData();
  //   data.append('file', file);
  //   const response = await fetch(`${constants.url}/delete`, {
  //     method: 'POST',
  //     body: data,
  //     headers: { "x-access'courser-auth-token": window.localStorage.getItem(constants.authToken) }

  //   });
  //   const res = await response.json();
  //   console.log(res);
  //   setIsLoading(false);
  //   const resFiles = res.files ? res.files : [];
  //   setUser({ ...user, files: [...file, ...resFiles] });
  // }

  const toggleYTModal = (e) => {
    e.stopPropagation();
    setShowYTModal(!showYTModal);
  };

  const handleOutsideClickYTModal = (e) => {
    const clickedOnFontAwesomeIcon = e.target.closest('.fa-question-circle');
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

  console.log("messages: ", messages);

  if (version === 'chatWindow') {
    return (
      <div className="h-full w-full py-2">
        {showUpdateToken ? (
          <UpdateToken
            setCanvasToken={setCanvasToken}
            toggleShowUpdateToken={toggleShowUpdateToken}
          />
        ) : null}
        <div className="mx-auto flex h-full max-w-7xl flex-col items-center justify-between">
          <div
            ref={myRef}
            className="flex h-full w-full flex-col items-center justify-start overflow-auto px-12 md:w-[600px] md:px-0"
          >
            {messages.map((response, i) => {
              return <AIResponse response={response} key={i} />
            })}
            {isLoadingResponse ? <Cooking /> : null}
          </div>
          <CommentForm
            sendNextQuestion={sendNextQuestion}
            file={file}
            addFile={handleFileUpload}
            placeholder={`Follow up`}
            toggleShowUpdateToken={toggleShowUpdateToken}
          />
        </div>
      </div>
    )
  }

  if (version === 'firstQuestion') {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-10 py-10">
        <header>
          {showUpdateToken ? (
            <UpdateToken
              setCanvasToken={setCanvasToken}
              toggleShowUpdateToken={toggleShowUpdateToken}
            />
          ) : null}
          <div className="mx-auto max-w-7xl">
            <h1 className="text-2xl font-bold leading-tight tracking-tight text-gray-900 md:text-3xl">
              What are you wondering?
            </h1>
          </div>
        </header>
        <main className="w-full">
          <div className="mx-auto my-10 max-w-7xl">
            <div className="flex h-[70%] min-w-full flex-col items-center justify-center">
              <CommentForm
                sendNextQuestion={sendNextQuestion}
                file={file}
                addFile={handleFileUpload}
                placeholder={`e.g. "what should I study for my networks exam?"`}
                toggleShowUpdateToken={toggleShowUpdateToken}
              />
            </div>
          </div>
        </main>
      </div>
    )
  }
  return (
    <div className="flex h-[80%] w-full flex-col items-center justify-center py-10">
      {showYTModal ? (
        <div
          className="absolute z-10 flex w-[90%] items-center justify-center overflow-y-auto rounded-lg bg-iowaYellow-500 p-5 md:w-auto"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <iframe
            width="600"
            height="400"
            src="https://www.youtube.com/embed/phzp5RBNYNs?si=o8z-dcrt7M-HjUYH"
            title="YouTube video player"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
          ></iframe>
        </div>
      ) : null}
      <header>
        <div className="mx-auto text-center">
          <h1 className="text-2xl font-bold leading-tight tracking-tight text-gray-900 md:text-3xl">
            What is your Canvas Token
          </h1>
        </div>
      </header>
      <main className="h-full w-full">
        <div className="mx-auto h-full max-w-7xl">
          <div className="flex h-[70%] w-full flex-col items-center justify-center">
            <CommentForm
              sendNextQuestion={setCanvasToken}
              placeholder={'Ex: 1234~1234~1234~1234'}
            />
          </div>
        </div>
      </main>
      <h1>Confused? Click here!</h1>
      <footer className="group flex w-auto items-center justify-center gap-3">
        <ToolTip text="Help?">
          <FontAwesomeIcon
            icon={faQuestionCircle}
            size="2x"
            color="#FBBF24"
            onClick={(e) => toggleYTModal(e)}
            className="fa-question-circle cursor-pointer transition-colors duration-300 hover:text-yellow-400"
          />
        </ToolTip>
      </footer>
    </div>
  )
}


function CommentForm({ sendNextQuestion, placeholder, file, addFile, btnText, toggleShowUpdateToken }) {
  const [nextQuestion, setNextQuestion] = useState('');

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendNextQuestion(nextQuestion);
      setNextQuestion('');
    }
  }

  return (
    <div className="sticky bottom-0 right-0 flex w-full items-start space-x-4 bg-white px-12 pt-2 md:w-[600px] md:px-0">
      <div className="min-w-0 flex-1">
        <div>
          <div className="border-b border-gray-200 focus-within:border-iowaYellow-600">
            <textarea
              rows={1}
              value={nextQuestion}
              onChange={(e) => setNextQuestion(e.target.value)}
              className="textInput block w-full resize-none border-0 border-b border-transparent p-0 pb-2 text-gray-900 placeholder:text-gray-400 focus:border-iowaYellow-600 focus:ring-0 sm:text-sm sm:leading-6"
              placeholder={placeholder}
              onKeyDown={handleKeyPress}
            ></textarea>
          </div>
          <div
            className={`flex ${
              file ? 'align-center justify-between' : 'justify-end'
            } pt-2`}
          >
            {file && (
              <div className="flex items-center space-x-5">
                <div className="flow-root">
                  <label
                    htmlFor="fileInput"
                    type="button"
                    className="-m-2 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-gray-400 hover:text-gray-500"
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13"
                      />
                    </svg>
                    <input
                      id="fileInput"
                      type="file"
                      className="sr-only"
                      onChange={addFile}
                      multiple
                    />
                  </label>
                </div>

                <div className="flow-root">
                  <Dropdown files={file} />
                </div>

                {toggleShowUpdateToken ? (
                  <div className="">
                    <button
                      onClick={toggleShowUpdateToken}
                      className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                      Update Token
                    </button>
                  </div>
                ) : null}
              </div>
            )}
            <button
              className="inline-flex items-center rounded-md bg-iowaYellow-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-iowaYellow-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-iowaYellow-600"
              onClick={() => {
                sendNextQuestion(nextQuestion)
                setNextQuestion('')
              }}
            >
              {btnText ? btnText : 'Submit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}