"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getUserLooks, getUserVideos } from '@/lib/chatbot-utils';
import { chatWithFashionBot, analyzeLookImage, analyzeFashionVideo } from '@/lib/chatbot';

export default function ChatBotClient() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: 'user', text: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      if (input === '/help') {
        setMenuVisible(true);
        setMessages([...newMessages, {
          role: 'bot',
          text: 'Menu:\n1. Type /look to review your uploaded style\n2. Type /video to analyze your FashionTV video\n3. Type anything else for fashion advice!'
        }]);
      } else if (input === '/look') {
        const looks = await getUserLooks(user.uid);
        if (looks.length === 0) throw new Error("No looks found.");
        const feedback = await analyzeLookImage(looks[0].imageUrl);
        setMessages([...newMessages, { role: 'bot', text: feedback }]);
      } else if (input === '/video') {
        const videos = await getUserVideos(user.uid);
        if (videos.length === 0) throw new Error("No videos found.");
        const feedback = await analyzeFashionVideo(videos[0].videoUrl);
        setMessages([...newMessages, { role: 'bot', text: feedback }]);
      } else {
        const response = await chatWithFashionBot(newMessages.map(m => m.text));
        setMessages([...newMessages, { role: 'bot', text: response }]);
      }
    } catch (err) {
      setMessages([...newMessages, { role: 'bot', text: 'Oops! ' + err.message }]);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <div className="h-[500px] overflow-y-scroll border rounded p-3 bg-white">
        {messages.map((msg, idx) => (
          <div key={idx} className={`my-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block px-3 py-2 rounded-lg ${msg.role === 'user' ? 'bg-pink-200' : 'bg-gray-200'}`}>
              {msg.text}
            </span>
          </div>
        ))}
        {loading && <div className="text-center text-sm text-gray-400">Glamina is typing...</div>}
      </div>
      <div className="mt-2 flex">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 border rounded px-3 py-2"
          placeholder="Ask Glamina..."
        />
        <button onClick={handleSend} className="ml-2 px-4 py-2 bg-black text-white rounded">
          Send
        </button>
      </div>
    </div>
  );
}
