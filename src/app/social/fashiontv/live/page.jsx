'use client';

import { useState, useEffect, useRef, useCallback, memo, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { getApprovedLivestreams, addLivestream, parseStreamUrl, getAllLivestreams, deleteLivestream } from '@/lib/fashiontv';
import { Home, Plus, ExternalLink, Calendar, User, Video, VideoOff, Mic, MicOff, Settings, MessageCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import LiveStreamCard from '@/components/fashiontv/LiveStreamCard';
import LiveFeedGrid from '@/components/fashiontv/LiveFeedGrid';

// Constants
const VIDEO_CONSTRAINTS = {
  EXACT: {
    width: { exact: 1280 },
    height: { exact: 720 },
    frameRate: { exact: 30 },
    aspectRatio: { exact: 16/9 }
  },
  IDEAL: {
    width: { ideal: 1280, min: 640 },
    height: { ideal: 720, min: 480 },
    frameRate: { ideal: 30, min: 15 },
    aspectRatio: { ideal: 16/9 }
  }
};

const STREAM_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  ACTIVE: 'active',
  ERROR: 'error'
};

const TOAST_MESSAGES = {
  STREAM_STARTED: {
    title: "You're Live!",
    description: "Your live stream has started successfully"
  },
  STREAM_ENDED: {
    title: "Stream Ended",
    description: "Your live stream has ended successfully"
  },
  STREAM_RESTARTED: {
    title: "Stream Restarted",
    description: "Video stream has been restarted with higher quality"
  },
  RESTART_FAILED: {
    title: "Restart Failed",
    description: "Could not restart video stream. Using existing stream.",
    variant: "destructive"
  },
  AUTH_REQUIRED: {
    title: "Authentication Required",
    description: "Please sign in to add a live stream",
    variant: "destructive"
  },
  MISSING_INFO: {
    title: "Missing Information",
    description: "Please fill in all required fields",
    variant: "destructive"
  }
};

// Utility functions
const validateStreamForm = (formData, user) => {
  if (!user) {
    return { isValid: false, message: TOAST_MESSAGES.AUTH_REQUIRED };
  }
  
  if (!formData.title?.trim() || !formData.url?.trim()) {
    return { isValid: false, message: TOAST_MESSAGES.MISSING_INFO };
  }
  
  return { isValid: true };
};

const validateLiveStreamData = (liveStreamData, user) => {
  if (!user) {
    return { isValid: false, message: TOAST_MESSAGES.AUTH_REQUIRED };
  }
  
  if (!liveStreamData.title?.trim()) {
    return { 
      isValid: false, 
      message: {
        title: "Title Required",
        description: "Please enter a title for your live stream",
        variant: "destructive"
      }
    };
  }
  
  return { isValid: true };
};

// Optimized Video Component that only re-renders when video-specific props change
const OptimizedVideo = memo(({ videoRef, isVideoEnabled, onLoadedData, onCanPlay, onLoadedMetadata, onPlaying, onError, onPause, onSuspend, onStalled, onAbort, onEmptied }) => {
  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className="w-full flex-1 object-cover bg-gray-900"
      style={{ 
        transform: 'scaleX(-1)', 
        minHeight: '400px',
        height: '100%',
        width: '100%',
        objectFit: 'cover',
        display: 'block',
        backgroundColor: '#1f2937',
        zIndex: 1,
        minWidth: '320px',
        visibility: isVideoEnabled ? 'visible' : 'hidden',
        borderRadius: '16px'
      }}
      onLoadedData={onLoadedData}
      onCanPlay={onCanPlay}
      onLoadedMetadata={onLoadedMetadata}
      onPlaying={onPlaying}
      onError={onError}
      onPause={onPause}
      onSuspend={onSuspend}
      onStalled={onStalled}
      onAbort={onAbort}
      onEmptied={onEmptied}
    />
  );
}, (prevProps, nextProps) => {
  // Only re-render if video-specific props change
  return prevProps.isVideoEnabled === nextProps.isVideoEnabled;
});

