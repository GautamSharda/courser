import React, {useState} from 'react'
import FileUpload from '../components/FileUpload'
import Sources from '../components/Sources'

import { PresentationChartBarIcon } from '@heroicons/react/24/solid';

export default function PPTX({sources, setSources}) {

    const handleDeleteSource = (index) => {
        const updatedSources = sources.PPTX.filter((_, i) => i !== index)
        setSources((prevSources) => ({
            ...prevSources,
            PPTX: updatedSources
        }))
    }

    const handleFileUpload = (e) => {
        const file = e.target.files[0]
        // file.id = uuid(); if we wanted to have unique ids for mapping
        const fileType = file.name.split('.')[1]
        const updatedSources = [...sources.PPTX, file]
        if (fileType === 'pptx') {
            setSources((prevSources) => ({
                ...prevSources,
                PPTX: updatedSources
            }))
        }
    }

    return (
        <div className='w-full h-full'>
            <FileUpload text='PowerPoint' type='pptx' Icon={PresentationChartBarIcon} handleFileUpload={handleFileUpload}/>
            <Sources handleDeleteSource={handleDeleteSource} sources={sources.PPTX}/>
        </div>
    )
}
