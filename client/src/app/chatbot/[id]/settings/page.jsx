'use client';
import React from "react";
import {useState, useEffect} from "react";
import { Loader } from '@/components/Loader';
import constants from '@/helpers/constants';
import isLoggedIn from '@/helpers/isLoggedIn';
import { ChromePicker } from 'react-color';



export default function Settings ({ params }) {
    const [loading, setLoading] = useState('');
    const [name, setName] = useState('');
    const [placeholder, setPlaceholder] = useState('');
    const [color, setColor] = useState('#fdf7c3');
    const [initialState, setInitialState] = useState({});//{name: '', placeholder: '', color: '', prompt: '', imgUrl: ''}
    const [prompt, setPrompt] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imgUrl, setImgUrl] = useState(constants.courserLogoLarge);

    const courseID = params.id;


    const getData = async () => {
        const course = await isLoggedIn(constants.clientUrl, `course/getCourseProtected/${courseID}`);
        console.log(course);
        const {color, backgroundImg, name, instructions, placeholder } = course;
        setName(name || '');
        setPlaceholder(placeholder || '');
        setColor(color || '#fdf7c3');
        setPrompt(instructions || '');
        setImgUrl(backgroundImg || constants.courserLogoLarge);
        setInitialState({name, placeholder, color, instructions, backgroundImg});

        setLoading('');
    }

    const save = async () => {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('courseID', courseID);
        formData.append('placeholder', placeholder);
        formData.append('color', color);
        formData.append('instructions', prompt);
        formData.append('image', imageFile);
        // formData.append('courseID', courseID);
        setLoading('Saving ...');
        const response = await fetch(`${constants.url}/course/update`, {
            method: 'POST',
            headers: { 
                "x-access'courser-auth-token": window.localStorage.getItem(constants.authToken),
            },
            body: formData,
        });
        setLoading('');
        if (response.ok) {
            const data = await response.json();
            console.log(data);
        } else {
            console.log('we had an error');
        }
    }
    
      useEffect(() => {
        getData();
      }, []);

    if (loading) {
        return (
        <div className="w-full h-full flex flex-col justify-center items-center">
            <Loader text={loading} className={'-'}/>
        </div>
        )
    }

    const hasDataChanged = () => {
        return name !== initialState.name || placeholder !== initialState.placeholder || color !== initialState.color || prompt !== initialState.instructions || (imgUrl !== initialState.backgroundImg && imgUrl !== constants.courserLogoLarge);
    }
    const canUpdate = hasDataChanged();
    
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        console.log(file);
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImgUrl(reader.result);
            }
            reader.readAsDataURL(file);
        }
    };
    return (
        <div className="w-full h-full flex flex-col justify-center items-center bg-red config-container">
            <div className="h-full w-full max-w-[800px] flex flex-col justify-start items-center pt-8 pb-8">
                <div className="h-16 w-full flex justify-start items-center">
                    <p className="text-2xl font-bold mr-4">Settings</p>
                </div>
                <div className="h-full w-full mt-4">
                    <div className="flex w-full flex-col items-start justify-start gap-2">
                        <label className="text-md w-full text-left font-bold text-zinc-600 md:text-lg">
                        Chatbot Name
                        </label>
                        <input
                        type="text"
                        name="website"
                        className="w-full flex-auto rounded-md border-0 max-w-[275px] px-3 py-1.5 text-zinc-600 ring-1 ring-inset ring-zinc-400 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-yellow-500 sm:text-sm sm:leading-6"
                        placeholder="Chatbot Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="flex w-full flex-col items-start justify-start gap-2  mt-8">
                        <label className="text-md w-full text-left font-bold text-zinc-600 md:text-lg">
                        Question Placeholder
                        </label>
                        <input
                        type="text"
                        name="website"
                        className="w-full flex-auto rounded-md border-0 px-3 py-1.5 text-zinc-600 ring-1 ring-inset ring-zinc-400 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-yellow-500 sm:text-sm sm:leading-6"
                        placeholder="What is significant about horseshoe crabs?"
                        value={placeholder}
                        onChange={(e) => setPlaceholder(e.target.value)}
                        />
                    </div>
                    {/* <div className="flex w-full flex-col items-start justify-start gap-2  mt-8">
                        <label className="text-md w-full text-left font-bold text-zinc-600 md:text-lg">
                        Chatbot System Prompt
                        </label>
                        <textarea
                        type="text"
                        name="website"
                        className="w-full flex-auto rounded-md resize-none border-0 px-3 py-1.5 text-zinc-600 ring-1 ring-inset ring-zinc-400 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-yellow-500 sm:text-sm sm:leading-6"
                        placeholder="You are a helpful AI assistant for a University classroom that answers questions for students about this course."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        />
                    </div> */}
                    <div className="flex w-full flex-row items-start justify-between gap-2 mt-8 px-10">
                        <div className="flex flex-col items-start justify-start">
                            <label className="text-md w-full text-left font-bold text-zinc-600 md:text-lg">
                                Background Image
                            </label>
                            <div className="relative w-[225px] rounded-sm mt-4 hover:cursor-pointer group">
                                <img className="w-full h-full rounded-sm" src={imgUrl} />
                                <div className="absolute inset-0 bg-gray-700 opacity-0 group-hover:opacity-50 transition-opacity duration-200 flex justify-center items-center text-white rounded-md" onClick={() => document.getElementById('fileInput').click()}>Upload Image</div>
                                <input type="file" id="fileInput" accept="image/png, image/jpeg, image/jpg" className="hidden" onChange={handleImageUpload} />
                            </div>
                        </div>
                        <div className="flex flex-col items-start justify-start">
                            <label className="text-md w-full text-left font-bold text-zinc-600 md:text-lg">
                            Chatbot Color
                            </label>
                            <ChromePicker 
                                onChangeComplete={(color) => setColor(color.hex)}
                                color={color}
                                toggles={false}
                                className="mt-4"
                            />
                        </div>
                    </div>
                    <button
                        data-variant="flat"
                        disabled={!canUpdate}
                        className={`w-full rounded-md mt-10 mb-10 bg-zinc-700 p-2 px-4 text-zinc-300 transition duration-200 ${
                            !canUpdate
                            ? 'cursor-not-allowed opacity-50'
                            : 'hover-bg-zinc-600 hover-text-zinc-100'
                        }`}
                        type="button"
                        onClick={save}
                        >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    )
};

