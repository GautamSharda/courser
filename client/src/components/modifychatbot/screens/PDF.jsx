import React, {useState} from 'react'
import FileUpload from '../components/FileUpload';
import Sources from '../components/Sources'
import { DocumentIcon,PresentationChartBarIcon } from '@heroicons/react/24/solid';

export default function PDF(props) {

    const [sources, setSources] = useState([]);

    const handleDeleteSource = (index) => {
        const updatedSources = sources.filter((_, i) => i !== index)
        setSources(updatedSources)
    }

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        const fileType = file.name.split(".")[1];
        // file.id = uuid(); if we wanted to have unique ids for mapping
        if (fileType === 'pdf') setSources([...sources, file])
    }

    return (
      <div className="h-full w-full">
        <FileUpload
          text="PDF"
          type="pdf"
          Icon={DocumentIcon}
          handleFileUpload={handleFileUpload}
        />
        <Sources sources={sources} handleDeleteSource={handleDeleteSource}/>
      </div>
    )
}
