import React, { useState, useEffect } from 'react';

const Cooking = () => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const intervalId = setInterval(() => {
      // Add a dot every interval
      setDots((prevDots) => (prevDots.length < 3 ? prevDots + '.' : '.'));
    }, 500); // Adjust the interval time as needed

    return () => {
      // Cleanup the interval on component unmount
      clearInterval(intervalId);
    };
  }, []); // Empty dependency array to run the effect once on mount

  return (
    <div className="mb-4 flex w-full flex-col rounded-br-xl rounded-tr-xl bg-[#f0f0f0] px-4 py-2 md:w-[600px]">
      <p>Cooking{dots}</p>
    </div>
  );
};

export default Cooking;