import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import { GoogleGenAI } from "@google/genai";
import axios from "axios";
import 'dotenv/config';

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  temperature: 0.7,
  apiKey:  process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
    },
  ],
});

const genAI = new GoogleGenAI({apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY});


const SYSTEM_PROMPT_WITH_MEDIA = `You are a professional fashion advisor with a deep understanding of clothing styles, colors, fits, body types, and fashion trends. The user will upload a video showcasing an outfit or look.

Analyze the video thoroughly, focusing on:

Appreciating strong elements of the outfit, such as fabric choice, color coordination, layering, accessories, or how well it suits the user's body type or movement.

Offering gentle, constructive suggestions for improvement — such as better color contrasts, different fits, or more suitable accessories.

Considering the background and pose in the video, recommend the kind of clothing or colors that would photograph or visually balance better in that setting.

Always end with a friendly fashion tip that's relevant to what the user wore or can use going forward (e.g., “Try using vertical stripes to elongate your look”).

Keep the tone warm, supportive, stylish, and insightful — like a mentor helping someone build confidence and refine their style.`


/**
 * Normal fashion chat
 * TODO: add an existing initial msg in chatbox
 */
export const chatWithFashionBot = async (messages, username=false) => {

  let userInfo = '';
  if (username) {
    userInfo = ` User's name is ${username}. Give suggestions according to the gender.`
  }

  const aiMsg = await llm.invoke([
    ["system", "Strictly reply as a helpful fashion expert that helps user professionally. Do not entertain any talks unrelated to fashion without being rude. Be professional." + userInfo],
    ...messages.map((msg) => ["human", msg]),
  ]);
  return aiMsg.content;
};

/**
 * Analyze a look (image URL)
 * From user's Upload a Look Section
 */
export const analyzeLookImage = async (imageUrl, username=false) => {
  const response = await fetch(imageUrl);
  const imageArrayBuffer = await response.arrayBuffer();
  const base64ImageData = Buffer.from(imageArrayBuffer).toString('base64');

  let userInfo = '';
  if (username) {
    userInfo = ` User's name is ${username}. Give suggestions according to the gender.`
  }

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
        text: SYSTEM_PROMPT_WITH_MEDIA + userInfo
      },
    ],
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
  });

  return result.text;
};

/*
 Analyze a fashion video (video URL)
 From user's fashionTV video
*/
export const analyzeFashionVideo = async (videoUrl, username=false) => {
  const response = await axios.get(videoUrl, { responseType: 'arraybuffer' });
  const base64Video = Buffer.from(response.data).toString('base64');

  let userInfo = '';
  if (username) {
    userInfo = ` User's name is ${username}. Give suggestions according to the gender.`
  }

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
        text: SYSTEM_PROMPT_WITH_MEDIA + userInfo
      },
    ],
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
  });

  return result.text;
};

