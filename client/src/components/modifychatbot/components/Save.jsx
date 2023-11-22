import React, { useState } from 'react'
export default function Save(props) {
    const [name, setName] = useState('');
    const disabled = name.trim() === '';
    return (
      <div className="flex h-full w-full flex-col items-center justify-start rounded-sm border-2 border-solid border-slate-100 p-4">
        <h3 className="text-md mb-2 font-medium">Finalize</h3>
        <div className="mb-1 flex w-full items-start justify-start">
          <p className="text-sm font-medium">Name:</p>
        </div>
        <input
          type="text"
          className="h-[35px] w-full rounded-md border-0 px-3 py-1.5 text-zinc-600 ring-1 ring-inset ring-zinc-400 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-yellow-500"
          placeholder="Biology 101"
          onChange={(e) => setName(e.target.value)}
          value={name}
        />

        <button
          className={`h-[35px] w-full rounded-md ${
            disabled
              ? 'cursor-not-allowed bg-zinc-700 text-zinc-300 opacity-50'
              : 'bg-iowaYellow text-white'
          } mt-4 font-semibold `}
          disabled={disabled}
        >
          Create Chatbot
        </button>
      </div>
    )
}
