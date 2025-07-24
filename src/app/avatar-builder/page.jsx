"use client";

import { AvatarCreator } from "@readyplayerme/react-avatar-creator";
import { useAuth } from "@/hooks/useAuth"; 
import { useRef, useEffect } from "react";
import { saveAvatarToFirestore } from "@/lib/fashion-builder-utils";

const config = {
  clearCache: false,
  bodyType: "fullbody",
  quickStart: false,
  language: "en",
};

const style = { width: "100%", height: "100vh", border: "none" };

export default function App() {
  const { user } = useAuth(); 
  const userRef = useRef(user);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

//   console.table(userRef.current)
//   console.table(user)

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
    console.table(currentUser)
    console.log(currentUser.uid)
    await saveAvatarToFirestore(currentUser?.uid, pngUrl);
  };

  return (
    <AvatarCreator
      subdomain="fashionbuilder"
      config={config}
      style={style}
      onAvatarExported={handleOnAvatarExported}
    />
  );
}
