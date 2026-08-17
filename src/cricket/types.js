export const MATCH_FORMATS = [
  { value: 't20', label: 'T20', overs: 20 },
  { value: 'odi', label: 'One Day', overs: 50 },
  { value: 'custom', label: 'Custom', overs: 10 },
];

export const createTeam = (name) => ({
  id: crypto.randomUUID(),
  name: name.trim(),
  players: [],
});

export const createPlayer = (name) => ({
  id: crypto.randomUUID(),
  name: name.trim(),
});
