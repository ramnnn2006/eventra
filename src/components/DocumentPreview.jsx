import React from 'react';
import { ArrowLeft, Download } from 'lucide-react';

export default function DocumentPreview({
  formData,
  setView,
  generateDocxFile,
  generateRichWordDoc,
  coordinators,
  logos
}) {
  // Compute ordered logos based on placement rules
  const activeOptionalLogos = logos.filter(l => l.isOptional && formData.selectedLogos.includes(l.id));
  const leftLogo = logos.find(l => l.id === 'vitc');
  const centerLogo = logos.find(l => l.id === 'mic');
  const rightLogo = logos.find(l => l.id === 'swc');

  const half = Math.ceil(activeOptionalLogos.length / 2);
  const leftGroup = activeOptionalLogos.slice(0, half);
  const rightGroup = activeOptionalLogos.slice(half);

  const orderedLogos = [
    leftLogo,
    ...leftGroup,
    centerLogo,
    ...rightGroup,
    rightLogo
  ].filter(Boolean);

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className="preview-nav">
        <button className="btn btn-secondary" onClick={() => setView('review')} style={{ gap: 6 }}>
          <ArrowLeft size={16} />
          <span>Return to Summary</span>
        </button>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary" onClick={generateDocxFile} style={{ gap: 6 }}>
            <Download size={16} />
            <span>Download DOCX Template</span>
          </button>
          <button className="btn btn-primary" onClick={generateRichWordDoc} style={{ gap: 6 }}>
            <Download size={16} />
            <span>Download Rich Word Document</span>
          </button>
        </div>
      </div>

      <div className="preview-container">
        {/* Logos Header (Commented out as requested)
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingBottom: 16, borderBottom: '1.5pt solid #000' }}>
          {orderedLogos.map((logo) => (
            <img 
              key={logo.id} 
              src={logo.dataUrl || logo.src} 
              alt={logo.name} 
              style={{ height: 48, maxWidth: 120, objectFit: 'contain' }} 
            />
          ))}
        </div>
        */}

        {/* Report Header */}
        <div className="doc-header">Microsoft Innovations Club</div>
        <div className="doc-subtitle">VALUE ADDED / GUEST LECTURE / SEMINAR / WORKSHOP / SYMPOSIUM / CONFERENCE / TRAINING PROGRAM DETAILS</div>
        
        {/* Details table */}
        <table className="doc-table">
          <tbody>
            <tr>
              <td style={{ width: '30%' }}><b>Event type</b></td>
              <td colSpan="3">{formData.eventType}</td>
            </tr>
            <tr>
              <td><b>Title of the event</b></td>
              <td colSpan="3">{formData.eventTitle}</td>
            </tr>
            <tr>
              <td><b>Date (From – To)</b></td>
              <td colSpan="3">{formData.startDate} to {formData.endDate}</td>
            </tr>
            <tr>
              <td><b>Time</b></td>
              <td colSpan="3">{formData.startTime} (Duration: {formData.duration})</td>
            </tr>
            <tr>
              <td><b>Venue</b></td>
              <td colSpan="3">
                {formData.venue === 'Classroom' || formData.venue === 'Other' ? formData.customVenue : formData.venue}
              </td>
            </tr>
            <tr>
              <td><b>No. of Participants</b></td>
              <td colSpan="3">{formData.attendanceData.length}</td>
            </tr>
            <tr style={{ backgroundColor: '#f2f2f2', fontWeight: 'bold' }}>
              <td rowSpan="3" style={{ verticalAlign: 'middle' }}>Coordinator(s)</td>
              <td>Emp. ID.</td>
              <td>Faculty Name</td>
              <td>Department</td>
            </tr>
            <tr>
              <td>{coordinators.find(c => c.empId === formData.coord1)?.empId || ''}</td>
              <td>{coordinators.find(c => c.empId === formData.coord1)?.name || ''}</td>
              <td>{coordinators.find(c => c.empId === formData.coord1)?.department || ''}</td>
            </tr>
            <tr>
              <td>{coordinators.find(c => c.empId === formData.coord2)?.empId || ''}</td>
              <td>{coordinators.find(c => c.empId === formData.coord2)?.name || ''}</td>
              <td>{coordinators.find(c => c.empId === formData.coord2)?.department || ''}</td>
            </tr>
            {formData.resourcePersonEnabled && (
              <>
                <tr>
                  <td><b>Resource Person Name</b></td>
                  <td colSpan="3">{formData.resourcePerson.name}</td>
                </tr>
                <tr>
                  <td><b>Designation</b></td>
                  <td colSpan="3">{formData.resourcePerson.designation}</td>
                </tr>
                <tr>
                  <td><b>Organization Details</b></td>
                  <td colSpan="3">{formData.resourcePerson.organization}</td>
                </tr>
                <tr>
                  <td><b>Place</b></td>
                  <td colSpan="3">{formData.resourcePerson.place}</td>
                </tr>
                <tr>
                  <td><b>E-mail</b></td>
                  <td colSpan="3">{formData.resourcePerson.email}</td>
                </tr>
                <tr>
                  <td><b>Mobile no.</b></td>
                  <td colSpan="3">{formData.resourcePerson.mobile}</td>
                </tr>
              </>
            )}
          </tbody>
        </table>

        {/* Brochure Section */}
        {formData.brochureImage && (
          <div style={{ marginTop: 40, borderTop: '1px dashed #ddd', paddingTop: 20 }}>
            <div style={{ fontWeight: 'bold', fontSize: 13, marginBottom: 12, textTransform: 'uppercase' }}>
              Brochure / Circular of the Event / Programme Schedule
            </div>
            <div style={{ textAlign: 'center' }}>
              <img src={formData.brochureImage} alt="Event Poster" style={{ maxWidth: '60%', height: 'auto', border: '1px solid #ddd' }} />
            </div>
          </div>
        )}

        {/* Report Write-up outcomes */}
        <div style={{ marginTop: 40, borderTop: '1px dashed #ddd', paddingTop: 20 }}>
          <div className="doc-header" style={{ fontSize: 14 }}>A REPORT ON {(formData.eventTitle || '').toUpperCase()}</div>
          <div style={{ textIndent: '40px', textAlign: 'justify', whiteSpace: 'pre-wrap', fontSize: 12, lineHeight: 1.6 }}>
            {formData.description}
          </div>
        </div>

        {/* Images list */}
        {formData.images.length > 0 && (
          <div style={{ marginTop: 40, borderTop: '1px dashed #ddd', paddingTop: 20 }}>
            <div style={{ fontWeight: 'bold', fontSize: 13, marginBottom: 12, textTransform: 'uppercase' }}>
              Geotagged photos of the event with caption and date (at least 2 Nos)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {formData.images.map((img, idx) => (
                <div key={idx} style={{ textAlign: 'center', border: '1px solid #eee', padding: 8 }}>
                  <img src={img} alt={`Event Execution ${idx+1}`} style={{ width: '100%', height: 'auto', maxHeight: 200, objectFit: 'cover' }} />
                  <div style={{ fontSize: 9, marginTop: 4, fontStyle: 'italic' }}>
                    Photo {idx+1}: Event in progress. Date: {formData.startDate}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attendance Table */}
        <div style={{ marginTop: 40, borderTop: '1px dashed #ddd', paddingTop: 20 }}>
          <div className="doc-header" style={{ fontSize: 14 }}>Attendance</div>
          <div style={{ fontWeight: 'bold', fontSize: 11, marginBottom: 12 }}>
            <div>Event Name: {formData.eventTitle}</div>
            <div>Date: {formData.startDate}</div>
          </div>
          
          <table className="doc-table">
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2', fontWeight: 'bold' }}>
                <th style={{ width: '8%' }}>Sl. No.</th>
                <th style={{ width: '30%' }}>Reg. No. / Emp. ID.</th>
                <th>Name</th>
                <th style={{ width: '15%' }}>Type</th>
              </tr>
            </thead>
            <tbody>
              {formData.attendanceData.map((p, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>{p.regNo}</td>
                  <td>{p.name}</td>
                  <td>{p.type === 'Student' ? 'S' : p.type === 'Faculty' ? 'F' : p.type === 'External' ? 'E' : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Finance details */}
        {formData.financeEnabled && (
          <div style={{ marginTop: 40, borderTop: '1px dashed #ddd', paddingTop: 20 }}>
            <div className="doc-header" style={{ fontSize: 14 }}>Expenditure / Revenue Details of the Event</div>
            <table className="doc-table">
              <thead>
                <tr style={{ backgroundColor: '#f2f2f2', fontWeight: 'bold' }}>
                  <th>Expenditure (Rs.)</th>
                  <th>Revenue (Rs.)</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{formData.finance.expenditure || '0'}</td>
                  <td>{formData.finance.revenue || '0'}</td>
                  <td>{formData.finance.remarks || 'None'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Document Signatures */}
        <div className="doc-signatures">
          <div className="doc-sig-block">
            {coordinators.find(c => c.empId === formData.coord1)?.signature && (
              <img 
                src={coordinators.find(c => c.empId === formData.coord1)?.signature} 
                alt="Signature" 
                className="doc-sig-image" 
              />
            )}
            <div>Signature of the Coordinator</div>
          </div>
          <div className="doc-sig-block" style={{ justifyContent: 'flex-end' }}>
            <div>Signature of Asst. Director Student Welfare</div>
          </div>
          <div className="doc-sig-block" style={{ justifyContent: 'flex-end' }}>
            <div>Signature of the Dean / Director</div>
          </div>
        </div>
      </div>
    </div>
  );
}
