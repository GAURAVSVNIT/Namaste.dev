import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// Re-export Firebase storage functions for easier imports
export { storage, ref, uploadBytes, getDownloadURL, deleteObject };

// Helper function to upload a file and get its download URL
export const uploadImageToStorage = async (file, path) => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Alias for backwards compatibility
export const uploadFile = uploadImageToStorage;

// Helper function to delete a file from storage
export const deleteFile = async (path) => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};
