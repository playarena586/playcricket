import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider, useAuth } from './auth/AuthProvider';
import Auth from './pages/Auth';
import CreateMatch from './pages/CreateMatch';
import MatchHistory from './pages/MatchHistory';
import Scoring from './pages/Scoring';
import { deleteMatch, loadMatches, upsertMatch } from './cricket/storage';
import './styles.css';

function App() {
  const [screen, setScreen] = useState('home');
  const [match, setMatch] = useState(null);
  const [matches, setMatches] = useState(() => loadMatches());
  const { user, configured, signOut } = useAuth();

  const saveMatch = (nextMatch) => {
    const saved = { ...nextMatch, updatedAt: nextMatch.updatedAt ?? new Date().toISOString() };
    setMatch(saved);
    setMatches(upsertMatch(saved));
  };

  const openMatch = (savedMatch) => { setMatch(savedMatch); setScreen('scoring'); };
  const removeMatch = (id) => { if (!window.confirm('Delete this saved match?')) return; setMatches(deleteMatch(id)); if (match?.id === id) setMatch(null); };

  if (screen === 'create') return <CreateMatch onCreate={(createdMatch) => { saveMatch(createdMatch); setScreen('home'); }} onCancel={() => setScreen('home')} />;
  if (screen === 'history') return <MatchHistory matches={matches} onOpen={openMatch} onDelete={removeMatch} onBack={() => setScreen('home')} />;
  if (screen === 'scoring' && match) return <Scoring match={match} onSave={saveMatch} onExit={(saved) => { saveMatch(saved); setScreen('home'); }} />;
  if (screen === 'auth') return <Auth onBack={() => setScreen('home')} />;

  return (
    <main className="app">
      <section className="hero"><span className="badge">🏏 PlayCricket</span><h1>Cricket made simple.</h1><p>Build matches, manage teams, and keep score from one clean dashboard.</p></section>
      <div className="account-bar">
        {user ? <><span>Signed in as {user.email}</span><button className="secondary" onClick={() => signOut()}>Sign out</button></> : <button className="secondary" onClick={() => setScreen('auth')}>{configured ? 'Sign in' : 'Set up account'}</button>}
      </div>
      {match && <section className="active-match"><span className="eyebrow">Saved match</span><h2>{match.name}</h2><p>{match.teams[0].name} vs {match.teams[1].name} · {match.overs} overs</p><button className="primary" type="button" onClick={() => setScreen('scoring')}>Open Scoring</button></section>}
      <section className="cards" aria-label="PlayCricket features">
        <article className="card"><h2>Create a match</h2><p>Set teams, players, overs, and match format.</p><button className="primary" type="button" onClick={() => setScreen('create')}>New Match</button></article>
        <article className="card"><h2>Live scoring</h2><p>Record runs, wickets, overs, and player performance.</p><button className="secondary" type="button" disabled={!match} onClick={() => setScreen('scoring')}>Start Scoring</button></article>
        <article className="card"><h2>Match history</h2><p>{matches.length} saved {matches.length === 1 ? 'match' : 'matches'} on this browser.</p><button className="secondary" type="button" onClick={() => setScreen('history')}>View Matches</button></article>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<AuthProvider><App /></AuthProvider>);
