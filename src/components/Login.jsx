import React, { useState, useEffect } from 'react';

const USERNAME = 'Georgiy1992';
const PASSWORD = 'KassaNDRa193728!';

export default function Login({ onSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const token = localStorage.getItem('session');
      if (token === 'ok') {
        onSuccess?.();
      }
    } catch {}
  }, [onSuccess]);

  const submit = (e) => {
    e.preventDefault();
    setError('');
    if (username === USERNAME && password === PASSWORD) {
      try { localStorage.setItem('session', 'ok'); } catch {}
      onSuccess?.();
    } else {
      setError('Неверный логин или пароль');
    }
  };

  return (
    <div className="login glass">
      <h1>Вход</h1>
      <form onSubmit={submit} className="login-form">
        <label>
          Логин
          <input value={username} onChange={(e)=>setUsername(e.target.value)} autoFocus />
        </label>
        <label>
          Пароль
          <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
        </label>
        {error && <div className="login-error">{error}</div>}
        <div className="login-actions">
          <button type="submit">Войти</button>
        </div>
      </form>
    </div>
  );
}
