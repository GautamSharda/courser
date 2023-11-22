import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'

function Sources({sources, handleDeleteSource}) {
  return (
    <div className="mt-auto flex w-full flex-col items-start justify-center">
      <p className="text-lg font-bold text-zinc-600">
        Your sources:{' '}
        {sources.filter((source) => source.url ? source.url.trim() !== '' : source.name).length}
      </p>
      <div className="flex w-full flex-col items-start justify-center gap-2">
        {sources.length == 0 && (
          <p className="text-sm text-zinc-400">
            You have not added any sources yet. Start by adding one up above!
          </p>
        )}

        {sources.map((source, index) => (
          <div
            key={source.id}
            className="flex w-full items-center justify-start gap-2 rounded-md p-2 text-sm text-zinc-600 ring-1 ring-inset ring-zinc-600"
          >
            <p>{source.url ? source.url : source.name}</p>
            <FontAwesomeIcon
              icon={faTrash}
              className="ml-auto cursor-pointer text-red-700 hover:text-red-600"
              onClick={() => handleDeleteSource(index)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default Sources