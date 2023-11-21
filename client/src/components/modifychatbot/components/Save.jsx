import React, { useState } from 'react'
export default function Save(props) {
    const [name, setname] = useState('');
    const disabled = name.trim() === '';
    return (
        <div className='w-full h-full flex flex-col border-solid border-2 rounded-sm border-slate-100 items-center justify-start p-4'>
            <h3 className='text-md font-medium mb-2'>Finalize</h3>
            <div className='w-full flex items-start justify-start mb-1'>
                <p className='text-sm font-medium'>Name:</p>
            </div>
            <input
                type="text"
                className="w-full h-[35px] rounded-md border-0 px-3 py-1.5 text-zinc-600 ring-1 ring-inset ring-zinc-400 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-yellow-500"
                placeholder="Biology 101"
                onChange={(e) => setname(e.target.value)}
                value={name}
            />

            <button className={`w-full h-[35px] rounded-md ${disabled ? 'bg-zinc-700 cursor-not-allowed' : 'bg-iowaYellow'} text-white font-semibold mt-4 `}
            disabled={disabled}
            >
                Create Chatbot
            </button>
        </div>
    )
}
