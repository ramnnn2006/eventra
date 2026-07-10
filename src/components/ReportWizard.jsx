import React from 'react';
import { 
  ArrowRight, Upload, Trash, RefreshCw, AlertCircle, CheckCircle, Sparkles, Mic, Check
} from 'lucide-react';

export default function ReportWizard({
  formData,
  setFormData,
  step,
  setStep,
  setView,
  validationErrors,
  setValidationErrors,
  coordinatorsList,
  venuesList,
  eventTypesList,
  smartFillFlags,
  refinementLoading,
  handleRefineReportText,
  csvInputRef,
  handleCSVUpload: handleAttendanceUpload,
  csvErrors,
  brochureInputRef,
  handleBrochureUpload,
  imagesInputRef,
  handleImagesUpload,
  discardDraft,
  showToast,
  logos
}) {
  return (
    <div className="form-wizard">
      <div className="wizard-header">
        <span className="wizard-title">{formData.eventTitle || 'New Event Report'}</span>
        <span className="wizard-progress">Step {step} of 6</span>
      </div>
      
      <div className="wizard-body">
        {/* Step 1: Event Details & Faculty Coordinators */}
        {step === 1 && (
          <div>
            <h2 className="step-question">Event basics</h2>
            <p className="step-description">What happened, when, where, and who coordinated it.</p>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Event Type</label>
                <select 
                  className={`form-input ${validationErrors.eventType ? 'error' : ''} ${smartFillFlags.includes('eventType') ? 'smart-fill-flagged' : ''}`}
                  value={formData.eventType}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, eventType: e.target.value }));
                    setValidationErrors(prev => ({ ...prev, eventType: null }));
                  }}
                >
                  <option value="">Select Event Type...</option>
                  {eventTypesList.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {validationErrors.eventType && <span className="validation-error-text">{validationErrors.eventType}</span>}
                {smartFillFlags.includes('eventType') && <span className="smart-fill-flag-text">⚠️ Not parsed by Smart Fill</span>}
              </div>
              
              <div className="form-group">
                <label className="form-label">Event Title</label>
                <input 
                  type="text" 
                  className={`form-input ${validationErrors.eventTitle ? 'error' : ''} ${smartFillFlags.includes('eventTitle') ? 'smart-fill-flagged' : ''}`}
                  placeholder="e.g. Android Development Workshop"
                  value={formData.eventTitle}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, eventTitle: e.target.value }));
                    setValidationErrors(prev => ({ ...prev, eventTitle: null }));
                  }}
                />
                {validationErrors.eventTitle && <span className="validation-error-text">{validationErrors.eventTitle}</span>}
                {smartFillFlags.includes('eventTitle') && <span className="smart-fill-flag-text">⚠️ Not parsed by Smart Fill</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input 
                  type="date" 
                  className={`form-input ${validationErrors.startDate ? 'error' : ''} ${smartFillFlags.includes('startDate') ? 'smart-fill-flagged' : ''}`}
                  value={formData.startDate}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, startDate: e.target.value }));
                    setValidationErrors(prev => ({ ...prev, startDate: null }));
                  }}
                />
                {validationErrors.startDate && <span className="validation-error-text">{validationErrors.startDate}</span>}
                {smartFillFlags.includes('startDate') && <span className="smart-fill-flag-text">⚠️ Not parsed by Smart Fill</span>}
              </div>
              
              <div className="form-group">
                <label className="form-label">End Date</label>
                <input 
                  type="date" 
                  className={`form-input ${validationErrors.endDate ? 'error' : ''} ${smartFillFlags.includes('endDate') ? 'smart-fill-flagged' : ''}`}
                  value={formData.endDate}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, endDate: e.target.value }));
                    setValidationErrors(prev => ({ ...prev, endDate: null }));
                  }}
                />
                {validationErrors.endDate && <span className="validation-error-text">{validationErrors.endDate}</span>}
                {smartFillFlags.includes('endDate') && <span className="smart-fill-flag-text">⚠️ Not parsed by Smart Fill</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Start Time</label>
                <input 
                  type="text" 
                  className={`form-input ${validationErrors.startTime ? 'error' : ''} ${smartFillFlags.includes('startTime') ? 'smart-fill-flagged' : ''}`}
                  placeholder="e.g. 10:00 AM"
                  value={formData.startTime}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, startTime: e.target.value }));
                    setValidationErrors(prev => ({ ...prev, startTime: null }));
                  }}
                />
                {validationErrors.startTime && <span className="validation-error-text">{validationErrors.startTime}</span>}
                {smartFillFlags.includes('startTime') && <span className="smart-fill-flag-text">⚠️ Not parsed by Smart Fill</span>}
              </div>
              
              <div className="form-group">
                <label className="form-label">Duration</label>
                <input 
                  type="text" 
                  className={`form-input ${validationErrors.duration ? 'error' : ''} ${smartFillFlags.includes('duration') ? 'smart-fill-flagged' : ''}`}
                  placeholder="e.g. 90 minutes, 3 hours"
                  value={formData.duration}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, duration: e.target.value }));
                    setValidationErrors(prev => ({ ...prev, duration: null }));
                  }}
                />
                {validationErrors.duration && <span className="validation-error-text">{validationErrors.duration}</span>}
                {smartFillFlags.includes('duration') && <span className="smart-fill-flag-text">⚠️ Not parsed by Smart Fill</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Venue</label>
                <select 
                  className={`form-input ${validationErrors.venue ? 'error' : ''} ${smartFillFlags.includes('venue') ? 'smart-fill-flagged' : ''}`}
                  value={formData.venue}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, venue: e.target.value }));
                    setValidationErrors(prev => ({ ...prev, venue: null }));
                  }}
                >
                  <option value="">Select Venue...</option>
                  {venuesList.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
                {validationErrors.venue && <span className="validation-error-text">{validationErrors.venue}</span>}
                {smartFillFlags.includes('venue') && <span className="smart-fill-flag-text">⚠️ Not parsed by Smart Fill</span>}
              </div>

              {(formData.venue === 'Classroom' || formData.venue === 'Other') && (
                <div className="form-group">
                  <label className="form-label">Custom Venue Name</label>
                  <input 
                    type="text" 
                    className={`form-input ${validationErrors.customVenue ? 'error' : ''} ${smartFillFlags.includes('customVenue') ? 'smart-fill-flagged' : ''}`}
                    placeholder="e.g. Netaji block 402"
                    value={formData.customVenue}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, customVenue: e.target.value }));
                      setValidationErrors(prev => ({ ...prev, customVenue: null }));
                    }}
                  />
                  {validationErrors.customVenue && <span className="validation-error-text">{validationErrors.customVenue}</span>}
                  {smartFillFlags.includes('customVenue') && <span className="smart-fill-flag-text">⚠️ Not parsed by Smart Fill</span>}
                </div>
              )}
            </div>

            <div className="form-row" style={{ borderTop: '1px solid var(--border-light)', paddingTop: 20, marginTop: 20 }}>
              <div className="form-group">
                <label className="form-label">Faculty Coordinator 1</label>
                <select 
                  className={`form-input ${validationErrors.coord1 ? 'error' : ''} ${smartFillFlags.includes('coord1') ? 'smart-fill-flagged' : ''}`}
                  value={formData.coord1}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, coord1: e.target.value }));
                    setValidationErrors(prev => ({ ...prev, coord1: null }));
                  }}
                >
                  <option value="">Select Faculty...</option>
                  {coordinatorsList.map(c => (
                    <option key={c.empId} value={c.empId}>{c.name} ({c.department})</option>
                  ))}
                </select>
                {validationErrors.coord1 && <span className="validation-error-text">{validationErrors.coord1}</span>}
                {smartFillFlags.includes('coord1') && <span className="smart-fill-flag-text">⚠️ Not parsed by Smart Fill</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Faculty Coordinator 2 (Optional)</label>
                <select 
                  className={`form-input ${smartFillFlags.includes('coord2') ? 'smart-fill-flagged' : ''}`}
                  value={formData.coord2}
                  onChange={(e) => setFormData(prev => ({ ...prev, coord2: e.target.value }))}
                >
                  <option value="">Select Faculty...</option>
                  {coordinatorsList.map(c => (
                    <option key={c.empId} value={c.empId}>{c.name} ({c.department})</option>
                  ))}
                </select>
                {smartFillFlags.includes('coord2') && <span className="smart-fill-flag-text">⚠️ Not parsed by Smart Fill</span>}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Resource Person & Branding */}
        {step === 2 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <h2 className="step-question">Resource person</h2>
                <p className="step-description" style={{ marginBottom: 0 }}>If you had an external speaker or guest, turn this on and fill in their info.</p>
              </div>
              <label className="switch-container" style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={formData.resourcePersonEnabled}
                  onChange={(e) => setFormData(prev => ({ ...prev, resourcePersonEnabled: e.target.checked }))}
                  style={{ width: 20, height: 20, cursor: 'pointer' }}
                />
              </label>
            </div>

            {formData.resourcePersonEnabled && (
              <div className="fade-in">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Resource Person Name</label>
                    <input 
                      type="text" 
                      className="form-input"
                      value={formData.resourcePerson.name}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        resourcePerson: { ...prev.resourcePerson, name: e.target.value }
                      }))}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Designation</label>
                    <input 
                      type="text" 
                      className="form-input"
                      value={formData.resourcePerson.designation}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        resourcePerson: { ...prev.resourcePerson, designation: e.target.value }
                      }))}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Organization</label>
                    <input 
                      type="text" 
                      className="form-input"
                      value={formData.resourcePerson.organization}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        resourcePerson: { ...prev.resourcePerson, organization: e.target.value }
                      }))}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Place</label>
                    <input 
                      type="text" 
                      className="form-input"
                      value={formData.resourcePerson.place}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        resourcePerson: { ...prev.resourcePerson, place: e.target.value }
                      }))}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input 
                      type="email" 
                      className="form-input"
                      value={formData.resourcePerson.email}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        resourcePerson: { ...prev.resourcePerson, email: e.target.value }
                      }))}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Mobile Number</label>
                    <input 
                      type="text" 
                      className="form-input"
                      value={formData.resourcePerson.mobile}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        resourcePerson: { ...prev.resourcePerson, mobile: e.target.value }
                      }))}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Event Branding / Logos Selection */}
            <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border-light)' }}>
              <h2 className="step-question">Event branding</h2>
              <p className="step-description">Select optional logos to include on the cover page. VIT Chennai, MIC, and Student Welfare logos are included by default.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginTop: 16 }}>
                {logos.filter(l => l.isOptional).map(logo => {
                  const isSelected = formData.selectedLogos.includes(logo.id);
                  return (
                    <div 
                      key={logo.id} 
                      onClick={() => {
                        setFormData(prev => {
                          const selected = prev.selectedLogos.includes(logo.id)
                            ? prev.selectedLogos.filter(id => id !== logo.id)
                            : [...prev.selectedLogos, logo.id];
                          return { ...prev, selectedLogos: selected };
                        });
                      }}
                      style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        padding: 12, 
                        border: `2px solid ${isSelected ? 'hsl(var(--accent-h), var(--accent-s), var(--accent-l))' : 'var(--border-light)'}`, 
                        borderRadius: 8, 
                        cursor: 'pointer',
                        backgroundColor: isSelected ? 'hsl(var(--accent-h), var(--accent-s), 96%)' : 'var(--card-bg)',
                        transition: 'all 0.2s ease',
                        textAlign: 'center'
                      }}
                    >
                      <img src={logo.dataUrl || logo.src} alt={logo.name} style={{ height: 40, objectFit: 'contain', marginBottom: 8 }} />
                      <span style={{ fontSize: 12, fontWeight: 500 }}>{logo.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Event Write-up */}
        {step === 3 && (
          <div>
            <h2 className="step-question">Event write-up</h2>
            <p className="step-description">Write or paste a summary of what happened at the event. Aim for 200 to 500 words.</p>
            
            <div className="form-group">
              <textarea 
                className="form-input"
                rows={8}
                style={{ resize: 'vertical', width: '100%', fontFamily: 'inherit', padding: 12 }}
                placeholder="Type or paste your report draft here..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                <span className="dropzone-hint">
                  Word Count: {formData.description.trim() ? formData.description.trim().split(/\s+/).length : 0} words
                </span>
                <button 
                  className="btn btn-secondary" 
                  onClick={handleRefineReportText}
                  disabled={refinementLoading || !formData.description.trim()}
                  style={{ gap: 6 }}
                >
                  {refinementLoading ? <RefreshCw size={14} className="spin" /> : <RefreshCw size={14} />}
                  Refine with Groq LLM
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Attendance File Upload */}
        {step === 4 && (
          <div>
            <h2 className="step-question">Attendance</h2>
            <p className="step-description">Upload a CSV or Excel (.xlsx, .xls) file with participant info. Columns get matched automatically.</p>
            
            <div className="file-dropzone" onClick={() => csvInputRef.current?.click()}>
              <Upload size={32} className="dropzone-icon" />
              <p className="dropzone-text">Drop your CSV or Excel file here, or click to pick a file</p>
              <p className="dropzone-hint">Accepted file types: .csv, .xlsx, .xls</p>
            </div>
            
            <input 
              type="file" 
              ref={csvInputRef} 
              onChange={handleAttendanceUpload} 
              accept=".csv, .xlsx, .xls" 
              style={{ display: 'none' }}
            />

            {formData.attendanceFileName && (
              <div style={{ marginTop: 16, padding: 12, backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{formData.attendanceFileName}</span>
                <span className="badge badge-success">{formData.attendanceData.length} participants</span>
              </div>
            )}

            {csvErrors.length > 0 && (
              <div style={{ marginTop: 16, padding: 12, border: '1px solid #fecaca', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: 'var(--radius-md)', fontSize: 13, display: 'flex', gap: 8 }}>
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                <div>{csvErrors.join(', ')}</div>
              </div>
            )}
          </div>
        )}

        {/* Step 5: Brochure & Images */}
        {step === 5 && (
          <div>
            <h2 className="step-question">Photos and brochure</h2>
            <p className="step-description">Upload the event flyer and at least 2 photos from the event.</p>
            
            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label">Event Brochure / Flyer</label>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <button className="btn btn-secondary" onClick={() => brochureInputRef.current?.click()}>
                  Upload Brochure Image
                </button>
                <input 
                  type="file" 
                  ref={brochureInputRef} 
                  onChange={handleBrochureUpload} 
                  accept="image/*" 
                  style={{ display: 'none' }}
                />
                {formData.brochureImage && (
                  <span className="badge badge-success">Brochure Selected</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Event Photos (at least 2)</label>
              <button className="btn btn-secondary" onClick={() => imagesInputRef.current?.click()}>
                Upload Event Photos
              </button>
              <input 
                type="file" 
                ref={imagesInputRef} 
                onChange={handleImagesUpload} 
                accept="image/*" 
                multiple 
                style={{ display: 'none' }}
              />
              
              {formData.images.length > 0 && (
                <div className="image-preview-list">
                  {formData.images.map((img, i) => (
                    <div key={i} className="image-preview-item">
                      <img src={img} alt={`Event photo ${i+1}`} className="image-preview-img" />
                      <button 
                        className="image-preview-remove" 
                        onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }))}
                      >
                        <Trash size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 6: Finance Section */}
        {step === 6 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <h2 className="step-question">Money stuff</h2>
                <p className="step-description" style={{ marginBottom: 0 }}>Turn this on if there was any spending or revenue for this event.</p>
              </div>
              <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={formData.financeEnabled}
                  onChange={(e) => setFormData(prev => ({ ...prev, financeEnabled: e.target.checked }))}
                  style={{ width: 20, height: 20, cursor: 'pointer' }}
                />
              </label>
            </div>

            {formData.financeEnabled && (
              <div className="fade-in">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Expenditure (Rs.)</label>
                    <input 
                      type="number" 
                      className="form-input"
                      placeholder="e.g. 5000"
                      value={formData.finance.expenditure}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        finance: { ...prev.finance, expenditure: e.target.value }
                      }))}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Revenue (Rs.)</label>
                    <input 
                      type="number" 
                      className="form-input"
                      placeholder="e.g. 12000"
                      value={formData.finance.revenue}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        finance: { ...prev.finance, revenue: e.target.value }
                      }))}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Remarks</label>
                  <textarea 
                    className="form-input"
                    rows={3}
                    placeholder="Special remarks regarding finance..."
                    value={formData.finance.remarks}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      finance: { ...prev.finance, remarks: e.target.value }
                    }))}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="wizard-footer">
        <button 
          className="btn btn-secondary" 
          onClick={step === 1 ? discardDraft : () => setStep(step - 1)}
        >
          {step === 1 ? 'Discard Draft' : 'Back'}
        </button>
        
        <button 
          className="btn btn-primary" 
          onClick={() => {
            if (step === 1) {
              const errors = {};
              if (!formData.eventType) errors.eventType = 'Event Type is required';
              if (!formData.eventTitle.trim()) errors.eventTitle = 'Event Title is required';
              if (!formData.startDate) errors.startDate = 'Start Date is required';
              if (!formData.endDate) errors.endDate = 'End Date is required';
              if (!formData.startTime.trim()) errors.startTime = 'Start Time is required';
              if (!formData.duration.trim()) errors.duration = 'Duration is required';
              if (!formData.venue) errors.venue = 'Venue is required';
              if ((formData.venue === 'Classroom' || formData.venue === 'Other') && !formData.customVenue.trim()) {
                errors.customVenue = 'Custom Venue Name is required';
              }
              if (!formData.coord1) errors.coord1 = 'Faculty Coordinator is required';

              if (Object.keys(errors).length > 0) {
                setValidationErrors(errors);
                showToast('Please fill all required fields');
                return;
              }
              setValidationErrors({});
            }

            if (step === 3) {
              if (!formData.description.trim()) {
                showToast('Please write some content first');
                return;
              }
            }

            if (step === 4) {
              if (formData.attendanceData.length === 0) {
                showToast('Please upload the attendance CSV file');
                return;
              }
            }

            if (step === 5) {
              if (formData.images.length < 2) {
                showToast('Please upload at least 2 event photos');
                return;
              }
            }

            if (step === 6) {
              setView('review');
            } else {
              setStep(step + 1);
            }
          }}
        >
          <span>{step === 6 ? 'Review Summary' : 'Next'}</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
