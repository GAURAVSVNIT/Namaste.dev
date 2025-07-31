import { AvatarCreator } from '@readyplayerme/react-avatar-creator';
import { Avatar } from "@readyplayerme/visage";
import { useState } from "react";

const config = {
  clearCache: true,
  bodyType: 'fullbody',
  quickStart: false,
  language: 'en',
};

const style = { width: '100%', height: '100vh', border: 'none' };

export default function RenderedAvatar() {
  const [avatarUrl, setAvatarUrl] = useState('');
  const handleOnAvatarExported = (event) => {
    setAvatarUrl(event.data.url);
  };

  return (
      <>
        <AvatarCreator subdomain="demo" config={config} style={style} onAvatarExported={handleOnAvatarExported} />
        {avatarUrl && <Avatar modelSrc={avatarUrl} />}
      </>
  );
}