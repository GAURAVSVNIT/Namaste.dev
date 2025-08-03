'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db, auth } from '@/lib/quiz';
import '@/static/quiz/playQuiz.css'
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [user, setUser] = useState(null);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        alert("Please Login first to play a quiz!")
        router.push('/auth/login');
      }
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
        const data = snap.data();
        setQuiz(data);
        setAnswers(new Array(data.data.length).fill(null));
        setStartTime(Date.now());
      } else {
        alert('Quiz not found');
        router.push('/quiz');
      }
    }

    fetchQuiz();
  }, [quiz_id]);

  const handleOptionSelect = (optIndex) => {
    const updated = [...answers];
    updated[currentIndex] = optIndex;
    setAnswers(updated);
  };

  const goToNext = () => {
    if (answers[currentIndex] === null) {
      alert('Please select an option to proceed');
      return;
    }

    setFade(false);
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setFade(true);
    }, 200); 
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
    await setDoc(doc(db, 'quiz_responses', docRef.id), { response_id: docRef.id }, { merge: true });

    router.push(`/quiz/results/${docRef.id}`);
  };

  if (!quiz || !user) return <p className="p-6">Loading quiz...</p>;

  const question = quiz.data[currentIndex];
  const selected = answers[currentIndex];

  return (
  <div className="quiz-bg">
    <div className="quiz-header">
      <h1>{quiz.title}</h1>
      <p className="text-gray-600">{quiz.description}</p>
    </div>

    <div
      key={currentIndex}
      className={`quiz-card ${fade ? 'fade-enter-active' : 'fade-enter'}`}
    >
      <h2 className='question-number-text'>
        Question {currentIndex + 1} of {quiz.data.length}
      </h2>

      <div className="quiz-topbar">
      <div className="progress-container">
        <div
          className="progress-bar"
          style={{ width: `${((currentIndex+1)/quiz.data.length)*100}%` }}
        />
        <div
          className="progress-head"
          style={{ left: `${((currentIndex+1)/quiz.data.length)*100}%` }}
        />
      </div>
    </div>

      <p className="question-text">{question.question}</p>

      {question.questionImg && (
        <img src={question.questionImg} alt="Question" className="quiz-image" />
      )}

      {question.options.map((opt, optIdx) => (
        <label key={optIdx} className={`quiz-option ${selected===optIdx? 'selected':''}`}>
          <input
            type="radio"
            name={`q-${currentIndex}`}
            checked={selected === optIdx}
            onChange={() => handleOptionSelect(optIdx)}
          />
          <span>{opt}</span>
          {question.optionsImg && question.optionsImg[optIdx] && (
            <img
              src={question.optionsImg[optIdx]}
              alt={`Option ${optIdx + 1}`}
              className="w-16 h-10 rounded object-cover"
            />
          )}
        </label>
      ))}

      <div className="flex justify-end mt-4">
        {currentIndex === quiz.data.length - 1 ? (
          <button className="quiz-submit-button" onClick={handleSubmit}>
            Submit Quiz
          </button>
        ) : (
          <button className="quiz-button" onClick={goToNext}>
            Next
          </button>
        )}
      </div>
    </div>
  </div>
);

}
