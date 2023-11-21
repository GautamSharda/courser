import React from 'react'
import FileUpload from '../components/FileUpload'
import { PresentationChartBarIcon } from '@heroicons/react/24/solid';

export default function PPTX(props) {
    return (
        <div className='w-full h-full'>
            <FileUpload text='PowerPoint' type='pptx' Icon={PresentationChartBarIcon}/>
        </div>
    )
}
