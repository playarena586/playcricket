import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import CreateMatch from './pages/CreateMatch';
import Scoring from './pages/Scoring';
import './styles.css';

function App() {
  const [screen, setScreen] = useState('home');
  const [match, setMatch] = useState(null);

  if (screen === 'create') return <CreateMatch onCreate={(createdMatch) => { setMatch(createdMatch); setScreen('home'); }} onCancel={() => setScreen('home')} />;
  if (screen === 'scoring' && match) return <Scoring match={match} onExit={() => setScreen('home')} />;

  return (
    <main className="app">
      <section className="hero"><span className="badge">🏏 PlayCricket</span><h1>Cricket made simple.</h1><p>Build matches, manage teams, and keep score from one clean dashboard.</p></section>
      {match && <section className="active-match"><span className="eyebrow">Scheduled match</span><h2>{match.name}</h2><p>{match.teams[0].name} vs {match.teams[1].name} · {match.overs} overs</p><button className="primary" type="button" onClick={() => setScreen('scoring')}>Open Scoring</button></section>}
      <section className="cards" aria-label="PlayCricket features">
        <article className="card"><h2>Create a match</h2><p>Set teams, players, overs, and match format.</p><button className="primary" type="button" onClick={() => setScreen('create')}>New Match</button></article>
        <article className="card"><h2>Live scoring</h2><p>Record runs, wickets, overs, and player performance.</p><button className="secondary" type="button" disabled={!match} onClick={() => setScreen('scoring')}>Start Scoring</button></article>
        <article className="card"><h2>Match history</h2><p>Keep completed matches and results organized.</p><button className="secondary" type="button">View Matches</button></article>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
