"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import pb from "@/lib/pocketbase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import UserList from "@/components/user-list"
import ChatMessages from "@/components/chat-messages"
import { MessageSquare, Users, Send, Plus } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import LogoutButton from "./logout-button"
import Image from "next/image"


const MOCK_GROUPS = [
  { id: "g1", name: "Team Alpha", members: 5, avatar: "/vercel.svg?height=40&width=40" },
  { id: "g2", name: "Project Beta", members: 3, avatar: "/vercel.svg?height=40&width=40" },
  { id: "g3", name: "Coffee Chat", members: 8, avatar: "/vercel.svg?height=40&width=40" },
]

export default function ChatInterface() {
  const [message, setMessage] = useState("")
  const [activeChat, setActiveChat] = useState<string | null>(null)
  const [chatType, setChatType] = useState<"direct" | "group">("direct")
  const [messages, setMessages] = useState<{ id: string; sender: string; content: string; timestamp: string; isMe: boolean }[]>([])
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [users, setUsers] = useState<{ id: string; name: string; online: boolean; avatar: string }[]>([])

  // Load list of users (excluding current user)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const records = await pb.collection("users").getFullList()
        const currentUserId = pb.authStore.record?.id
        const list = records
          .filter((rec) => rec.id !== currentUserId)
          .map((rec) => ({
            id: rec.id,
            name: rec.name || rec.username || rec.email,
            online: rec.isOnline,
            avatar: rec.avatar || "",
          }))
        setUsers(list)
      } catch (err) {
        console.error("Failed to fetch users", err)
      }
    }
    fetchUsers()
  }, [])

  // Set default active chat when users load
  useEffect(() => {
    if (users.length > 0 && !activeChat) {
      setActiveChat(users[0].id)
    }
  }, [users, activeChat])

  // Function to fetch direct messages
  const fetchMessages = useCallback(async () => {
    if (chatType !== "direct" || !activeChat) return
    try {
      const currentUserId = pb.authStore.record?.id
      const { items } = await pb
        .collection("direct_messages")
        .getList(1, 50, {
          sort: "created",
          filter: `sender = "${currentUserId}" && receiver = "${activeChat}" || sender = "${activeChat}" && receiver = "${currentUserId}"`,
        })
      const formatted = items.map((item) => {
        const isMe = item.sender === currentUserId
        const senderName = isMe
          ? "You"
          : users.find((u) => u.id === item.sender)?.name || "Unknown"
        return {
          id: item.id,
          sender: senderName,
          content: item.content,
          timestamp: new Date(item.created).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isMe,
        }
      })
      setMessages(formatted)
    } catch (err) {
      console.error("Failed to fetch messages", err)
    }
  }, [activeChat, chatType, users])

  // Fetch messages when activeChat or chatType changes
  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  // Subscribe to real-time incoming messages
  useEffect(() => {
    let unsubscribe: (() => Promise<void>) | null = null
    const subscribeToMessages = async () => {
      if (chatType !== "direct" || !activeChat) return
      const currentUserId = pb.authStore.record?.id
      unsubscribe = await pb
        .collection("direct_messages")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .subscribe("*", (e: any) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const record = e.record as any
          if (
            (record.sender === currentUserId && record.receiver === activeChat) ||
            (record.receiver === currentUserId && record.sender === activeChat)
          ) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === record.id)) return prev
              const isMe = record.sender === currentUserId
              const senderName = isMe
                ? "You"
                : users.find((u) => u.id === record.sender)?.name || "Unknown"
              return [
                ...prev,
                {
                  id: record.id,
                  sender: senderName,
                  content: record.content,
                  timestamp: new Date(record.created).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                  isMe,
                },
              ]
            })
          }
        })
    }
    subscribeToMessages()
    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [activeChat, chatType, users])

  // when user logs in/out
  useEffect(() => {
    let unsubscribe: (() => Promise<void>) | null = null

    const subscribeToUserStatus = async () => {
      const currentUserId = pb.authStore.record?.id
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      unsubscribe = await pb.collection("users").subscribe("*", (e: any) => {
        const updatedUser = e.record
        if (updatedUser.id === currentUserId) return // 🔒 Skip self

        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === updatedUser.id
              ? { ...user, online: updatedUser.isOnline }
              : user
          )
        )
      })
    }

    subscribeToUserStatus()

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [])


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || chatType !== "direct" || !activeChat) return
    try {
      const currentUserId = pb.authStore.record?.id
      await pb.collection("direct_messages").create({
        sender: currentUserId,
        receiver: activeChat,
        content: message,
      })
      setMessage("")
      fetchMessages()
    } catch (err) {
      console.error("Failed to send message", err)
    }
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
        className={`${isMobile
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
              users={users}
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
                  className={`flex items-center p-2 rounded-lg cursor-pointer hover:bg-gray-100 ${activeChat === group.id && chatType === "group" ? "bg-gray-100" : ""
                    }`}
                  onClick={() => {
                    setActiveChat(group.id)
                    setChatType("group")
                    if (isMobile) setIsMobileSidebarOpen(false)
                  }}
                >
                  <div className="relative">
                    <Image src={group.avatar || "/vercel.svg"} alt={group.name} className="w-10 h-10 rounded-full" />
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
          <LogoutButton />
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
                  <Image src="/vercel.svg?height=40&width=40" alt="Chat avatar" className="w-10 h-10 rounded-full" />
                  {chatType === "direct" && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                  )}
                </div>
                <div className="ml-3">
                  <p className="font-medium">
                    {chatType === "direct"
                      ? users.find((u) => u.id === activeChat)?.name
                      : MOCK_GROUPS.find((g) => g.id === activeChat)?.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {chatType === "direct"
                      ? (users.find((u) => u.id === activeChat)?.online ? "Online" : "Offline")
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

