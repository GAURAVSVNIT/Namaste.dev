'use client';

import React from 'react';
import { motion } from 'framer-motion';
import MerchantChat from '../../../components/chat/MerchantChat';
import RoleProtected from '@/components/auth/RoleProtected';
import { USER_ROLES } from '@/lib/roles';
import styles from './Chat.module.css';

function ChatPageContent() {

  return (
    <div className={styles.chatContainer}>
      {/* Header */}
      <motion.header 
        className={styles.header}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className={styles.title}>Customer Chat</h1>
        <p className={styles.subtitle}>Manage customer conversations</p>
      </motion.header>

      {/* Chat Interface */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="h-[600px]"
      >
        <MerchantChat />
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
