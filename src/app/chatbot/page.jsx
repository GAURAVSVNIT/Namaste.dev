"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getUserLooks, getUserVideos } from "@/lib/chatbot-utils";
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

  useEffect(() => {
    setShowCommandMenu(input.startsWith("/"));
  }, [input]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = (role, text) => {
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
    addMessage("user", "[Uploaded Image]");
    try {
      const imageUrl = URL.createObjectURL(file); // placeholder
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
  };

  return (
    <div
      className={`relative max-w-2xl mx-auto mt-[6rem] flex flex-col h-[90vh] border shadow-xl rounded-3xl bg-gradient-to-b from-white to-gray-100 ${poppins.variable}`}
    >
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-4 py-2 max-w-xs md:max-w-sm text-sm leading-snug rounded-2xl shadow-md ${
                msg.role === "user"
                  ? "bg-pink-500 text-white"
                  : "bg-white border text-gray-800"
              }`}
              dangerouslySetInnerHTML={{ __html: marked(msg.text) }}
            />
          </div>
        ))}
        {loading && (
          <div className="text-center text-gray-400 text-sm">Glamina is typing...</div>
        )}

        {looks.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {looks.map((l, i) => (
              <img
                key={i}
                src={l.imageUrl}
                alt={`Look ${i}`}
                onClick={() => handleLookSelect(l.imageUrl)}
                className="w-24 h-24 object-cover rounded-xl cursor-pointer border border-gray-300 hover:ring-2 hover:ring-pink-400 transition"
              />
            ))}
          </div>
        )}

        {videos.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {videos.map((v, i) => (
              <video
                key={i}
                src={v.videoUrl}
                onClick={() => handleVideoSelect(v.videoUrl)}
                autoPlay
                loop
                muted
                playsInline
                className="w-28 h-28 object-cover rounded-xl cursor-pointer border border-gray-300 hover:scale-105 hover:border-pink-400 transition-transform"
              />
            ))}
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {showCommandMenu && (
        <div className="absolute bottom-24 left-4 right-4 bg-white border rounded-xl shadow-lg p-3 text-sm z-20">
          <div
            onClick={() => setInput("/look")}
            className="cursor-pointer px-2 py-1 rounded hover:bg-gray-100"
          >
            /look – Review uploaded looks
          </div>
          <div
            onClick={() => setInput("/video")}
            className="cursor-pointer px-2 py-1 rounded hover:bg-gray-100"
          >
            /video – Analyze fashion video
          </div>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer px-2 py-1 rounded hover:bg-gray-100"
          >
            Upload image – Custom style
          </div>
        </div>
      )}

      <div className="p-4 border-t bg-white sticky bottom-0 flex flex-col gap-3">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
            placeholder="Type a message or /command"
          />
          <button
            onClick={handleSend}
            className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-full transition"
          >
            Send
          </button>
          <input
            type="file"
            accept="image/*"
            hidden
            ref={fileInputRef}
            onChange={handleImageUpload}
          />
        </div>

        <div className="flex gap-2 text-sm">
          <button
            onClick={() => setInput("/look")}
            className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full hover:bg-pink-200 transition"
          >
            /look
          </button>
          <button
            onClick={() => setInput("/video")}
            className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full hover:bg-pink-200 transition"
          >
            /video
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full hover:bg-pink-200 transition"
          >
            Upload Image
          </button>
        </div>
      </div>
    </div>
  );
}
