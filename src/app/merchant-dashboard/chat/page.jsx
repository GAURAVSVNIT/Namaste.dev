'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Users } from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, collection, addDoc, query, where, orderBy, onSnapshot, getDocs, serverTimestamp } from '../../../lib/firebase';

const MerchantChat = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [user] = useAuthState(auth);
  const messagesEndRef = useRef(null);

  // Load conversations for this merchant
  useEffect(() => {
    if (!user) return;

    const loadConversations = async () => {
      try {
        // First, let's load all chats to debug
        console.log('Loading conversations for merchant:', user.uid);
        
        const chatsRef = collection(db, 'chats');
        
        // Query all chats first to see what data we have
        const allChatsSnapshot = await getDocs(chatsRef);
        console.log('Total chats found:', allChatsSnapshot.size);
        
        allChatsSnapshot.forEach((doc) => {
          const data = doc.data();
          console.log('Chat data:', {
            id: doc.id,
            roomId: data.roomId,
            merchantId: data.merchantId,
            userId: data.userId,
            userName: data.userName,
            userRole: data.userRole,
            message: data.message
          });
        });
        
        // Now query for merchant-specific chats
        // Check for both actual user UID and the hardcoded merchant ID
        const q1 = query(
          chatsRef,
          where('merchantId', '==', user.uid)
        );
        
        const q2 = query(
          chatsRef,
          where('merchantId', '==', 'current_merchant_001')
        );
        
        // Execute both queries
        const [chatSnapshot1, chatSnapshot2] = await Promise.all([
          getDocs(q1),
          getDocs(q2)
        ]);
        
        console.log('Chats with user UID:', chatSnapshot1.size);
        console.log('Chats with hardcoded ID:', chatSnapshot2.size);
        
        // Combine both result sets
        const allDocs = [];
        chatSnapshot1.forEach(doc => allDocs.push(doc));
        chatSnapshot2.forEach(doc => allDocs.push(doc));
        
        console.log('Total merchant chats found:', allDocs.length);
        const chatsByRoom = {};
        
        allDocs.forEach((doc) => {
          const data = doc.data();
          const roomId = data.roomId;
          
          if (!chatsByRoom[roomId]) {
            chatsByRoom[roomId] = {
              roomId,
              productId: data.productId,
              customerId: data.userId,
              customerName: data.userName,
              lastMessage: data.message,
              lastTimestamp: data.timestamp?.toDate() || new Date(data.timestamp),
              unreadCount: data.userRole === 'customer' && !data.isRead ? 1 : 0
            };
          } else {
            // Update with more recent message
            if (data.timestamp > chatsByRoom[roomId].lastTimestamp) {
              chatsByRoom[roomId].lastMessage = data.message;
              chatsByRoom[roomId].lastTimestamp = data.timestamp?.toDate() || new Date(data.timestamp);
            }
          }
        });
        
        const conversationsList = Object.values(chatsByRoom);
        setConversations(conversationsList);
        
        if (conversationsList.length > 0 && !activeConversation) {
          setActiveConversation(conversationsList[0]);
        }
      } catch (error) {
        console.error('Error loading conversations:', error);
      }
    };

    loadConversations();
  }, [user]);

  // Real-time listener for active conversation messages
  useEffect(() => {
    if (!activeConversation) return;

    const messagesRef = collection(db, 'chats');
    const q = query(
      messagesRef,
      where('roomId', '==', activeConversation.roomId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesList = [];
      const seenIds = new Set();
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        const messageId = doc.id;
        
        // Skip duplicate messages
        if (!seenIds.has(messageId)) {
          seenIds.add(messageId);
          messagesList.push({
            id: messageId,
            ...data,
            timestamp: data.timestamp?.toDate() || new Date()
          });
        }
      });
      
      // Sort messages by timestamp to ensure correct order
      messagesList.sort((a, b) => a.timestamp - b.timestamp);
      setMessages(messagesList);
    });

    return () => unsubscribe();
  }, [activeConversation]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !activeConversation) return;

    try {
      await addDoc(collection(db, 'chats'), {
        roomId: activeConversation.roomId,
        message: newMessage.trim(),
        userId: user.uid,
        userName: user.displayName || 'Merchant',
        userRole: 'merchant',
        productId: activeConversation.productId,
        merchantId: 'current_merchant_001', // Use consistent merchant ID
        timestamp: serverTimestamp(),
        isRead: false
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (!user) return <div>Please log in to access merchant chat.</div>;

  return (
    <div className="flex h-full bg-white rounded-lg shadow-sm border">
      {/* Conversations Sidebar */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Users size={20} />
            <h2 className="font-semibold">Customer Conversations</h2>
            <span className="text-sm text-gray-500">({conversations.length})</span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <MessageCircle size={32} className="mx-auto mb-2" />
              <p>No customer conversations yet</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.roomId}
                onClick={() => setActiveConversation(conv)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  activeConversation?.roomId === conv.roomId ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{conv.customerName}</div>
                    <div className="text-xs text-gray-500 truncate mt-1">{conv.lastMessage}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {conv.lastTimestamp?.toLocaleDateString()} {conv.lastTimestamp?.toLocaleTimeString()}
                    </div>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <MessageCircle size={18} />
                <span className="font-medium">Chatting with {activeConversation.customerName}</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  <MessageCircle size={32} className="mx-auto mb-2" />
                  <p>No messages yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.userId === user.uid ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          msg.userId === user.uid
                            ? 'bg-blue-500 text-white'
                            : 'bg-white border shadow-sm'
                        }`}
                      >
                        <div className="text-xs opacity-70 mb-1">
                          {msg.userName} • {msg.timestamp?.toLocaleTimeString()}
                        </div>
                        <p>{msg.message}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t bg-white">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageCircle size={48} className="mx-auto mb-4" />
              <p>Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MerchantChat;
