export const createInnings = (battingTeam, bowlingTeam, maxOvers) => ({
  battingTeamId: battingTeam.id,
  bowlingTeamId: bowlingTeam.id,
  maxOvers,
  runs: 0,
  wickets: 0,
  legalBalls: 0,
  balls: [],
  striker: battingTeam.players[0]?.id ?? null,
  nonStriker: battingTeam.players[1]?.id ?? null,
  bowler: bowlingTeam.players[0]?.id ?? null,
  completed: false,
});

export const scoreBall = (innings, { runs = 0, extras = 0, extraType = null, wicket = false }) => {
  const isLegal = !['wide', 'no-ball'].includes(extraType);
  const total = Number(runs) + Number(extras);
  const nextLegalBalls = innings.legalBalls + (isLegal ? 1 : 0);
  const nextWickets = innings.wickets + (wicket ? 1 : 0);
  const ball = { id: crypto.randomUUID(), runs: Number(runs), extras: Number(extras), extraType, wicket, legal: isLegal, total };

  return {
    ...innings,
    runs: innings.runs + total,
    wickets: nextWickets,
    legalBalls: nextLegalBalls,
    balls: [...innings.balls, ball],
    completed: nextWickets >= 10 || nextLegalBalls >= innings.maxOvers * 6,
  };
};

export const formatOvers = (legalBalls) => `${Math.floor(legalBalls / 6)}.${legalBalls % 6}`;
