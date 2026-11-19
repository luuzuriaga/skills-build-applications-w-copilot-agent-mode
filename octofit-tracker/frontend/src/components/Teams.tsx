import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Team = { name: string; mascot?: string; members: string[] };

export default function Teams() {
  const [state, setState] = useState<{ teams?: Team[]; error?: string }>({});
  useEffect(() => { getJson<{ teams: Team[] }>('/api/teams').then((data) => setState(data)).catch(() => setState({ error: 'Unable to load teams.' })); }, []);
  return <section><h2>Teams</h2>{state.error ? <p role="alert">{state.error}</p> : !state.teams ? <p role="status">Loading teams...</p> : state.teams.length ? <ul>{state.teams.map((team) => <li key={team.name}>{team.name}{team.mascot ? ` (${team.mascot})` : ''}: {team.members.length} members</li>)}</ul> : <p>No teams yet.</p>}</section>;
}
