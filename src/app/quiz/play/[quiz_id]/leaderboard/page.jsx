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

        // Group by user_id and keep best performance
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

  if (loading) return <p className="p-6">Loading leaderboard...</p>;
  if (!entries.length) return <p className="p-6">No leaderboard entries yet.</p>;

  return (
    <div className="p-6"><br /><br /><br /><br />
      <h1 className="text-2xl font-bold mb-4">Leaderboard</h1>
      <div className="overflow-auto">
        <table className="min-w-full border border-gray-300 rounded overflow-hidden shadow">
          <thead className="bg-gray-100">
            <tr className="text-left">
              <th className="py-2 px-4 border-b">#</th>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Score (out of {entries[0].total})</th>
              <th className="py-2 px-4 border-b">Time Taken (s)</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, idx) => (
              <tr key={entry.user_id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{idx + 1}</td>
                <td className="py-2 px-4 border-b">{entry.name}</td>
                <td className="py-2 px-4 border-b text-green-700 font-semibold">{entry.score}</td>
                <td className="py-2 px-4 border-b">{entry.timeTaken}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
