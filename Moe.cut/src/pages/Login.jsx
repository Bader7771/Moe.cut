import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('adminToken', data.token);
        navigate('/admin');
      } else {
        const errData = await response.json();
        setError(errData.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#000', color: '#fff', fontFamily: 'inherit' }}>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', width: '320px', gap: '1.5rem', padding: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', margin: 0, textAlign: 'center', letterSpacing: '0.05em', fontWeight: 600 }}>ADMIN LOGIN</h1>
          {error && <p style={{ color: '#ff4d4d', margin: 0, fontSize: '0.875rem', textAlign: 'center' }}>{error}</p>}
          
          <input 
            type="text" 
            placeholder="USERNAME" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)}
            style={{ padding: '1rem', background: '#111', border: '1px solid #333', color: '#fff', fontSize: '0.875rem', letterSpacing: '0.05em', fontFamily: 'inherit' }}
            required
          />
          <input 
            type="password" 
            placeholder="PASSWORD" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: '1rem', background: '#111', border: '1px solid #333', color: '#fff', fontSize: '0.875rem', letterSpacing: '0.05em', fontFamily: 'inherit' }}
            required
          />
          <button type="submit" style={{ padding: '1rem', background: '#fff', color: '#000', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.875rem', letterSpacing: '0.1em', fontFamily: 'inherit' }}>
            LOGIN TO DASHBOARD
          </button>
          <button type="button" onClick={() => navigate('/')} style={{ padding: '1rem', background: 'transparent', color: '#888', border: '1px solid #333', cursor: 'pointer', fontSize: '0.75rem', letterSpacing: '0.05em', fontFamily: 'inherit' }}>
            BACK TO SITE
          </button>
        </form>
      </div>
    </div>
  );
}
