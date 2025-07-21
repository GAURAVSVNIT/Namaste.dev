'use client';
import { useState } from 'react';

export default function UploadInput({ onUpload }) {
  const [file, setFile] = useState(null);

  const handleChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      onUpload(f);
    }
  };

  return (
    <label className="cursor-pointer text-blue-500">
      Upload Image/Video
      <input type="file" accept="image/*,video/*" onChange={handleChange} className="hidden" />
    </label>
  );
}
