import React from 'react'
import FileUpload from '../components/FileUpload';
import { DocumentIcon,PresentationChartBarIcon } from '@heroicons/react/24/solid';

export default function PDF(props) {
    return (
        <div className='w-full h-full'>
            <FileUpload text='PDF' type='pdf' Icon={DocumentIcon}/>
        </div>
    )
}
