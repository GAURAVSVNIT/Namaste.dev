import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import { GoogleGenAI } from "@google/genai";
import axios from "axios";
import 'dotenv/config';

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  temperature: 2,
  apiKey:  process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
    },
  ],
});

const genAI = new GoogleGenAI({apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY});

/**
 * Normal fashion chat
 */
export const chatWithFashionBot = async (messages) => {
  const aiMsg = await llm.invoke([
    ["system", "Strictly reply as a helpful fashion expert that helps user professionally. Do not entertain any talks unrelated to fashion without being rude. Be professional."],
    ...messages.map((msg) => ["human", msg]),
  ]);
  return aiMsg.content;
};

/**
 * Analyze a look (image URL)
 */
export const analyzeLookImage = async (imageUrl) => {
  console.log("URLL: "+imageUrl)
  const response = await fetch(imageUrl);
  const imageArrayBuffer = await response.arrayBuffer();
  const base64ImageData = Buffer.from(imageArrayBuffer).toString('base64');

  // const proxyImageUrl = `/api/imageProxy?url=${encodeURIComponent(imageUrl)}`;
  // const imageBlob = await fetch(proxyImageUrl)

  const result = await genAI.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64ImageData,
        },
      },
      {
        text: "Behave like a fashion adviser and tell the user how he or she looks in the image. The praise should be followed by useful suggestions for outfit and pose improvements."
      },
    ],
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
  });

  return result.text;
};

/**
 * Analyze a fashion video (video URL)
 */
export const analyzeFashionVideo = async (videoUrl) => {
  const response = await axios.get(videoUrl, { responseType: 'arraybuffer' });
  const base64Video = Buffer.from(response.data).toString('base64');

  const result = await genAI.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        inlineData: {
          mimeType: 'video/mp4',
          data: base64Video,
        },
      },
      {
        text: "Behave like a fashion adviser and tell the user how he or she looks in the video. The praise should be followed by useful suggestions for outfit and pose improvements."
      },
    ],
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
  });

  return result.text;
};

