import React from 'react';
import { CheckCircle } from 'lucide-react';

export default function ReviewSummary({
  formData,
  setFormData,
  setView,
  setStep,
  coordinators,
  discardDraft
}) {
  return (
    <div className="review-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h2>Review Event Details</h2>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary" onClick={discardDraft} style={{ borderStyle: 'dashed' }}>
            Discard Report
          </button>
          <button className="btn btn-primary" onClick={() => setView('preview')}>
            Generate Preview
          </button>
        </div>
      </div>

      {/* Section 1: Basic Event info */}
      <div className="review-section-card">
        <div className="review-section-header">
          <span className="review-section-title">
            <CheckCircle size={16} style={{ color: 'var(--accent)' }} />
            <span>1. Event Description</span>
          </span>
          <button className="btn btn-link" onClick={() => { setView('create'); setStep(1); }}>
            Edit
          </button>
        </div>
        <div className="review-data-grid">
          <div className="review-data-item">
            <span className="review-data-label">Event Type</span>
            <span className="review-data-value">{formData.eventType}</span>
          </div>
          <div className="review-data-item">
            <span className="review-data-label">Event Title</span>
            <span className="review-data-value">{formData.eventTitle}</span>
          </div>
          <div className="review-data-item">
            <span className="review-data-label">Dates</span>
            <span className="review-data-value">{formData.startDate} to {formData.endDate}</span>
          </div>
          <div className="review-data-item">
            <span className="review-data-label">Time & Duration</span>
            <span className="review-data-value">{formData.startTime} to {formData.endTime} ({formData.duration})</span>
          </div>
          <div className="review-data-item">
            <span className="review-data-label">Venue</span>
            <span className="review-data-value">
              {formData.venue === 'Classroom' || formData.venue === 'Other' ? formData.customVenue : formData.venue}
            </span>
          </div>
        </div>
      </div>

      {/* Section 2: Coordinators */}
      <div className="review-section-card">
        <div className="review-section-header">
          <span className="review-section-title">
            <CheckCircle size={16} style={{ color: 'var(--accent)' }} />
            <span>2. Coordinators</span>
          </span>
          <button className="btn btn-link" onClick={() => { setView('create'); setStep(1); }}>
            Edit
          </button>
        </div>
        <div className="review-data-grid">
          <div className="review-data-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span className="review-data-label">Coordinator 1</span>
              <span className="review-data-value">
                {coordinators.find(c => c.empId === formData.coord1)?.name || 'None selected'}
              </span>
            </div>
            {formData.coord1 && (
              <button className="btn btn-link" style={{ color: '#ef4444', fontSize: 12, padding: 0 }} onClick={() => setFormData(prev => ({ ...prev, coord1: '' }))}>
                Remove
              </button>
            )}
          </div>
          <div className="review-data-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span className="review-data-label">Coordinator 2</span>
              <span className="review-data-value">
                {coordinators.find(c => c.empId === formData.coord2)?.name || 'None selected'}
              </span>
            </div>
            {formData.coord2 && (
              <button className="btn btn-link" style={{ color: '#ef4444', fontSize: 12, padding: 0 }} onClick={() => setFormData(prev => ({ ...prev, coord2: '' }))}>
                Remove
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Section 3: Resource Person */}
      <div className="review-section-card">
        <div className="review-section-header">
          <span className="review-section-title">
            <CheckCircle size={16} style={{ color: 'var(--accent)' }} />
            <span>3. Guest / Resource Person</span>
          </span>
          <button className="btn btn-link" onClick={() => { setView('create'); setStep(2); }}>
            Edit
          </button>
        </div>
        {formData.resourcePersonEnabled ? (
          <div className="review-data-grid">
            <div className="review-data-item">
              <span className="review-data-label">Name</span>
              <span className="review-data-value">{formData.resourcePerson.name}</span>
            </div>
            <div className="review-data-item">
              <span className="review-data-label">Designation & Org</span>
              <span className="review-data-value">{formData.resourcePerson.designation}, {formData.resourcePerson.organization}</span>
            </div>
            <div className="review-data-item">
              <span className="review-data-label">Contact</span>
              <span className="review-data-value">{formData.resourcePerson.email} | {formData.resourcePerson.mobile}</span>
            </div>
          </div>
        ) : (
          <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Skipped.</div>
        )}
      </div>

      {/* Section 4: Report write up */}
      <div className="review-section-card">
        <div className="review-section-header">
          <span className="review-section-title">
            <CheckCircle size={16} style={{ color: 'var(--accent)' }} />
            <span>4. Write-up</span>
          </span>
          <button className="btn btn-link" onClick={() => { setView('create'); setStep(3); }}>
            Edit
          </button>
        </div>
        <div style={{ fontSize: 14, textOverflow: 'ellipsis', whiteSpace: 'pre-wrap', maxHeight: 120, overflowY: 'auto', backgroundColor: '#fafafb', padding: 12, borderRadius: 6, border: '1px solid #eee' }}>
          {formData.description || 'Nothing written yet.'}
        </div>
      </div>

      {/* Section 5: Attendance */}
      <div className="review-section-card">
        <div className="review-section-header">
          <span className="review-section-title">
            <CheckCircle size={16} style={{ color: 'var(--accent)' }} />
            <span>5. Attendance</span>
          </span>
          <button className="btn btn-link" onClick={() => { setView('create'); setStep(4); }}>
            Edit
          </button>
        </div>
        <div className="review-data-grid">
          <div className="review-data-item">
            <span className="review-data-label">CSV Filename</span>
            <span className="review-data-value">{formData.attendanceFileName || 'No CSV uploaded'}</span>
          </div>
          <div className="review-data-item">
            <span className="review-data-label">Total Participants</span>
            <span className="review-data-value">{formData.attendanceData.length}</span>
          </div>
        </div>
      </div>

      {/* Section 6: Media */}
      <div className="review-section-card">
        <div className="review-section-header">
          <span className="review-section-title">
            <CheckCircle size={16} style={{ color: 'var(--accent)' }} />
            <span>6. Photos & Brochure</span>
          </span>
          <button className="btn btn-link" onClick={() => { setView('create'); setStep(5); }}>
            Edit
          </button>
        </div>
        <div className="review-data-grid">
          <div className="review-data-item">
            <span className="review-data-label">Brochure Selected?</span>
            <span className="review-data-value">{formData.brochureImage ? 'Yes' : 'No'}</span>
          </div>
          <div className="review-data-item">
            <span className="review-data-label">Event Photos</span>
            <span className="review-data-value">{formData.images.length} photos uploaded</span>
          </div>
        </div>
      </div>

      {/* Section 7: Finance */}
      <div className="review-section-card">
        <div className="review-section-header">
          <span className="review-section-title">
            <CheckCircle size={16} style={{ color: 'var(--accent)' }} />
            <span>7. Finance Details</span>
          </span>
          <button className="btn btn-link" onClick={() => { setView('create'); setStep(6); }}>
            Edit
          </button>
        </div>
        {formData.financeEnabled ? (
          <div className="review-data-grid">
            <div className="review-data-item">
              <span className="review-data-label">Expenditure</span>
              <span className="review-data-value">Rs. {formData.finance.expenditure || '0'}</span>
            </div>
            <div className="review-data-item">
              <span className="review-data-label">Revenue</span>
              <span className="review-data-value">Rs. {formData.finance.revenue || '0'}</span>
            </div>
            <div className="review-data-item">
              <span className="review-data-label">Remarks</span>
              <span className="review-data-value">{formData.finance.remarks || 'None'}</span>
            </div>
          </div>
        ) : (
          <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Skipped.</div>
        )}
      </div>
    </div>
  );
}
