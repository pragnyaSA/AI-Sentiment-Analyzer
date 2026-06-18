import React, { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase-config";
import { useNavigate } from "react-router-dom";
import '../styles.css';

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/app");
    } catch (err) {
      setError(err.message || "Error creating account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy-1)', display: 'flex', flexDirection: 'column' }}>
      <nav className="navbar">
        <div className="navbar-logo">SentimentScope</div>
        <ul className="navbar-links">
          <li><a href="#about">About</a></li>
          <li><a href="#contact">Contact Us</a></li>
          <li>
            <button className="navbar-button"
              style={{ background: 'transparent', color: 'var(--electric)', border: '1px solid var(--border)' }}
              onClick={() => navigate("/login")}>
              Login
            </button>
          </li>
        </ul>
      </nav>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '48px 24px' }}>
        <div className="auth-logo-center">
          <span className="auth-logo-dot"></span>
          SentimentScope
        </div>

        <div className="auth-auth-container">
          <h2>Create account</h2>
          {error && <div className="auth-error">{error}</div>}
          <form onSubmit={handleSignUp}>
            <div className="input-group">
              <label>Email address</label>
              <input type="email" className="auth-auth-input" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input type="password" className="auth-auth-input" placeholder="Min. 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="input-group" style={{ marginBottom: '24px' }}>
              <label>Confirm password</label>
              <input type="password" className="auth-auth-input" placeholder="••••••••" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
            </div>
            <button type="submit" className="auth-auth-button" disabled={loading}>
              {loading ? 'Creating account…' : 'Create account →'}
            </button>
          </form>
          <div className="toggle-auth">
            Already have an account?
            <button className="toggle-button" onClick={() => navigate("/login")}>Log in</button>
          </div>
        </div>
      </div>

      <footer className="footer"><p>© 2024 SentimentScope. All rights reserved.</p></footer>
    </div>
  );
};

export default Signup;