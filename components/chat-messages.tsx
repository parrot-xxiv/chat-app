"use client"

import { useEffect, useRef } from "react"

interface ChatMessagesProps {
  messages: {
    id: string
    sender: string
    content: string
    timestamp: string
    isMe: boolean
  }[]
}

export default function ChatMessages({ messages }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div key={message.id} className={`flex ${message.isMe ? "justify-end" : "justify-start"}`}>
          <div
            className={`max-w-[80%] rounded-lg p-3 ${
              message.isMe ? "bg-blue-500 text-white rounded-br-none" : "bg-white text-gray-800 rounded-bl-none shadow"
            }`}
          >
            {!message.isMe && <p className="text-xs font-medium mb-1">{message.sender}</p>}
            <p>{message.content}</p>
            <p className={`text-xs mt-1 text-right ${message.isMe ? "text-blue-100" : "text-gray-500"}`}>
              {message.timestamp}
            </p>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  )
}
