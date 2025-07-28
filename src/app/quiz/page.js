'use client';
import { useEffect, useState } from 'react';
import { db } from '@/lib/quiz'; 
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import Link from 'next/link';
import Image from 'next/image';
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
    <div className="quiz-landing-container">
      <h1 className="quiz-heading">All Quizzes</h1>
  {/* <div className="quiz-card-grid"> */}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {quizzes.map((quiz) => (
         <Link
            href={`/quiz/play/${quiz.quiz_id}`}
            key={quiz.id}
            className="quiz-card-link"
          >
            <div className="quiz-card-image-container">
              <img
                src={getCoverImage(quiz)}
                alt={quiz.title}
                className="quiz-card-image"
              />
            </div>

            <div className="quiz-card-content">
              <h2 className="quiz-card-title">{quiz.title}</h2>
              <p className="quiz-card-description">
                {quiz.description?.slice(0, 100)}...
              </p>
              {quiz.created_by && (
                <p className="quiz-card-creator">By: {quiz.created_by}</p>
              )}
            </div>
          </Link>

        ))}
      </div>
    </div>
  );
}
