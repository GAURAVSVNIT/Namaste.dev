"use client";

import { useEffect, useState } from "react";
import { getAvatarsFromFirestore } from "@/lib/fashion-builder-utils";
import { useAuth } from "@/hooks/useAuth"; 
import "@/static/avatars/avatars.css"; 
import { Download, UploadCloud, Search, Camera, Play, Sparkle, Wand } from "lucide-react";
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from '@/lib/quiz';
import SplitText from "@/blocks/TextAnimations/SplitText/SplitText";

export function AvatarBuilderHeader() {

  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        alert("Please Login first to use Avataraa and create your own 3D avatar!")
        router.push('/auth/login');
      }
      // else setUser(u);
    });

    return () => unsub();
  }, []);

  const handleCreateAvatar = () => {
    router.push('/avatars/custom-avatar-builder');
  }



  return (
    <section className="header-section" style={{ margin: "1rem 0" }}>
      <div className="badge">🔥 Trending</div>
      <h1 className="headline">
        <SplitText 
            text="Custom Avatar Builder" 
            splitType="chars"
            delay={80}
            duration={0.8}
            ease="power3.out"
            from={{ opacity: 0, y: 60, rotateX: -90 }}
            to={{ opacity: 1, y: 0, rotateX: 0 }}
            threshold={0.2}
            className="fashion-blog-split"
          />
      </h1>
      <p className="subtext">
        Show your creativity by designing avatars that resemble you,
          someone you know, or just for fun. You can later upload them to
          our social media platform under “<strong>Looks</strong>”.
      </p>

      <div className="actions">
          <button className="btn-create-look">
            <Sparkle className="btn-icon" size={18} onClick={handleCreateAvatar} />
            Create Avatar
          </button>
      </div>
    </section>
  );
}


export default function AvatarsGallery() {
  const { user } = useAuth();
  const [avatars, setAvatars] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (user?.uid) {
      getAvatarsFromFirestore(user.uid).then(setAvatars);
    }
  }, [user]);

  const handleUpload = (url) => {
    router.push(`/avatars/select?avatar=${url.split("/").pop().split(".png")[0]}`);
  }

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
            <button className="upload-btn flex gap-3" onClick={() => { handleUpload(url) }}> <UploadCloud size={18} /> Upload this Look</button>
          </div>
        ))}
      </div>
       {avatars.length === 0 && (
        <p className="text-center text-gray-500 mt-20">No avatars saved yet. Upload your first look!</p>
      )}
    </div>
  );
}
