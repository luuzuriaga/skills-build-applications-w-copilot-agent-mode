import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Entry = { teamName: string; totalPoints: number; rank: number };

export default function Leaderboard() {
  const [state, setState] = useState<{ leaderboard?: Entry[]; error?: string }>({});
  useEffect(() => { getJson<{ leaderboard: Entry[] }>('/api/leaderboard').then((data) => setState(data)).catch(() => setState({ error: 'Unable to load leaderboard.' })); }, []);
  return <section><h2>Leaderboard</h2>{state.error ? <p role="alert">{state.error}</p> : !state.leaderboard ? <p role="status">Loading leaderboard...</p> : state.leaderboard.length ? <ol>{state.leaderboard.map((entry) => <li key={entry.teamName}>{entry.teamName}: {entry.totalPoints} points</li>)}</ol> : <p>No leaderboard scores yet.</p>}</section>;
}
