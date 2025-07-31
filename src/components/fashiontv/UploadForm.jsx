'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { uploadVideo } from '@/lib/fashiontv';
import { toast } from '@/hooks/use-toast';
import { 
  generateVideoThumbnail, 
  validateVideoFile, 
  createThumbnailPreviewURL, 
  cleanupPreviewURL 
} from '@/utils/videoUtils';

export default function UploadForm({ onSuccess }) {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailBlob, setThumbnailBlob] = useState(null);
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false);
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

    // Generate and set thumbnail
    setIsGeneratingThumbnail(true);
    generateVideoThumbnail(file, 2)
      .then(thumbnailBlob => {
        const thumbnailUrl = createThumbnailPreviewURL(thumbnailBlob);
        setThumbnail(thumbnailUrl); // For preview display
        setThumbnailBlob(thumbnailBlob); // For upload
        setIsGeneratingThumbnail(false);
      })
      .catch(() => {
        setValidationError('Failed to generate thumbnail');
        setThumbnail(null);
        setThumbnailBlob(null);
        setIsGeneratingThumbnail(false);
      });

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
        caption: caption.trim()
      };

      await uploadVideo(user.uid, selectedFile, videoData, thumbnailBlob);
      
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
<div style={{
      maxWidth: '600px',
      margin: 'auto',
      padding: '40px',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: '24px',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      backdropFilter: 'blur(20px)'
    }}>
<h2 style={{
        fontSize: '28px',
        fontWeight: 'bold',
        marginBottom: '24px',
        textAlign: 'center',
        color: '#1f2937',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}>Upload Your Fashion Video</h2>
      
      {/* File Input */}
      <div style={{ marginBottom: '24px' }}>
<label style={{
          display: 'block',
          fontSize: '16px',
          fontWeight: '600',
          color: '#374151',
          marginBottom: '8px'
        }}>
          Select Video
        </label>
        <p style={{
          fontSize: '14px',
          color: '#6b7280',
          marginBottom: '12px',
          margin: '0 0 12px 0'
        }}>Upload a video file (max 100MB, 60 seconds)</p>
        <input
          type="file"
          accept="video/*"
          onChange={handleFileSelect}
          style={{
            display: 'block',
            width: '100%',
            padding: '12px',
            fontSize: '14px',
            color: '#374151',
            backgroundColor: '#f1f5f9',
            border: '2px solid #e5e7eb',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'border-color 0.2s ease',
            outline: 'none'
          }}
          onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
          onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
        />
        {validationError && (
          <p className="text-red-500 text-sm mt-1">{validationError}</p>
        )}
      </div>

      {/* Video Preview */}
      {preview && (
        <div style={{ marginBottom: '24px' }}>
<label style={{
            display: 'block',
            fontSize: '16px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '8px'
          }}>
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
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                width: '32px',
                height: '32px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
                boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Caption Input */}
      <div style={{ marginBottom: '32px' }}>
<label style={{
          display: 'block',
          fontSize: '16px',
          fontWeight: '600',
          color: '#374151',
          marginBottom: '8px'
        }}>
          Caption
        </label>
        <p style={{
          fontSize: '14px',
          color: '#6b7280',
          marginBottom: '12px',
          margin: '0 0 12px 0'
        }}>Describe your fashion video to engage your audience</p>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Write a caption for your video..."
          rows={3}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '14px',
            color: '#374151',
            border: '2px solid #e5e7eb',
            borderRadius: '12px',
            backgroundColor: '#f8fafc',
            outline: 'none',
            transition: 'border-color 0.2s ease',
            resize: 'vertical'
          }}
          onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
          onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
        />
      </div>

      {/* Upload Button */}
<button
        onClick={handleUpload}
        disabled={!selectedFile || isUploading || !!validationError}
        style={{
          width: '100%',
          padding: '16px',
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#ffffff',
          backgroundColor: !selectedFile || isUploading || validationError ? '#d1d5db' : '#2563eb',
          border: 'none',
          borderRadius: '12px',
          cursor: !selectedFile || isUploading || validationError ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.3s ease'
        }}
        onMouseOver={(e) => {!selectedFile && !isUploading && !validationError ? (e.target.style.backgroundColor = '#1d4ed8') : null}}
        onMouseOut={(e) => {!selectedFile && !isUploading && !validationError ? (e.target.style.backgroundColor = '#2563eb') : null}}
      >
        {isUploading ? 'Uploading...' : 'Upload Video'}
      </button>
    </div>
  );
}
