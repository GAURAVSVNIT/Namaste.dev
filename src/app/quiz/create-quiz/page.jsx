'use client';
import { useState } from 'react';
import { db, auth } from '@/lib/quiz';
import {
  collection,
  addDoc,
  setDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function CreateQuizPage() {
  const router = useRouter();
  const [quizInfo, setQuizInfo] = useState({
    title: '',
    description: '',
    coverImage: '',
  });

  const [questions, setQuestions] = useState([
    {
      question: '',
      questionImg: '',
      options: ['', '', '', ''],
      optionsImg: [],
      answer: 0,
      explanation: '',
      type: 'mcq',
    }
  ]);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: '',
        questionImg: '',
        options: ['', '', '', ''],
        optionsImg: [],
        answer: 0,
        explanation: '',
        type: 'mcq',
      }
    ]);
  };

  const handleSubmit = async () => {
    try {
      const quiz = {
        ...quizInfo,
        created_on: serverTimestamp(),
        created_by: auth.currentUser.uid,
        prize: {}, // empty for now, tobe done after marketplace feature
        data: questions
      };

      const docRef = await addDoc(collection(db, 'quizzes'), {
        ...quizInfo,
        created_on: serverTimestamp(),
        // created_by: auth.currentUser.displayName.toLowerCase().replace(/\s+/g, '_'),
        prize: {},
        data: questions,
        });

        // the generated quiz_id
        await setDoc(doc(db, 'quizzes', docRef.id), {
        quiz_id: docRef.id,
        }, { merge: true });

        router.push(`/quiz/play/${docRef.id}`);

    } catch (error) {
      console.error("Error creating quiz:", error);
      alert("Failed to create quiz");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Create a New Quiz</h1>

      <div className="space-y-2">
        <input
          type="text"
          placeholder="Title"
          className="border p-2 w-full"
          value={quizInfo.title}
          onChange={(e) => setQuizInfo({ ...quizInfo, title: e.target.value })}
        />
        <textarea
          placeholder="Description"
          className="border p-2 w-full"
          value={quizInfo.description}
          onChange={(e) => setQuizInfo({ ...quizInfo, description: e.target.value })}
        />
        <input
          type="text"
          placeholder="Cover Image URL (optional)"
          className="border p-2 w-full"
          value={quizInfo.coverImage}
          onChange={(e) => setQuizInfo({ ...quizInfo, coverImage: e.target.value })}
        />
      </div>

      <hr />

      {questions.map((q, idx) => (
        <div key={idx} className="border p-4 rounded space-y-2">
          <h2 className="font-semibold">Question {idx + 1}</h2>
          <input
            type="text"
            placeholder="Question text"
            className="border p-2 w-full"
            value={q.question}
            onChange={(e) => {
              const newQ = [...questions];
              newQ[idx].question = e.target.value;
              setQuestions(newQ);
            }}
          />
          <input
            type="text"
            placeholder="Question image URL (optional)"
            className="border p-2 w-full"
            value={q.questionImg}
            onChange={(e) => {
              const newQ = [...questions];
              newQ[idx].questionImg = e.target.value;
              setQuestions(newQ);
            }}
          />
          <select
            value={q.type}
            className="border p-2"
            onChange={(e) => {
              const newQ = [...questions];
              newQ[idx].type = e.target.value;
              if (e.target.value === 'truefalse') {
                newQ[idx].options = ['True', 'False'];
              } else {
                newQ[idx].options = ['', '', '', ''];
              }
              setQuestions(newQ);
            }}
          >
            <option value="mcq">Multiple Choice</option>
            <option value="truefalse">True/False</option>
          </select>

          {q.options.map((opt, optIdx) => (
            <div key={optIdx} className="flex items-center gap-2">
              <input
                type="radio"
                name={`correct-${idx}`}
                checked={q.answer === optIdx}
                onChange={() => {
                  const newQ = [...questions];
                  newQ[idx].answer = optIdx;
                  setQuestions(newQ);
                }}
              />
              
              <input
                type="text"
                placeholder={`Option ${optIdx + 1}`}
                className="border p-2 flex-1"
                value={opt}
                onChange={(e) => {
                  const newQ = [...questions];
                  newQ[idx].options[optIdx] = e.target.value;
                  setQuestions(newQ);
                }}
              />
            </div>
          ))}

          <input
            type="text"
            placeholder="Explanation"
            className="border p-2 w-full"
            value={q.explanation}
            onChange={(e) => {
              const newQ = [...questions];
              newQ[idx].explanation = e.target.value;
              setQuestions(newQ);
            }}
          />
        </div>
      ))}

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={handleAddQuestion}
      >
        + Add Question
      </button>

      <button
        className="bg-green-600 text-white px-6 py-3 rounded font-semibold"
        onClick={handleSubmit}
      >
        Submit Quiz
      </button>
    </div>
  );
}
