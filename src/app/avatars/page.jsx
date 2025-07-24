"use client";

import { useEffect, useState } from "react";
import { getAvatarsFromFirestore } from "@/lib/fashion-builder-utils";
import { useAuth } from "@/hooks/useAuth"; // Assumes you have auth hook
import "@/static/avatars/avatars.css";
import { Download, UploadCloud, Search, Camera, Play, Sparkle, Wand } from "lucide-react";
import Link from "next/link";

export function AvatarBuilderHeader() {
  return (
    <section className="header-section">
      <div className="badge">🔥 Trending</div>
      <h1 className="headline">Custom Avatar Builder</h1>
      <p className="subtext">
        Show your creativity by designing avatars that resemble you,
          someone you know, or just for fun. You can later upload them to
          our social media platform under “<strong>Looks</strong>”.
      </p>

      <div className="actions">
        <a href="./avatars/custom-avatar-builder">
          <button className="btn-create-look">
            <Sparkle className="btn-icon" size={18} />
            Create Avatar
          </button>
        </a>
      </div>
    </section>
  );
}


export default function AvatarsGallery() {
  const { user } = useAuth();
  const [avatars, setAvatars] = useState([]);

  useEffect(() => {
    if (user?.uid) {
      getAvatarsFromFirestore(user.uid).then(setAvatars);
    }
  }, [user]);

  return (
    <div className="avatars-page">
      <AvatarBuilderHeader />
      <h1 className="avatars-title">Your Saved Looks</h1>
      <div className="avatars-container">
        {avatars.map((url, index) => (
          <div key={index} className="avatar-card">
            <div className="avatar-image-wrapper">
              <img src={url} alt={`Avatar ${index + 1}`} className="avatar-image" />
              <a
                href={url.replace(".png", ".glb")} 
                download
                className="download-btn"
              >
              <Download size={16} color="#fff" /> <span>3D Model</span>
              </a>
            </div>
            <button className="upload-btn flex gap-3"> <UploadCloud size={18} /> Upload this Look</button>
          </div>
        ))}
      </div>
       {avatars.length === 0 && (
        <p className="text-center text-gray-500 mt-20">No avatars saved yet. Upload your first look!</p>
      )}
    </div>
  );
}
