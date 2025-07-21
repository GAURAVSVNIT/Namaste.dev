"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getUserLooks, getUserVideos, saveMessageToFirestore } from "@/lib/chatbot-utils";
import {
  chatWithFashionBot,
  analyzeLookImage,
  analyzeFashionVideo,
} from "@/lib/chatbot";
import { marked } from "marked";
import { Poppins } from "next/font/google";
import "@/static/chatbot/markupStyle.css";
import '@/static/chatbot/chatbot-ui.css';


const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["400", "600"],
});

export default function ChatBotClient() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCommandMenu, setShowCommandMenu] = useState(false);
  const [looks, setLooks] = useState([]);
  const [videos, setVideos] = useState([]);

  const fileInputRef = useRef(null);
  const scrollRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', });
  }, [messages, loading, looks, videos]);


  useEffect(() => {
    setShowCommandMenu(input.startsWith("/") && document.activeElement === inputRef.current);
  }, [input]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = async (role, text) => {
    setMessages((prev) => [...prev, { role, text }]);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: "user", text: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setShowCommandMenu(false);

    try {
      if (input === "/help") {
        addMessage(
          "bot",
          "Menu:\n1. Type /look to review your uploaded style\n2. Type /video to analyze your FashionTV video\n3. Upload a custom image.\n4. Or ask anything for fashion advice!"
        );
      } else if (input === "/look") {
        const looks = await getUserLooks(user.uid);
        setLooks(looks);
        if (looks.length === 0) throw new Error("No looks found.");
        addMessage("bot", `Select a look to analyze:`);
      } else if (input === "/video") {
        const videos = await getUserVideos(user.uid);
        setVideos(videos);
        if (videos.length === 0) throw new Error("No videos found.");
        addMessage("bot", `Select a video to analyze:`);
      } else {
        const response = await chatWithFashionBot(
          newMessages.map((m) => m.text)
        );
        addMessage("bot", marked(response));
      }
    } catch (err) {
      addMessage("bot", "Oops! " + err.message);
    }

    setLoading(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);

    try {
      const imageUrl = URL.createObjectURL(file);
      addMessage("user", `<img
                              src="${imageUrl}"
                              alt="${imageUrl}"
                            />`);
    }
    catch (err) {
      addMessage("user", "[Uploaded Image]");
    }
    
    try {
      const imageUrl = URL.createObjectURL(file); 
      const feedback = await analyzeLookImage(imageUrl);
      addMessage("bot", feedback);
    } catch (err) {
      addMessage("bot", "Upload failed: " + err.message);
    }
    setLoading(false);
  };

  const handleLookSelect = async (url) => {
    setLoading(true);
    try {
      const feedback = await analyzeLookImage(url);
      addMessage("bot", feedback);
    } catch (err) {
      addMessage("bot", err.message);
    }
    setLoading(false);
    setLooks([]);
  };

  const handleVideoSelect = async (url) => {
    setLoading(true);
    try {
      const feedback = await analyzeFashionVideo(url);
      addMessage("bot", feedback);
    } catch (err) {
      addMessage("bot", err.message);
    }
    setLoading(false);
    setLooks([]);
  };

  return (
  <div className="chatbot-container">
    <div className="chatbot-messages">
      {messages.map((msg, idx) => (
        <div key={idx} className={`chatbot-message ${msg.role}`}>
          <span dangerouslySetInnerHTML={{ __html: marked(msg.text) }} />
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

       {/* {loading && <div className="chatbot-message bot">Glamina is typing...</div>} */}
      {loading && (
        <div className="chatbot-message bot">
          Glamina is typing<span className="typing-dots">
            <span>.</span><span>.</span><span>.</span>
          </span>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>

    {showCommandMenu && (
      <div className="chatbot-command-menu">
        <div onClick={() => setInput('/help')} className="chatbot-command-option">
          /help - See the set of Instructions
        </div>
        <div onClick={() => setInput('/look')} className="chatbot-command-option">
          /look - Review uploaded looks
        </div>
        <div onClick={() => setInput('/video')} className="chatbot-command-option">
          /video - Analyze fashion video
        </div>
        <div onClick={() => {setInput(''); fileInputRef.current?.click()} } className="chatbot-command-option">
          Upload Image - Custom style
        </div>
      </div>
    )}

    <div className="chatbot-input-area">
      <input
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        className="chatbot-input"
        placeholder="Ask Glamina..."
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
      <button onClick={() => {setInput('/help'); setShowCommandMenu(false); } } className="chatbot-action-btn">/help</button>
      <button onClick={() => {setInput('/look'); setShowCommandMenu(false); } } className="chatbot-action-btn">/look</button>
      <button onClick={() => {setInput('/video'); setShowCommandMenu(false)} } className="chatbot-action-btn">/video</button>
      <button onClick={() => {setInput(''); fileInputRef.current?.click(); setShowCommandMenu(false)} } className="chatbot-action-btn">Upload Image</button>
    </div>
  </div>
);

}
