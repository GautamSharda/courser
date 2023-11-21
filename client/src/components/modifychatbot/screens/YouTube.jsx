import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';


function YouTube() {
    const [sources, setSources] = useState([]);
    const [currentSource, setCurrentSource] = useState('');

    const handleDeleteSource = (index) => {
        const updatedSources = sources.filter((_, i) => i !== index);
        setSources(updatedSources);
    }
    const handleAddSource = () => {
        const updatedSources = [...sources];
        updatedSources.push({ id: sources.length + 1, url: currentSource });
        setSources(updatedSources);
        // clear the input
        setCurrentSource('');
    }

    return (
    <div className='flex w-full h-full flex-col items-start justify-start'> 
        <div className="flex w-full flex-col items-center justify-center gap-2">
            <label className="text-md w-full text-left font-bold text-zinc-600 md:text-lg">
            2. Add your sources (YouTube videos) to your chatbot
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
        <div className="mt-auto flex w-full flex-col items-start justify-center">
            <p className="text-lg font-bold text-zinc-600">
            Your sources:{' '}
            {sources.filter((source) => source.url.trim() !== '').length}
            </p>
            <div className="flex w-full flex-col items-start justify-center gap-2">
            {sources.length == 0 && (
                <p className="text-sm text-zinc-400">
                You have not added any sources yet. Start by adding one up above!
                </p>
            )}

            {sources.map((source, index) => (
                <div
                key={source.id}
                className="flex w-full items-center justify-start gap-2 p-2 ring-1 ring-inset ring-zinc-600 text-zinc-600 text-sm rounded-md"
                >
                <p>{source.url}</p>
                <FontAwesomeIcon
                    icon={faTrash}
                    className="ml-auto cursor-pointer text-red-700 hover:text-red-600"
                    onClick={() => handleDeleteSource(index)}
                />
                </div>
            ))}
            </div>
        </div>
    </div>
)}

export default YouTube