'use client';
import React from "react";
import Chatbot from "@/components/chatbot/Chatbot";
import { NavLink } from '@/components/NavLink'


export default function Chat ({ params }) {
    const courseID = params.id;
    return (
        <div className="w-full h-full flex flex-col justify-center items-center">
            <div className="h-full w-full max-w-[800px] flex flex-col justify-start items-center pt-8 pb-8">
                <div className="h-16 w-full flex justify-start items-center">
                    <p className="text-2xl font-bold mr-4">Chatbot</p>
                    <NavLink href={'./settings'}>Modify</NavLink>
                </div>
                <div className="h-full w-full border-2 p-2 rounded-md">
                    <Chatbot id={courseID} />
                </div>
            </div>
        </div>
    )
};

