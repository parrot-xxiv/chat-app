"use client"

import Image from "next/image"

interface UserListProps {
  users: {
    id: string
    name: string
    online: boolean
    avatar: string
  }[]
  activeUserId: string | null
  onSelectUser: (id: string) => void
}

export default function UserList({ users, activeUserId, onSelectUser }: UserListProps) {
  // Sort users by online status
  const sortedUsers = [...users].sort((a, b) => {
    if (a.online && !b.online) return -1
    if (!a.online && b.online) return 1
    return 0
  })

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-2 mb-2">
        <h3 className="text-sm font-medium text-gray-500">Online Users</h3>
        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
          {users.filter((user) => user.online).length} online
        </span>
      </div>

      {sortedUsers.map((user) => (
        <div
          key={user.id}
          className={`flex items-center p-2 rounded-lg cursor-pointer hover:bg-gray-100 ${
            activeUserId === user.id ? "bg-gray-100" : ""
          }`}
          onClick={() => onSelectUser(user.id)}
        >
          <div className="relative">
            <Image src={user.avatar || "/vercel.svg"} alt={user.name} className="w-10 h-10 rounded-full" />
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                user.online ? "bg-green-500" : "bg-gray-300"
              }`}
            ></span>
          </div>
          <div className="ml-3">
            <p className="font-medium">{user.name}</p>
            <p className="text-xs text-gray-500">{user.online ? "Online" : "Offline"}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
