import React, { useState, useEffect } from 'react'
import Sources from "../components/Sources.jsx"


function YouTube({sources, setSources}) {
    const [currentSource, setCurrentSource] = useState('');

    const handleDeleteSource = (index) => {
        const updatedSources = sources.youtube.filter((_, i) => i !== index);
        setSources((prevSources) => ({
          ...prevSources,
          youtube: updatedSources,
        }))
    }

    const handleAddSource = () => {
        const updatedSources = [...sources.youtube];
        updatedSources.push({ id: sources.youtube.length + 1, url: currentSource });
        setSources((prevSources) => ({ ...prevSources, youtube: updatedSources }));
        // clear the input
        setCurrentSource('');
    }

    return (
    <div className='flex w-full h-full flex-col items-start justify-start'> 
        <div className="flex w-full flex-col items-center justify-center gap-2">
            <label className="text-md w-full text-left font-bold text-zinc-600 md:text-lg">
            Add Youtube videos to your chatbot
            </label>
            <input
                type="text"
                name="website"
                className="w-full flex-auto rounded-md border-0 px-3 py-1.5 text-zinc-600 ring-1 ring-inset ring-zinc-400 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-yellow-500 sm:text-sm sm:leading-6"
                placeholder="https://www.youtube.com/watch?v=a00AaaAAAAA&ab_channel=JohnDoe"
                onChange={(e) => setCurrentSource(e.target.value)}
                value={currentSource}
            />
            <button
                disabled={currentSource.trim() === ''}
                className={`${
                    currentSource.trim() === '' ? 'opacity-50' : ''
                } 'hover-text-zinc-100 hover:bg-zinc-600' w-full rounded-md bg-zinc-700 p-2 text-sm text-zinc-300 transition duration-200`}
                type="button"
                onClick={() => handleAddSource()}
            >
            Add URL
            </button>
        </div>
        <Sources sources={sources.youtube} handleDeleteSource={handleDeleteSource}/>
    </div>
)}

export default YouTube