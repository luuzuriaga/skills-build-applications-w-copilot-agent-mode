import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Activity = { type: string; minutes: number; points: number };

export default function Activities() {
  const [state, setState] = useState<{ activities?: Activity[]; error?: string }>({});
  useEffect(() => { getJson<{ activities: Activity[] }>('/api/activities').then((data) => setState(data)).catch(() => setState({ error: 'Unable to load activities.' })); }, []);
  return <section><h2>Activities</h2>{state.error ? <p role="alert">{state.error}</p> : !state.activities ? <p role="status">Loading activities...</p> : state.activities.length ? <ul>{state.activities.map((activity, index) => <li key={`${activity.type}-${index}`}>{activity.type}: {activity.minutes} minutes ({activity.points} points)</li>)}</ul> : <p>No activities yet.</p>}</section>;
}
