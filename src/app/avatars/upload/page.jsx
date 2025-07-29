"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from "@/hooks/useAuth";
import LookForm from "@/components/look/LookForm";
import { toast } from '@/hooks/use-toast';
import { createLook } from '@/lib/look';

function UploadAvatarContent() {
    const { user } = useAuth();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const searchParams = useSearchParams();

    const avatarUrl = "https://models.readyplayer.me/" + searchParams.get('avatar').replaceAll("~", "&");

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
        <h3 className="text-2xl text-center font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 dark:to-blue-500 bg-clip-text text-transparent" style={{ marginBottom: "1rem" }}>Upload your Avatar</h3>
        <LookForm 
            onSubmit={handleSubmit} 
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
            initialData={initialData}
         />
      </div>
    );
}

export default function UploadAvatar() {
  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <UploadAvatarContent />
    </Suspense>
  );
}
