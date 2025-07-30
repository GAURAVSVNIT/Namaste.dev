'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from '../ui/dialog';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp } from '../../lib/firebase';

const ChatButton = ({ product }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [user] = useAuthState(auth);
  const messagesEndRef = useRef(null);
  
  const roomId = `product_${product?.id}_merchant_${product?.merchantId || 'default'}`;

  // Real-time listener for messages
  useEffect(() => {
    if (!isOpen || !user) return;

    const messagesRef = collection(db, 'chats');
    const q = query(
      messagesRef,
      where('roomId', '==', roomId)
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
  }, [isOpen, user, roomId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const merchantId = product?.merchantId || product?.sellerId || 'default';
    console.log('Sending message with data:', {
      roomId,
      productId: product?.id,
      merchantId,
      userId: user.uid,
      userName: user.displayName || user.email?.split('@')[0] || 'User'
    });

    try {
      await addDoc(collection(db, 'chats'), {
        roomId,
        message: newMessage.trim(),
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || 'User',
        userRole: 'customer',
        productId: product?.id,
        merchantId,
        timestamp: serverTimestamp(),
        isRead: false
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (!user) return null;

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 z-50 flex items-center gap-2"
        aria-label="Chat with merchant"
      >
        <MessageCircle size={24} />
        <span className="hidden sm:inline">Chat with Merchant</span>
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md h-[600px] p-0">
          <DialogHeader className="p-4 pb-0 border-b">
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle size={20} />
              Chat with Merchant
            </DialogTitle>
            <p className="text-sm text-gray-600 mt-1">
              Ask questions about {product?.name}
            </p>
          </DialogHeader>
          
          <div className="flex-1 flex flex-col">
            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  <MessageCircle className="mx-auto mb-2" size={32} />
                  <p>Start a conversation with the merchant!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.userId === user.uid ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
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
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChatButton;
