'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  PaperclipIcon, 
  SmileIcon, 
  Check, 
  CheckCheck, 
  Users, 
  MessageCircle, 
  Clock,
  Phone,
  VideoIcon,
  MoreVertical
} from 'lucide-react';
import { useDashboard } from '@/context/DashboardContext';
import { Textarea } from '@/components/ui/textarea';
import styles from './Chat.module.css';
import RoleProtected from '@/components/auth/RoleProtected';
import { USER_ROLES } from '@/lib/roles';
import styles from './Chat.module.css';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
};

/**
 * Renders the main customer support chat interface with real-time messaging, typing indicators, and enhanced input controls.
 *
 * Provides a chat UI where users can send messages, view grouped message history by date, and receive simulated support team responses. Includes features such as animated message transitions, typing indicators, emoji picker toggling, and role-based access control.
 */
function ChatPageContent() {
  const { state, dispatch } = useDashboard();
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [state.messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const message = {
        id: Date.now().toString(),
        sender: 'You',
        message: newMessage.trim(),
        timestamp: new Date().toISOString(),
        isSupport: false,
        status: 'sent'
      };
      
      dispatch({ type: 'ADD_MESSAGE', payload: message });
      setNewMessage('');
      setIsTyping(true);

      // Simulate typing indicator
      setTimeout(() => {
        setIsTyping(false);
        
        // Simulate support response with more variety
        const responses = [
          'Thank you for your message. Our team will get back to you shortly.',
          'We have received your inquiry and are looking into it now.',
          'Thanks for reaching out! Let me check that for you.',
          'Great question! I\'ll find that information for you right away.',
          'Thanks for contacting us. Give me a moment to review your request.'
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        const supportMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'Support Team',
          message: randomResponse,
          timestamp: new Date().toISOString(),
          isSupport: true
        };
        dispatch({ type: 'ADD_MESSAGE', payload: supportMessage });
      }, 2000 + Math.random() * 1000); // Random delay between 2-3 seconds
    }
  };

  const handleKeyDown = (e) => {
    // Send message on Enter (but allow Shift+Enter for new line)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // Group messages by date
  const groupedMessages = state.messages.reduce((groups, message) => {
    const date = formatDate(message.timestamp);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  return (
    <div className={styles.chatContainer}>
      {/* Enhanced Header */}
      <motion.header 
        className={styles.header}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className={styles.title}>Customer Support Chat</h1>
        <p className={styles.subtitle}>Connect with your customers in real-time</p>
      </motion.header>

      {/* Enhanced Chat Interface */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={styles.chatCard}
      >
        <div className={styles.chatHeader}>
          <div className={styles.chatStatus}>
            <div className={styles.onlineIndicator}>
              <span className={styles.statusDot}></span>
              <span>Support Team - Online</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Phone className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <VideoIcon className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
        
        <div className={styles.messagesContainer}>
          <div className={styles.messagesList}>
            <AnimatePresence>
              {Object.entries(groupedMessages).map(([date, messages]) => (
                <div key={date}>
                  {/* Date Separator */}
                  <div className="flex items-center justify-center my-4">
                    <div className="bg-white px-3 py-1 rounded-full text-xs text-gray-500 shadow-sm border">
                      {date}
                    </div>
                  </div>
                  
                  {/* Messages for this date */}
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className={`${styles.message} ${message.isSupport ? styles.messageSupport : styles.messageUser}`}
                    >
                      <div className={styles.messageHeader}>
                        <span>{message.sender}</span>
                        <div className={styles.messageTime}>
                          <Clock className="w-3 h-3" />
                          {formatTime(message.timestamp)}
                          {!message.isSupport && (
                            <div className={styles.messageStatusIcons}>
                              {message.status === 'read' ? (
                                <CheckCheck className={`${styles.statusIcon} text-blue-500`} />
                              ) : message.status === 'delivered' ? (
                                <CheckCheck className={`${styles.statusIcon} text-gray-400`} />
                              ) : (
                                <Check className={`${styles.statusIcon} text-gray-400`} />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <p className={styles.messageContent}>{message.message}</p>
                    </motion.div>
                  ))}
                </div>
              ))}
              
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`${styles.typingIndicator}`}
                >
                  <div className={styles.typingDot}></div>
                  <div className={styles.typingDot}></div>
                  <div className={styles.typingDot}></div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </AnimatePresence>
          </div>
        </div>

        {/* Enhanced Message Input */}
        <div className={styles.inputContainer}>
          <form onSubmit={handleSendMessage} className={styles.messageForm}>
            <button 
              type="button" 
              className={styles.attachmentButton} 
              aria-label="Attach file"
              title="Attach file"
            >
              <PaperclipIcon className="w-5 h-5" />
            </button>
            
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
              className={styles.messageInput}
              rows={1}
            />
            
            <button 
              type="button" 
              className={styles.emojiButton} 
              aria-label="Add emoji"
              title="Add emoji"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <SmileIcon className="w-5 h-5" />
            </button>
            
            <button 
              type="submit" 
              className={styles.sendButton}
              disabled={!newMessage.trim()}
              aria-label="Send message"
              title="Send message"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

// Main component with role protection
export default function ChatPage() {
  return (
    <RoleProtected allowedRoles={[USER_ROLES.MERCHANT, USER_ROLES.ADMIN]}>
      <ChatPageContent />
    </RoleProtected>
  );
}
