# Courser

Courser is an online platform for professors to build chatbots for their class that respond to student questions based on the class lectures.

Professors can embed these chatbots in their class page (ex. on Canvas) using the chatbot's public link.

One particularly loved feature of Courser's chatbots is that they respond to questions with links to the most relevant parts from all the lectures.

You can read more about the technical details in the API section.

What follows is some ideas about where to take Courser.

# Minimum Viable Product

Professors can use the chatbot to create weekly learning modules with relevant source material, lecture notes, assignments, and assessments.

Students can use the chatbot to ask questions about the source material, lecture notes, assignments, and assessments.

You can embed these chatbots in your class page (ex. on Canvas) using their public link.

# Future Roadmap

Professors can create a course and students can join it with a course code or valid email.

Professors can upload source material (text + video + image) and students can view it.

All student questions are posted to a discussion board for everyone to search, view, and respond to.

Professors can record videos and create text files on Courser.

Various standard LMS features: announcements, discussions, grades etc.

# API

There are 2 endpoints: /chat and /create

1) /create creates a new empty Chatbot

In the future, a Chatbot can have various kinds of Source(s), but for now it can only have 1 kind of source: lecture videos.

Specifically, links to YT videos.

Here is how the links are used:

YoutubeLinks : [String] --> Transcriptions : [String] --> Chunks : [Object] --> ChunkStrings --> [String] --> ChunkEmbeddings [[Number]]

Chunks are stored in a document database. ChunksEmbeddings are stored in a vector database alongside their corresponding index value in Chunks.

2) /chat uses the user's chat message and responds with the chatbots response alongside the sources used

Here is how the chat message is used:

Message : String --> MessageEmbedding : [Number] --> ChunkEmbeddings : [[Number]] --> ChunkIndex : Number --> Chunks : [Object] --> ChunkTexts : String --> Response : String, Sources: String

Future Technical Considerations
---InputHandler: A class that retrieves a file hosted elsewhere or uploaded directly
---ChunkMaker: All the different file types need to be converted into chunks that are then stored appropriately in both Document and Vector DB
 (this could be broken up into text retriever, chunk maker, chunk storer, vector maker, and vector storer)
---ChunkRetrievers: Combine chunks from all sources and perform a vector search for the most relevant one