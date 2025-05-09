"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import UserList from "@/components/user-list"
import ChatMessages from "@/components/chat-messages"
import { MessageSquare, Users, LogOut, Send, Plus } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"

// Mock data for demonstration
const MOCK_USERS = [
  { id: "1", name: "John Doe", online: true, avatar: "/vercel.svg?height=40&width=40" },
  { id: "2", name: "Jane Smith", online: true, avatar: "/vercel.svg?height=40&width=40" },
  { id: "3", name: "Bob Johnson", online: false, avatar: "/vercel.svg?height=40&width=40" },
  { id: "4", name: "Alice Williams", online: true, avatar: "/vercel.svg?height=40&width=40" },
  { id: "5", name: "Charlie Brown", online: false, avatar: "/vercel.svg?height=40&width=40" },
]

const MOCK_GROUPS = [
  { id: "g1", name: "Team Alpha", members: 5, avatar: "/vercel.svg?height=40&width=40" },
  { id: "g2", name: "Project Beta", members: 3, avatar: "/vercel.svg?height=40&width=40" },
  { id: "g3", name: "Coffee Chat", members: 8, avatar: "/vercel.svg?height=40&width=40" },
]

const MOCK_MESSAGES = [
  { id: "m1", sender: "John Doe", content: "Hey there! How's it going?", timestamp: "10:30 AM", isMe: false },
  {
    id: "m2",
    sender: "You",
    content: "I'm good, thanks! Just working on that new project.",
    timestamp: "10:32 AM",
    isMe: true,
  },
  {
    id: "m3",
    sender: "John Doe",
    content: "That sounds interesting. Can you tell me more about it?",
    timestamp: "10:33 AM",
    isMe: false,
  },
  {
    id: "m4",
    sender: "You",
    content: "It's a chat application with real-time features.",
    timestamp: "10:35 AM",
    isMe: true,
  },
]

export default function ChatInterface() {
  const [message, setMessage] = useState("")
  const [activeChat, setActiveChat] = useState<string | null>("1")
  const [chatType, setChatType] = useState<"direct" | "group">("direct")
  const [messages, setMessages] = useState(MOCK_MESSAGES)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const router = useRouter()
  const isMobile = useMediaQuery("(max-width: 768px)")

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    const newMessage = {
      id: `m${messages.length + 1}`,
      sender: "You",
      content: message,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isMe: true,
    }

    setMessages([...messages, newMessage])
    setMessage("")

    // Simulate receiving a response after a short delay
    setTimeout(() => {
      const responseMessage = {
        id: `m${messages.length + 2}`,
        sender: activeChat === "1" ? "John Doe" : "Team Alpha",
        content: "Thanks for your message! I'll get back to you soon.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isMe: false,
      }
      setMessages((prev) => [...prev, responseMessage])
    }, 2000)
  }

  const handleLogout = () => {
    router.push("/")
  }

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen)
  }

  useEffect(() => {
    if (!isMobile) {
      setIsMobileSidebarOpen(false)
    }
  }, [isMobile])

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - hidden on mobile unless toggled */}
      <div
        className={`${
          isMobile
            ? isMobileSidebarOpen
              ? "fixed inset-0 z-50 block w-72 bg-white shadow-lg"
              : "hidden"
            : "w-72 border-r bg-white"
        } flex flex-col h-full`}
      >
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">ChatApp</h2>
        </div>

        <Tabs defaultValue="direct" className="flex-1 overflow-hidden">
          <div className="px-4 pt-4">
            <TabsList className="w-full">
              <TabsTrigger value="direct" className="flex-1" onClick={() => setChatType("direct")}>
                <MessageSquare className="w-4 h-4 mr-2" />
                Chats
              </TabsTrigger>
              <TabsTrigger value="group" className="flex-1" onClick={() => setChatType("group")}>
                <Users className="w-4 h-4 mr-2" />
                Groups
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="direct" className="flex-1 overflow-y-auto p-2">
            <UserList
              users={MOCK_USERS}
              activeUserId={activeChat}
              onSelectUser={(id) => {
                setActiveChat(id)
                setChatType("direct")
                if (isMobile) setIsMobileSidebarOpen(false)
              }}
            />
          </TabsContent>

          <TabsContent value="group" className="flex-1 overflow-y-auto p-2">
            <div className="space-y-2">
              {MOCK_GROUPS.map((group) => (
                <div
                  key={group.id}
                  className={`flex items-center p-2 rounded-lg cursor-pointer hover:bg-gray-100 ${
                    activeChat === group.id && chatType === "group" ? "bg-gray-100" : ""
                  }`}
                  onClick={() => {
                    setActiveChat(group.id)
                    setChatType("group")
                    if (isMobile) setIsMobileSidebarOpen(false)
                  }}
                >
                  <div className="relative">
                    <img src={group.avatar || "/vercel.svg"} alt={group.name} className="w-10 h-10 rounded-full" />
                  </div>
                  <div className="ml-3">
                    <p className="font-medium">{group.name}</p>
                    <p className="text-xs text-gray-500">{group.members} members</p>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-2">
                <Plus className="w-4 h-4 mr-2" />
                Create New Group
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <div className="p-4 border-t mt-auto">
          <Button variant="outline" className="w-full" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col h-full">
        {/* Chat header */}
        <div className="flex items-center justify-between p-4 border-b bg-white">
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={toggleMobileSidebar} className="mr-2">
              <Users className="h-5 w-5" />
            </Button>
          )}

          <div className="flex items-center">
            {activeChat && (
              <>
                <div className="relative">
                  <img src="/vercel.svg?height=40&width=40" alt="Chat avatar" className="w-10 h-10 rounded-full" />
                  {chatType === "direct" && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                  )}
                </div>
                <div className="ml-3">
                  <p className="font-medium">
                    {chatType === "direct"
                      ? MOCK_USERS.find((u) => u.id === activeChat)?.name
                      : MOCK_GROUPS.find((g) => g.id === activeChat)?.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {chatType === "direct"
                      ? "Online"
                      : `${MOCK_GROUPS.find((g) => g.id === activeChat)?.members} members`}
                  </p>
                </div>
              </>
            )}
          </div>

          <div>{/* Additional chat options could go here */}</div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <ChatMessages messages={messages} />
        </div>

        {/* Message input */}
        <div className="p-4 border-t bg-white">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button type="submit" disabled={!message.trim()}>
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

