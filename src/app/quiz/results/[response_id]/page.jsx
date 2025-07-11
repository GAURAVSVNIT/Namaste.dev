'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/lib/quiz';
import { doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';
import Confetti from 'react-confetti';
import { CheckCircle2, XCircle, Trophy } from 'lucide-react';
import '@/static/quiz/quizResponse.css';

// Add this inside ResultPage.jsx (before `export default function ResultPage`)
function CircularScore({ score, total }) {
  const radius = 60;
  const stroke = 10;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const percent = (score / total) * 100;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="circular-score">
      <svg height={radius * 2} width={radius * 2}>
        <circle
          stroke="#eee"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="var(--color-fashion-primary)"
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference + ' ' + circumference}
          strokeDashoffset={strokeDashoffset}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <div className="circular-score-text">
        <span>{score}</span>
        <small>of {total}</small>
      </div>
    </div>
  );
}


export default function ResultPage() {
  const { response_id } = useParams();
  const [result, setResult] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    }
  }, []);

  useEffect(() => {
    async function fetchResultAndQuiz() {
      try {
        const resSnap = await getDoc(doc(db, 'quiz_responses', response_id));
        if (!resSnap.exists()) {
          alert('Result not found');
          return;
        }

        const resData = resSnap.data();
        if (!resData.quiz_id || typeof resData.quiz_id !== 'string') {
          alert('Invalid result data.');
          return;
        }

        setResult(resData);
        const quizSnap = await getDoc(doc(db, 'quizzes', resData.quiz_id));
        if (!quizSnap.exists()) {
          alert('Quiz not found');
          return;
        }

        setQuiz(quizSnap.data());
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

  const scorePercent = (result.score / result.total) * 100;
  const wonPrize = result.score >= (quiz?.prize?.cutoff ?? Infinity);

  return (
    <div className="result-container">
      {wonPrize && <Confetti width={windowSize.width} height={windowSize.height} />}

      <div className="result-header">
        <h1>🎉 Quiz Completed!</h1>
        <CircularScore score={result.score} total={result.total} />
        <p className="time-info">⏱️ Time Taken: {result.timeTaken} sec</p>

        <div>
          {wonPrize && (
          <div className="coupon-banner">
            <Trophy size={20} className="mr-2" />&nbsp;
            Congrats! You won a coupon 🎁 <span className="coupon-code">WINNER2024</span>
          </div>
        )}
        </div>

        <Link
          href={`/quiz/play/${result.quiz_id}/leaderboard`}
          className="leaderboard-link"
        >
          🏆 View Leaderboard
        </Link>
      </div>

      <hr />

      <div className="response-list">
        <h2 className="responses-heading">Your Answers Breakdown</h2>

        {quiz?.data?.map((q, idx) => {
          const userAnswer = result?.answers?.[idx];
          const correctAnswer = q?.answer;
          const isCorrect = userAnswer === correctAnswer;
          const userOption = Array.isArray(q.options) ? q.options[userAnswer] : 'N/A';
          const correctOption = Array.isArray(q.options) ? q.options[correctAnswer] : 'N/A';

          return (
            <div key={idx} className={`response-card ${isCorrect ? 'correct' : 'incorrect'}`}>
              <h2 className="response-question">
                {idx + 1}. {q?.question || 'No question text'}
              </h2>

              {q?.questionImg && (
                <img src={q.questionImg} className="response-image" alt="Question" />
              )}

              <p className="response-answer">
                <span className="label">Your Answer:</span> {userOption || 'Not answered'}
                {isCorrect ? (
                  <CheckCircle2 className="icon-correct" />
                ) : (
                  <XCircle className="icon-wrong" />
                )}
              </p>

              {!isCorrect && (
                <p className="response-correct">
                  <span className="label">Correct:</span> {correctOption || 'Not available'}
                </p>
              )}

              {q?.explanation && (
                <p className="response-explanation">
                  <span className="label">Explanation:</span> {q.explanation}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
