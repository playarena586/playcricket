import { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';

export default function Auth({ onBack }) {
  const { configured, signIn, signUp } = useAuth();
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');
    setBusy(true);
    const action = mode === 'signin' ? signIn : signUp;
    const { data, error: authError } = await action(email.trim(), password);
    setBusy(false);
    if (authError) setError(authError.message);
    else if (mode === 'signup' && !data?.session) setMessage('Account created. Check your email to confirm your address.');
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <button className="secondary" type="button" onClick={onBack}>← Back</button>
        <span className="eyebrow">PlayCricket account</span>
        <h1>{mode === 'signin' ? 'Welcome back' : 'Create your account'}</h1>
        <p>Sign in to prepare PlayCricket for cloud-synced matches.</p>
        {!configured && <div className="wicket-banner">Supabase is not configured yet. Add the values from <code>.env.example</code> to your local <code>.env.local</code>.</div>}
        <form onSubmit={submit} className="auth-form">
          <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label>
          <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength="6" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} required /></label>
          {error && <div className="auth-error" role="alert">{error}</div>}
          {message && <div className="auth-message" role="status">{message}</div>}
          <button className="primary" disabled={!configured || busy}>{busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}</button>
        </form>
        <button className="link-button auth-toggle" type="button" onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); setMessage(''); }}>
          {mode === 'signin' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
        </button>
      </div>
    </main>
  );
}
