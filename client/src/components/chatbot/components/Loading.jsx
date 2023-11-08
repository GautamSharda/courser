import React, { useState, useEffect } from "react";

const Loading = () => {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const intervalId = setInterval(() => {
      // Add a dot every interval
      setDots((prevDots) => (prevDots.length < 3 ? prevDots + "." : "."));
    }, 500); // Adjust the interval time as needed

    return () => {
      // Cleanup the interval on component unmount
      clearInterval(intervalId);
    };
  }, []); // Empty dependency array to run the effect once on mount

  return (
    <div
      className={`my-1 w-full flex items-center justify-start`}
    >
      <div
        className={`px-4 py-2 flex justify-between min-w-3/4 max-w-5/6 items-center shrink overflow-auto bg-zinc-500 rounded-r-lg rounded-tl-lg`}
      >
        <p className="break-words text-white text-md w-full whitespace-no-wrap overflow-hidden">
            Thinking{dots}
        </p>
      </div>
    </div>
  );
};

export default Loading;
