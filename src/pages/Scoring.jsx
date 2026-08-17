import { useMemo, useState } from 'react';
import { availableBatters, createInnings, economy, formatOvers, scoreBall, setBowler, setNextBatter, strikeRate } from '../cricket/scoring';

export default function Scoring({ match, onExit, onSave }) {
  const [inningsList, setInningsList] = useState(() => match.inningsList?.length ? match.inningsList : [createInnings(match.teams[0], match.teams[1], match.overs)]);
  const [inningsIndex, setInningsIndex] = useState(() => match.inningsIndex ?? 0);
  const [pendingWicket, setPendingWicket] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const innings = inningsList[inningsIndex];
  const batting = match.teams.find((team) => team.id === innings.battingTeamId);
  const bowling = match.teams.find((team) => team.id === innings.bowlingTeamId);
  const striker = batting.players.find((player) => player.id === innings.striker)?.name ?? 'Select new batter';
  const nonStriker = batting.players.find((player) => player.id === innings.nonStriker)?.name ?? 'Non-striker';
  const runRate = useMemo(() => innings.legalBalls ? (innings.runs / innings.legalBalls * 6).toFixed(2) : '0.00', [innings.runs, innings.legalBalls]);
  const required = innings.target === null ? null : Math.max(0, innings.target - innings.runs);
  const requiredRate = required !== null && innings.legalBalls < innings.maxOvers * 6 ? (required / ((innings.maxOvers * 6 - innings.legalBalls) / 6)).toFixed(2) : null;
  const save = (next) => {
    const nextList = inningsList.map((item, index) => index === inningsIndex ? next : item);
    setInningsList(nextList);
    onSave({ ...match, inningsList: nextList, inningsIndex, updatedAt: new Date().toISOString(), status: inningsIndex === 1 && next.completed ? 'completed' : 'in-progress' });
  };
  const addBall = (runs, extras = 0, extraType = null) => { if (innings.completed || innings.pendingBatter) return; save(scoreBall(innings, { runs, extras, extraType, wicket: pendingWicket })); setPendingWicket(false); };
  const startSecondInnings = () => { const next = createInnings(bowling, batting, match.overs, innings.runs + 1); const nextList = [...inningsList, next]; setInningsList(nextList); setInningsIndex(1); setShowStats(false); onSave({ ...match, inningsList: nextList, inningsIndex: 1, updatedAt: new Date().toISOString(), status: 'in-progress' }); };
  const selectBatter = (event) => save(setNextBatter(innings, event.target.value));
  const selectBowler = (event) => save(setBowler(innings, event.target.value));
  const matchComplete = inningsIndex === 1 && innings.completed;
  const result = matchComplete ? (innings.result === 'chased' ? `${batting.name} won by ${10 - innings.wickets} wickets` : innings.runs === inningsList[0].runs ? 'Match tied' : innings.runs > inningsList[0].runs ? `${batting.name} won by ${innings.runs - inningsList[0].runs} runs` : `${bowling.name} won by ${inningsList[0].runs - innings.runs} runs`) : null;
  const exit = () => onExit({ ...match, inningsList, inningsIndex, updatedAt: new Date().toISOString() });

  return (
    <main className="scoring-page">
      <header className="score-header"><button className="secondary" onClick={exit}>← Back</button><div><span className="eyebrow">Innings {inningsIndex + 1} · {innings.completed ? 'Complete' : 'Live'}</span><h1>{match.name}</h1></div><span className={innings.completed ? 'status complete' : 'status'}>{matchComplete ? 'Match complete' : innings.completed ? 'Innings complete' : 'Live'}</span></header>
      <section className="scoreboard"><div><span>{batting.name}</span><strong>{innings.runs}/{innings.wickets}</strong><small>{formatOvers(innings.legalBalls)} / {innings.maxOvers} overs</small></div><div className="score-meta"><span>Run rate</span><strong>{runRate}</strong>{required !== null && <><span>Required</span><strong>{required} runs{requiredRate ? ` @ ${requiredRate}` : ''}</strong></>}</div></section>
      {!innings.completed && <>
        <section className="players-card"><div><span>🏏 Striker</span>{innings.pendingBatter ? <select value="" onChange={selectBatter}><option value="">Choose new batter</option>{availableBatters(innings, batting).map((player) => <option key={player.id} value={player.id}>{player.name}</option>)}</select> : <strong>{striker}</strong>}</div><div><span>Non-striker</span><strong>{nonStriker}</strong></div><div><span>Bowler</span><select value={innings.bowler ?? ''} onChange={selectBowler}>{bowling.players.map((player) => <option key={player.id} value={player.id}>{player.name}</option>)}</select></div></section>
        <section className="scoring-card"><h2>Record ball</h2>{pendingWicket && <div className="wicket-banner">Wicket selected — choose the runs on this delivery</div>}<div className="run-grid">{[0,1,2,3,4,6].map((run) => <button key={run} className="run-button" onClick={() => addBall(run)}>{run}</button>)}</div><div className="extras-grid"><button onClick={() => addBall(0, 1, 'wide')}>Wide +1</button><button onClick={() => addBall(0, 1, 'no-ball')}>No-ball +1</button><button onClick={() => addBall(0, 1, 'bye')}>Bye +1</button><button onClick={() => addBall(0, 1, 'leg-bye')}>Leg bye +1</button></div><div className="score-actions"><button className={pendingWicket ? 'danger selected' : 'danger'} onClick={() => setPendingWicket((value) => !value)}>Wicket</button><button className="secondary" onClick={() => save({ ...innings, striker: innings.nonStriker, nonStriker: innings.striker })}>Swap strike</button><button className="secondary" onClick={() => setShowStats((value) => !value)}>Stats</button></div></section>
      </>}
      {innings.completed && inningsIndex === 0 && <section className="active-match"><span className="eyebrow">First innings complete</span><h2>{batting.name}: {innings.runs}/{innings.wickets}</h2><p>{bowling.name} needs {innings.runs + 1} runs to win.</p><button className="primary" onClick={startSecondInnings}>Start second innings</button></section>}
      {matchComplete && <section className="active-match"><span className="eyebrow">Final result</span><h2>{result}</h2><p>Final score: {inningsList[0].runs}/{inningsList[0].wickets} · {innings.runs}/{innings.wickets}</p></section>}
      {showStats && <section className="stats-grid"><div className="ball-history"><h2>Batting</h2>{batting.players.map((player) => { const stats = innings.battingStats[player.id]; return <div className="stat-row" key={player.id}><strong>{player.name}</strong><span>{stats.runs} ({stats.balls}) · 4s {stats.fours} · 6s {stats.sixes} · SR {strikeRate(stats)}{stats.out ? ' · OUT' : ''}</span></div>; })}</div><div className="ball-history"><h2>Bowling</h2>{bowling.players.map((player) => { const stats = innings.bowlingStats[player.id]; return <div className="stat-row" key={player.id}><strong>{player.name}</strong><span>{formatOvers(stats.balls)} · {stats.runs} runs · {stats.wickets} wkts · Econ {economy(stats)}</span></div>; })}</div></section>}
      <section className="ball-history"><h2>Ball-by-ball</h2>{innings.balls.length === 0 ? <p>No deliveries recorded yet.</p> : <ol>{innings.balls.slice().reverse().map((ball) => <li key={ball.id}><span>{ball.number}</span><strong>{ball.wicket ? 'Wicket' : ball.total}</strong><small>{ball.extraType ?? (ball.legal ? 'Legal delivery' : 'Extra')}</small></li>)}</ol>}</section>
    </main>
  );
}
