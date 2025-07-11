'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { db } from '@/lib/quiz';
import {
  collection,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import '@/static/quiz/leaderboard.css';

export default function LeaderboardPage() {
  const { quiz_id } = useParams();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const q = query(
          collection(db, 'quiz_responses'),
          where('quiz_id', '==', quiz_id)
        );

        const snapshot = await getDocs(q);
        const raw = snapshot.docs.map(doc => doc.data());

        const bestByUser = {};
        raw.forEach((res) => {
          const existing = bestByUser[res.user_id];
          const isBetter =
            !existing ||
            res.score > existing.score ||
            (res.score === existing.score && res.timeTaken < existing.timeTaken);

          if (isBetter) bestByUser[res.user_id] = res;
        });

        const entriesWithName = await Promise.all(
          Object.values(bestByUser).map(async (entry) => {
            try {
              const userSnap = await getDocs(
                query(collection(db, 'users'), where('__name__', '==', entry.user_id))
              );
              let name = entry.user_id;
              if (!userSnap.empty) {
                const user = userSnap.docs[0].data();
                if (user.first_name && user.last_name) {
                  name = `${user.first_name} ${user.last_name}`;
                }
              }
              return { ...entry, name };
            } catch {
              return { ...entry, name: entry.user_id };
            }
          })
        );

        const sorted = entriesWithName.sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          return a.timeTaken - b.timeTaken;
        });

        setEntries(sorted.slice(0, 10));
      } catch (err) {
        console.error('Error loading leaderboard:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, [quiz_id]);

  if (loading) return <p className="leaderboard-container">Loading leaderboard...</p>;
  if (!entries.length) return <p className="leaderboard-container">No leaderboard entries yet.</p>;

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <h1>🏆 Leaderboard</h1>
        <p className="subtle-text">Top performers in this quiz</p>
      </div>

      <div className="leaderboard-table-wrapper">
        <table className="leaderboard-table">
          <thead>
            <tr className='header-row'>
              <th>#</th>
              <th>Name</th>
              <th>Score</th>
              <th>Time (s)</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, idx) => (
              <tr key={entry.user_id}>
                <td>
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                </td>
                <td>{entry.name}</td>
                <td className="score-cell">{entry.score} / {entry.total}</td>
                <td>{entry.timeTaken}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
