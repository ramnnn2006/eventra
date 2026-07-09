import React from 'react';
import { FileText } from 'lucide-react';

export default function LoginCard({ username, setUsername, password, setPassword, handleLogin }) {
  return (
    <div className="login-card">
      <div className="landing-illustration">
        <FileText size={32} style={{ color: 'var(--accent)' }} />
      </div>
      <h2 className="login-title">Eventra Sign In</h2>
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label className="form-label">Username</label>
          <input 
            type="text" 
            className="form-input" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input 
            type="password" 
            className="form-input" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }}>
          Login
        </button>
      </form>
    </div>
  );
}
