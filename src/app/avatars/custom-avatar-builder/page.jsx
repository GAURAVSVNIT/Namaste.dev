"use client";

import { AvatarCreator } from "@readyplayerme/react-avatar-creator";
import { useAuth } from "@/hooks/useAuth"; 
import { useRef, useEffect, useState } from "react";
import { saveAvatarToFirestore } from "@/lib/fashion-builder-utils";

const config = {
  clearCache: false,
  bodyType: "fullbody",
  quickStart: false,
  language: "en",
};

export default function App() {
  const { user } = useAuth(); 
  const userRef = useRef(user);
  const [style, setStyle] = useState({ width: "100%", height: "100vh", border: "none" });

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  
useEffect(() => {
  const updateStyle = () => {
    const newStyle = { width: "100%", height: "100vh", border: "none" };
    document.body.style.backgroundColor = "#10101b";

    if (window.innerWidth < 768) {
      newStyle.marginTop = "4.5rem";
    } 
    else if (window.innerWidth < 1024) {
      newStyle.marginTop = "6rem";
    } 
    else {
      newStyle.marginTop = "0";
    }
    setStyle(newStyle);
  };
  updateStyle(); 
  window.addEventListener("resize", updateStyle); 

  return () => window.removeEventListener("resize", updateStyle); 
}, []);



  const handleOnAvatarExported = async (event) => {
    const currentUser = userRef.current;

    const glbUrl = event.data.url;
    const avatarId = glbUrl.split("/").pop().replace(".glb", "");
    const pngUrl = `https://models.readyplayer.me/${avatarId}.png`;

    console.log("Avatar GLB URL:", glbUrl);
    console.log("Avatar PNG Snapshot:", pngUrl);

    const metadataUrl = `https://api.readyplayer.me/v1/avatars/${avatarId}`;
    const response = await fetch(metadataUrl, {
      headers: {
        "X-API-Key": process.env.NEXT_PUBLIC_RPM_API_KEY,
      },
    });

    if (!response.ok) {
      console.error("Metadata fetch error:", await response.json());
      return;
    }

    const avatarJson = await response.json();
    console.log("Avatar metadata:", avatarJson);
    console.table(currentUser);
    console.log(currentUser?.uid);

    await saveAvatarToFirestore(currentUser?.uid, pngUrl);
  };

  return (
    <div>
      <AvatarCreator
        subdomain="fashionbuilder"
        config={config}
        style={style}
        onAvatarExported={handleOnAvatarExported}
      />
    </div>
  );
}
