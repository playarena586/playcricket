const STORAGE_KEY = 'playcricket.matches.v1';

const isBrowser = typeof window !== 'undefined' && window.localStorage;

export function loadMatches() {
  if (!isBrowser) return [];
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    const matches = value ? JSON.parse(value) : [];
    return Array.isArray(matches) ? matches : [];
  } catch {
    return [];
  }
}

export function saveMatches(matches) {
  if (!isBrowser) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(matches));
}

export function upsertMatch(match) {
  const matches = loadMatches();
  const index = matches.findIndex((item) => item.id === match.id);
  if (index === -1) matches.unshift(match);
  else matches[index] = match;
  saveMatches(matches);
  return matches;
}

export function deleteMatch(matchId) {
  const matches = loadMatches().filter((match) => match.id !== matchId);
  saveMatches(matches);
  return matches;
}

export function clearMatches() {
  if (!isBrowser) return;
  window.localStorage.removeItem(STORAGE_KEY);
}
