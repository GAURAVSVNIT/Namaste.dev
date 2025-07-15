'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { uploadVideo } from '@/lib/fashiontv';
import { toast } from '@/hooks/use-toast';

export default function UploadForm({ onSuccess }) {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [validationError, setValidationError] = useState('');

  const validateVideo = (file) => {
    // Check file type
    if (!file.type.startsWith('video/')) {
      return 'Please select a video file';
    }

    // Check file size (100MB = 104857600 bytes)
    if (file.size > 104857600) {
      return 'Video file must be less than 100MB';
    }

    return null;
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const error = validateVideo(file);
    if (error) {
      setValidationError(error);
      return;
    }

    setValidationError('');
    setSelectedFile(file);
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    // Check video duration
    const video = document.createElement('video');
    video.src = previewUrl;
    video.onerror = () => {
    setValidationError('Failed to load video for validation');
    setSelectedFile(null);
    setPreview(null);
    URL.revokeObjectURL(previewUrl);
    };
    video.onloadedmetadata = () => {
      if (video.duration > 60) {
        setValidationError('Video must be 60 seconds or less');
        setSelectedFile(null);
        setPreview(null);
        URL.revokeObjectURL(previewUrl);
      }
    };
  };

  const handleUpload = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to upload videos",
        variant: "destructive",
      });
      return;
    }

    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a video file to upload",
        variant: "destructive",
      });
      return;
    }

    if (!caption.trim()) {
      toast({
        title: "Caption Required",
        description: "Please add a caption for your video",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      const videoData = {
        caption: caption.trim(),
      };

      await uploadVideo(user.uid, selectedFile, videoData);
      
      toast({
        title: "Success!",
        description: "Your video has been uploaded successfully.",
      });

      // Reset form
      setSelectedFile(null);
      setPreview(null);
      setCaption('');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const clearSelection = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setSelectedFile(null);
    setPreview(null);
    setValidationError('');
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Upload Video</h2>
      
      {/* File Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Video
        </label>
        <input
          type="file"
          accept="video/*"
          onChange={handleFileSelect}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {validationError && (
          <p className="text-red-500 text-sm mt-1">{validationError}</p>
        )}
      </div>

      {/* Video Preview */}
      {preview && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preview
          </label>
          <div className="relative aspect-square bg-black rounded-lg overflow-hidden">
            <video
              src={preview}
              controls
              className="w-full h-full object-cover"
            />
            <button
              onClick={clearSelection}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Caption Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Caption
        </label>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Write a caption for your video..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
      </div>

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={!selectedFile || isUploading || !!validationError}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {isUploading ? 'Uploading...' : 'Upload Video'}
      </button>
    </div>
  );
}
