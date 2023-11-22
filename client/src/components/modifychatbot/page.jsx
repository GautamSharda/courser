import React, { useState, useEffect } from 'react';
import SelectType from './components/SelectType';
import Save from './components/Save';
import YouTube from './screens/YouTube';
import PDF from './screens/PDF';
import PPTX from './screens/PPTX';

const createText = {
    'title': 'Create Chatbot',
    'subtitle': 'Add your data sources to configure your chatbot',
    'button': 'Create Chatbot'
}

const modifyText = {
    'title': 'Modify Chatbot',
    'subtitle': 'Modify your chatbot',
    'button': 'Save Changes'
}

const screens = {
    'youtube': YouTube,
    'PDF': PDF,
    'PPTX': PPTX,
}

export default function ModifyChatbot({ create }) {
    const [view, setView] = useState('youtube');
    const text = create ? createText : modifyText;
    const Screen = screens[view];
    return (
        <div className='w-full h-full flex justify-center items-center'>
            <div className='w-[95%] max-w-[1050px] flex flex-col justify-start items-center h-full mt-40'>
                <div className='flex flex-col justify-center items-center mb-12'>
                    <h2 className='text-3xl font-bold'>{text.title}</h2>
                    <p>{text.subtitle}</p>
                </div>
                <div className="flex items-start justify-between w-full">
                    <div className='w-[15%] mr-md h-full'>
                        <SelectType view={view} setView={setView} />
                    </div>
                    <div className='w-[50%]'>
                        <Screen />
                    </div>
                    <div className='w-[25%]'>
                        <Save />
                    </div>
                </div>
            </div>
        </div>
    )
}