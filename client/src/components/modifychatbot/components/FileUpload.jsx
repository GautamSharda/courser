import React, { useState } from 'react';


export default function FileUpload({ text, type, Icon, handleFileUpload }) {
  return (
    <div className="h-full w-full">
      <div className="col-span-full">
        <label
          htmlFor="cover-photo"
          className="text-md block font-semibold leading-6 text-gray-900"
        >
          {text} Files
        </label>
        <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
          <div className="text-center">
            <Icon
              className="mx-auto h-12 w-12 text-gray-300"
              aria-hidden="true"
            />
            <div className="mt-4 flex text-sm leading-6 text-gray-600">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer rounded-md bg-white font-semibold text-iowaYellow focus-within:outline-none focus-within:ring-2 focus-within:ring-iowaYellow focus-within:ring-offset-2 hover:text-iowaYellow-300"
              >
                <span>Upload {type} files</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  onChange={handleFileUpload}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs leading-5 text-gray-600">{type} up to 20MB</p>
          </div>
        </div>
      </div>
    </div>
  )
}
