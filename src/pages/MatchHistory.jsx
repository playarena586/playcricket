import { useMemo, useState } from 'react';

const formatDate = (value) => {
  if (!value) return 'Unknown date';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
};

export default function MatchHistory({ matches, onOpen, onDelete, onBack }) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => matches.filter((match) => {
    const text = `${match.name} ${match.teams?.[0]?.name ?? ''} ${match.teams?.[1]?.name ?? ''}`.toLowerCase();
    return text.includes(query.toLowerCase());
  }), [matches, query]);

  return (
    <main className="history-page">
      <header className="page-header">
        <div><span className="eyebrow">Saved locally</span><h1>Match history</h1><p>Your matches remain available after a page refresh on this browser.</p></div>
        <button className="secondary" type="button" onClick={onBack}>← Dashboard</button>
      </header>
      <input className="history-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search matches or teams..." aria-label="Search matches" />
      {filtered.length === 0 ? <section className="empty-state"><h2>{matches.length ? 'No matches found' : 'No matches yet'}</h2><p>{matches.length ? 'Try another search.' : 'Create your first match to see it here.'}</p></section> : <section className="history-list">{filtered.map((match) => <article className="history-item" key={match.id}><div><span className="eyebrow">{match.status ?? 'scheduled'} · {match.overs} overs</span><h2>{match.name}</h2><p>{match.teams?.[0]?.name} vs {match.teams?.[1]?.name}</p><small>{formatDate(match.updatedAt ?? match.createdAt)}</small></div><div className="history-actions"><button className="primary" type="button" onClick={() => onOpen(match)}>Open</button><button className="secondary" type="button" onClick={() => onDelete(match.id)}>Delete</button></div></article>)}</section>}
    </main>
  );
}
