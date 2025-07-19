'use client';

import { useState, useEffect, useRef, useCallback, memo, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { getApprovedLivestreams, addLivestream, parseStreamUrl, getAllLivestreams, deleteLivestream } from '@/lib/fashiontv';
import { Home, Plus, ExternalLink, Calendar, User, Video, VideoOff, Mic, MicOff, Settings } from 'lucide-react';
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
        visibility: isVideoEnabled ? 'visible' : 'hidden'
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
      <div className="h-screen flex flex-col bg-black overflow-hidden relative">
        {/* Live Stream Header */}
        <div className="bg-gradient-to-r from-red-600 to-pink-600 p-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-white font-semibold">LIVE</span>
            </div>
            <div className="text-white">
              <h1 className="text-lg font-bold">{currentLiveStream.title}</h1>
              <p className="text-sm opacity-80">Started: {currentLiveStream.startTime.toLocaleTimeString()}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowChat(!showChat)}
              className="bg-gray-800 bg-opacity-80 hover:bg-opacity-100 text-white px-4 py-2 rounded-lg transition-all border border-gray-600 hover:border-gray-500"
            >
              <span className="text-white">{showChat ? 'Hide Chat' : 'Show Chat'}</span>
            </button>
            <button
              onClick={endCurrentLiveStream}
              className="bg-red-700 hover:bg-red-800 text-white px-6 py-2 rounded-lg font-semibold transition-all"
            >
              End Stream
            </button>
          </div>
        </div>
        
        {/* Live Stream Content */}
        <div className="flex-1 flex min-h-0">
          {/* Video Area */}
          <div className={`${showChat ? 'flex-1' : 'w-full'} bg-black flex flex-col relative`}>
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
            
            {/* Bottom Controls - Centered */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-4 z-20">
              <button
                onClick={toggleVideo}
                disabled={isTogglingVideo}
                className={`p-4 rounded-full transition-all shadow-lg ${isVideoEnabled ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} ${isTogglingVideo ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
              >
                {isTogglingVideo ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                ) : (
                  isVideoEnabled ? <Video className="w-6 h-6 text-white" /> : <VideoOff className="w-6 h-6 text-white" />
                )}
              </button>
              <button
                onClick={toggleAudio}
                className={`p-4 rounded-full transition-all shadow-lg ${isAudioEnabled ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                title={isAudioEnabled ? 'Turn off microphone' : 'Turn on microphone'}
              >
                {isAudioEnabled ? <Mic className="w-6 h-6 text-white" /> : <MicOff className="w-6 h-6 text-white" />}
              </button>
            </div>

            {/* Chat Input */}
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-3/4 max-w-md z-20">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={handleChatKeyPress}
                  placeholder="Message your audience..."
                  className="flex-1 bg-gray-800 bg-opacity-90 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 border border-gray-600 backdrop-blur-sm placeholder-gray-400"
                />
                <button
                  onClick={sendChatMessage}
                  disabled={!chatInput.trim()}
                  className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-all font-medium shadow-lg"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
          
          {/* Chat Panel */}
          {showChat && (
            <div className="w-80 bg-gray-900 flex flex-col flex-shrink-0">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-700 flex-shrink-0">
                <h3 className="text-white font-semibold">Live Chat</h3>
                <p className="text-gray-400 text-sm">Chat with your audience</p>
              </div>
              
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-0">
                {chatMessages.map((msg) => {
                  const isStreamer = msg.user === (user?.displayName || user?.email);
                  return (
                    <div key={msg.id} className={`${msg.isSystem ? 'text-center' : ''}`}>
                      {msg.isSystem ? (
                        <div className="text-gray-400 text-xs italic">
                          {msg.message}
                        </div>
                      ) : (
                        <div className={`rounded-lg p-3 ${isStreamer ? 'bg-gradient-to-r from-red-600 to-pink-600 border-2 border-red-400' : 'bg-gray-800'}`}>
                          <div className="flex items-center space-x-2 mb-1">
                            {isStreamer && (
                              <span className="bg-yellow-500 text-black px-2 py-0.5 rounded text-xs font-bold">
                                STREAMER
                              </span>
                            )}
                            <span className={`font-medium text-sm ${isStreamer ? 'text-white' : 'text-blue-400'}`}>
                              {msg.user}
                            </span>
                            <span className={`text-xs ${isStreamer ? 'text-gray-200' : 'text-gray-500'}`}>
                              {msg.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <p className={`text-sm ${isStreamer ? 'text-white font-medium' : 'text-white'}`}>
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900">
      {/* Header */}
      <div className="relative z-10 p-6">
        <div className="flex items-center justify-between mb-4">
          <Link href="/fashiontv">
            <button className="flex items-center space-x-2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full hover:bg-opacity-70 transition-all backdrop-blur-sm">
              <span className="text-sm font-semibold">← Back to TV</span>
            </button>
          </Link>

          <Link href="/">
            <button className="bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all backdrop-blur-sm">
              <Home className="w-6 h-6" />
            </button>
          </Link>
        </div>
        
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            Live Fashion Streams
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Discover and share live fashion content from around the world
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      {user ? (
        <div className="flex justify-center mb-8 space-x-4">
          <button
            onClick={() => setShowGoLiveModal(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-full font-semibold transition-all flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <span className="w-5 h-5 text-red-500">🔴</span>
            <span>Go Live</span>
          </button>
          
          <button
            onClick={() => setShowSubmitForm(!showSubmitForm)}
            className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-8 py-3 rounded-full font-semibold transition-all flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span>Add Stream URL</span>
          </button>
          
          {/* Admin: Clear All Streams Button - Only show when there are demo streams */}
          {streams.some(stream => stream.userId?.startsWith('sample-user')) && (
            <button
              onClick={handleDeleteAllSampleStreams}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-full font-semibold transition-all flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <span>Clear Demo Streams</span>
            </button>
          )}
        </div>
      ) : (
        <div className="flex justify-center mb-6">
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 text-center text-white max-w-md">
            <p className="text-sm mb-2">Want to share your live fashion content?</p>
            <Link href="/login">
              <button className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-6 py-2 rounded-full font-semibold transition-all text-sm">
                Sign In to Add Streams
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* Submit Form */}
      {showSubmitForm && (
        <div className="max-w-lg mx-auto mb-8 bg-white rounded-xl shadow-xl border border-gray-100 p-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Add Live Stream</h2>
            <p className="text-gray-600 mt-2">Share your live fashion content with the community</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Stream Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                placeholder="e.g., Milan Fashion Week 2025 - Live Runway Show"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Stream Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
                placeholder="Brief description of your live stream content..."
                rows="3"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Stream URL *
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={handleUrlChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                placeholder="https://youtube.com/watch?v=... or https://twitch.tv/channel"
                required
              />
              {formData.platform && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-800">
                    ✓ Platform detected: <span className="font-semibold capitalize">{formData.platform}</span>
                  </p>
                </div>
              )}
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:hover:scale-100"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Adding Stream...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>Add Stream</span>
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowSubmitForm(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold transition-all border border-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
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
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 flex space-x-2">
                    <button
                      onClick={() => stopGoLive(stream.id)}
                      className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-all"
                    >
                      <VideoOff className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold animate-pulse">
                    🔴 LIVE
                  </span>
                  <span className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-semibold">
                    Your Stream
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-2">{stream.title}</h3>
                  {stream.description && (
                    <p className="text-sm text-gray-600 mb-3">{stream.description}</p>
                  )}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Started: {stream.startTime.toLocaleTimeString()}</span>
                    <span className="text-green-600 font-semibold">Live Now</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* External Streams Grid */}
      <div className="container mx-auto px-4 pb-8">
        {userLiveStreams.length > 0 && (
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-white mb-2">External Live Streams</h2>
            <p className="text-gray-300">Discover streams from around the world</p>
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
      
      {/* Go Live Modal */}
      {showGoLiveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-lg">🔴</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Go Live</h2>
              <p className="text-gray-600 mt-2">Start broadcasting live to your audience</p>
            </div>
            
            {/* Camera Preview */}
            <div className="mb-6">
              <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden relative">
                <video
                  ref={previewVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{ display: previewStream ? 'block' : 'none' }}
                />
                
                {!previewStream && (
                  <div className="flex items-center justify-center h-full absolute inset-0">
                    <div className="text-center text-gray-400">
                      {isLoadingPreview ? (
                        <>
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-2"></div>
                          <p className="text-sm">Connecting to camera...</p>
                        </>
                      ) : (
                        <>
                          <Video className="w-12 h-12 mx-auto mb-2" />
                          <p className="text-sm">Camera Preview</p>
                        </>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Video/Audio indicators */}
                <div className="absolute bottom-2 left-2 flex space-x-2">
                  <div className={`p-1 rounded-full ${isVideoEnabled ? 'bg-green-600' : 'bg-red-600'}`}>
                    {isVideoEnabled ? <Video className="w-4 h-4 text-white" /> : <VideoOff className="w-4 h-4 text-white" />}
                  </div>
                  <div className={`p-1 rounded-full ${isAudioEnabled ? 'bg-green-600' : 'bg-red-600'}`}>
                    {isAudioEnabled ? <Mic className="w-4 h-4 text-white" /> : <MicOff className="w-4 h-4 text-white" />}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Stream Title *</label>
                <input
                  type="text"
                  value={liveStreamData.title}
                  onChange={(e) => setLiveStreamData({ ...liveStreamData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="e.g., My Fashion Live Stream"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Stream Description</label>
                <textarea
                  value={liveStreamData.description}
                  onChange={(e) => setLiveStreamData({ ...liveStreamData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                  placeholder="Tell your audience what you'll be streaming..."
                  rows="3"
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <button
                  onClick={toggleVideo}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 ${
                    isVideoEnabled 
                      ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                  <span>{isVideoEnabled ? 'Video On' : 'Video Off'}</span>
                </button>
                <button
                  onClick={toggleAudio}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 ${
                    isAudioEnabled 
                      ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  <span>{isAudioEnabled ? 'Audio On' : 'Audio Off'}</span>
                </button>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={startGoLive}
                  disabled={isGoingLive}
                  className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:hover:scale-100"
                >
                  {isGoingLive ? (
                    <span className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Starting...</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center space-x-2">
                      <span>🔴</span>
                      <span>Go Live</span>
                    </span>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowGoLiveModal(false);
                    setLiveStreamData({ title: '', description: '' });
                    setIsGoingLive(false);
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold transition-all border border-gray-300"
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




