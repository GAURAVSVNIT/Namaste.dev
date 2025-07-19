'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, PaperclipIcon, SmileIcon, Check, CheckCheck } from 'lucide-react';
import { useDashboard } from '@/context/DashboardContext';
// import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import styles from './Chat.module.css';
import RoleProtected from '@/components/auth/RoleProtected';
import { USER_ROLES } from '@/lib/roles';

const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

function ChatPageContent() {
  const { state, dispatch } = useDashboard();
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
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
        
        // Simulate support response
        const supportMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'Support Team',
          message: 'Thank you for your message. Our team will get back to you shortly.',
          timestamp: new Date().toISOString(),
          isSupport: true
        };
        dispatch({ type: 'ADD_MESSAGE', payload: supportMessage });
      }, 2000);
    }
  };

  const handleKeyDown = (e) => {
    // Send message on Enter (but allow Shift+Enter for new line)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div className={styles.chatContainer}>
      {/* Header */}
      <motion.header 
        className={styles.header}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className={styles.title}>Support Chat</h1>
        <p className={styles.subtitle}>Get help from our support team</p>
      </motion.header>

      {/* Chat Interface */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={styles.chatCard}
      >
        <div className={styles.chatHeader}>
          <div className={styles.chatStatus}>
            <span className={styles.statusDot}></span>
            <span>Support Team - Online</span>
          </div>
        </div>
        
        <div className={styles.messagesContainer}>
          <div className={styles.messagesList}>
            <AnimatePresence>
              {state.messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  className={`${styles.message} ${message.isSupport ? styles.messageSupport : styles.messageUser}`}
                >
                  <div className={styles.messageHeader}>
                    <span>{message.sender}</span>
                    <span className={styles.messageTime}>
                      {formatTime(message.timestamp)}
                      {!message.isSupport && (
                        <span className="ml-1">
                          {message.status === 'read' ? (
                            <CheckCheck className="inline w-3 h-3 ml-1" />
                          ) : message.status === 'delivered' ? (
                            <CheckCheck className="inline w-3 h-3 ml-1 opacity-50" />
                          ) : (
                            <Check className="inline w-3 h-3 ml-1 opacity-50" />
                          )}
                        </span>
                      )}
                    </span>
                  </div>
                  <p className={styles.messageContent}>{message.message}</p>
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`${styles.message} ${styles.messageSupport} ${styles.typingIndicator}`}
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

        {/* Message Input */}
        <div className={styles.inputContainer}>
          <form onSubmit={handleSendMessage} className={styles.messageForm}>
            <button type="button" className={styles.attachmentButton} aria-label="Attach file">
              <PaperclipIcon className="w-5 h-5" />
            </button>
            
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className={styles.messageInput}
              rows={1}
            />
            
            <button type="button" className={styles.emojiButton} aria-label="Add emoji">
              <SmileIcon className="w-5 h-5" />
            </button>
            
            <button 
              type="submit" 
              className={styles.sendButton}
              disabled={!newMessage.trim()}
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
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
