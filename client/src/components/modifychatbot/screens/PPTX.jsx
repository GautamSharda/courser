import React, {useState} from 'react'
import FileUpload from '../components/FileUpload'
import Sources from '../components/Sources'

import { PresentationChartBarIcon } from '@heroicons/react/24/solid';

export default function PPTX(props) {

    const [sources, setSources] = useState([])

    const handleDeleteSource = (index) => {
        const updatedSources = sources.filter((_, i) => i !== index)
        setSources(updatedSources)
    }

    const handleFileUpload = (e) => {
      const file = e.target.files[0]
      // file.id = uuid(); if we wanted to have unique ids for mapping
      const fileType = file.name.split('.')[1]
      if (fileType === 'pptx') setSources([...sources, file])
    }

    return (
        <div className='w-full h-full'>
            <FileUpload text='PowerPoint' type='pptx' Icon={PresentationChartBarIcon} handleFileUpload={handleFileUpload}/>
            <Sources handleDeleteSource={handleDeleteSource} sources={sources}/>
        </div>
    )
}
