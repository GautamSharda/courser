'use client'

import Navbar from '@/components/Navbar'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink, faDeleteLeft, faTrash} from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';
import constants from '@/helpers/constants';
import isLoggedIn from '@/helpers/isLoggedIn';


function CreateChatbot() {
  const [sources, setSources] = useState([{ id: 1, url: '' }]);
  const [selection, setSelection] = useState('youtube');

  useEffect(() => {
    isLoggedIn(constants.clientUrl);
  }, []);

  const handleDeleteSource = (index) => {
    if (sources.length === 1) {
      // If there's only one input, clear it instead of deleting it
      const updatedSources = [...sources];
      updatedSources[index].url = '';
      setSources(updatedSources);
    } else {
      // If there are more than one input, delete the input
      const updatedSources = sources.filter((_, i) => i !== index);
      setSources(updatedSources);
    }
  };
//`
  return (
    <div className="h-screen w-full">
      <Navbar />
      <div className="my-10 flex h-full w-full flex-col items-center justify-start gap-10">
        <div className="flex flex-col items-center justify-center gap-2">
          <h1 className="text-3xl font-bold text-zinc-700">Create Chatbot</h1>
          <p className="text-sm md:text-md text-center text-zinc-500">Copy/paste your lecture video links into the textbox and let Courser handle the rest!</p>
        </div>
        <div className='grid grid-cols-12 gap-8 max-w-7xl px-4 lg:mx-auto'>
          <div className='col-span-12 sm:col-span-4 lg:col-span-2'>
            <div className='flex flex-col justify-center items-center gap-2'>
              <div className={`flex justify-center items-center gap-2 text-md p-2 w-full text-center ${selection === "youtube" ? 'text-yellow-500 bg-zinc-50' : 'text-zinc-500'}`}>
                <FontAwesomeIcon icon={faLink} className='h-full w-4'/>
                <p className='h-full'>Youtube URL</p>
              </div>
              <button className="bg-zinc-700 text-zinc-300 transition duration-200 hover:bg-zinc-600 hover-text-zinc-100 rounded-sm p-2 text-sm w-full" type="button" onClick={() => setSources([...sources, { id: sources.length + 1, url: '' }])}>Add URL</button>
            </div>
          </div>
          <div className="col-span-12 sm:col-span-10 lg:col-span-10">
            <div className="flex justify-betweeen items-start relative">
              <div className='flex justify-center items-start flex-col max-w-2xl lg:w-4/6'>
                <div className='flex justify-start p-2 pt-0 items-center w-full gap-2 text-md'>
                  <h1 className='text-xl font-bold'>Youtube URL</h1>
                </div>
                <div className='flex flex-col gap-2 w-full'>
                  {sources.map((source, index) => (
                    <div className="relative mt-2 rounded-sm w-full" key={index}>
                      <div class="flex space-x-2 w-full">
                        <input
                          type="text"
                          name="website"
                          className="flex-auto rounded-sm border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus-ring-inset focus-ring-yellow-500 sm:text-sm sm:leading-6"
                          placeholder="https://www.youtube.com/watch?v=a00AaaAAAAA&ab_channel=JohnDoe"
                          value={source.url}
                          onChange={(e) => {
                            const updatedSources = [...sources];
                            updatedSources[index].url = e.target.value;
                            setSources(updatedSources);
                          }}
                        />
                        <button
                          data-variant="flat"
                          className="bg-zinc-700 text-zinc-300 transition duration-200 hover:bg-zinc-600 hover-text-zinc-100 rounded-sm p-2 px-4"
                          type="button"
                          onClick={() => handleDeleteSource(index)}
                        >
                          {sources.length === 1 ? <FontAwesomeIcon icon={faDeleteLeft}/> : <FontAwesomeIcon icon={faTrash}/>}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className='ml-8 w-full lg:my-0 lg:w-2/6'>
                <div className='flex justify-center items-center flex-col max-w-2xl lg:w-4/6 gap-5'>
                  <p className='text-zinc-600'>Sources: <span className="font-bold">{sources.filter((source) => source.url.trim() !== '').length}</span></p>
                  <button
                    data-variant="flat"
                    disabled={sources.filter((source) => source.url.trim() !== '').length === 0}
                    className={`bg-zinc-700 text-zinc-300 transition duration-200 rounded-sm p-2 px-4 ${sources.filter((source) => source.url.trim() !== '').length === 0 ? 'cursor-not-allowed opacity-50' : 'hover-bg-zinc-600 hover-text-zinc-100'}`}
                    type="button"
                  >
                    Create Chatbot
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateChatbot;
