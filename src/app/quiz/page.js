'use client';
import { useEffect, useState } from 'react';
import { db } from '@/lib/quiz'; 
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import Link from 'next/link';
import '@/static/quiz/quiz.css';

export default function QuizPage() {
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    async function fetchQuizzes() {
      const q = query(collection(db, 'quizzes'), orderBy('created_on', 'desc'));
      const snapshot = await getDocs(q);
      setQuizzes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }

    fetchQuizzes();
  }, []);

  const getCoverImage = (quiz) =>
    quiz.coverImage?.trim()
      ? quiz.coverImage
      : `/quiz/quiz_placeholder.png`;

  return (
    <div className="mainQuizSection p-6 mt-5">
      <h1 className="text-2xl font-bold mb-6">All Quizzes</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {quizzes.map((quiz) => (
          <Link
            href={`/quiz/play/${quiz.quiz_id}`}
            key={quiz.id}
            className="bg-white rounded-xl overflow-hidden shadow hover:shadow-lg transition duration-300"
          >
            <div className="h-56 overflow-hidden">
              <img
                src={getCoverImage(quiz)}
                alt={quiz.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-4 space-y-2">
              <h2 className="text-lg font-bold text-gray-800">{quiz.title}</h2>
              <p className="text-gray-600 text-sm">{quiz.description?.slice(0, 100)}...</p>
              {quiz.created_by && (
                <p className="text-xs text-gray-400">By: {quiz.created_by}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
