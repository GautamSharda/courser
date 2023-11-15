'use client';
import React from "react";
import { useState, useEffect, useRef } from "react";
import constants from '@/helpers/constants';
import isLoggedIn from '@/helpers/isLoggedIn';
import copy from '@/images/icons/copy.png'
import Image from 'next/image'




export default function Embed ({ params }) {
    const courseID = params.id;
    console.log(courseID);
      useEffect(() => {
        isLoggedIn(constants.clientUrl);
      }, []);

    const inputEl = useRef(null);
    const copyTextEl = useRef(null);


    const handleCopyClick = () => {
        inputEl.current.select();
        document.execCommand("copy");
        copyTextEl.current.classList.add("active");
        window.getSelection().removeAllRanges();
        setTimeout(() => {
            copyTextEl.current.classList.remove("active");
        }, 2500);
    };

    return (
        <div className="w-full h-full flex flex-col justify-center items-center bg-red config-container">
            <div className="h-full w-full max-w-[800px] flex flex-col justify-start items-center pt-8 pb-8">
                <div className="h-16 w-full flex justify-start items-center">
                    <p className="text-2xl font-bold mr-4">Embed</p>
                </div>
                <div className="h-full w-full mt-4">
                    <p>Embed this url into your Canvas page through the redirect LTI extension</p>
                    <div className="copy-text mt-4" ref={copyTextEl}>
                        <input type="copyTextInput" className="copyTextInput focus:border-transparent" value={`${constants.clientUrl}/my-chatbots/${courseID}`} ref={inputEl} readonly />
                        <button onClick={handleCopyClick}>
                            <Image src={copy} alt="vlaid" className='copyImage' />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
};

