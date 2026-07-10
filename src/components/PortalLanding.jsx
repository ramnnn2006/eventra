import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function PortalLanding({ navigate }) {
  return (
    <div className="landing-split-container">
      <div className="landing-left">
        <div className="landing-mic-logo-row">
          <img src="/miclogo.png" alt="MIC Logo" className="landing-mic-logo-img" />
          <span className="landing-mic-tag">Microsoft Innovations Club</span>
        </div>
        <h1 className="landing-hero-title">MIC Report<br/>Generator.</h1>
        <p className="landing-hero-subtitle">
          Fill in your event details, upload attendance, and get a formatted VIT Chennai report as a Word doc. That's it.
        </p>
        <div className="landing-hero-actions" style={{ marginTop: 12 }}>
          <button className="btn btn-primary" onClick={() => navigate('/login')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 28px', fontSize: 16, cursor: 'pointer' }}>
            <span>Get Started</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
      <div className="landing-right">
        <div className="mic-silhouette-container">
          <svg viewBox="0 0 400 400" className="mic-silhouette-svg">
            {/* Top Left Quadrant (dots) */}
            {Array.from({ length: 8 }).map((_, r) => 
              Array.from({ length: 8 }).map((_, c) => (
                <circle 
                  key={`tl-${r}-${c}`} 
                  cx={50 + c * 16} 
                  cy={50 + r * 16} 
                  r="3.5" 
                  fill="var(--accent)" 
                  className="silhouette-dot"
                  style={{ animationDelay: `${(r + c) * 0.1}s` }}
                />
              ))
            )}

            {/* Top Right Quadrant */}
            {Array.from({ length: 8 }).map((_, r) => 
              Array.from({ length: 8 }).map((_, c) => (
                <circle 
                  key={`tr-${r}-${c}`} 
                  cx={210 + c * 16} 
                  cy={50 + r * 16} 
                  r="3.5" 
                  fill="var(--accent)" 
                  className="silhouette-dot"
                  style={{ animationDelay: `${(r + (7 - c)) * 0.1}s` }}
                />
              ))
            )}

            {/* Bottom Left Quadrant */}
            {Array.from({ length: 8 }).map((_, r) => 
              Array.from({ length: 8 }).map((_, c) => (
                <circle 
                  key={`bl-${r}-${c}`} 
                  cx={50 + c * 16} 
                  cy={210 + r * 16} 
                  r="3.5" 
                  fill="var(--accent)" 
                  className="silhouette-dot"
                  style={{ animationDelay: `${((7 - r) + c) * 0.1}s` }}
                />
              ))
            )}

            {/* Bottom Right Quadrant */}
            {Array.from({ length: 8 }).map((_, r) => 
              Array.from({ length: 8 }).map((_, c) => (
                <circle 
                  key={`br-${r}-${c}`} 
                  cx={210 + c * 16} 
                  cy={210 + r * 16} 
                  r="3.5" 
                  fill="var(--accent)" 
                  className="silhouette-dot"
                  style={{ animationDelay: `${((7 - r) + (7 - c)) * 0.1}s` }}
                />
              ))
            )}
          </svg>
        </div>
      </div>
    </div>
  );
}
