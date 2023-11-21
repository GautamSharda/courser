import React, { useState, useEffect } from 'react';
import { PlayCircleIcon } from '@heroicons/react/20/solid';
import { DocumentIcon,PresentationChartBarIcon } from '@heroicons/react/24/outline';

const tabs = {
    "youtube": {text: "YouTube", icon: PlayCircleIcon},
    "PDF": {text: "PDF", icon: DocumentIcon},
    "PPTX": {text: "PowerPoint", icon: PresentationChartBarIcon},
    

}

export default function SelectType(props) {
    const {view, setView} = props;

    return (
        <div className='w-full h-full flex flex-col align-top justify-start'>
            {Object.keys(tabs).map((tab, index) => {
                return (
                    <div className='w-full h-[43px] flex justify-center items-center'>
                        <Pill text={tabs[tab].text} Icon={tabs[tab].icon} active={view === tab} clicked = {() => {setView(tab)}}/>
                    </div>
                )
            })}
        </div>
    )
}


function Pill ({text, Icon, active, clicked}) {
    const [isHovering, setIsHovering] = useState(false);
    const colorful = (active || isHovering);
    return (
        <div className={`w-full h-full flex justify-center items-center`} >
            <div className={`w-full flex justify-start items-center hover:cursor-pointer ${colorful && 'bg-[#fbfbfc]'} rounded-md transition ease-in-out p-2`}
                onClick={clicked}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
            >
                <Icon className={`mr-1 h-6 w-6 ${colorful ? 'text-iowaYellow' : 'text-slate-900'} transition ease-in-out`} aria-hidden="true"/>
                <p className={`text-m font-bold ${colorful ? 'text-iowaYellow' : 'text-slate-900'}`}>{text}</p>
            </div>
        </div>
    )
}