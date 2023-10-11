import React, { useState, useEffect, useRef } from 'react'


const messagesHook = () => {
  const [messages, setMessages] = useState([]);

  const addMessage = async (messagesArr, scrollToBottom) => {
    var state = [...messages];
    for (let first of messagesArr) {
      if (first.type !== "AI") {
        setMessages([...state, first]);
        state = [...state, first]
      } else {
        const order = ["startText", "text", "plans", "endText"];
        const nxt = { "type": "AI", "plans": [], "text": "", "startText": "", "endText": "" }
        while (order.length > 0) {
          const key = order.shift();
          if (key === "plans") {
            const plans = first[key];
            const totalPlans = [];
            while (plans.length > 0) {
              const nextPlan = plans.shift();
              const newPlans = [];
              while (nextPlan.courses.length > 0) {
                const nextCourse = nextPlan.courses.shift();
                newPlans.push(nextCourse);
                setMessages([...state, { ...nxt, "plans": [...totalPlans, { "courses": [...newPlans] }] }]);
                await sleep(200);
              }
              totalPlans.push({ "courses": [...newPlans] });
              nxt["plans"] = [...totalPlans];
            }
          } else {
            while (first[key].length > 0) {
              const nextCharacter = first[key][0];
              first[key] = first[key].slice(1);
              nxt[key] += nextCharacter;
              setMessages([...state, { ...nxt }]);
              await sleep(20);
            }
          }
        }
      }
    }
    scrollToBottom();
  }
  const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  return [messages, addMessage];
}

export default messagesHook;