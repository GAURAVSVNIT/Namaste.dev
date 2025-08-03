"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  getUserLooks,
  getUserVideos,
  saveMessageToFirestore,
  getMessagesFromFirestore,
} from "@/lib/chatbot-utils";
import {
  chatWithFashionBot,
  analyzeLookImage,
  analyzeFashionVideo,
} from "@/lib/chatbot";
import { marked } from "marked";
import { Poppins } from "next/font/google";
import "@/static/chatbot/markupStyle.css";
import "@/static/chatbot/chatbot-ui.css";
import DOMPurify from 'dompurify';
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from '@/lib/quiz'; // just to check authentication and avoid repeated code
import { useRouter } from "next/navigation";

const renderer = new marked.Renderer();

renderer.link = (linkData, title, text) => {
  const href = linkData.href;
  if (href.includes('.mp4') || href.includes('.webm') || href.includes('.ogg') || href.includes('.m4a')) {
    return `<video controls style="max-width: 100%;"><source src="${href}" type="video/mp4">Your browser does not support the video tag.</video>`;
  }

  // deafault markup link tag for other formats
  return `<a href="${href}" title="${title}">${text}</a>`;
};

marked.setOptions({
  renderer,
  gfm: true,
  breaks: true,
  pedantic: false,
  smartLists: true,
  smartypants: false,
  highlight: function(code) { return code; }
});


const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["400", "600"],
});

