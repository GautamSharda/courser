'use client'
function ChatMessage({ message, isUser, sources, color }) {

  return (
    <div
      className={`my-1 flex w-full items-center ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
    >
      <div
        style={isUser ? { backgroundColor: color } : {}}
        className={`min-w-3/4 max-w-5/6 flex shrink items-center justify-between overflow-auto px-4 py-2 ${
          !isUser
            ? 'rounded-r-lg rounded-tl-lg bg-zinc-500'
            : 'rounded-l-lg rounded-tr-lg'
        }`}
      >
        <p className="text-md whitespace-no-wrap w-full overflow-hidden break-words text-white">
          {message}
          {sources ? (
            <div className="mt-2 flex flex-col items-start border-t-2 border-zinc-400 text-sm">
              {sources.map((source, i) => (
                <a
                  key={i}
                  className="w-fit max-w-[100%] cursor-pointer overflow-hidden overflow-ellipsis text-ellipsis whitespace-nowrap break-words text-zinc-300 transition duration-200 hover:text-zinc-100"
                  target="_blank"
                  href={source.url}
                >
                  {`(${source.minutes < 10 ? '0'+source.minutes : source.minutes}:${source.seconds < 10 ? '0'+source.seconds : source.seconds}) ${source.title}`}
                </a>
              ))}
            </div>
          ) : null}
        </p>
      </div>
    </div>
  )
}

export default ChatMessage;
