'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Send, User, MessageCircle, Users, Phone, Video } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useMerchantStore } from '@/store/merchant-store'
import { formatDistanceToNow } from 'date-fns'

export default function ChatPage() {
  const { messages, addMessage, onlineUsers, setOnlineUsers } = useMerchantStore()
  const [newMessage, setNewMessage] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    // Simulate WebSocket connection
    const connectWebSocket = () => {
      // Mock initial data
      setOnlineUsers([
        { id: 1, name: 'Support Team', status: 'online', lastSeen: new Date() },
        { id: 2, name: 'Technical Support', status: 'away', lastSeen: new Date(Date.now() - 300000) },
        { id: 3, name: 'Sales Team', status: 'online', lastSeen: new Date() }
      ])

      if (selectedUser === null) {
        setSelectedUser({ id: 1, name: 'Support Team', status: 'online', lastSeen: new Date() })
      }

      // Mock initial messages
      if (messages.length === 0) {
        const initialMessages = [
          {
            id: 1,
            senderId: 1,
            senderName: 'Support Team',
            content: 'Hello! How can I help you today?',
            timestamp: new Date(Date.now() - 3600000),
            type: 'received'
          },
          {
            id: 2,
            senderId: 'merchant',
            senderName: 'You',
            content: 'Hi, I need help with my product listing',
            timestamp: new Date(Date.now() - 3300000),
            type: 'sent'
          },
          {
            id: 3,
            senderId: 1,
            senderName: 'Support Team',
            content: 'I\'d be happy to help you with that. What specific issue are you facing?',
            timestamp: new Date(Date.now() - 3000000),
            type: 'received'
          }
        ]
        
        initialMessages.forEach(msg => addMessage(msg))
      }
    }

    connectWebSocket()

    // Cleanup function
    return () => {
      // Disconnect WebSocket here
    }
  }, [addMessage, setOnlineUsers, selectedUser, messages.length])

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (newMessage.trim() && selectedUser) {
      const message = {
        senderId: 'merchant',
        senderName: 'You',
        content: newMessage,
        timestamp: new Date(),
        type: 'sent'
      }
      
      addMessage(message)
      setNewMessage('')

      // Simulate response from support
      setTimeout(() => {
        const response = {
          senderId: selectedUser.id,
          senderName: selectedUser.name,
          content: 'Thank you for your message. I\'m looking into that for you.',
          timestamp: new Date(),
          type: 'received'
        }
        addMessage(response)
      }, 1000)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'bg-green-500'
      case 'away':
        return 'bg-yellow-500'
      case 'offline':
        return 'bg-gray-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="h-[calc(100vh-12rem)] flex space-x-6">
      {/* Sidebar - Online Users */}
      <div className="w-80 flex-shrink-0">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Support Team</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {onlineUsers.map((user) => (
                <motion.div
                  key={user.id}
                  whileHover={{ scale: 1.02 }}
                  className={`flex items-center space-x-3 p-3 cursor-pointer transition-colors ${
                    selectedUser?.id === user.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedUser(user)}
                >
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(user.status)}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{user.name}</p>
                    <p className="text-xs text-gray-500">
                      {user.status === 'online' ? 'Online' : 
                       user.status === 'away' ? 'Away' : 
                       `Last seen ${formatDistanceToNow(user.lastSeen)} ago`}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {user.status}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <Card className="flex-1 flex flex-col">
          {/* Chat Header */}
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedUser?.avatar} />
                  <AvatarFallback>{selectedUser?.name?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{selectedUser?.name}</CardTitle>
                  <p className="text-sm text-gray-500">
                    {selectedUser?.status === 'online' ? 'Online now' : 
                     selectedUser?.status === 'away' ? 'Away' : 
                     `Last seen ${formatDistanceToNow(selectedUser?.lastSeen)} ago`}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Video className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Messages */}
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.type === 'sent' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md ${message.type === 'sent' ? 'order-2' : 'order-1'}`}>
                  <div className={`rounded-lg p-3 ${
                    message.type === 'sent' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                  </div>
                  <p className={`text-xs text-gray-500 mt-1 ${
                    message.type === 'sent' ? 'text-right' : 'text-left'
                  }`}>
                    {formatDistanceToNow(message.timestamp)} ago
                  </p>
                </div>
                <div className={`${message.type === 'sent' ? 'order-1 mr-2' : 'order-2 ml-2'}`}>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={message.avatar} />
                    <AvatarFallback>
                      {message.type === 'sent' ? 'M' : message.senderName[0]}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Message Input */}
          <div className="border-t p-4">
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button type="submit" disabled={!newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  )
}
