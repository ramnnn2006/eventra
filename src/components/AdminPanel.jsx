import React from 'react';
import { 
  FileText, Users, Settings, Upload, Trash, Plus, Mic, Download 
} from 'lucide-react';

export default function AdminPanel({
  adminSection,
  setAdminSection,
  uploadedReports,
  uploadedReportsList,
  deleteReport,
  coordinators,
  coordinatorsList,
  newFaculty,
  setNewFaculty,
  handleAddFaculty,
  facSigInputRef,
  handleFacultySignatureUpload,
  deleteFaculty,
  newVenue,
  setNewVenue,
  addVenue,
  venuesRaw,
  deleteVenue,
  newEventType,
  setNewEventType,
  addEventType,
  eventTypesRaw,
  deleteEventType,
  templateInputRef,
  handleTemplateUpload,
  logos,
  logoInputRef,
  handleLogoUpload,
  deleteLogo,
  showToast
}) {
  const handleDownloadReport = (rep) => {
    // base64 helper inside component
    const base64ToArrayBuffer = (base64) => {
      const binary_string = window.atob(base64);
      const len = binary_string.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
      }
      return bytes.buffer;
    };

    let blob;
    const fileData = rep.fileData || rep.file;
    if (fileData && fileData !== 'base64_simulated_contents') {
      try {
        const buffer = base64ToArrayBuffer(fileData);
        blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      } catch (e) {
        blob = new Blob(['Simulated report content'], { type: 'text/plain' });
      }
    } else {
      blob = new Blob(['Simulated report content for ' + (rep.eventName || rep.title)], { type: 'text/plain' });
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = rep.filename || rep.fileName || 'report.docx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Downloading report...');
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2 style={{ fontSize: 16, fontWeight: 700, letterSpacing: -0.2 }}>MIC Administration</h2>
        <nav className="admin-nav">
          <div className={`admin-nav-item ${adminSection === 'reports' ? 'active' : ''}`} onClick={() => setAdminSection('reports')}>
            <FileText size={18} />
            <span>Uploaded Reports</span>
          </div>
          <div className={`admin-nav-item ${adminSection === 'faculty' ? 'active' : ''}`} onClick={() => setAdminSection('faculty')}>
            <Users size={18} />
            <span>Faculty Coordinators</span>
          </div>
          <div className={`admin-nav-item ${adminSection === 'config' ? 'active' : ''}`} onClick={() => setAdminSection('config')}>
            <Settings size={18} />
            <span>App Configurations</span>
          </div>
          <div className={`admin-nav-item ${adminSection === 'template' ? 'active' : ''}`} onClick={() => setAdminSection('template')}>
            <Upload size={18} />
            <span>Document Template</span>
          </div>
          <div className={`admin-nav-item ${adminSection === 'logos' ? 'active' : ''}`} onClick={() => setAdminSection('logos')}>
            <Mic size={18} />
            <span>Manage Logos</span>
          </div>
        </nav>
      </aside>
      
      <main className="admin-main">
        {/* Admin Panel: Reports */}
        {adminSection === 'reports' && (
          <div>
            <div className="admin-page-header">
              <h1 className="admin-page-title">Saved reports</h1>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
                {uploadedReportsList?.length || 0} reports total
              </span>
            </div>
            <div className="admin-card">
              {(uploadedReportsList || []).length > 0 ? (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Event Name</th>
                      <th>Saved Filename</th>
                      <th>Upload Date</th>
                      <th>Status</th>
                      <th style={{ width: 140 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(uploadedReportsList || []).map(rep => {
                      const eventName = rep.eventName || rep.title || 'Event Report';
                      const filename = rep.filename || rep.fileName || 'report.docx';
                      const uploadDate = rep.uploadDate || rep.uploadedAt || 'Today';
                      const id = rep.id || rep._id;
                      return (
                        <tr key={id}>
                          <td style={{ fontWeight: 500 }}>{eventName}</td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{filename}</td>
                          <td>{uploadDate}</td>
                          <td>
                            <span className="badge badge-success">{rep.status || 'Saved'}</span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 12 }}>
                              <button 
                                className="btn btn-link" 
                                onClick={() => handleDownloadReport(rep)}
                                style={{ display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}
                              >
                                <Download size={14} />
                                <span>Download</span>
                              </button>
                              <button 
                                className="btn btn-link" 
                                onClick={() => deleteReport(rep)}
                                style={{ display: 'flex', alignItems: 'center', gap: 4, padding: 0, color: '#b91c1c' }}
                              >
                                <Trash size={14} />
                                <span>Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)', fontSize: 14 }}>
                  No reports saved yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Admin Panel: Faculty Coordinators */}
        {adminSection === 'faculty' && (
          <div>
            <div className="admin-page-header">
              <h1 className="admin-page-title">Faculty coordinators</h1>
            </div>
            
            <div className="admin-card" style={{ marginBottom: 32 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Add Faculty Coordinator</h3>
              <form onSubmit={handleAddFaculty} className="inline-edit-form">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Employee ID</label>
                    <input 
                      type="text" 
                      className="form-input"
                      value={newFaculty.empId}
                      onChange={(e) => setNewFaculty(prev => ({ ...prev, empId: e.target.value }))}
                      placeholder="e.g. 51280"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Faculty Name</label>
                    <input 
                      type="text" 
                      className="form-input"
                      value={newFaculty.name}
                      onChange={(e) => setNewFaculty(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Dr. John Doe"
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <input 
                      type="text" 
                      className="form-input"
                      value={newFaculty.department}
                      onChange={(e) => setNewFaculty(prev => ({ ...prev, department: e.target.value }))}
                      placeholder="e.g. SCOPE"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Electronic Signature (Image file)</label>
                    <input 
                      type="file" 
                      ref={facSigInputRef}
                      onChange={handleFacultySignatureUpload}
                      accept="image/*"
                      className="form-input"
                    />
                  </div>
                </div>
                
                <button type="submit" className="btn btn-primary" style={{ width: 'max-content', alignSelf: 'flex-end' }}>
                  Add Coordinator
                </button>
              </form>
            </div>

            <div className="admin-card">
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Registered Coordinators</h3>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Emp. ID.</th>
                    <th>Faculty Name</th>
                    <th>Department</th>
                    <th>Electronic Signature</th>
                    <th style={{ width: 80 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(coordinatorsList || []).map(c => (
                    <tr key={c._id || c.empId}>
                      <td>{c.empId}</td>
                      <td style={{ fontWeight: 500 }}>{c.name}</td>
                      <td>{c.department}</td>
                      <td>
                        {c.signature ? (
                          <img src={c.signature} alt="Signature" style={{ maxHeight: 24, display: 'block' }} />
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>No signature</span>
                        )}
                      </td>
                      <td>
                        <button className="btn btn-danger" onClick={() => deleteFaculty(c)} style={{ padding: '4px 8px', fontSize: 12 }}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Admin Panel: Configurations */}
        {adminSection === 'config' && (
          <div>
            <div className="admin-page-header">
              <h1 className="admin-page-title">App Configurations</h1>
            </div>

            <div className="form-row">
              <div className="admin-card">
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Configure Event Types</h3>
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  <input 
                    type="text" 
                    className="form-input"
                    placeholder="Add new event type..."
                    value={newEventType}
                    onChange={(e) => setNewEventType(e.target.value)}
                  />
                  <button className="btn btn-primary" onClick={addEventType}>
                    <Plus size={16} />
                  </button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 240, overflowY: 'auto' }}>
                  {(eventTypesRaw || []).map(t => {
                    const name = typeof t === 'object' ? t.name : t;
                    const id = typeof t === 'object' ? t._id : t;
                    return (
                      <div key={id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', border: '1px solid var(--border-light)', borderRadius: 6 }}>
                        <span style={{ fontSize: 14 }}>{name}</span>
                        <button className="btn btn-link" onClick={() => deleteEventType(t)} style={{ color: '#b91c1c' }}>
                          <Trash size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="admin-card">
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Configure Venues List</h3>
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  <input 
                    type="text" 
                    className="form-input"
                    placeholder="Add new venue..."
                    value={newVenue}
                    onChange={(e) => setNewVenue(e.target.value)}
                  />
                  <button className="btn btn-primary" onClick={addVenue}>
                    <Plus size={16} />
                  </button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 240, overflowY: 'auto' }}>
                  {(venuesRaw || []).map(v => {
                    const name = typeof v === 'object' ? v.name : v;
                    const id = typeof v === 'object' ? v._id : v;
                    return (
                      <div key={id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', border: '1px solid var(--border-light)', borderRadius: 6 }}>
                        <span style={{ fontSize: 14 }}>{name}</span>
                        {name !== 'Classroom' && name !== 'Other' && (
                          <button className="btn btn-link" onClick={() => deleteVenue(v)} style={{ color: '#b91c1c' }}>
                            <Trash size={14} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Admin Panel: Templates */}
        {adminSection === 'template' && (
          <div>
            <div className="admin-page-header">
              <h1 className="admin-page-title">Report template</h1>
            </div>
            
            <div className="admin-card">
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 24 }}>
                <div style={{ padding: 12, backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-lg)' }}>
                  <FileText size={48} style={{ color: 'var(--text-muted)' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Current Template: template.docx</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
                    New reports are generated from this file. Replace it if your college updates the format.
                  </p>
                  <button className="btn btn-secondary" onClick={() => templateInputRef.current?.click()} style={{ gap: 6 }}>
                    <Upload size={14} />
                    Replace Official Template
                  </button>
                  <input 
                    type="file" 
                    ref={templateInputRef}
                    onChange={handleTemplateUpload}
                    accept=".docx"
                    style={{ display: 'none' }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Admin Panel: Logos */}
        {adminSection === 'logos' && (
          <div>
            <div className="admin-page-header">
              <h1 className="admin-page-title">Manage Logos</h1>
            </div>

            <div className="admin-card" style={{ marginBottom: 32 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Upload Custom Logo</h3>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleLogoUpload}
                  style={{ display: 'none' }}
                  ref={logoInputRef}
                />
                <button className="btn btn-secondary" onClick={() => logoInputRef.current?.click()}>
                  Choose Logo Image
                </button>
                <span className="text-muted" style={{ fontSize: 13 }}>
                  Only PNG or JPG. Recommended size: 200x200px.
                </span>
              </div>
            </div>

            <div className="admin-card">
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Available Logos</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
                {(logos || []).map(logo => (
                  <div key={logo.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 16, border: '1px solid var(--border-light)', borderRadius: 8, backgroundColor: 'var(--bg)', position: 'relative' }}>
                    <img src={logo.dataUrl || logo.src} alt={logo.name} style={{ height: 60, objectFit: 'contain', marginBottom: 12 }} />
                    <span style={{ fontSize: 13, fontWeight: 500, textAlign: 'center', marginBottom: 4 }}>{logo.name}</span>
                    <span className="badge" style={{ backgroundColor: logo.isOptional ? 'var(--border)' : 'var(--accent)', color: logo.isOptional ? 'var(--text-secondary)' : '#fff', fontSize: 11 }}>
                      {logo.isOptional ? 'Optional' : 'Required'}
                    </span>
                    {logo.isOptional && (
                      <button 
                        onClick={() => deleteLogo(logo.id)}
                        style={{ position: 'absolute', top: 8, right: 8, border: 'none', background: 'none', color: '#b91c1c', cursor: 'pointer', padding: 4 }}
                      >
                        <Trash size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
