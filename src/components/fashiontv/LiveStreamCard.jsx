'use client';

import { memo } from 'react';
import PropTypes from 'prop-types';

function LiveStreamCard({ stream }) {
  return (
    <div className="w-full max-w-sm rounded overflow-hidden shadow-lg m-4">
      <div className="relative">
        <iframe
          src={stream.embedUrl}
          frameBorder="0"
          allow="autoplay; encrypted-media"
          allowFullScreen
          className="w-full h-48"
        ></iframe>
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 p-3 text-white">
          <h2 className="text-lg font-bold mb-1">{stream.title}</h2>
          <p className="text-sm">Added by {stream.userName}</p>
        </div>
      </div>
    </div>
  );
}

LiveStreamCard.propTypes = {
  stream: PropTypes.shape({
    title: PropTypes.string.isRequired,
    embedUrl: PropTypes.string.isRequired,
    userName: PropTypes.string.isRequired,
  }).isRequired,
};

export default memo(LiveStreamCard);
