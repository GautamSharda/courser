'use client';
import React from "react";
import Chatbot from '@/components/chatbot/Chatbot';


const Page = ({ params }) => {
    return <Chatbot id={params.id} />;
}

export default Page;