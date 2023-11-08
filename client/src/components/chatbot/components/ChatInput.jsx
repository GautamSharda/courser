"use client";
import {useState, useRef} from "react";

function ChatInput({handleSubmit}) {

  const [message, setMessage] = useState("")
  const formRef = useRef(null); // Create a ref for the form element

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
    <div className="bg-white w-full flex-col flex justify-center items-center sticky z-10 bottom-0 right-0 p-4 max-w-3xl">
      <form
        className="w-full shadow-2xl rounded-xl"
        onSubmit={handleChatSubmit}
        ref={formRef}
      >
        <div className="w-full h-auto flex justify-center items-center border-bucksBlue border-2 bg-white rounded-xl">
          <textarea
            placeholder="What is significant about horseshoe crabs?"
            className="max-h-[100px] min-h-full text-zinc-700 py-2 px-3 resize-none leading-tight mr-1 w-full rounded-l-xl focus:outline-none"
            onChange={(e) => handleTextAreaChange(e)}
            autoFocus
            name="message"
            autoComplete="off"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleChatSubmit(e);
              }
            }}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="none"
            className={`${
              !message.trim() ? "opacity-50" : "hover:opacity-80 cursor-pointer"
            } text-bucksBlue w-5 h-5 transition duration-200 mr-2`}
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
  );
}

export default ChatInput;
