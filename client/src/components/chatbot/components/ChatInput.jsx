"use client";
import {useState, useRef, useEffect} from "react";

function ChatInput({handleSubmit, color}) {

  const [message, setMessage] = useState("")
  const formRef = useRef(null); // Create a ref for the form element
  const [borderColor, setBorderColor] = useState('')
  const [textColor, setTextColor] = useState('')

  const handleChatSubmit = (e) => {
    if (!message.trim()) return; // Check if the trimmed message is empty (no non-whitespace characters)
    handleSubmit(message);
    formRef.current.reset(); // Reset the form using the ref
    // return text area to its normal height
    const textArea = document.querySelector("textarea");
    textArea.style.height = "inherit";
    setMessage("");
  };

  const handleTextAreaChange = (e) => {
    setMessage(e.target.value);
    e.target.style.height = "inherit";
    e.target.style.height = `${e.target.scrollHeight}px`; 
  }

  return (
    <div className="sticky bottom-0 right-0 z-10 flex w-full max-w-3xl flex-col items-center justify-center bg-white p-4">
      <form
        className="w-full rounded-xl shadow-2xl"
        onSubmit={handleChatSubmit}
        ref={formRef}
      >
        <div
          className={
            `flex h-auto w-full items-center justify-center rounded-xl border-2 bg-white ${color
              ? `border-${color}`
              : 'border-bucksBlue' }`
          }
        >
          <textarea
            placeholder="What is significant about horseshoe crabs?"
            className="mr-1 max-h-[100px] min-h-full w-full resize-none rounded-l-xl border-none px-3 py-2 leading-tight text-zinc-700 text-md focus:outline-none"
            onChange={(e) => handleTextAreaChange(e)}
            autoFocus
            name="message"
            autoComplete="off"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleChatSubmit(e)
              }
            }}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="none"
            className={`${
              !message.trim() ? 'opacity-50' : 'cursor-pointer hover:opacity-80'
            } mr-2 h-5 w-5 ${color ? `text-${color}` : 'text-bucksBlue'} transition duration-200`}
            onClick={handleChatSubmit}
          >
            <path
              d="M.5 1.163A1 1 0 0 1 1.97.28l12.868 6.837a1 1 0 0 1 0 1.766L1.969 15.72A1 1 0 0 1 .5 14.836V10.33a1 1 0 0 1 .816-.983L8.5 8 1.316 6.653A1 1 0 0 1 .5 5.67V1.163Z"
              fill="currentColor"
            ></path>
          </svg>
        </div>
      </form>
    </div>
  )
}

export default ChatInput;
