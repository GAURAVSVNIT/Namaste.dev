"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from "@/hooks/useAuth";
import LookForm from "@/components/look/LookForm";
import { toast } from '@/hooks/use-toast';
import { createLook } from '@/lib/look';



export default function UploadAvatar() {
    const { user } = useAuth();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const searchParams = useSearchParams();

    const avatarUrl = "https://models.readyplayer.me/" + searchParams.get('avatar');

    const initialData = {
        images: [avatarUrl],
        caption: "Proudly presenting my custom made avatar 💫",
        tags: ["avatar"]
    };

  
    const handleSubmit = async (lookData) => {
      setIsSubmitting(true);
      try {
        await createLook(user.uid, lookData);
        toast({
          title: "Success!",
          description: "Your avatar look has been uploaded successfully.",
        });
        router.push('/social/look');
      } 
      catch (error) {
        toast({
          title: "Error",
          description: "Failed to upload avatar look. Please try again. "+error,
          variant: "destructive",
        });
      } 
      finally {
        setIsSubmitting(false);
      }
    };
  
    const handleCancel = () => {
      router.push('/social/look');
    };



  return (
    <div className="avatars-page">
      <h3>Upload your Avatar</h3>
      <LookForm 
          onSubmit={handleSubmit} 
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          initialData={initialData}
       />
    </div>
  );
}
