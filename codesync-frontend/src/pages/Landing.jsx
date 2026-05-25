import { Link } from 'react-router-dom';
import { Code2, Users, Zap, Bot, Play, Shield } from 'lucide-react';
import './Landing.css';

export default function Landing() {
  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="landing-nav-brand">
          <Code2 size={28} />
          <span className="gradient-text">CodeSync</span>
        </div>
        <div className="landing-nav-actions">
          <Link to="/login" className="btn-secondary">Sign In</Link>
          <Link to="/register" className="btn-primary">Get Started</Link>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-badge">🚀 Real-time Collaborative Coding</div>
        <h1 className="hero-title">
          Code Together,<br />
          <span className="gradient-text">Build Faster</span>
        </h1>
        <p className="hero-subtitle">
          The collaborative coding platform that lets teams write, execute, and debug code in real-time with AI-powered assistance.
        </p>
        <div className="hero-actions">
          <Link to="/register" className="btn-primary btn-lg">Start Coding Free</Link>
          <Link to="/login" className="btn-secondary btn-lg">Sign In →</Link>
        </div>
        <div className="hero-code-preview">
          <div className="code-window">
            <div className="code-window-header">
              <div className="code-window-dots">
                <span className="dot red" />
                <span className="dot yellow" />
                <span className="dot green" />
              </div>
              <span className="code-window-title">main.py — CodeSync Room</span>
            </div>
            <pre className="code-window-body"><code>{`def fibonacci(n):\n    if n <= 1:\n        return n\n    a, b = 0, 1\n    for _ in range(2, n + 1):\n        a, b = b, a + b\n    return b\n\n# User2 is typing...\nprint(fibonacci(10))  # → 55`}</code></pre>
            <div className="code-cursors">
              <div className="cursor-indicator" style={{top: '38%', left: '45%'}}>
                <span className="cursor-line" style={{background: '#3b82f6'}} />
                <span className="cursor-label" style={{background: '#3b82f6'}}>Alice</span>
              </div>
              <div className="cursor-indicator" style={{top: '72%', left: '30%'}}>
                <span className="cursor-line" style={{background: '#8b5cf6'}} />
                <span className="cursor-label" style={{background: '#8b5cf6'}}>Bob</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <h2 className="features-title">Everything you need to <span className="gradient-text">collaborate</span></h2>
        <div className="features-grid">
          <div className="feature-card animate-fade-in">
            <div className="feature-icon blue"><Users size={24} /></div>
            <h3>Live Collaboration</h3>
            <p>Code together in real-time with conflict-free editing powered by CRDT technology.</p>
          </div>
          <div className="feature-card animate-fade-in" style={{animationDelay: '100ms'}}>
            <div className="feature-icon purple"><Play size={24} /></div>
            <h3>Instant Execution</h3>
            <p>Run Java, Python, and C++ code instantly in sandboxed Docker containers.</p>
          </div>
          <div className="feature-card animate-fade-in" style={{animationDelay: '200ms'}}>
            <div className="feature-icon green"><Bot size={24} /></div>
            <h3>AI Assistant</h3>
            <p>Get intelligent code reviews, bug detection, and complexity analysis powered by GPT-4o.</p>
          </div>
          <div className="feature-card animate-fade-in" style={{animationDelay: '300ms'}}>
            <div className="feature-icon orange"><Zap size={24} /></div>
            <h3>Room Codes</h3>
            <p>Share a simple 8-character code to invite anyone to your coding session.</p>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <p>Built with ❤️ using Spring Boot, React, and WebSockets</p>
      </footer>
    </div>
  );
}