export default function ChatBot() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCommandMenu, setShowCommandMenu] = useState(false);
  const [looks, setLooks] = useState([]);
  const [videos, setVideos] = useState([]);

  const router = useRouter();

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        alert("Please Login first to talk with Zyra, our AI fashion consultant.")
        router.push('/auth/login');
      }
      // else setUser(u);
    });

    return () => unsub();
  }, []);

  // Load chat history
  useEffect(() => {
    const fetchMessages = async () => {
      if (user?.uid) {
        const history = await getMessagesFromFirestore(user.uid);
        // console.table(history)
        setMessages(history);
      }
    };
    fetchMessages();
  }, [user]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest"  });
  }, [messages, loading]);

  useEffect(() => {
    setShowCommandMenu(input.startsWith("/") && document.activeElement === inputRef.current);
  }, [input]);

  const addMessage = async (role, type, content, mediaUrl = null, fileName = null) => {
    const message = { role, type, content, mediaUrl, fileName, timestamp: new Date() };
    setMessages((prev) => [...prev, message]);
    await saveMessageToFirestore(user.uid, message);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    await addMessage("user", "text", input);
    setInput("");
    setLoading(true);
    setShowCommandMenu(false);

    try {
      if (input === "/help") {
        await addMessage("bot", "text",
          "Menu:\n1. Type /look to review your uploaded style\n2. Type /video to analyze your FashionTV video\n3. Upload a custom image.\n4. Or ask anything for fashion advice!"
        );
      } 
      
      else if (input === "/look") {
        const looks = await getUserLooks(user.uid);
        setLooks(looks);
        if (looks.length === 0) throw new Error("No looks found.");
        await addMessage("bot", "text", `Select a look to analyze:`);
      } 
      
      else if (input === "/video") {
        const videos = await getUserVideos(user.uid);
        setVideos(videos);
        if (videos.length === 0) throw new Error("No videos found. Please upload a video on fashion TV to use this feature.");
        await addMessage("bot", "text", `Select one of your fashionTV video${videos.length > 1 ? 's' : ''} to analyze:`);
      } 
      
      else {
        const allMessages = [...messages, { role: "user", content: input }];
        const response = await chatWithFashionBot(allMessages.map((m) => m.content), user?.displayName);
        await addMessage("bot", "text", marked(response));
      }
    } 
    
    catch (err) {
      await addMessage("bot", "text", "Oops! " + err.message);
    }

    setLoading(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    const fileName = file.name;

    setLoading(true);

    await addMessage("user", "upload", `Uploaded Image:\n![UploadedImage](${fileName})`, imageUrl, fileName);

    try {
      const feedback = await analyzeLookImage(imageUrl, user?.displayName);
      await addMessage("bot", "text", feedback);
    } catch (err) {
      await addMessage("bot", "text", "Upload failed: " + err.message);
    } finally { + URL.revokeObjectURL(imageUrl);
    }

    setLoading(false);
  };

  const handleLookSelect = async (url) => {
    setLoading(true);
    await addMessage("user", "image", `Analyze this look:\n![look](${url})`, url);
    try {
      const feedback = await analyzeLookImage(url, user?.displayName);
      await addMessage("bot", "text", feedback);
    } catch (err) {
      await addMessage("bot", "text", err.message);
    }
    setLoading(false);
    setLooks([]);
  };

  const handleVideoSelect = async (url) => {
    setLoading(true);
    await addMessage("user", "video", `Analyze this video:\n[video](${url})`, url);
    try {
      const feedback = await analyzeFashionVideo(url, user?.displayName);
      await addMessage("bot", "text", feedback);
    } catch (err) {
      await addMessage("bot", "text", err.message);
    }
    setLoading(false);
    setVideos([]);
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-messages">
        {/* Logo Watermark */}
        <div className="chatbot-watermark">
          <img src="/logo-home.png" alt="Namaste.dev Logo" />
        </div>
        {messages.map((msg, idx) => (
          <div key={idx} className={`chatbot-message ${msg.role}`}>
{/*             - <span dangerouslySetInnerHTML={{ __html: marked(msg.content) }} /> */}
                <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked(msg.content))}} />
            {msg.fileName && <div className="file-meta">📎 {msg.fileName.split('.')[0].slice(0,10) + msg.fileName.split('.')[1]}</div>}
          </div>
        ))}

        {looks.length > 0 && (
          <>
            <h3>Choose a Look: </h3>
            <div className="chatbot-media-preview">
              {looks.map((l, i) => (
                <img
                  key={i}
                  src={l.imageUrl}
                  alt={`Look ${i}`}
                  onClick={() => handleLookSelect(l.imageUrl)}
                />
              ))}
            </div>
          </>
        )}

        {videos.length > 0 && (
          <>
            <h3>Choose a Video: </h3>
            <div className="chatbot-media-preview">
              {videos.map((v, i) => (
                <video
                  key={i}
                  src={v.videoUrl}
                  onClick={() => handleVideoSelect(v.videoUrl)}
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ))}
            </div>
          </>
        )}

        {loading && (
          <div className="chatbot-message bot">
            Zyra is typing<span className="typing-dots">
              <span>.</span><span>.</span><span>.</span>
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {showCommandMenu && (
        <div className="chatbot-command-menu">
          <div onClick={() => setInput("/help")} className="chatbot-command-option">
            /help - See the set of Instructions
          </div>
          <div onClick={() => setInput("/look")} className="chatbot-command-option">
            /look - Review uploaded looks
          </div>
          <div onClick={() => setInput("/video")} className="chatbot-command-option">
            /video - Analyze fashion video
          </div>
          <div onClick={() => { setInput(""); fileInputRef.current?.click(); }} className="chatbot-command-option">
            Upload Image - Custom style
          </div>
        </div>
      )}

      <div className="chatbot-input-area">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="chatbot-input"
          placeholder="Ask Zyra anything about fashion or type '/'"
        />
        <button onClick={handleSend} className="chatbot-send-btn">Send</button>
        <input
          type="file"
          accept="image/*"
          hidden
          ref={fileInputRef}
          onChange={handleImageUpload}
        />
      </div>

      <div className="chatbot-actions">
        <button onClick={() => { setInput("/help"); setShowCommandMenu(false); }} className="chatbot-action-btn">/help</button>
        <button onClick={() => { setInput("/look"); setShowCommandMenu(false); }} className="chatbot-action-btn">/look</button>
        <button onClick={() => { setInput("/video"); setShowCommandMenu(false); }} className="chatbot-action-btn">/video</button>
        <button onClick={() => { setInput(""); fileInputRef.current?.click(); setShowCommandMenu(false); }} className="chatbot-action-btn">Upload Image</button>
      </div>
    </div>
  );
}
