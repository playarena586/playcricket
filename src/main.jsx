import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

function App() {
  return (
    <main className="app">
      <section className="hero">
        <span className="badge">🏏 PlayCricket</span>
        <h1>Cricket made simple.</h1>
        <p>Build matches, manage teams, and keep score from one clean dashboard.</p>
      </section>

      <section className="cards" aria-label="PlayCricket features">
        <article className="card">
          <h2>Create a match</h2>
          <p>Set teams, overs, venue, and match format.</p>
          <button type="button">New Match</button>
        </article>
        <article className="card">
          <h2>Live scoring</h2>
          <p>Record runs, wickets, overs, and player performance.</p>
          <button type="button">Start Scoring</button>
        </article>
        <article className="card">
          <h2>Match history</h2>
          <p>Keep completed matches and results organized.</p>
          <button type="button">View Matches</button>
        </article>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
