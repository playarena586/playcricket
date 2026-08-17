const emptyBattingStats = (player) => ({ playerId: player.id, runs: 0, balls: 0, fours: 0, sixes: 0, out: false });
const emptyBowlingStats = (player) => ({ playerId: player.id, balls: 0, runs: 0, wickets: 0, wides: 0, noBalls: 0 });

export const createInnings = (battingTeam, bowlingTeam, maxOvers, target = null) => ({
  battingTeamId: battingTeam.id,
  bowlingTeamId: bowlingTeam.id,
  maxOvers,
  target,
  runs: 0,
  wickets: 0,
  legalBalls: 0,
  balls: [],
  striker: battingTeam.players[0]?.id ?? null,
  nonStriker: battingTeam.players[1]?.id ?? null,
  bowler: bowlingTeam.players[0]?.id ?? null,
  battingStats: Object.fromEntries(battingTeam.players.map((player) => [player.id, emptyBattingStats(player)])),
  bowlingStats: Object.fromEntries(bowlingTeam.players.map((player) => [player.id, emptyBowlingStats(player)])),
  dismissedPlayers: [],
  pendingBatter: false,
  completed: false,
  result: null,
});

export const availableBatters = (innings, team) => team.players.filter((player) => !innings.dismissedPlayers.includes(player.id) && player.id !== innings.striker && player.id !== innings.nonStriker);

export const scoreBall = (innings, { runs = 0, extras = 0, extraType = null, wicket = false }) => {
  if (innings.completed || innings.pendingBatter) return innings;
  const batRuns = Number(runs);
  const extraRuns = Number(extras);
  const isLegal = !['wide', 'no-ball'].includes(extraType);
  const total = batRuns + extraRuns;
  const nextLegalBalls = innings.legalBalls + (isLegal ? 1 : 0);
  const nextWickets = innings.wickets + (wicket ? 1 : 0);
  const strikerStats = { ...innings.battingStats[innings.striker] };
  strikerStats.runs += batRuns;
  strikerStats.balls += isLegal ? 1 : 0;
  strikerStats.fours += batRuns === 4 ? 1 : 0;
  strikerStats.sixes += batRuns === 6 ? 1 : 0;
  strikerStats.out = strikerStats.out || wicket;
  const bowlerStats = { ...innings.bowlingStats[innings.bowler] };
  bowlerStats.runs += total;
  bowlerStats.balls += isLegal ? 1 : 0;
  bowlerStats.wides += extraType === 'wide' ? 1 : 0;
  bowlerStats.noBalls += extraType === 'no-ball' ? 1 : 0;
  bowlerStats.wickets += wicket ? 1 : 0;
  const ball = { id: crypto.randomUUID(), number: innings.balls.length + 1, runs: batRuns, extras: extraRuns, extraType, wicket, striker: innings.striker, bowler: innings.bowler, legal: isLegal, total };
  const shouldEndOver = isLegal && nextLegalBalls % 6 === 0;
  const completedByTarget = innings.target !== null && innings.runs + total >= innings.target;
  const completed = completedByTarget || nextWickets >= 10 || nextLegalBalls >= innings.maxOvers * 6;
  let striker = innings.striker;
  let nonStriker = innings.nonStriker;
  if (batRuns % 2 === 1) [striker, nonStriker] = [nonStriker, striker];
  if (shouldEndOver && !completed && !wicket) [striker, nonStriker] = [nonStriker, striker];
  if (wicket) striker = null;
  return {
    ...innings,
    runs: innings.runs + total,
    wickets: nextWickets,
    legalBalls: nextLegalBalls,
    balls: [...innings.balls, ball],
    striker,
    nonStriker,
    battingStats: { ...innings.battingStats, [ball.striker]: strikerStats },
    bowlingStats: { ...innings.bowlingStats, [innings.bowler]: bowlerStats },
    dismissedPlayers: wicket ? [...innings.dismissedPlayers, innings.striker] : innings.dismissedPlayers,
    pendingBatter: wicket && !completed,
    completed,
    result: completed ? (completedByTarget ? 'chased' : null) : null,
  };
};

export const setNextBatter = (innings, playerId) => innings.pendingBatter ? { ...innings, striker: playerId, pendingBatter: false } : innings;
export const setBowler = (innings, playerId) => ({ ...innings, bowler: playerId });
export const formatOvers = (legalBalls) => `${Math.floor(legalBalls / 6)}.${legalBalls % 6}`;
export const strikeRate = (stats) => stats.balls ? ((stats.runs / stats.balls) * 100).toFixed(2) : '0.00';
export const economy = (stats) => stats.balls ? ((stats.runs / stats.balls) * 6).toFixed(2) : '0.00';
