'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db, auth } from '@/lib/quiz';
import {
  doc,
  getDoc,
  addDoc,
  setDoc,
  collection,
  serverTimestamp
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function PlayQuizPage() {
  const { quiz_id } = useParams();
  const router = useRouter();

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) router.push('/'); // Redirect if not logged in
      else setUser(u);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!quiz_id) return;
    async function fetchQuiz() {
      const ref = doc(db, 'quizzes', quiz_id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setQuiz(snap.data());
        setAnswers(new Array(snap.data().data.length).fill(null));
        setStartTime(Date.now());
      } else {
        alert('Quiz not found');
        router.push('/quiz');
      }
    }

    fetchQuiz();
  }, [quiz_id]);

  const handleOptionSelect = (qIndex, optIndex) => {
    const newAnswers = [...answers];
    newAnswers[qIndex] = optIndex;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (answers.includes(null)) {
      alert('Please answer all questions');
      return;
    }

    const correctAnswers = quiz.data.map((q) => q.answer);
    let score = 0;

    answers.forEach((ans, i) => {
      if (ans === correctAnswers[i]) score++;
    });

    const timeTaken = Math.floor((Date.now() - startTime) / 1000);

    const response = {
      quiz_id,
      user_id: user.uid,
      played_on: serverTimestamp(),
      score,
      total: quiz.data.length,
      answers,
      timeTaken,
    };

    const docRef = await addDoc(collection(db, 'quiz_responses'), response);

    // generate response_id
    await setDoc(doc(db, 'quiz_responses', docRef.id), {
            response_id: docRef.id,
            }, { merge: true });

    router.push(`/quiz/results/${docRef.id}`);
  };

  if (!quiz || !user) return <p className="p-6">Loading quiz...</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">{quiz.title}</h1>
      <p className="text-gray-600">{quiz.description}</p>

      {quiz.data.map((q, idx) => (
        <div key={idx} className="border p-4 rounded space-y-2">
          <h2 className="font-semibold">
            {idx + 1}. {q.question}
          </h2>
          {q.questionImg && (
            <img src={q.questionImg} alt="Q" className="w-64 mb-2" />
          )}
          {q.options.map((opt, optIdx) => (
            <div key={optIdx} className="flex items-center gap-2">
              <input
                type="radio"
                name={`q-${idx}`}
                checked={answers[idx] === optIdx}
                onChange={() => handleOptionSelect(idx, optIdx)}
              />
              <span>{opt}</span>
              {q.optionsImg && q.optionsImg[optIdx] && (
                <img src={q.optionsImg[optIdx]} className="w-20 h-12" />
              )}
            </div>
          ))}
        </div>
      ))}

      <button
        className="bg-green-600 text-white px-6 py-3 rounded font-semibold"
        onClick={handleSubmit}
      >
        Submit Quiz
      </button>
    </div>
  );
}