export default function LivePage() {
  const { user } = useAuth();
  const [streams, setStreams] = useState([]);
  const [userLiveStreams, setUserLiveStreams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [showGoLiveModal, setShowGoLiveModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    platform: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoingLive, setIsGoingLive] = useState(false);
  const [liveStreamData, setLiveStreamData] = useState({
    title: '',
    description: ''
  });
  const [mediaStream, setMediaStream] = useState(null);
  const [previewStream, setPreviewStream] = useState(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isLiveStreaming, setIsLiveStreaming] = useState(false);
  const [currentLiveStream, setCurrentLiveStream] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [showChat, setShowChat] = useState(true);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [hasAttemptedRestart, setHasAttemptedRestart] = useState(false);
  const [isTogglingVideo, setIsTogglingVideo] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const previewVideoRef = useRef(null);
  const liveVideoRef = useRef(null);
  const optionsMenuRef = useRef(null);
  
  // Define restart function early so it can be used in useEffect
  // Utility to stop media stream
  const stopMediaStream = useCallback((stream) => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  }, []);

  // Utility to create media stream
  const createMediaStream = useCallback(async (videoEnabled, audioEnabled) => {
    const constraints = {
      video: videoEnabled ? VIDEO_CONSTRAINTS.EXACT : false,
      audio: audioEnabled
    };
    return navigator.mediaDevices.getUserMedia(constraints);
  }, []);

  // Restart video stream
  const restartVideoStream = async (isAutomatic = false) => {
    console.log('Restarting video stream...', isAutomatic ? '(automatic)' : '(manual)');

    stopMediaStream(mediaStream); // Stop current stream

    if (isAutomatic) {
      setHasAttemptedRestart(true); // Reset restart flag
    }

    await new Promise(resolve => setTimeout(resolve, 500)); // Wait a moment

    try {
      const newStream = await createMediaStream(isVideoEnabled, isAudioEnabled);
      setMediaStream(newStream);

      if (!isAutomatic) {
        toast(TOAST_MESSAGES.STREAM_RESTARTED);
      }
    } catch (error) {
      console.error('Error restarting stream:', error);
      if (!isAutomatic) {
        toast(TOAST_MESSAGES.RESTART_FAILED);
      }
    }
  };

  useEffect(() => {
    fetchStreams();
  }, []);
  
  // Close options menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target)) {
        setShowOptionsMenu(false);
      }
    };
    
    if (showOptionsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showOptionsMenu]);
  
  // Cleanup function for when component unmounts
  useEffect(() => {
    return () => {
      // Stop all media streams when component unmounts
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => {
          track.stop();
        });
      }
      
      if (previewStream) {
        previewStream.getTracks().forEach(track => {
          track.stop();
        });
      }
      
      // Stop all user live streams
      userLiveStreams.forEach(stream => {
        if (stream.stream) {
          stream.stream.getTracks().forEach(track => {
            track.stop();
          });
        }
      });
    };
  }, [mediaStream, previewStream, userLiveStreams]);
  
  // Start preview when modal opens
  useEffect(() => {
    if (showGoLiveModal && !previewStream) {
      // Add a small delay to ensure the modal is fully rendered
      setTimeout(() => {
        startPreview();
      }, 100);
    } else if (!showGoLiveModal && previewStream) {
      stopPreview();
    }
  }, [showGoLiveModal]);
  
  // Handle video element assignment when preview stream changes
  useEffect(() => {
    if (previewVideoRef.current && previewStream) {
      console.log('Assigning preview stream to video element');
      previewVideoRef.current.srcObject = previewStream;
      
      // Add event listeners to debug video loading
      previewVideoRef.current.onloadedmetadata = () => {
        console.log('Preview video metadata loaded');
      };
      
      previewVideoRef.current.onplaying = () => {
        console.log('Preview video started playing');
      };
      
      previewVideoRef.current.onerror = (e) => {
        console.error('Preview video error:', e);
      };
    }
  }, [previewStream]);
  
  // Utility to configure video element
  const configureVideoElement = useCallback((videoElement, stream) => {
    if (!videoElement || !stream) return;

    // Clear existing stream if different
    if (videoElement.srcObject && videoElement.srcObject !== stream) {
      console.log('Clearing existing stream');
      videoElement.srcObject = null;
    }

    // Assign stream and configure properties
    videoElement.srcObject = stream;
    videoElement.autoplay = true;
    videoElement.playsInline = true;
    videoElement.muted = true;
    videoElement.controls = false;
    
    // Force visibility
    Object.assign(videoElement.style, {
      display: 'block',
      minWidth: '320px',
      minHeight: '240px'
    });

    console.log('Stream assigned to video element');
  }, []);

  // Video metadata handler
  const handleVideoMetadata = useCallback((videoElement) => {
    const { videoWidth, videoHeight, duration, readyState } = videoElement;
    console.log('Video metadata loaded:', { videoWidth, videoHeight, duration, readyState });

    // Handle small dimensions
    if (videoWidth < 100 || videoHeight < 100) {
      console.warn('Video dimensions too small, applying workaround');
      
      Object.assign(videoElement.style, {
        minWidth: '640px',
        minHeight: '480px',
        width: '100%',
        height: '100%',
        objectFit: 'cover'
      });

      // Auto-restart if not attempted yet
      if (!hasAttemptedRestart) {
        console.log('Auto-restarting stream due to small dimensions');
        setTimeout(() => restartVideoStream(true), 1000);
      }
    }

    // Auto-play
    videoElement.play()
      .then(() => console.log('Video started playing'))
      .catch(err => console.error('Error playing video:', err));
  }, [hasAttemptedRestart, restartVideoStream]);

  // Handle live video stream assignment - ONLY when video stream actually changes
  useEffect(() => {
    if (liveVideoRef.current && mediaStream && isLiveStreaming) {
      console.log('Setting up live video stream assignment');
      
      const videoElement = liveVideoRef.current;
      
      // Only configure if stream is actually different
      if (videoElement.srcObject !== mediaStream) {
        configureVideoElement(videoElement, mediaStream);
        
        const metadataHandler = () => handleVideoMetadata(videoElement);
        videoElement.onloadedmetadata = metadataHandler;
        
        return () => {
          videoElement.onloadedmetadata = null;
        };
      }
    }
  }, [mediaStream, isLiveStreaming]); // Removed configureVideoElement and handleVideoMetadata to prevent re-renders
  
  const startPreview = async () => {
    try {
      setIsLoadingPreview(true);
      console.log('Starting preview...');
      
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia is not supported in this browser');
      }
      
      // Check current permissions first
      try {
        const permissions = await navigator.permissions.query({ name: 'camera' });
        console.log('Camera permission state:', permissions.state);
        
        if (permissions.state === 'denied') {
          throw new Error('Camera permission is denied. Please enable it in your browser settings.');
        }
      } catch (permError) {
        console.log('Could not check permissions:', permError);
      }
      
      // Try different video constraints for better compatibility - start with exact high quality
      const videoConstraints = [
        // Try with exact high quality constraints first
        {
          video: {
            width: { exact: 1280 },
            height: { exact: 720 },
            frameRate: { exact: 30 },
            aspectRatio: { exact: 16/9 },
            facingMode: 'user'
          },
          audio: isAudioEnabled
        },
        // Try exact without facingMode
        {
          video: {
            width: { exact: 1280 },
            height: { exact: 720 },
            frameRate: { exact: 30 },
            aspectRatio: { exact: 16/9 }
          },
          audio: isAudioEnabled
        },
        // Try with ideal constraints
        {
          video: {
            width: { ideal: 1280, min: 640 },
            height: { ideal: 720, min: 480 },
            frameRate: { ideal: 30, min: 15 },
            aspectRatio: { ideal: 16/9 },
            facingMode: 'user'
          },
          audio: isAudioEnabled
        },
        // Fallback to basic video with minimum dimensions
        {
          video: {
            width: { ideal: 640, min: 320 },
            height: { ideal: 480, min: 240 },
            frameRate: { ideal: 30, min: 15 }
          },
          audio: isAudioEnabled
        },
        // Basic fallback
        {
          video: true,
          audio: isAudioEnabled
        }
      ];
      
      let stream = null;
      let lastError = null;
      
      for (const constraints of videoConstraints) {
        try {
          console.log('Trying video constraints:', constraints);
          stream = await navigator.mediaDevices.getUserMedia(constraints);
          console.log('Video stream obtained:', stream);
          break;
        } catch (error) {
          console.log('Video constraint failed:', error);
          lastError = error;
        }
      }
      
      if (!stream) {
        throw lastError || new Error('Could not access camera with any constraints');
      }
      
      // If audio is enabled but not included in the stream, try to add it
      if (isAudioEnabled && stream.getAudioTracks().length === 0) {
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const audioTrack = audioStream.getAudioTracks()[0];
          stream.addTrack(audioTrack);
          console.log('Audio track added successfully');
        } catch (audioError) {
          console.log('Audio access failed, continuing with video only:', audioError);
          // Don't show error toast for audio failure - it's optional
        }
      }
      
      setPreviewStream(stream);
    } catch (error) {
      console.error('Error starting preview:', error);
      
      let errorMessage = "Please check your camera permissions and try again";
      
      if (error.name === 'NotAllowedError') {
        errorMessage = "Camera access was denied. Please click the camera icon in your browser's address bar to allow access.";
      } else if (error.name === 'NotFoundError') {
        errorMessage = "No camera was found. Please check that your camera is connected and not being used by another application.";
      } else if (error.name === 'NotReadableError') {
        errorMessage = "Camera is already in use by another application. Please close other apps using the camera and try again.";
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = "Camera constraints could not be satisfied. Please try with different settings.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Camera Access Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoadingPreview(false);
    }
  };
  
  const stopPreview = () => {
    if (previewStream) {
      console.log('Stopping preview...');
      previewStream.getTracks().forEach(track => {
        track.stop();
      });
      setPreviewStream(null);
    }
  };

  // Fetch streams from API
  const fetchStreams = useCallback(async () => {
    try {
      setIsLoading(true);
      const streamsData = await getApprovedLivestreams(20);
      setStreams(streamsData);
    } catch (error) {
      console.error('Error fetching streams:', error);
      toast({
        title: "Error",
        description: "Failed to load live streams",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Form submission handler
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    const validation = validateStreamForm(formData, user);
    if (!validation.isValid) {
      toast(validation.message);
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Parse and validate URL
      const parsedUrl = parseStreamUrl(formData.url);
      
      const streamData = {
        title: formData.title,
        url: formData.url,
        platform: parsedUrl.platform,
        embedUrl: parsedUrl.embedUrl,
        description: formData.description || ''
      };

      await addLivestream(user.uid, streamData);
      
      toast({
        title: "Stream Added Successfully",
        description: "Your live stream is now visible to everyone",
      });
      
      setFormData({ title: '', url: '', platform: '', description: '' });
      setShowSubmitForm(false);
      
      // Refresh the streams list to show the new stream
      fetchStreams();
      
    } catch (error) {
      console.error('Error submitting stream:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add live stream",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, user]);

  // Handle URL change and platform detection
  const handleUrlChange = useCallback((e) => {
    const url = e.target.value;
    setFormData(prev => ({ ...prev, url }));
    
    // Try to detect platform from URL
    try {
      if (url.trim()) {
        const parsed = parseStreamUrl(url);
        setFormData(prev => ({ ...prev, platform: parsed.platform }));
      }
    } catch (error) {
      // Invalid URL, but don't show error yet
      setFormData(prev => ({ ...prev, platform: '' }));
    }
  }, []);

  const handleStreamDeleted = (streamId) => {
    // Remove the deleted stream from the local state
    setStreams(prevStreams => prevStreams.filter(stream => stream.id !== streamId));
  };
  
  const handleDeleteAllSampleStreams = async () => {
    if (!user) return;
    
    const confirmed = window.confirm('Are you sure you want to clear all existing live streams? This action cannot be undone.');
    if (!confirmed) return;
    
    try {
      // Get all streams
      const allStreams = await getAllLivestreams();
      
      // Filter system/demo streams (those with userId starting with 'sample-user')
      const streamsToDelete = allStreams.filter(stream => stream.userId?.startsWith('sample-user'));
      
      // Delete each stream
      const deletePromises = streamsToDelete.map(stream => deleteLivestream(stream.id));
      await Promise.all(deletePromises);
      
      toast({
        title: "Streams Cleared",
        description: `${streamsToDelete.length} live streams have been removed`,
      });
      
      // Refresh the streams list
      fetchStreams();
    } catch (error) {
      console.error('Error clearing streams:', error);
      toast({
        title: "Error",
        description: "Failed to clear streams. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Start live streaming
  const startGoLive = useCallback(async () => {
    const validation = validateLiveStreamData(liveStreamData, user);
    if (!validation.isValid) {
      toast(validation.message);
      return;
    }
    
    try {
      setIsGoingLive(true);
      
      // Use the preview stream if available, otherwise create a new one
      let stream = previewStream || mediaStream;
      
      if (!stream) {
        console.log('Creating new stream for live broadcast');
        // Get user media with proper constraints - use exact dimensions for better quality
        const constraints = {
          video: isVideoEnabled ? {
            width: { exact: 1280 },
            height: { exact: 720 },
            frameRate: { exact: 30 },
            aspectRatio: { exact: 16/9 }
          } : false,
          audio: isAudioEnabled
        };
        
        // Fallback constraints if exact fails
        const fallbackConstraints = {
          video: isVideoEnabled ? {
            width: { ideal: 1280, min: 640 },
            height: { ideal: 720, min: 480 },
            frameRate: { ideal: 30, min: 15 },
            aspectRatio: { ideal: 16/9 }
          } : false,
          audio: isAudioEnabled
        };
        
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraints);
          console.log('New stream created with exact constraints:', stream);
        } catch (error) {
          console.log('Exact constraints failed, trying fallback:', error);
          stream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
          console.log('New stream created with fallback constraints:', stream);
        }
        console.log('Stream tracks:', stream.getTracks().map(t => ({ kind: t.kind, enabled: t.enabled })));
      } else {
        console.log('Using existing stream:', stream);
        console.log('Existing stream tracks:', stream.getTracks().map(t => ({ kind: t.kind, enabled: t.enabled })));
      }
      
      // Ensure video tracks are enabled if video is supposed to be on
      if (isVideoEnabled) {
        const videoTracks = stream.getVideoTracks();
        videoTracks.forEach(track => {
          track.enabled = true;
          console.log('Video track enabled:', track.enabled);
        });
      }
      
      // Ensure audio tracks are enabled if audio is supposed to be on
      if (isAudioEnabled) {
        const audioTracks = stream.getAudioTracks();
        audioTracks.forEach(track => {
          track.enabled = true;
          console.log('Audio track enabled:', track.enabled);
        });
      }
      
      console.log('Setting media stream:', stream);
      setMediaStream(stream);
      
      // Create a new user live stream entry
      const newLiveStream = {
        id: Date.now().toString(),
        title: liveStreamData.title,
        description: liveStreamData.description,
        userName: user.displayName || user.email,
        userId: user.uid,
        startTime: new Date(),
        isLive: true,
        stream: stream
      };
      
      setUserLiveStreams(prev => [...prev, newLiveStream]);
      setCurrentLiveStream(newLiveStream);
      setIsLiveStreaming(true);
      setHasAttemptedRestart(false); // Reset restart flag for new stream
      
      // The useEffect hook will handle the video assignment
      
      // Add initial chat messages
      setChatMessages([
        {
          id: Date.now(),
          user: 'System',
          message: `${user.displayName || user.email} started the live stream!`,
          timestamp: new Date(),
          isSystem: true
        },
        {
          id: Date.now() + 1,
          user: 'System',
          message: 'Welcome to the live stream chat!',
          timestamp: new Date(),
          isSystem: true
        }
      ]);
      
      // Add some sample viewer messages after a delay
      setTimeout(() => {
        setChatMessages(prev => [...prev, {
          id: Date.now() + 2,
          user: 'FashionFan2024',
          message: 'Hello! Excited for this stream! 👋',
          timestamp: new Date(),
          isSystem: false
        }]);
      }, 3000);
      
      setTimeout(() => {
        setChatMessages(prev => [...prev, {
          id: Date.now() + 3,
          user: 'StyleWatcher',
          message: 'Great quality stream! Looking forward to the content 🔥',
          timestamp: new Date(),
          isSystem: false
        }]);
      }, 8000);
      
      toast({
        title: "You're Live!",
        description: "Your live stream has started successfully",
      });
      
      setShowGoLiveModal(false);
      // Reset the form data
      setLiveStreamData({ title: '', description: '' });
      
      // Stop preview stream since we're now live
      stopPreview();
      
    } catch (error) {
      console.error('Error starting live stream:', error);
      let errorMessage = "Please allow camera and microphone access to go live";
      
      if (error.name === 'NotAllowedError') {
        errorMessage = "Camera/microphone access was denied. Please allow access and try again.";
      } else if (error.name === 'NotFoundError') {
        errorMessage = "No camera or microphone found. Please check your devices.";
      } else if (error.name === 'NotReadableError') {
        errorMessage = "Camera/microphone is already in use by another application.";
      }
      
      toast({
        title: "Camera Access Required",
        description: errorMessage,
        variant: "destructive",
      });
      setIsGoingLive(false);
    }
  }, [user, liveStreamData, previewStream, mediaStream, isVideoEnabled, isAudioEnabled, createMediaStream, stopPreview]);
  
  // Stream management functions
  const stopGoLive = useCallback((streamId) => {
    const stream = userLiveStreams.find(s => s.id === streamId);
    if (stream?.stream) {
      stopMediaStream(stream.stream);
    }
    
    if (mediaStream) {
      stopMediaStream(mediaStream);
      setMediaStream(null);
    }
    
    // Clean up state
    setUserLiveStreams(prev => prev.filter(s => s.id !== streamId));
    setIsLiveStreaming(false);
    setCurrentLiveStream(null);
    setChatMessages([]);
    setChatInput('');
    
    toast(TOAST_MESSAGES.STREAM_ENDED);
  }, [userLiveStreams, mediaStream, stopMediaStream]);
  
  const endCurrentLiveStream = useCallback(() => {
    if (currentLiveStream) {
      stopGoLive(currentLiveStream.id);
    }
  }, [currentLiveStream, stopGoLive]);
  
  // Chat message handlers - optimized to not affect video
  const sendChatMessage = useCallback(() => {
    const trimmedInput = chatInput.trim();
    if (!trimmedInput || !user) return;

    const newMessage = {
      id: Date.now(),
      user: user.displayName || user.email,
      message: trimmedInput,
      timestamp: new Date(),
      isSystem: false,
      isStreamer: true
    };
    
    setChatMessages(prev => [...prev, newMessage]);
    setChatInput('');
    
    // Removed toast to prevent re-renders that affect video
  }, [chatInput, user]);
  
  const handleChatKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      sendChatMessage();
    }
  }, [sendChatMessage]);
  
  // Toggle video on/off
  const toggleVideo = useCallback(async () => {
    const newVideoState = !isVideoEnabled;
    setIsTogglingVideo(true);
    console.log('Toggling video to:', newVideoState);

    try {
      if (newVideoState) {
        // Turning video ON - create fresh stream
        stopMediaStream(mediaStream);
        const newStream = await createMediaStream(true, isAudioEnabled);
        
        setMediaStream(newStream);
        setIsVideoEnabled(true);
        
        // Update user live streams
        setUserLiveStreams(prev => 
          prev.map(stream => ({
            ...stream,
            stream: newStream
          }))
        );
        
        if (liveVideoRef.current) {
          configureVideoElement(liveVideoRef.current, newStream);
          
          // Auto-play with delay
          setTimeout(() => {
            liveVideoRef.current?.play()
              .then(() => console.log('Video playing after toggle ON'))
              .catch(err => console.error('Error playing video after toggle ON:', err))
              .finally(() => setIsTogglingVideo(false));
          }, 100);
        } else {
          setIsTogglingVideo(false);
        }
      } else {
        // Turning video OFF - disable tracks
        setIsVideoEnabled(false);
        
        if (mediaStream) {
          mediaStream.getVideoTracks().forEach(track => {
            track.enabled = false;
            console.log('Video track disabled');
          });
        }
        
        setIsTogglingVideo(false);
      }
    } catch (error) {
      console.error('Error toggling video:', error);
      setIsVideoEnabled(!newVideoState); // Revert state on error
      setIsTogglingVideo(false);
    }
  }, [isVideoEnabled, mediaStream, isAudioEnabled, stopMediaStream, createMediaStream, configureVideoElement]);
  
  // Toggle audio on/off - ONLY affects audio tracks, never touches video
  const toggleAudio = useCallback(() => {
    const newAudioState = !isAudioEnabled;
    console.log('Toggling audio to:', newAudioState);
    
    setIsAudioEnabled(newAudioState);
    
    // Only toggle existing audio tracks - never recreate the stream
    if (mediaStream && isLiveStreaming) {
      const audioTracks = mediaStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = newAudioState;
        console.log('Audio track toggled:', track.enabled);
      });
      
      console.log('Audio toggled successfully without affecting video');
    }
  }, [isAudioEnabled, mediaStream, isLiveStreaming]);

  // Memoize chat messages to prevent re-renders
  const memoizedChatMessages = useMemo(() => chatMessages, [chatMessages]);
  
  // Live streaming interface
  if (isLiveStreaming && currentLiveStream) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
        overflow: 'hidden',
        position: 'relative',
        padding: '16px',
        gap: '16px'
      }}>
        {/* Section 1: Top Strip - Live Stream Header */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'rgba(0, 0, 0, 0.2)',
              padding: '8px 16px',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  background: '#ef4444',
                  borderRadius: '50%',
                  animation: 'pulse 2s infinite'
                }}></div>
                <div style={{
                  position: 'absolute',
                  width: '12px',
                  height: '12px',
                  background: '#ef4444',
                  borderRadius: '50%',
                  animation: 'ping 1s infinite',
                  opacity: 0.75
                }}></div>
              </div>
              <span style={{
                color: 'white',
                fontWeight: 'bold',
                fontSize: '16px',
                letterSpacing: '0.5px',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
              }}>LIVE</span>
            </div>
            <div style={{ color: 'white' }}>
              <h1 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                margin: '0 0 4px 0',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
              }}>{currentLiveStream.title}</h1>
              <p style={{
                fontSize: '14px',
                opacity: 0.9,
                margin: 0,
                color: '#f0f0f0'
              }}>Started: {currentLiveStream.startTime.toLocaleTimeString()}</p>
            </div>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <button
              onClick={() => setShowChat(!showChat)}
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '10px',
                transition: 'all 0.3s ease',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(0, 0, 0, 0.6)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(0, 0, 0, 0.4)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <MessageCircle style={{ width: '16px', height: '16px' }} />
              <span>{showChat ? 'Hide Chat' : 'Show Chat'}</span>
            </button>
            <button
              onClick={endCurrentLiveStream}
              style={{
                background: 'linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%)',
                color: 'white',
                padding: '10px 24px',
                borderRadius: '10px',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(185, 28, 28, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%)';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 20px rgba(185, 28, 28, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%)';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(185, 28, 28, 0.3)';
              }}
            >
              End Stream
            </button>
          </div>
        </div>
        
        {/* Section 2: Center Content - Horizontal Layout with Video and Chat */}
        <div style={{
          flex: 1,
          display: 'flex',
          gap: '20px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '20px',
          padding: '20px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          minHeight: 0
        }}>
          {/* Video Area - Direct */}
          <div style={{
            flex: showChat ? 1 : 'none',
            width: showChat ? 'auto' : '100%',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <OptimizedVideo
              videoRef={liveVideoRef}
              isVideoEnabled={isVideoEnabled}
              onLoadedData={() => console.log('Live video data loaded')}
              onCanPlay={() => console.log('Live video can play')}
              onLoadedMetadata={() => console.log('Live video metadata loaded')}
              onPlaying={() => console.log('Live video is playing')}
              onError={(e) => console.error('Live video error:', e)}
              onPause={() => console.log('Live video paused')}
              onSuspend={() => console.log('Live video suspended')}
              onStalled={() => console.log('Live video stalled')}
              onAbort={() => console.log('Live video aborted')}
              onEmptied={() => console.log('Live video emptied')}
            />
            
            {/* Video disabled overlay */}
            {!isVideoEnabled && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-90 z-10">
                <div className="text-white text-center">
                  {isTogglingVideo ? (
                    <>
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                      <p>Enabling video...</p>
                    </>
                  ) : (
                    <>
                      <VideoOff className="w-12 h-12 mx-auto mb-4" />
                      <p>Video is disabled</p>
                      <p className="text-sm text-gray-300 mt-2">Click the video button to enable camera</p>
                    </>
                  )}
                </div>
              </div>
            )}
            
            {/* Loading overlay */}
            {!mediaStream && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-10">
                <div className="text-white text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                  <p>Loading video stream...</p>
                  <p className="text-sm text-gray-300 mt-2">Setting up camera...</p>
                </div>
              </div>
            )}
            
            {/* Stream Info Overlay */}
            <div className="absolute top-6 left-6 bg-black bg-opacity-80 text-white px-4 py-2 rounded-lg backdrop-blur-sm z-20">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">LIVE</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isVideoEnabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <Video className={`w-3 h-3 ${isVideoEnabled ? 'text-green-400' : 'text-red-400'}`} />
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isAudioEnabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <Mic className={`w-3 h-3 ${isAudioEnabled ? 'text-green-400' : 'text-red-400'}`} />
                </div>
              </div>
            </div>
            
            {/* Options Menu */}
            <div className="absolute top-6 right-6 z-20" ref={optionsMenuRef}>
              <div className="relative">
                <button
                  onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                  className="bg-black bg-opacity-80 text-white p-2 rounded-lg backdrop-blur-sm hover:bg-opacity-100 transition-all"
                  title="Stream Options"
                >
                  <div className="flex flex-col space-y-0.5">
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                  </div>
                </button>
                
                {showOptionsMenu && (
                  <div className="absolute top-12 right-0 bg-black bg-opacity-90 text-white rounded-lg backdrop-blur-sm min-w-64 z-30">
                    {/* Stream Info */}
                    <div className="p-3 border-b border-gray-600">
                      <h4 className="font-semibold mb-2 text-sm">Stream Info</h4>
                      <div className="space-y-1 text-xs">
                        <div>Stream: {mediaStream ? 'Available' : 'None'}</div>
                        <div>Video Tracks: {mediaStream ? mediaStream.getVideoTracks().length : 0}</div>
                        <div>Audio Tracks: {mediaStream ? mediaStream.getAudioTracks().length : 0}</div>
                        <div>Video Enabled: {isVideoEnabled ? 'Yes' : 'No'}</div>
                        <div>Audio Enabled: {isAudioEnabled ? 'Yes' : 'No'}</div>
                        {mediaStream && mediaStream.getVideoTracks().length > 0 && (
                          <div>Video Track Active: {mediaStream.getVideoTracks()[0].enabled ? 'Yes' : 'No'}</div>
                        )}
                        {mediaStream && mediaStream.getAudioTracks().length > 0 && (
                          <div>Audio Track Active: {mediaStream.getAudioTracks()[0].enabled ? 'Yes' : 'No'}</div>
                        )}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="p-3">
                      <div className="space-y-2">
                        <button
                          onClick={() => {
                            if (liveVideoRef.current) {
                              console.log('Manual video play test');
                              liveVideoRef.current.play().then(() => {
                                console.log('Manual play successful');
                              }).catch(err => {
                                console.error('Manual play failed:', err);
                              });
                            }
                            setShowOptionsMenu(false);
                          }}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors"
                        >
                          Test Play
                        </button>
                        <button
                          onClick={() => {
                            restartVideoStream();
                            setShowOptionsMenu(false);
                          }}
                          className="w-full bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm transition-colors"
                        >
                          Restart Stream
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Modern Bottom Controls Panel */}
            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(20px)',
              padding: '16px 24px',
              borderRadius: '50px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
              zIndex: 20
            }}>
              {/* Video Toggle */}
              <button
                onClick={toggleVideo}
                disabled={isTogglingVideo}
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  border: 'none',
                  background: isVideoEnabled 
                    ? 'linear-gradient(135deg, #10b981 0%, #047857 100%)' 
                    : 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                  color: 'white',
                  cursor: isTogglingVideo ? 'not-allowed' : 'pointer',
                  opacity: isTogglingVideo ? 0.6 : 1,
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                }}
                title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
                onMouseEnter={(e) => {
                  if (!isTogglingVideo) {
                    e.target.style.transform = 'scale(1.1)';
                    e.target.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isTogglingVideo) {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
                  }
                }}
              >
                {isTogglingVideo ? (
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid transparent',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                ) : (
                  isVideoEnabled ? 
                    <Video style={{ width: '24px', height: '24px' }} /> : 
                    <VideoOff style={{ width: '24px', height: '24px' }} />
                )}
              </button>

              {/* Audio Toggle */}
              <button
                onClick={toggleAudio}
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  border: 'none',
                  background: isAudioEnabled 
                    ? 'linear-gradient(135deg, #10b981 0%, #047857 100%)' 
                    : 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                }}
                title={isAudioEnabled ? 'Turn off microphone' : 'Turn on microphone'}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.1)';
                  e.target.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
                }}
              >
                {isAudioEnabled ? 
                  <Mic style={{ width: '24px', height: '24px' }} /> : 
                  <MicOff style={{ width: '24px', height: '24px' }} />
                }
              </button>

              {/* Chat Input Container */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginLeft: '8px'
              }}>
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={handleChatKeyPress}
                  placeholder="Message your audience..."
                  style={{
                    minWidth: '300px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    padding: '12px 20px',
                    borderRadius: '25px',
                    border: 'none',
                    outline: 'none',
                    fontSize: '15px',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(10px)'
                  }}
                  onFocus={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                    e.target.style.boxShadow = '0 0 0 2px rgba(239, 68, 68, 0.4)';
                  }}
                  onBlur={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  onClick={sendChatMessage}
                  disabled={!chatInput.trim()}
                  style={{
                    background: chatInput.trim() 
                      ? 'linear-gradient(135deg, #dc2626 0%, #ec4899 100%)' 
                      : 'rgba(107, 114, 128, 0.5)',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '25px',
                    border: 'none',
                    fontWeight: '600',
                    cursor: chatInput.trim() ? 'pointer' : 'not-allowed',
                    transition: 'all 0.3s ease',
                    fontSize: '15px',
                    boxShadow: chatInput.trim() ? '0 8px 32px rgba(220, 38, 38, 0.3)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (chatInput.trim()) {
                      e.target.style.background = 'linear-gradient(135deg, #b91c1c 0%, #be185d 100%)';
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 12px 40px rgba(220, 38, 38, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (chatInput.trim()) {
                      e.target.style.background = 'linear-gradient(135deg, #dc2626 0%, #ec4899 100%)';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 8px 32px rgba(220, 38, 38, 0.3)';
                    }
                  }}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
          
          {/* Chat Panel */}
          {showChat && (
            <div style={{
            width: '350px',
              background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
              borderRadius: '16px',
              padding: '16px',
              margin: '20px 0',
              marginLeft: '20px',
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              fontFamily: 'Inter, system-ui, sans-serif'
            }}>
              {/* Chat Header */}
              <div style={{
                padding: '20px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                flexShrink: 0,
                background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)'
              }}>
                <h3 style={{
                  color: 'white',
                  fontWeight: '700',
                  fontSize: '18px',
                  margin: '0 0 4px 0'
                }}>Live Chat</h3>
                <p style={{
                  color: '#9ca3af',
                  fontSize: '14px',
                  margin: 0
                }}>Chat with your audience</p>
              </div>
              
              {/* Chat Messages */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                minHeight: 0
              }}>
                {chatMessages.map((msg) => {
                  const isStreamer = msg.user === (user?.displayName || user?.email);
                  return (
                    <div key={msg.id} style={{
                      textAlign: msg.isSystem ? 'center' : 'left'
                    }}>
                      {msg.isSystem ? (
                        <div style={{
                          color: '#9ca3af',
                          fontSize: '12px',
                          fontStyle: 'italic',
                          padding: '8px 0'
                        }}>
                          {msg.message}
                        </div>
                      ) : (
                        <div style={{
                          borderRadius: '12px',
                          padding: '12px 16px',
                          background: isStreamer 
                            ? 'linear-gradient(135deg, #dc2626 0%, #ec4899 100%)'
                            : 'rgba(31, 41, 55, 0.8)',
                          border: isStreamer 
                            ? '1px solid rgba(239, 68, 68, 0.5)' 
                            : '1px solid rgba(55, 65, 81, 0.3)',
                          backdropFilter: 'blur(10px)',
                          boxShadow: isStreamer 
                            ? '0 4px 12px rgba(220, 38, 38, 0.3)'
                            : '0 2px 8px rgba(0, 0, 0, 0.1)'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '6px',
                            flexWrap: 'wrap'
                          }}>
                            {isStreamer && (
                              <span style={{
                                background: '#fbbf24',
                                color: '#000000',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                fontSize: '10px',
                                fontWeight: 'bold',
                                letterSpacing: '0.5px'
                              }}>
                                STREAMER
                              </span>
                            )}
                            <span style={{
                              fontWeight: '600',
                              fontSize: '14px',
                              color: isStreamer ? '#ffffff' : '#60a5fa'
                            }}>
                              {msg.user}
                            </span>
                            <span style={{
                              fontSize: '11px',
                              color: isStreamer ? '#e5e7eb' : '#9ca3af',
                              opacity: 0.8
                            }}>
                              {msg.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <p style={{
                            fontSize: '14px',
                            color: '#ffffff',
                            fontWeight: isStreamer ? '500' : '400',
                            margin: 0,
                            lineHeight: '1.4'
                          }}>
                            {msg.message}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>  
        )}
        </div>
      </div>
    );
  }
  
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #7c3aed 0%, #000 50%, #ec4899 100%)' }}>
      {/* Professional Header */}
      <div style={{ position: 'relative', zIndex: 10, padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
          <Link href="/social/fashiontv">
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'rgba(0, 0, 0, 0.6)',
              color: 'white',
              padding: '12px 20px',
              borderRadius: '50px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              <span>← Back to TV</span>
            </button>
          </Link>

          <Link href="/social">
            <button style={{
              background: 'rgba(0, 0, 0, 0.6)',
              color: 'white',
              padding: '12px',
              borderRadius: '50%',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}>
              <Home style={{ width: '24px', height: '24px' }} />
            </button>
          </Link>
        </div>
        
        <div style={{ textAlign: 'center', padding: '0 20px' }}>
          <h1 style={{ 
            fontSize: '48px', 
            fontWeight: '800', 
            color: 'white', 
            marginBottom: '16px',
            margin: '0 0 16px 0'
          }}>
            Live Fashion Streams
          </h1>
          <p style={{ 
            color: '#d1d5db', 
            fontSize: '20px', 
            maxWidth: '600px', 
            margin: '0 auto',
            lineHeight: 1.6
          }}>
            Discover and share live fashion content from around the world
          </p>
        </div>
      </div>

      {/* Professional Action Buttons */}
      {user ? (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '48px', gap: '20px', padding: '0 32px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowGoLiveModal(true)}
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
              color: 'white',
              padding: '16px 32px',
              borderRadius: '50px',
              border: 'none',
              fontWeight: '600',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 25px rgba(124, 58, 237, 0.3)'
            }}
          >
            <span style={{ fontSize: '18px' }}>🔴</span>
            <span>Go Live</span>
          </button>
          
          <button
            onClick={() => setShowSubmitForm(!showSubmitForm)}
            style={{
              background: 'linear-gradient(135deg, #dc2626, #ec4899)',
              color: 'white',
              padding: '16px 32px',
              borderRadius: '50px',
              border: 'none',
              fontWeight: '600',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 25px rgba(220, 38, 38, 0.3)'
            }}
          >
            <Plus style={{ width: '20px', height: '20px' }} />
            <span>Add Stream URL</span>
          </button>
          
          {/* Admin: Clear All Streams Button */}
          {streams.some(stream => stream.userId?.startsWith('sample-user')) && (
            <button
              onClick={handleDeleteAllSampleStreams}
              style={{
                background: 'linear-gradient(135deg, #ea580c, #f97316)',
                color: 'white',
                padding: '16px 24px',
                borderRadius: '50px',
                border: 'none',
                fontWeight: '600',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 25px rgba(234, 88, 12, 0.3)'
              }}
            >
              <span>Clear Demo Streams</span>
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '48px', padding: '0 32px' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '24px',
            textAlign: 'center',
            color: 'white',
            maxWidth: '400px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <p style={{ fontSize: '16px', marginBottom: '16px', margin: '0 0 16px 0' }}>Want to share your live fashion content?</p>
            <Link href="/login">
              <button style={{
                background: 'linear-gradient(135deg, #dc2626, #ec4899)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '50px',
                border: 'none',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}>
                Sign In to Add Streams
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* Professional Submit Form Modal */}
      {showSubmitForm && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: '20px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowSubmitForm(false);
            }
          }}
        >
          <div style={{
            maxWidth: '600px',
            width: '100%',
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '24px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            padding: '40px',
            backdropFilter: 'blur(20px)'
          }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #dc2626, #ec4899)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto'
            }}>
              <Plus style={{ width: '28px', height: '28px', color: 'white' }} />
            </div>
            <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#1f2937', margin: '0 0 12px 0' }}>Add Live Stream</h2>
            <p style={{ color: '#6b7280', fontSize: '16px', margin: 0 }}>Share your live fashion content with the community</p>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                Stream Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '16px',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  fontSize: '16px',
                  backgroundColor: 'white'
                }}
                placeholder="e.g., Milan Fashion Week 2025 - Live Runway Show"
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                Stream Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '16px',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  fontSize: '16px',
                  backgroundColor: 'white',
                  resize: 'none',
                  minHeight: '100px'
                }}
                placeholder="Brief description of your live stream content..."
                rows="3"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                Stream URL *
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={handleUrlChange}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '16px',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  fontSize: '16px',
                  backgroundColor: 'white'
                }}
                placeholder="https://youtube.com/watch?v=... or https://twitch.tv/channel"
                required
              />
              {formData.platform && (
                <div style={{ marginTop: '12px', padding: '12px 16px', backgroundColor: '#d1fae5', border: '1px solid #a7f3d0', borderRadius: '12px' }}>
                  <p style={{ fontSize: '14px', color: '#065f46', margin: 0 }}>
                    ✓ Platform detected: <span style={{ fontWeight: '600', textTransform: 'capitalize' }}>{formData.platform}</span>
                  </p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '16px', paddingTop: '24px' }}>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  flex: 1,
                  background: isSubmitting ? 'rgba(156, 163, 175, 0.8)' : 'linear-gradient(135deg, #dc2626, #ec4899)',
                  color: 'white',
                  padding: '16px 24px',
                  borderRadius: '16px',
                  border: 'none',
                  fontWeight: '600',
                  fontSize: '16px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 8px 25px rgba(220, 38, 38, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {isSubmitting ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid white',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    <span>Adding Stream...</span>
                  </>
                ) : (
                  <>
                    <Plus style={{ width: '16px', height: '16px' }} />
                    <span>Add Stream</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowSubmitForm(false)}
                style={{
                  flex: 1,
                  background: 'rgba(243, 244, 246, 0.8)',
                  color: '#374151',
                  padding: '16px 24px',
                  borderRadius: '16px',
                  border: '2px solid rgba(209, 213, 219, 0.8)',
                  fontWeight: '600',
                  fontSize: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
          </div>
        </div>
      )}

      {/* User Live Streams Section */}
      {userLiveStreams.length > 0 && (
        <div className="container mx-auto px-4 pb-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-white mb-2">Your Live Streams</h2>
            <p className="text-gray-300">Broadcasting live to your audience</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userLiveStreams.map((stream) => (
              <div key={stream.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="relative aspect-video bg-black flex items-center justify-center">
                  <video
                    autoPlay
                    playsInline
                    muted
                    ref={(video) => {
                      if (video && stream.stream) {
                        video.srcObject = stream.stream;
                      }
                    }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ 
                    position: 'absolute', 
                    bottom: '8px', 
                    left: '8px', 
                    display: 'flex', 
                    gap: '8px' 
                  }}>
                    <button
                      onClick={() => stopGoLive(stream.id)}
                      style={{
                        backgroundColor: '#dc2626',
                        color: 'white',
                        padding: '8px',
                        borderRadius: '9999px',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <VideoOff style={{ width: '16px', height: '16px' }} />
                    </button>
                  </div>
                  <span style={{ 
                    position: 'absolute', 
                    top: '8px', 
                    left: '8px', 
                    backgroundColor: '#ef4444',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '600',
                    animation: 'pulse 2s infinite'
                  }}>
                    🔴 LIVE
                  </span>
                  <span style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    Your Stream
                  </span>
                </div>
                <div style={{ padding: '16px' }}>
                  <h3 style={{ fontWeight: '700', color: '#1f2937', marginBottom: '8px' }}>{stream.title}</h3>
                  {stream.description && (
                    <p style={{ fontSize: '14px', color: '#4b5563', marginBottom: '12px' }}>{stream.description}</p>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#6b7280' }}>
                    <span>Started: {stream.startTime.toLocaleTimeString()}</span>
                    <span style={{ color: '#10b981', fontWeight: '600' }}>Live Now</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* External Streams Grid */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 32px 48px 32px' }}>
        {userLiveStreams.length > 0 && (
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '800', color: 'white', marginBottom: '12px', margin: '0 0 12px 0' }}>External Live Streams</h2>
            <p style={{ color: '#d1d5db', fontSize: '18px', margin: 0 }}>Discover streams from around the world</p>
          </div>
        )}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
              <p className="mt-4 text-white">Loading live streams...</p>
            </div>
          </div>
        ) : streams.length === 0 ? (
          <div className="text-center py-20">
            <ExternalLink className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Live Streams Available</h3>
            <p className="text-gray-300 mb-4">Be the first to share a live fashion stream with the community!</p>
            {user && (
              <button
                onClick={() => setShowSubmitForm(true)}
                className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-6 py-2 rounded-full font-semibold transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Add Live Stream
              </button>
            )}
          </div>
        ) : (
          <LiveFeedGrid 
            streams={streams} 
            currentUser={user} 
            onStreamDeleted={handleStreamDeleted} 
          />
        )}
      </div>
      
      {/* Professional Go Live Modal */}
      {showGoLiveModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '20px',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.98)',
            borderRadius: '20px',
            maxWidth: '420px',
            width: '100%',
            padding: '20px',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(20px)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px auto',
                boxShadow: '0 8px 25px rgba(124, 58, 237, 0.3)'
              }}>
                <span style={{ color: 'white', fontSize: '24px' }}>🔴</span>
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#1f2937', margin: '0 0 8px 0' }}>Go Live</h2>
              <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Start broadcasting live to your audience</p>
            </div>
            
            {/* Professional Camera Preview */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{
                aspectRatio: '16/9',
                backgroundColor: '#111827',
                borderRadius: '12px',
                overflow: 'hidden',
                position: 'relative',
                border: '1px solid rgba(124, 58, 237, 0.2)'
              }}>
                <video
                  ref={previewVideoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: previewStream ? 'block' : 'none'
                  }}
                />
                
                {!previewStream && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    position: 'absolute',
                    inset: 0
                  }}>
                    <div style={{ textAlign: 'center', color: '#9ca3af' }}>
                      {isLoadingPreview ? (
                        <>
                          <div style={{
                            width: '48px',
                            height: '48px',
                            border: '3px solid #7c3aed',
                            borderTop: '3px solid transparent',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            margin: '0 auto 12px auto'
                          }}></div>
                          <p style={{ fontSize: '14px', margin: 0 }}>Connecting to camera...</p>
                        </>
                      ) : (
                        <>
                          <Video style={{ width: '48px', height: '48px', margin: '0 auto 12px auto' }} />
                          <p style={{ fontSize: '14px', margin: 0 }}>Camera Preview</p>
                        </>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Professional Video/Audio indicators */}
                <div style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '12px',
                  display: 'flex',
                  gap: '8px'
                }}>
                  <div style={{
                    padding: '8px',
                    borderRadius: '50%',
                    backgroundColor: isVideoEnabled ? '#10b981' : '#ef4444',
                    backdropFilter: 'blur(10px)'
                  }}>
                    {isVideoEnabled ? 
                      <Video style={{ width: '16px', height: '16px', color: 'white' }} /> : 
                      <VideoOff style={{ width: '16px', height: '16px', color: 'white' }} />
                    }
                  </div>
                  <div style={{
                    padding: '8px',
                    borderRadius: '50%',
                    backgroundColor: isAudioEnabled ? '#10b981' : '#ef4444',
                    backdropFilter: 'blur(10px)'
                  }}>
                    {isAudioEnabled ? 
                      <Mic style={{ width: '16px', height: '16px', color: 'white' }} /> : 
                      <MicOff style={{ width: '16px', height: '16px', color: 'white' }} />
                    }
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Stream Title *</label>
                <input
                  type="text"
                  value={liveStreamData.title}
                  onChange={(e) => setLiveStreamData({ ...liveStreamData, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    fontSize: '14px',
                    backgroundColor: 'white'
                  }}
                  placeholder="e.g., My Fashion Live Stream"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Stream Description</label>
                <textarea
                  value={liveStreamData.description}
                  onChange={(e) => setLiveStreamData({ ...liveStreamData, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    fontSize: '14px',
                    backgroundColor: 'white',
                    resize: 'none',
                    minHeight: '70px'
                  }}
                  placeholder="Tell your audience what you'll be streaming..."
                  rows="2"
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={toggleVideo}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    background: isVideoEnabled 
                      ? 'linear-gradient(135deg, #7c3aed, #8b5cf6)'
                      : 'rgba(243, 244, 246, 0.8)',
                    color: isVideoEnabled ? 'white' : '#374151',
                    border: isVideoEnabled ? 'none' : '2px solid rgba(209, 213, 219, 0.5)',
                    boxShadow: isVideoEnabled ? '0 4px 12px rgba(124, 58, 237, 0.3)' : 'none',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  {isVideoEnabled ? 
                    <Video style={{ width: '14px', height: '14px' }} /> : 
                    <VideoOff style={{ width: '14px', height: '14px' }} />
                  }
                  <span>{isVideoEnabled ? 'Video On' : 'Video Off'}</span>
                </button>
                <button
                  onClick={toggleAudio}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    background: isAudioEnabled 
                      ? 'linear-gradient(135deg, #7c3aed, #8b5cf6)'
                      : 'rgba(243, 244, 246, 0.8)',
                    color: isAudioEnabled ? 'white' : '#374151',
                    border: isAudioEnabled ? 'none' : '2px solid rgba(209, 213, 219, 0.5)',
                    boxShadow: isAudioEnabled ? '0 4px 12px rgba(124, 58, 237, 0.3)' : 'none',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  {isAudioEnabled ? 
                    <Mic style={{ width: '14px', height: '14px' }} /> : 
                    <MicOff style={{ width: '14px', height: '14px' }} />
                  }
                  <span>{isAudioEnabled ? 'Audio On' : 'Audio Off'}</span>
                </button>
              </div>

              <div style={{ display: 'flex', gap: '12px', paddingTop: '16px' }}>
                <button
                  onClick={startGoLive}
                  disabled={isGoingLive}
                  style={{
                    flex: 1,
                    background: isGoingLive ? 'rgba(156, 163, 175, 0.8)' : 'linear-gradient(135deg, #dc2626, #ec4899)',
                    color: 'white',
                    padding: '14px 20px',
                    borderRadius: '12px',
                    border: 'none',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: isGoingLive ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: isGoingLive ? 'none' : '0 8px 25px rgba(220, 38, 38, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  {isGoingLive ? (
                    <>
                      <div style={{
                        width: '14px',
                        height: '14px',
                        border: '2px solid white',
                        borderTop: '2px solid transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></div>
                      <span>Starting...</span>
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: '16px' }}>🔴</span>
                      <span>Go Live</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowGoLiveModal(false);
                    setLiveStreamData({ title: '', description: '' });
                    setIsGoingLive(false);
                  }}
                  style={{
                    flex: 1,
                    background: 'rgba(243, 244, 246, 0.8)',
                    color: '#374151',
                    padding: '14px 20px',
                    borderRadius: '12px',
                    border: '2px solid rgba(209, 213, 219, 0.8)',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
