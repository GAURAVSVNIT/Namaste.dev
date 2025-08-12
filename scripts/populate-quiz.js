require('dotenv').config({ path: '.env.local', debug: true });
const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  doc, 
  setDoc, 
  serverTimestamp,
  collection,
  getDocs,
  query,
  where
} = require('firebase/firestore');

// Firebase configuration 
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- Common Metadata ---
// This is now just the creator's ID. The timestamp will be generated on-the-fly.
const createdBy = "aayush_prasad";

// --- Helper to upload a quiz ---
// FIX: This function now adds the metadata itself, ensuring a fresh timestamp for each upload.
async function uploadQuiz(quizData) {
  // Create a new object for uploading. This prevents modifying the original quiz object.
  // It copies the original quiz data and adds the metadata.
  const dataToUpload = {
    ...quizData, // Copy all key-value pairs from the quizData object
    created_by: createdBy, // Add the creator's ID
    created_on: serverTimestamp() // Add a FRESH server timestamp. This is the critical fix.
  };

  const quizRef = doc(db, "quizzes", dataToUpload.quiz_id);
  
  console.log(`Preparing to upload quiz: ${dataToUpload.title}`);
  // Log the final object being sent to Firestore. Note that 'created_on' will be null here, which is expected.
  // The null is a placeholder for the actual timestamp generated on Firestore's servers.
  console.log("Data packet:", JSON.stringify(dataToUpload, null, 2));

  await setDoc(quizRef, dataToUpload);
  console.log(`Successfully uploaded quiz: ${dataToUpload.title}`);
}


// --- Quiz 1: Indian Fashion (General) ---
// FIX: Using the full, correct object for quiz1.
const quiz1 = {
  quiz_id: "INDIAGEN123",
  title: "General Fashion Quiz",
  description: "Test your fashion sense rooted in Indian trends!",
  coverImage: null,
  cutoff: 1,
  prize: "",
  data: [
    {
      type: "mcq",
      question: "Which Indian state is famous for the Bandhani print?",
      options: ["Punjab", "Gujarat", "Kerala", "Bihar"],
      answer: 1,
      explanation: "Bandhani is a traditional tie-dye textile from Gujarat.",
      questionImg: "",
      optionsImg: []
    },
    {
      type: "truefalse",
      question: "Sherwani is a traditional outfit worn by women.",
      options: ["True", "False"],
      answer: 1,
      explanation: "Sherwani is typically worn by men.",
      questionImg: "",
      optionsImg: []
    },
    {
      type: "mcq",
      question: "What is a ‘Kurti’?",
      options: ["A traditional headwear", "A type of footwear", "A women's tunic", "A silk scarf"],
      answer: 2,
      explanation: "A Kurti is a tunic worn by women in India.",
      questionImg: "",
      optionsImg: []
    },
    {
      type: "mcq",
      question: "Which fabric is Varanasi most known for?",
      options: ["Cotton", "Chiffon", "Banarasi Silk", "Denim"],
      answer: 2,
      explanation: "Banarasi silk is globally known and originates from Varanasi.",
      questionImg: "",
      optionsImg: []
    },
    {
      type: "truefalse",
      question: "Mojaris are traditional Indian footwear.",
      options: ["True", "False"],
      answer: 0,
      explanation: "Yes, Mojaris are handcrafted shoes.",
      questionImg: "",
      optionsImg: []
    }
  ]
};

// --- Quiz 2: Traditional Indian Fashion (Both Gender) ---
// FIX: Removed created_by and created_on, as they are now handled by the uploadQuiz function.
const quiz2 = {
  quiz_id: "INDIATRAD456",
  title: "Traditional Indian Fashion",
  description: "Explore India's rich cultural fashion across all genders.",
  coverImage: "",
  cutoff: 1,
  prize: "",
  data: [
    {
      type: "mcq",
      question: "Which headwear is associated with Rajasthani men?",
      options: ["Turban", "Cap", "Helmet", "Topi"],
      answer: 0,
      explanation: "Rajasthani turbans are known for their vibrant colors.",
      questionImg: "",
      optionsImg: []
    },
    {
      type: "mcq",
      question: "Which garment is traditionally worn with a lehenga?",
      options: ["Choli", "Kurta", "Sari", "Dupatta"],
      answer: 0,
      explanation: "A lehenga is paired with a choli (blouse).",
      questionImg: "",
      optionsImg: []
    },
    {
      type: "truefalse",
      question: "Mundu is traditional attire from Tamil Nadu.",
      options: ["True", "False"],
      answer: 1,
      explanation: "Mundu is from Kerala; Tamil Nadu wears veshti.",
      questionImg: "",
      optionsImg: []
    },
    {
      type: "mcq",
      question: "Which Indian state is known for Phulkari embroidery?",
      options: ["Rajasthan", "Punjab", "Assam", "Odisha"],
      answer: 1,
      explanation: "Phulkari is traditional embroidery from Punjab.",
      questionImg: "",
      optionsImg: []
    },
    {
      type: "mcq",
      question: "Which fabric is most used in South Indian bridal sarees?",
      options: ["Cotton", "Kanjeevaram Silk", "Net", "Chanderi"],
      answer: 1,
      explanation: "Kanjeevaram silk is famous for bridal sarees.",
      questionImg: "",
      optionsImg: []
    },
    {
      type: "truefalse",
      question: "Lungi and dhoti are the same garment.",
      options: ["True", "False"],
      answer: 1,
      explanation: "While similar, they are worn differently and differ in formality.",
      questionImg: "",
      optionsImg: []
    },
    {
      type: "mcq",
      question: "Peshwai style saree draping is associated with?",
      options: ["Kolkata", "Goa", "Maharashtra", "Delhi"],
      answer: 2,
      explanation: "Peshwai draping comes from Maharashtra’s Maratha tradition.",
      questionImg: "",
      optionsImg: []
    },
    {
      type: "mcq",
      question: "Which attire is common in Manipuri classical dance?",
      options: ["Ghagra", "Innaphi & Phanek", "Salwar Kameez", "Dhoti"],
      answer: 1,
      explanation: "Innaphi & Phanek are worn in Manipuri dance.",
      questionImg: "",
      optionsImg: []
    },
    {
      type: "mcq",
      question: "Which is NOT a traditional Indian jewelry piece?",
      options: ["Maang Tikka", "Nath", "Kara", "Hoop Earrings"],
      answer: 3,
      explanation: "Hoop earrings are more Western than traditional Indian.",
      questionImg: "",
      optionsImg: []
    },
    {
      type: "truefalse",
      question: "Chikankari is a heavy gold embroidery from Gujarat.",
      options: ["True", "False"],
      answer: 1,
      explanation: "Chikankari is delicate white thread embroidery from Lucknow.",
      questionImg: "",
      optionsImg: []
    }
  ]
};

// --- Upload both quizzes ---
async function main() {
  console.log("Starting upload process...");
  try {
    await uploadQuiz(quiz1);
    await uploadQuiz(quiz2);
    console.log("\nAll quizzes have been uploaded successfully!");
  } catch (error) {
    console.error("An error occurred during the upload process:", error);
  }
}

main();