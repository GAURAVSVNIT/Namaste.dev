'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/lib/quiz';
import { doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';

export default function ResultPage() {
  const { response_id } = useParams();
  const [result, setResult] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResultAndQuiz() {
      try {
        // 1. Fetch quiz response
        console.log(response_id)
        const resSnap = await getDoc(doc(db, 'quiz_responses', response_id));
        console.log(99)
        if (!resSnap.exists()) {
          alert('Result not found');
          return;
        }

        const resData = resSnap.data();
        console.log('responseData:', resData);

        if (!resData.quiz_id || typeof resData.quiz_id !== 'string') {
        console.error('Invalid quiz_id in result:', resData.quiz_id);
        alert('Invalid result data.');
        return;
        }

        // const resData = resSnap.data();
        // console.log('responseData:', resData);
        setResult(resData);

        // 2. Fetch quiz data
        const quizSnap = await getDoc(doc(db, 'quizzes', resData.quiz_id));
        if (!quizSnap.exists()) {
          alert('Quiz not found');
          return;
        }
        const quizData = quizSnap.data();
        console.log('quizData:', quizData);
        setQuiz(quizData);
      } catch (err) {
        console.error('Error fetching result:', err);
        alert('Something went wrong loading your result.');
      } finally {
        setLoading(false);
      }
    }

    fetchResultAndQuiz();
  }, [response_id]);

  if (loading) return <p className="p-6">Loading result...</p>;

  if (!result || !quiz) return <p className="p-6 text-red-500">Unable to load result data.</p>;

  return (
    <div className="p-6 space-y-6"><br /><br /><br /><br />
    <Link href={`/quiz/play/${result.quiz_id}/leaderboard`}>See Leaderboard</Link>
      <h1 className="text-2xl font-bold">Your Quiz Result</h1>
      <div className="bg-gray-100 p-4 rounded space-y-1">
        <p><strong>Score:</strong> {result.score} / {result.total}</p>
        <p><strong>Time Taken:</strong> {result.timeTaken} sec</p>
      </div>
      <hr />
      
      {result.score >= quiz.prize.cutoff && (
        <p>
          Congratulations you won a Discount coupon
        </p>
      )}

      <hr />

      {quiz?.data?.map((q, idx) => {
        const userAnswer = result?.answers?.[idx];
        const correctAnswer = q?.answer;
        const isCorrect = userAnswer === correctAnswer;
        const userOption = Array.isArray(q.options) ? q.options[userAnswer] : 'N/A';
        const correctOption = Array.isArray(q.options) ? q.options[correctAnswer] : 'N/A';

        return (
          <div key={idx} className="border p-4 rounded bg-white shadow space-y-2">
            <h2 className="font-semibold text-lg">{idx + 1}. {q?.question || 'No question text'}</h2>

            {q?.questionImg && (
              <img src={q.questionImg} className="w-64 mb-2" alt="Question" />
            )}

            <p>
              <span className="font-medium">Your Answer:</span>{' '}
              {typeof userAnswer === 'number' && userOption !== undefined ? userOption : 'Not answered'}{' '}
              {typeof userAnswer === 'number' && isCorrect
                ? <span className="text-green-600">✔</span>
                : <span className="text-red-600">✘</span>}
            </p>

            {!isCorrect && (
              <p>
                <span className="font-medium">Correct Answer:</span>{' '}
                {correctOption !== undefined ? correctOption : 'Not available'}
              </p>
            )}

            {q?.explanation && (
              <p className="text-gray-700">
                <span className="font-medium">Explanation:</span>{' '}
                {q.explanation}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
