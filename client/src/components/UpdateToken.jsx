import {useState} from 'react'

const UpdateToken = ({ setCanvasToken, toggleShowUpdateToken }) => {
  const [newToken, setNewToken] = useState('')

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      setCanvasToken(newToken)
    }
  }

  return (
    <div className="focused absolute left-0 top-0 z-10 flex h-full w-full flex-col items-center justify-center gap-5 bg-white md:flex-row">
      <input
        autoFocus
        placeholder="Ex: 1234~1234~1234~1234"
        onChange={(e) => setNewToken(e.target.value)}
        onKeyDown={handleKeyPress}
        className="textInput block w-80 resize-none border-0 border-b border-transparent p-0 pb-2 text-gray-900 placeholder:text-gray-400 focus:border-iowaYellow-600 focus:ring-0 sm:text-sm sm:leading-6"
      />
      <div className="justiy-center flex items-center gap-2">
        <button
          onClick={toggleShowUpdateToken}
          className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 transition duration-200 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={() => setCanvasToken(newToken)}
          className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-yellow-500 px-3 py-2 text-sm text-white shadow-sm ring-1 ring-inset ring-gray-300 transition duration-200 hover:bg-yellow-400"
        >
          Update
        </button>
      </div>
    </div>
  )
}

export default UpdateToken