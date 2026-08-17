import { useMemo, useState } from 'react';
import { createPlayer, createTeam, MATCH_FORMATS } from '../cricket/types';

const emptyTeam = () => ({ name: '', players: [''] });

export default function CreateMatch({ onCreate, onCancel }) {
  const [matchName, setMatchName] = useState('');
  const [format, setFormat] = useState('t20');
  const [customOvers, setCustomOvers] = useState(10);
  const [teamA, setTeamA] = useState(emptyTeam);
  const [teamB, setTeamB] = useState(emptyTeam);

  const overs = useMemo(() => format === 'custom' ? Number(customOvers) : MATCH_FORMATS.find((item) => item.value === format).overs, [format, customOvers]);

  const updateTeam = (setter, team, field, value) => setter({ ...team, [field]: value });
  const updatePlayer = (setter, team, index, value) => setter({ ...team, players: team.players.map((player, i) => i === index ? value : player) });
  const addPlayer = (setter, team) => setter({ ...team, players: [...team.players, ''] });
  const removePlayer = (setter, team, index) => setter({ ...team, players: team.players.filter((_, i) => i !== index) });

  const submit = (event) => {
    event.preventDefault();
    const clean = (team) => createTeam(team.name).players = team.players.filter(Boolean).map(createPlayer);
    if (!matchName.trim() || !teamA.name.trim() || !teamB.name.trim() || overs < 1) return;
    const a = createTeam(teamA.name); a.players = clean(teamA);
    const b = createTeam(teamB.name); b.players = clean(teamB);
    onCreate({ id: crypto.randomUUID(), name: matchName.trim(), format, overs, teams: [a, b], status: 'scheduled' });
  };

  const TeamForm = ({ title, team, setter }) => (
    <section className="team-form">
      <h2>{title}</h2>
      <label>Team name<input value={team.name} onChange={(e) => updateTeam(setter, team, 'name', e.target.value)} placeholder="e.g. Play Arena XI" required /></label>
      <div className="players-heading"><strong>Players</strong><button type="button" className="link-button" onClick={() => addPlayer(setter, team)}>+ Add player</button></div>
      {team.players.map((player, index) => (
        <div className="player-row" key={index}>
          <input value={player} onChange={(e) => updatePlayer(setter, team, index, e.target.value)} placeholder={`Player ${index + 1}`} />
          {team.players.length > 1 && <button type="button" className="icon-button" onClick={() => removePlayer(setter, team, index)} aria-label={`Remove player ${index + 1}`}>×</button>}
        </div>
      ))}
    </section>
  );

  return (
    <form className="create-match" onSubmit={submit}>
      <div className="page-header"><div><span className="eyebrow">Match setup</span><h1>Create a match</h1><p>Set the match details and add both playing squads.</p></div><button type="button" className="secondary" onClick={onCancel}>Cancel</button></div>
      <section className="form-card match-details">
        <label>Match name<input value={matchName} onChange={(e) => setMatchName(e.target.value)} placeholder="Sunday Cricket Match" required /></label>
        <label>Format<select value={format} onChange={(e) => setFormat(e.target.value)}>{MATCH_FORMATS.map((item) => <option key={item.value} value={item.value}>{item.label} — {item.overs} overs</option>)}</select></label>
        {format === 'custom' && <label>Overs<input type="number" min="1" max="200" value={customOvers} onChange={(e) => setCustomOvers(e.target.value)} /></label>}
      </section>
      <div className="teams-grid"><TeamForm title="Team 1" team={teamA} setter={setTeamA} /><TeamForm title="Team 2" team={teamB} setter={setTeamB} /></div>
      <div className="form-actions"><span>{overs} overs • {teamA.players.filter(Boolean).length + teamB.players.filter(Boolean).length} players entered</span><button className="primary" type="submit">Create Match</button></div>
    </form>
  );
}
