import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Workout = { title: string; reason?: string };

export default function Workouts() {
  const [state, setState] = useState<{ suggestions?: Workout[]; error?: string }>({});
  useEffect(() => { getJson<{ suggestions: Workout[] }>(`/api/workouts/suggestions/${encodeURIComponent('mona@example.com')}`).then((data) => setState(data)).catch(() => setState({ error: 'Unable to load workout suggestions.' })); }, []);
  return <section><h2>Workout suggestions</h2>{state.error ? <p role="alert">{state.error}</p> : !state.suggestions ? <p role="status">Loading workout suggestions...</p> : state.suggestions.length ? <ul>{state.suggestions.map((workout) => <li key={workout.title}><strong>{workout.title}</strong>{workout.reason ? `: ${workout.reason}` : ''}</li>)}</ul> : <p>No workout suggestions yet.</p>}</section>;
}
