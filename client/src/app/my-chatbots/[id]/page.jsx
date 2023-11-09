'use client';
import React from "react";
import Chatbot from '@/components/chatbot/Chatbot';


const Page = ({ params }) => {
    console.log('at my chatbots');
    console.log(params);
    return <Chatbot id={params.id} />;
}

export default Page;