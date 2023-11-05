import Navbar from '@/components/Navbar'

function CreateChatbot() {
  return (
    <div className="h-screen w-full">
      <Navbar />
      <div className="my-10 flex h-full w-full flex-col items-center justify-start gap-10">
        <div className="flex flex-col items-center justify-center gap-2">
          <h1 className="text-3xl font-bold text-zinc-700">Create Chatbot</h1>
          <p className="text-md text-zinc-500">Add your course lectures and data to train your chatbot!</p>
        </div>
      </div>
    </div>
  )
}

export default CreateChatbot