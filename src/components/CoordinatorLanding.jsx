import React from 'react';

export default function CoordinatorLanding({ setView, docxInputRef, handleCompletedReportUpload }) {
  return (
    <div className="landing-split-container">
      <div className="landing-left">
        <div className="landing-mic-logo-row">
          <img src="/miclogo.png" alt="MIC Logo" className="landing-mic-logo-img" />
          <span className="landing-mic-tag">Microsoft Innovations Club</span>
        </div>
        <h1 className="landing-hero-title">Your Reports</h1>
        <p className="landing-hero-subtitle">
          Start a new report or pick up where you left off. You can also upload a finished .docx if you just need it saved.
        </p>
        <div className="landing-hero-actions">
          <button className="btn btn-primary" onClick={() => setView('create')}>
            Start New Report
          </button>
          <button className="btn btn-secondary" onClick={() => docxInputRef.current?.click()}>
            Upload Completed Report
          </button>
          <input 
            type="file" 
            ref={docxInputRef} 
            onChange={handleCompletedReportUpload} 
            accept=".docx" 
            style={{ display: 'none' }}
          />
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
