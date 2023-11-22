import React, {useState} from 'react'
import FileUpload from '../components/FileUpload';
import Sources from '../components/Sources'
import { DocumentIcon,PresentationChartBarIcon } from '@heroicons/react/24/solid';

export default function PDF({sources, setSources}) {

    const handleDeleteSource = (index) => {
        const updatedSources = sources.PDF.filter((_, i) => i !== index)
        setSources((prevSources) => ({
            ...prevSources,
            PDF: updatedSources
        }))
    }

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        const fileType = file.name.split(".")[1];
        // file.id = uuid(); if we wanted to have unique ids for mapping
        const updatedSources = [...sources.PDF, file];
        if (fileType === 'pdf') {
          setSources((prevSources) => ({
            ...prevSources,
            PDF: updatedSources,
          }))
        }
    }

    return (
      <div className="h-full w-full">
        <FileUpload
          text="PDF"
          type="pdf"
          Icon={DocumentIcon}
          handleFileUpload={handleFileUpload}
        />
        <Sources sources={sources.PDF} handleDeleteSource={handleDeleteSource}/>
      </div>
    )
}
