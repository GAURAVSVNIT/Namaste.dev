'use client';
import { useState } from 'react';
import { db, auth } from '@/lib/quiz';
import { ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import {
  collection,
  addDoc,
  setDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import '@/static/quiz/createQuiz.css';


export default function CreateQuizPage() {

  const [cutoff, setCutoff] = useState(3);

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

  const isQuestionValid = (q) => {
    if (!q.question.trim()) return false;
    if (q.options.some((opt) => !opt.trim())) return false;
    return true;
  };

  const handleAddQuestion = () => {
    const lastQ = questions[questions.length - 1];
    if (!isQuestionValid(lastQ)) {
      alert('Complete the current question before adding a new one.');
      return;
    }

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

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const reordered = [...questions];
    [reordered[index], reordered[index - 1]] = [reordered[index - 1], reordered[index]];
    setQuestions(reordered);
  };

  const handleMoveDown = (index) => {
    if (index === questions.length - 1) return;
    const reordered = [...questions];
    [reordered[index], reordered[index + 1]] = [reordered[index + 1], reordered[index]];
    setQuestions(reordered);
  };

  const handleDelete = (index) => {
    if (questions.length <= 1) {
      alert('At least one question is required.');
      return;
    }
    const updated = [...questions];
    updated.splice(index, 1);
    setQuestions(updated);
  };

  const handleSubmit = async () => {
    if (!quizInfo.title.trim() || !quizInfo.description.trim()) {
      alert('Quiz title and description are required.');
      return;
    }

    if (questions.length < 5) {
      alert('A quiz must contain at least 5 questions.');
      return;
    }
    
    try {
      setCutoff(Number(e.target.value)); 
    }
    catch (err) {}

    if (cutoff <= 0 || cutoff > questions.length) {
      alert(`Cutoff must be between 1 and ${questions.length}`);
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!isQuestionValid(q)) {
        alert(`Please complete all fields in Question ${i + 1} (except explanation/image).`);
        return;
      }
    }

    try {
      const quiz = {
        ...quizInfo,
        created_on: serverTimestamp(),
        created_by: auth.currentUser.uid,
        prize: { cutoff }, 
        data: questions,
      };

      const docRef = await addDoc(collection(db, 'quizzes'), quiz);

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
    <div className="create-quiz-container">
      <h1 className="create-quiz-heading">Create a New Quiz</h1>

      <div className="quiz-info">
        <input
          type="text"
          placeholder="Quiz Title"
          className="quiz-input"
          value={quizInfo.title}
          onChange={(e) => setQuizInfo({ ...quizInfo, title: e.target.value })}
        />
        <textarea
          placeholder="Quiz Description"
          className="quiz-input"
          value={quizInfo.description}
          onChange={(e) => setQuizInfo({ ...quizInfo, description: e.target.value })}
        />
        <input
          type="text"
          placeholder="Cover Image URL (optional)"
          className="quiz-input"
          value={quizInfo.coverImage}
          onChange={(e) => setQuizInfo({ ...quizInfo, coverImage: e.target.value })}
        />
        <div className='flex align-items-center'>
        <input
          type="number"
          min="1"
          max={questions.length}
          placeholder="Cutoff score to win coupon"
          className="quiz-input"
          onChange={(e) => setCutoff((e.target.value))}
          name='cutoff'
        />
        </div>
      </div>

      <hr className="divider" />

      {questions.map((q, idx) => (
        <div key={idx} className="question-card">
          <div className="flex justify-between items-center mb-2">
            <h2 className="question-title">Question {idx + 1}</h2>
            <div className="question-controls">
              <button onClick={() => handleMoveUp(idx)} className="btn-move" title="Move the Question Up">
                <ArrowUp className="icon" />
              </button>
              <button onClick={() => handleMoveDown(idx)} className="btn-move" title="Move the Question Down">
                <ArrowDown className="icon" />
              </button>
              <button onClick={() => handleDelete(idx)} className="btn-delete" title="Delete the Question">
                <Trash2 className="icon" />
              </button>
            </div>
          </div>

          <input
            type="text"
            placeholder="Question text"
            className="quiz-input"
            value={q.question}
            onChange={(e) => {
              const newQ = [...questions];
              newQ[idx].question = e.target.value;
              setQuestions(newQ);
            }}
          />
          <input
            type="text"
            placeholder="Image URL (optional)"
            className="quiz-input"
            value={q.questionImg}
            onChange={(e) => {
              const newQ = [...questions];
              newQ[idx].questionImg = e.target.value;
              setQuestions(newQ);
            }}
          />
          <select
            value={q.type}
            className="quiz-input"
            onChange={(e) => {
              const newQ = [...questions];
              newQ[idx].type = e.target.value;
              newQ[idx].options = e.target.value === 'truefalse' ? ['True', 'False'] : ['', '', '', ''];
              setQuestions(newQ);
            }}
          >
            <option value="mcq">Multiple Choice</option>
            <option value="truefalse">True / False</option>
          </select>

          {q.options.map((opt, optIdx) => (
            <div key={optIdx} className="option-row">
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
                className="quiz-input flex-1"
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
            placeholder="Explanation (optional)"
            className="quiz-input"
            value={q.explanation}
            onChange={(e) => {
              const newQ = [...questions];
              newQ[idx].explanation = e.target.value;
              setQuestions(newQ);
            }}
          />
        </div>
      ))}

      {questions.length < 15 && (
        <button className="btn-add" onClick={handleAddQuestion}>
          + Add Question
        </button>
      )}

      <button className="btn-submit" onClick={handleSubmit}>
        Submit Quiz
      </button>
    </div>
  );
}
