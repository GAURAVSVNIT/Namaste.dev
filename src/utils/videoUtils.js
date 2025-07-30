/**
 * Video utility functions for processing and thumbnail generation
 */

/**
 * Generate thumbnail from video file
 * @param {File} videoFile - Video file to extract thumbnail from
 * @param {number} seekTime - Time in seconds to capture thumbnail (default: 1 second)
 * @param {number} width - Thumbnail width (default: 300)
 * @param {number} height - Thumbnail height (default: 533 for 9:16 aspect ratio)
 * @returns {Promise<Blob>} - Thumbnail blob
 */
export const generateVideoThumbnail = (videoFile, seekTime = 1, width = 300, height = 533) => {
  return new Promise((resolve, reject) => {
    try {
      // Create video element
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Handle video loading
      video.addEventListener('loadedmetadata', () => {
        // Ensure seek time doesn't exceed video duration
        const actualSeekTime = Math.min(seekTime, video.duration / 2);
        video.currentTime = actualSeekTime;
      });

      // Handle seek completion
      video.addEventListener('seeked', () => {
        try {
          // Draw video frame to canvas
          context.drawImage(video, 0, 0, width, height);
          
          // Convert canvas to blob
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to generate thumbnail blob'));
            }
          }, 'image/jpeg', 0.8);
        } catch (error) {
          reject(error);
        }
      });

      // Handle errors
      video.addEventListener('error', (e) => {
        reject(new Error('Failed to load video for thumbnail generation'));
      });

      // Load video
      video.preload = 'metadata';
      video.src = URL.createObjectURL(videoFile);
      video.load();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generate multiple thumbnails from video at different time points
 * @param {File} videoFile - Video file to extract thumbnails from
 * @param {number} count - Number of thumbnails to generate (default: 3)
 * @param {number} width - Thumbnail width
 * @param {number} height - Thumbnail height
 * @returns {Promise<Array<Blob>>} - Array of thumbnail blobs
 */
export const generateMultipleThumbnails = async (videoFile, count = 3, width = 300, height = 533) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const thumbnails = [];
    let currentThumbnail = 0;

    canvas.width = width;
    canvas.height = height;

    video.addEventListener('loadedmetadata', () => {
      const duration = video.duration;
      const interval = duration / (count + 1); // Avoid very beginning and end
      
      const seekToNextThumbnail = () => {
        if (currentThumbnail < count) {
          const seekTime = interval * (currentThumbnail + 1);
          video.currentTime = seekTime;
        } else {
          resolve(thumbnails);
        }
      };

      video.addEventListener('seeked', () => {
        try {
          context.drawImage(video, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            if (blob) {
              thumbnails.push(blob);
              currentThumbnail++;
              seekToNextThumbnail();
            } else {
              reject(new Error('Failed to generate thumbnail blob'));
            }
          }, 'image/jpeg', 0.8);
        } catch (error) {
          reject(error);
        }
      });

      seekToNextThumbnail();
    });

    video.addEventListener('error', () => {
      reject(new Error('Failed to load video for thumbnail generation'));
    });

    video.preload = 'metadata';
    video.src = URL.createObjectURL(videoFile);
    video.load();
  });
};

/**
 * Get video duration
 * @param {File} videoFile - Video file
 * @returns {Promise<number>} - Duration in seconds
 */
export const getVideoDuration = (videoFile) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    
    video.addEventListener('loadedmetadata', () => {
      resolve(video.duration);
    });
    
    video.addEventListener('error', () => {
      reject(new Error('Failed to load video metadata'));
    });
    
    video.preload = 'metadata';
    video.src = URL.createObjectURL(videoFile);
    video.load();
  });
};

/**
 * Get video dimensions
 * @param {File} videoFile - Video file
 * @returns {Promise<{width: number, height: number}>} - Video dimensions
 */
export const getVideoDimensions = (videoFile) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    
    video.addEventListener('loadedmetadata', () => {
      resolve({
        width: video.videoWidth,
        height: video.videoHeight
      });
    });
    
    video.addEventListener('error', () => {
      reject(new Error('Failed to load video metadata'));
    });
    
    video.preload = 'metadata';
    video.src = URL.createObjectURL(videoFile);
    video.load();
  });
};

/**
 * Validate video file
 * @param {File} file - File to validate
 * @returns {Promise<{isValid: boolean, error?: string, metadata?: object}>}
 */
export const validateVideoFile = async (file) => {
  try {
    // Check file type
    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/webm'];
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Invalid file type. Only MP4, MOV, and WebM are allowed.'
      };
    }

    // Check file size (100MB limit)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'File size exceeds 100MB limit.'
      };
    }

    // Get video metadata
    const [duration, dimensions] = await Promise.all([
      getVideoDuration(file),
      getVideoDimensions(file)
    ]);

    // Check duration (60 seconds limit)
    if (duration > 60) {
      return {
        isValid: false,
        error: 'Video duration exceeds 60 seconds limit.'
      };
    }

    return {
      isValid: true,
      metadata: {
        duration,
        dimensions,
        fileSize: file.size,
        fileType: file.type
      }
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'Failed to validate video file.'
    };
  }
};

/**
 * Create thumbnail preview URL for display
 * @param {Blob} thumbnailBlob - Thumbnail blob
 * @returns {string} - Object URL for preview
 */
export const createThumbnailPreviewURL = (thumbnailBlob) => {
  return URL.createObjectURL(thumbnailBlob);
};

/**
 * Cleanup preview URL
 * @param {string} url - Object URL to cleanup
 */
export const cleanupPreviewURL = (url) => {
  URL.revokeObjectURL(url);
};
