import { useMemo, useState } from 'react';
import { createInnings, formatOvers, scoreBall } from '../cricket/scoring';

export default function Scoring({ match, onExit }) {
  const [innings, setInnings] = useState(() => createInnings(match.teams[0], match.teams[1], match.overs));
  const [pendingWicket, setPendingWicket] = useState(false);

  const batting = match.teams.find((team) => team.id === innings.battingTeamId);
  const bowling = match.teams.find((team) => team.id === innings.bowlingTeamId);
  const striker = batting.players.find((player) => player.id === innings.striker)?.name ?? 'Striker';
  const nonStriker = batting.players.find((player) => player.id === innings.nonStriker)?.name ?? 'Non-striker';
  const bowler = bowling.players.find((player) => player.id === innings.bowler)?.name ?? 'Bowler';
  const runRate = useMemo(() => innings.legalBalls ? (innings.runs / innings.legalBalls * 6).toFixed(2) : '0.00', [innings.runs, innings.legalBalls]);

  const addBall = (runs, extras = 0, extraType = null) => {
    if (innings.completed) return;
    const next = scoreBall(innings, { runs, extras, extraType, wicket: pendingWicket });
    setInnings(next);
    setPendingWicket(false);
  };

  const swapStrike = () => setInnings((current) => ({ ...current, striker: current.nonStriker, nonStriker: current.striker }));

  return (
    <main className="scoring-page">
      <header className="score-header">
        <button className="secondary" onClick={onExit}>← Back</button>
        <div><span className="eyebrow">Live scoring</span><h1>{match.name}</h1></div>
        <span className={innings.completed ? 'status complete' : 'status'}>{innings.completed ? 'Innings complete' : 'Live'}</span>
      </header>

      <section className="scoreboard">
        <div><span>{batting.name}</span><strong>{innings.runs}/{innings.wickets}</strong><small>{formatOvers(innings.legalBalls)} overs</small></div>
        <div className="score-meta"><span>Run rate</span><strong>{runRate}</strong><span>Target pending</span></div>
      </section>

      <section className="players-card">
        <div><span>🏏 Striker</span><strong>{striker}</strong></div><div><span>Non-striker</span><strong>{nonStriker}</strong></div><div><span>Bowler</span><strong>{bowler}</strong></div>
      </section>

      <section className="scoring-card">
        <h2>Record ball</h2>
        {pendingWicket && <div className="wicket-banner">Wicket selected — choose the runs on this delivery</div>}
        <div className="run-grid">{[0,1,2,3,4,6].map((run) => <button key={run} className="run-button" onClick={() => addBall(run)}>{run}</button>)}</div>
        <div className="extras-grid">
          <button onClick={() => addBall(0, 1, 'wide')}>Wide +1</button>
          <button onClick={() => addBall(0, 1, 'no-ball')}>No-ball +1</button>
          <button onClick={() => addBall(0, 1, 'bye')}>Bye +1</button>
          <button onClick={() => addBall(0, 1, 'leg-bye')}>Leg bye +1</button>
        </div>
        <div className="score-actions"><button className={pendingWicket ? 'danger selected' : 'danger'} onClick={() => setPendingWicket((value) => !value)}>Wicket</button><button className="secondary" onClick={swapStrike}>Swap strike</button></div>
      </section>

      <section className="ball-history"><h2>Ball-by-ball</h2>{innings.balls.length === 0 ? <p>No deliveries recorded yet.</p> : <ol>{innings.balls.slice().reverse().map((ball, index) => <li key={ball.id}><span>{innings.balls.length - index}</span><strong>{ball.wicket ? 'Wicket' : ball.total}</strong><small>{ball.extraType ?? (ball.legal ? 'Legal delivery' : 'Extra')}</small></li>)}</ol>}</section>
    </main>
  );
}
