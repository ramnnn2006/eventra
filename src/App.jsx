import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, Upload, ArrowRight, ArrowLeft, Check, Edit, Settings, LogOut, 
  Users, CheckCircle, Plus, Trash, MapPin, Calendar, Clock, DollarSign, 
  RefreshCw, AlertCircle, Eye, Download, Info
} from 'lucide-react';
import Papa from 'papaparse';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';

export default function App() {
  // Navigation & Auth
  const [view, setView] = useState('login'); // login, landing, create, review, preview, admin
  const [userRole, setUserRole] = useState(null); // user, admin
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Theme state
  const [accent, setAccent] = useState({ name: 'teal', h: 170, s: 75, l: 35 });
  
  // App settings & collections (persisted in localStorage)
  const [coordinators, setCoordinators] = useState([]);
  const [venues, setVenues] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [uploadedReports, setUploadedReports] = useState([]);
  
  // Form Wizard state
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    eventType: 'Workshop',
    eventTitle: '',
    startDate: '',
    endDate: '',
    startTime: '',
    duration: '',
    endTime: '',
    venue: 'MG Auditorium',
    customVenue: '',
    coord1: '',
    coord2: '',
    resourcePersonEnabled: false,
    resourcePerson: {
      name: '',
      designation: '',
      organization: '',
      place: '',
      email: '',
      mobile: ''
    },
    description: '',
    attendanceFileName: '',
    attendanceData: [],
    images: [], // array of base64 images
    brochureImage: null, // base64 brochure
    financeEnabled: false,
    finance: {
      expenditure: '',
      revenue: '',
      remarks: ''
    }
  });

  // UI status
  const [refinementLoading, setRefinementLoading] = useState(false);
  const [csvErrors, setCsvErrors] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [showRefineModal, setShowRefineModal] = useState(false);
  const [refinedText, setRefinedText] = useState('');
  
  // Admin editing states
  const [adminSection, setAdminSection] = useState('reports'); // reports, faculty, config, template
  const [newFaculty, setNewFaculty] = useState({ empId: '', name: '', department: '', signature: '' });
  const [newVenue, setNewVenue] = useState('');
  const [newEventType, setNewEventType] = useState('');
  const [customTemplate, setCustomTemplate] = useState(null); // base64 custom template docx
  
  // File inputs references
  const brochureInputRef = useRef(null);
  const imagesInputRef = useRef(null);
  const csvInputRef = useRef(null);
  const docxInputRef = useRef(null);
  const facSigInputRef = useRef(null);
  const templateInputRef = useRef(null);

  // Available accent colors
  const accentColors = [
    { name: 'teal', h: 170, s: 75, l: 35 },
    { name: 'slate', h: 215, s: 60, l: 40 },
    { name: 'steel', h: 200, s: 70, l: 35 },
    { name: 'rose', h: 350, s: 65, l: 45 },
    { name: 'charcoal', h: 220, s: 15, l: 35 }
  ];

  // Initialize data on mount
  useEffect(() => {
    // Load config from localStorage or fallback to defaults
    const savedCoordinators = localStorage.getItem('mic_coordinators');
    if (savedCoordinators) {
      setCoordinators(JSON.parse(savedCoordinators));
    } else {
      const defaults = [
        { empId: '51280', name: 'Dr. John Doe', department: 'SCOPE', signature: '/facsign.png' }
      ];
      setCoordinators(defaults);
      localStorage.setItem('mic_coordinators', JSON.stringify(defaults));
    }

    const savedVenues = localStorage.getItem('mic_venues');
    if (savedVenues) {
      setVenues(JSON.parse(savedVenues));
    } else {
      const defaults = ['MG Auditorium', 'Kasturba Auditorium', 'Kamaraj Auditorium', 'Netaji Auditorium', 'VOC Auditorium', 'Classroom', 'Online', 'Other'];
      setVenues(defaults);
      localStorage.setItem('mic_venues', JSON.stringify(defaults));
    }

    const savedEventTypes = localStorage.getItem('mic_event_types');
    if (savedEventTypes) {
      setEventTypes(JSON.parse(savedEventTypes));
    } else {
      const defaults = ['Workshop', 'Online Workshop', 'Hackathon', 'Competition', 'Guest Lecture', 'Seminar', 'Symposium', 'Conference', 'Value Added Session', 'Training Program', 'Other'];
      setEventTypes(defaults);
      localStorage.setItem('mic_event_types', JSON.stringify(defaults));
    }

    const savedReports = localStorage.getItem('mic_uploaded_reports');
    if (savedReports) {
      setUploadedReports(JSON.parse(savedReports));
    }

    // Check for draft report in progress
    const savedDraft = localStorage.getItem('mic_report_draft');
    if (savedDraft) {
      const parsedDraft = JSON.parse(savedDraft);
      setFormData(parsedDraft);
      showToast('Restored draft from last session');
    }
  }, []);

  // Update root css variables when accent changes
  useEffect(() => {
    document.documentElement.style.setProperty('--accent-h', accent.h);
    document.documentElement.style.setProperty('--accent-s', accent.s + '%');
    document.documentElement.style.setProperty('--accent-l', accent.l + '%');
  }, [accent]);

  // Autosave draft when formData changes
  useEffect(() => {
    if (view === 'create' || view === 'review') {
      localStorage.setItem('mic_report_draft', JSON.stringify(formData));
    }
  }, [formData, view]);

  // Auto calculate end time when start time or duration changes
  useEffect(() => {
    if (formData.startTime && formData.duration) {
      const computed = calculateEndTime(formData.startTime, formData.duration);
      if (computed && computed !== formData.endTime) {
        setFormData(prev => ({ ...prev, endTime: computed }));
      }
    }
  }, [formData.startTime, formData.duration]);

  // Toast System
  const showToast = (message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const calculateEndTime = (start, dur) => {
    if (!start || !dur) return '';
    try {
      let parts = start.split(' ');
      let timeParts = parts[0].split(':');
      let hours = parseInt(timeParts[0]);
      let minutes = parseInt(timeParts[1]) || 0;
      let modifier = parts[1] ? parts[1].toLowerCase() : '';

      if (modifier === 'pm' && hours < 12) hours += 12;
      if (modifier === 'am' && hours === 12) hours = 0;

      let durMinutes = 0;
      let durLower = dur.toLowerCase();
      if (durLower.includes('min')) {
        durMinutes = parseInt(durLower) || 0;
      } else if (durLower.includes('hour') || durLower.includes('hr')) {
        durMinutes = Math.round((parseFloat(durLower) || 0) * 60);
      } else if (durLower.includes('day')) {
        durMinutes = Math.round((parseFloat(durLower) || 0) * 24 * 60);
      } else {
        durMinutes = parseInt(durLower) || 0;
      }

      let date = new Date();
      date.setHours(hours);
      date.setMinutes(minutes + durMinutes);

      let endHours = date.getHours();
      let endMinutes = date.getMinutes();
      let ampm = endHours >= 12 ? 'PM' : 'AM';
      endHours = endHours % 12;
      endHours = endHours ? endHours : 12;
      let minStr = endMinutes < 10 ? '0' + endMinutes : endMinutes;

      return `${endHours}:${minStr} ${ampm}`;
    } catch (e) {
      return '';
    }
  };

  // Auth Action
  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin6767') {
      setUserRole('admin');
      setView('admin');
      showToast('Logged in as administrator');
    } else if (username === 'user' && password === 'user123') {
      setUserRole('user');
      setView('landing');
      showToast('Logged in as club coordinator');
    } else {
      showToast('Invalid username or password');
    }
  };

  const handleLogout = () => {
    setUserRole(null);
    setView('login');
    setUsername('');
    setPassword('');
    showToast('Logged out successfully');
  };

  // Image Optimization
  const processImageFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round(height * (MAX_WIDTH / width));
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round(width * (MAX_HEIGHT / height));
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  // File Upload Handlers
  const handleBrochureUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const optimized = await processImageFile(file);
      setFormData(prev => ({ ...prev, brochureImage: optimized }));
      showToast('Brochure image uploaded');
    }
  };

  const handleImagesUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newImages = [];
      for (const file of files) {
        const optimized = await processImageFile(file);
        newImages.push(optimized);
      }
      setFormData(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
      showToast(`Added ${files.length} images`);
    }
  };

  // CSV Parsing
  const handleCSVUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData(prev => ({ ...prev, attendanceFileName: file.name }));

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        // Map headers automatically
        const nameField = headers.find(h => {
          const l = h.toLowerCase();
          return l.includes('name') || l.includes('student name') || l.includes('full name');
        });
        const idField = headers.find(h => {
          const l = h.toLowerCase();
          return l.includes('reg') || l.includes('roll') || l.includes('id') || l.includes('no');
        });

        if (nameField && idField) {
          const mapped = results.data.map(row => {
            const rawId = row[idField] ? row[idField].trim() : '';
            const rawName = row[nameField] ? row[nameField].trim() : '';
            
            // Determine type
            let type = 'External';
            if (rawId) {
              const cleaned = rawId.replace(/[^a-zA-Z0-9]/g, '');
              if (cleaned.length === 5 && /^\d+$/.test(cleaned)) {
                type = 'Faculty';
              } else if (cleaned.length >= 8 && /^[0-9]{2}[a-zA-Z]{3}[0-9]{4}$/.test(cleaned.substring(0, 9))) {
                type = 'Student';
              } else if (/^[0-9]{2}[a-zA-Z]{2,3}[0-9]{4}/.test(cleaned)) {
                type = 'Student';
              }
            } else {
              type = '';
            }

            return {
              regNo: rawId,
              name: rawName,
              type: type
            };
          });

          setFormData(prev => ({ ...prev, attendanceData: mapped }));
          setCsvErrors([]);
          showToast(`Successfully parsed ${mapped.length} attendees`);
        } else {
          setCsvErrors(['Could not auto-map columns. Please check your CSV column headers. Make sure there are columns like "Name" and "Registration Number".']);
        }
      },
      error: (err) => {
        setCsvErrors(['Error parsing CSV: ' + err.message]);
      }
    });
  };

  // Groq API Call
  const handleRefineReportText = async () => {
    if (!formData.description.trim()) {
      showToast('Please write some content first');
      return;
    }
    
    setRefinementLoading(true);
    try {
      const prompt = `Refine the following event report to improve grammar, readability, and formatting. 
- Keep all facts, numbers, dates, names, and key outcomes.
- Write naturally like a human. Avoid AI-sounding buzzwords, excessive decorations, or robotic summaries.
- Keep the length between 200 and 500 words.
- Do NOT output any headings, introductions, markdown tags, or notes. Just output the clean refined text paragraphs.

Report:
${formData.description}`;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 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'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      const text = data.choices[0].message.content.trim();
      setRefinedText(text);
      setShowRefineModal(true);
    } catch (e) {
      console.error(e);
      showToast('Refinement failed. Using local fallback.');
      // Local fallback simple polishing
      setRefinedText(formData.description + "\n\n(Polished content summary here)");
      setShowRefineModal(true);
    } finally {
      setRefinementLoading(false);
    }
  };

  // Apply Refined Text
  const applyRefinedText = () => {
    setFormData(prev => ({ ...prev, description: refinedText }));
    setShowRefineModal(false);
    showToast('Refined text applied to report');
  };

  // Direct completed report upload
  const handleCompletedReportUpload = (e) => {
    const file = e.target.files?.[0];
    const eventName = prompt('Enter the Event Name for this report:');
    if (!file || !eventName) return;

    // Normalize filename
    const cleanName = eventName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_');
    const newFilename = `${cleanName}_report.docx`;

    const newReport = {
      id: Date.now(),
      eventName: eventName,
      filename: newFilename,
      uploadDate: new Date().toLocaleDateString(),
      status: 'Pending Review'
    };

    const updated = [...uploadedReports, newReport];
    setUploadedReports(updated);
    localStorage.setItem('mic_uploaded_reports', JSON.stringify(updated));
    showToast(`Report uploaded and saved as ${newFilename}`);
    
    // Clear input
    if (docxInputRef.current) docxInputRef.current.value = '';
  };

  // Reset/Discard draft
  const discardDraft = () => {
    if (window.confirm('Are you sure you want to discard this report? All progress will be lost.')) {
      localStorage.removeItem('mic_report_draft');
      setFormData({
        eventType: 'Workshop',
        eventTitle: '',
        startDate: '',
        endDate: '',
        startTime: '',
        duration: '',
        endTime: '',
        venue: 'MG Auditorium',
        customVenue: '',
        coord1: '',
        coord2: '',
        resourcePersonEnabled: false,
        resourcePerson: { name: '', designation: '', organization: '', place: '', email: '', mobile: '' },
        description: '',
        attendanceFileName: '',
        attendanceData: [],
        images: [],
        brochureImage: null,
        financeEnabled: false,
        finance: { expenditure: '', revenue: '', remarks: '' }
      });
      setStep(1);
      setView('landing');
      showToast('Draft discarded');
    }
  };

  // Generation of docx template
  const generateDocxFile = async () => {
    try {
      const response = await fetch('/template.docx');
      if (!response.ok) throw new Error('Could not fetch template file from server.');
      const buffer = await response.arrayBuffer();
      
      const zip = new PizZip(buffer);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      // Fetch details of coordinators
      const f1 = coordinators.find(c => c.empId === formData.coord1);
      const f2 = coordinators.find(c => c.empId === formData.coord2);

      const renderData = {
        event_type: formData.eventType || '',
        event_title: formData.eventTitle || '',
        event_title_upper: (formData.eventTitle || '').toUpperCase(),
        event_date: `${formData.startDate || ''} to ${formData.endDate || ''}`,
        event_time: `${formData.startTime || ''} (Duration: ${formData.duration || ''})`,
        event_venue: formData.venue === 'Classroom' || formData.venue === 'Other' ? formData.customVenue : formData.venue,
        participant_count: formData.attendanceData ? formData.attendanceData.length : 0,
        
        coord1_emp_id: f1 ? f1.empId : '',
        coord1_name: f1 ? f1.name : '',
        coord1_dept: f1 ? f1.department : '',
        
        coord2_emp_id: f2 ? f2.empId : '',
        coord2_name: f2 ? f2.name : '',
        coord2_dept: f2 ? f2.department : '',
        
        rp_name: formData.resourcePersonEnabled ? formData.resourcePerson.name : '',
        rp_designation: formData.resourcePersonEnabled ? formData.resourcePerson.designation : '',
        rp_org: formData.resourcePersonEnabled ? formData.resourcePerson.organization : '',
        rp_place: formData.resourcePersonEnabled ? formData.resourcePerson.place : '',
        rp_email: formData.resourcePersonEnabled ? formData.resourcePerson.email : '',
        rp_mobile: formData.resourcePersonEnabled ? formData.resourcePerson.mobile : '',
        
        event_description: formData.description || '',
        
        attendance_list: (formData.attendanceData || []).map((p, idx) => ({
          sl_no: idx + 1,
          reg_no: p.regNo,
          name: p.name,
          type: p.type === 'Student' ? 'S' : p.type === 'Faculty' ? 'F' : p.type === 'External' ? 'E' : ''
        })),
        
        has_finance: formData.financeEnabled,
        expenditure: formData.financeEnabled ? formData.finance.expenditure : '',
        revenue: formData.financeEnabled ? formData.finance.revenue : '',
        remarks: formData.financeEnabled ? formData.finance.remarks : '',

        // Image text placeholders to prevent compilation issues
        brochure_img: formData.brochureImage ? '[Event Brochure / Flyer Attached]' : '[No Brochure Flyer Attached]',
        images: formData.images && formData.images.length > 0 
          ? formData.images.map((_, i) => ({ img: `[Event Execution Photo ${i + 1} Attached]` })) 
          : [{ img: '[No Event Execution Photos Attached]' }],
        coord1_sig_image: f1 && f1.signature ? [{ coord1_sig_image: '[Faculty Coordinator 1 Signature Attached]' }] : [],
        coord2_sig_image: f2 && f2.signature ? [{ coord2_sig_image: '[Faculty Coordinator 2 Signature Attached]' }] : []
      };

      doc.render(renderData);

      const out = doc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

      const url = URL.createObjectURL(out);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${(formData.eventTitle || 'event').toLowerCase().replace(/\s+/g, '_')}_report.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('DOCX report generated successfully!');
    } catch (e) {
      console.error(e);
      showToast('DOCX generation error: ' + e.message);
    }
  };

  // Generate beautiful HTML-based Word Doc (preserves images perfectly)
  const generateRichWordDoc = () => {
    const f1 = coordinators.find(c => c.empId === formData.coord1);
    const f2 = coordinators.find(c => c.empId === formData.coord2);
    
    const docHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <title>MIC Event Report</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          body { font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.5; color: #000; margin: 1in; }
          .title { text-align: center; font-size: 16pt; font-weight: bold; margin-bottom: 5px; text-transform: uppercase; }
          .subtitle { text-align: center; font-size: 11pt; font-weight: bold; margin-bottom: 25px; text-transform: uppercase; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 10pt; }
          table, th, td { border: 1.5pt solid #000; }
          th, td { padding: 6px 10px; text-align: left; vertical-align: top; }
          .header-row { background-color: #f2f2f2; font-weight: bold; }
          .section-title { font-weight: bold; font-size: 12pt; margin-top: 25px; margin-bottom: 10px; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 3px; }
          .centered { text-align: center; }
          .images-grid { margin: 15px 0; }
          .image-container { display: inline-block; width: 48%; margin-right: 2%; text-align: center; margin-bottom: 15px; }
          .image-container img { width: 100%; height: auto; max-height: 250px; border: 1px solid #ddd; }
          .brochure-container { text-align: center; margin: 20px 0; }
          .brochure-container img { max-width: 80%; height: auto; max-height: 400px; }
          .signatures { margin-top: 50px; width: 100%; border: none; }
          .signatures td { border: none; padding: 0; width: 33%; text-align: center; font-weight: bold; }
          .sig-img { max-height: 45px; display: block; margin: 0 auto 5px auto; }
        </style>
      </head>
      <body>
        <div class="title">Microsoft Innovations Club</div>
        <div class="subtitle">VALUE ADDED / GUEST LECTURE / SEMINAR / WORKSHOP / SYMPOSIUM / CONFERENCE / TRAINING PROGRAM DETAILS</div>
        
        <table>
          <tr>
            <td width="30%"><b>Event type</b></td>
            <td colspan="3">${formData.eventType || ''}</td>
          </tr>
          <tr>
            <td><b>Title of the event</b></td>
            <td colspan="3">${formData.eventTitle || ''}</td>
          </tr>
          <tr>
            <td><b>Date (From – To)</b></td>
            <td colspan="3">${formData.startDate || ''} to ${formData.endDate || ''}</td>
          </tr>
          <tr>
            <td><b>Time</b></td>
            <td colspan="3">${formData.startTime || ''} (Duration: ${formData.duration || ''})</td>
          </tr>
          <tr>
            <td><b>Venue</b></td>
            <td colspan="3">${formData.venue === 'Classroom' || formData.venue === 'Other' ? formData.customVenue : formData.venue}</td>
          </tr>
          <tr>
            <td><b>No. of Participants</b></td>
            <td colspan="3">${formData.attendanceData ? formData.attendanceData.length : 0}</td>
          </tr>
          <tr class="header-row">
            <td rowspan="3" style="vertical-align: middle;"><b>Coordinator(s)</b></td>
            <td><b>Emp. ID.</b></td>
            <td><b>Faculty Name</b></td>
            <td><b>Department</b></td>
          </tr>
          <tr>
            <td>${f1 ? f1.empId : ''}</td>
            <td>${f1 ? f1.name : ''}</td>
            <td>${f1 ? f1.department : ''}</td>
          </tr>
          <tr>
            <td>${f2 ? f2.empId : ''}</td>
            <td>${f2 ? f2.name : ''}</td>
            <td>${f2 ? f2.department : ''}</td>
          </tr>
          ${formData.resourcePersonEnabled ? `
          <tr>
            <td><b>Resource Person Name</b></td>
            <td colspan="3">${formData.resourcePerson.name || ''}</td>
          </tr>
          <tr>
            <td><b>Designation</b></td>
            <td colspan="3">${formData.resourcePerson.designation || ''}</td>
          </tr>
          <tr>
            <td><b>Organization Details</b></td>
            <td colspan="3">${formData.resourcePerson.organization || ''}</td>
          </tr>
          <tr>
            <td><b>Place</b></td>
            <td colspan="3">${formData.resourcePerson.place || ''}</td>
          </tr>
          <tr>
            <td><b>E-mail</b></td>
            <td colspan="3">${formData.resourcePerson.email || ''}</td>
          </tr>
          <tr>
            <td><b>Mobile no.</b></td>
            <td colspan="3">${formData.resourcePerson.mobile || ''}</td>
          </tr>
          ` : ''}
        </table>

        <div style="page-break-before: always;"></div>

        ${formData.brochureImage ? `
          <div class="section-title">Brochure / Circular of the Event / Programme Schedule</div>
          <div class="brochure-container">
            <img src="${formData.brochureImage}" alt="Event Brochure" />
          </div>
          <div style="page-break-before: always;"></div>
        ` : ''}

        <div class="title" style="margin-top: 20px;">A REPORT ON ${(formData.eventTitle || '').toUpperCase()}</div>
        <div style="margin-top: 15px; text-align: justify;">
          ${(formData.description || '').split('\n').map(p => `<p>${p}</p>`).join('')}
        </div>

        ${formData.images && formData.images.length > 0 ? `
          <div class="section-title">Geotagged photos of the event with caption and date</div>
          <div class="images-grid">
            ${formData.images.map((img, i) => `
              <div class="image-container">
                <img src="${img}" alt="Event Photo ${i+1}" />
                <div style="font-size: 9pt; margin-top: 5px;">Photo ${i+1}: Event execution. Date: ${formData.startDate || ''}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <div style="page-break-before: always;"></div>

        <div class="section-title">Attendance</div>
        <div class="subtitle" style="text-align: left; margin-bottom: 10px;">
          <b>Event Name:</b> ${formData.eventTitle || ''}<br/>
          <b>Date:</b> ${formData.startDate || ''}
        </div>
        
        <table>
          <tr class="header-row">
            <th width="8%">Sl. No.</th>
            <th width="25%">Reg. No. / Emp. ID.</th>
            <th>Name</th>
            <th width="15%">Signature</th>
            <th width="15%">Type</th>
          </tr>
          ${formData.attendanceData.map((p, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td>${p.regNo || ''}</td>
              <td>${p.name || ''}</td>
              <td></td>
              <td>${p.type === 'Student' ? 'S' : p.type === 'Faculty' ? 'F' : p.type === 'External' ? 'E' : ''}</td>
            </tr>
          `).join('')}
        </table>

        ${formData.financeEnabled ? `
          <div style="page-break-before: always;"></div>
          <div class="section-title">Expenditure / Revenue Details of the Event</div>
          <table>
            <tr class="header-row">
              <th>Expenditure (Rs.)</th>
              <th>Revenue (Rs.)</th>
              <th>Remarks</th>
            </tr>
            <tr>
              <td>${formData.finance.expenditure || '0'}</td>
              <td>${formData.finance.revenue || '0'}</td>
              <td>${formData.finance.remarks || 'None'}</td>
            </tr>
          </table>
        ` : ''}

        <table class="signatures" style="margin-top: 60px;">
          <tr>
            <td>
              ${f1 && f1.signature ? `<img class="sig-img" src="${f1.signature}" alt="Signature" />` : ''}
              Signature of the Coordinator
            </td>
            <td>
              <!-- Blank for Student Welfare -->
              Signature of Asst. Director Student Welfare
            </td>
            <td>
              <!-- Blank for Dean -->
              Signature of Dean / Director
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + docHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(formData.eventTitle || 'event').toLowerCase().replace(/\s+/g, '_')}_report.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Rich Word report (with images) downloaded!');
  };

  // Add faculty coordinator in admin panel
  const handleAddFaculty = (e) => {
    e.preventDefault();
    if (!newFaculty.empId || !newFaculty.name || !newFaculty.department) {
      showToast('Please fill all fields');
      return;
    }

    const updated = [...coordinators, newFaculty];
    setCoordinators(updated);
    localStorage.setItem('mic_coordinators', JSON.stringify(updated));
    setNewFaculty({ empId: '', name: '', department: '', signature: '' });
    showToast('Faculty coordinator added');
    if (facSigInputRef.current) facSigInputRef.current.value = '';
  };

  const handleFacultySignatureUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setNewFaculty(prev => ({ ...prev, signature: event.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const deleteFaculty = (empId) => {
    if (window.confirm('Delete this coordinator?')) {
      const updated = coordinators.filter(c => c.empId !== empId);
      setCoordinators(updated);
      localStorage.setItem('mic_coordinators', JSON.stringify(updated));
      showToast('Faculty coordinator deleted');
    }
  };

  // Config adjustments in admin panel
  const addVenue = () => {
    if (newVenue.trim() && !venues.includes(newVenue.trim())) {
      const updated = [...venues, newVenue.trim()];
      setVenues(updated);
      localStorage.setItem('mic_venues', JSON.stringify(updated));
      setNewVenue('');
      showToast('Venue added');
    }
  };

  const deleteVenue = (venue) => {
    const updated = venues.filter(v => v !== venue);
    setVenues(updated);
    localStorage.setItem('mic_venues', JSON.stringify(updated));
  };

  const addEventType = () => {
    if (newEventType.trim() && !eventTypes.includes(newEventType.trim())) {
      const updated = [...eventTypes, newEventType.trim()];
      setEventTypes(updated);
      localStorage.setItem('mic_event_types', JSON.stringify(updated));
      setNewEventType('');
      showToast('Event type added');
    }
  };

  const deleteEventType = (type) => {
    const updated = eventTypes.filter(t => t !== type);
    setEventTypes(updated);
    localStorage.setItem('mic_event_types', JSON.stringify(updated));
  };

  // Replaced template upload
  const handleTemplateUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      showToast('System template replaced locally (Simulated)');
      if (templateInputRef.current) templateInputRef.current.value = '';
    }
  };

  return (
    <div className="app-container">
      {/* Top navbar (if logged in) */}
      {view !== 'login' && (
        <nav className="top-nav">
          <div className="top-nav-logo">
            <FileText size={18} className="text-muted" />
            <span>MIC Event Report Generator</span>
            {userRole === 'admin' && <span className="badge badge-info" style={{ marginLeft: 8 }}>Admin Workspace</span>}
          </div>
          <div className="top-nav-actions">
            {/* Theme picker */}
            <div className="accent-picker">
              {accentColors.map(color => (
                <div 
                  key={color.name}
                  className={`accent-dot ${accent.name === color.name ? 'active' : ''}`}
                  style={{ backgroundColor: `hsl(${color.h}, ${color.s}%, ${color.l}%)` }}
                  onClick={() => setAccent(color)}
                />
              ))}
            </div>
            
            {userRole === 'admin' ? (
              <>
                <button className="btn btn-secondary" onClick={() => setView(view === 'admin' ? 'landing' : 'admin')}>
                  {view === 'admin' ? 'Coordinators View' : 'Admin Workspace'}
                </button>
                <button className="btn btn-link" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <button className="btn btn-link" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            )}
          </div>
        </nav>
      )}

      {/* Main layout */}
      <main className="main-content">
        {/* VIEW: LOGIN */}
        {view === 'login' && (
          <div className="login-card">
            <div className="landing-illustration">
              <FileText size={32} style={{ color: 'var(--accent)' }} />
            </div>
            <h2 className="login-title">MIC Event Report Generator</h2>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. johndoe"
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
                  placeholder="Password"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }}>
                Login
              </button>
            </form>
          </div>
        )}

        {/* VIEW: LANDING */}
        {view === 'landing' && (
          <div className="landing-page">
            <div className="landing-illustration">
              <FileText size={32} style={{ color: 'var(--accent)' }} />
            </div>
            <h1 className="landing-title">Event Report Generator</h1>
            <div className="landing-actions">
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
        )}

        {/* VIEW: CREATE REPORT WIZARD */}
        {view === 'create' && (
          <div className="form-wizard">
            <div className="wizard-header">
              <span className="wizard-title">{formData.eventTitle || 'New Event Report'}</span>
              <span className="wizard-progress">Step {step} of 7</span>
            </div>
            
            <div className="wizard-body">
              {/* Step 1: Event Details */}
              {step === 1 && (
                <div>
                  <h2 className="step-question">Tell us about the event</h2>
                  <p className="step-description">Fill out the basic identifiers and dates for this report.</p>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Event Type</label>
                      <select 
                        className="form-input"
                        value={formData.eventType}
                        onChange={(e) => setFormData(prev => ({ ...prev, eventType: e.target.value }))}
                      >
                        {eventTypes.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Event Title</label>
                      <input 
                        type="text" 
                        className="form-input"
                        placeholder="e.g. Android Development Workshop"
                        value={formData.eventTitle}
                        onChange={(e) => setFormData(prev => ({ ...prev, eventTitle: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Start Date</label>
                      <input 
                        type="date" 
                        className="form-input"
                        value={formData.startDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">End Date</label>
                      <input 
                        type="date" 
                        className="form-input"
                        value={formData.endDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Start Time</label>
                      <input 
                        type="text" 
                        className="form-input"
                        placeholder="e.g. 10:00 AM"
                        value={formData.startTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Duration</label>
                      <input 
                        type="text" 
                        className="form-input"
                        placeholder="e.g. 90 minutes, 3 hours"
                        value={formData.duration}
                        onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Venue</label>
                      <select 
                        className="form-input"
                        value={formData.venue}
                        onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
                      >
                        {venues.map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </div>

                    {(formData.venue === 'Classroom' || formData.venue === 'Other') && (
                      <div className="form-group">
                        <label className="form-label">Custom Venue Name</label>
                        <input 
                          type="text" 
                          className="form-input"
                          placeholder="e.g. Netaji block 402"
                          value={formData.customVenue}
                          onChange={(e) => setFormData(prev => ({ ...prev, customVenue: e.target.value }))}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Faculty Coordinators */}
              {step === 2 && (
                <div>
                  <h2 className="step-question">Who were the coordinators?</h2>
                  <p className="step-description">Select up to two faculty coordinators for this event.</p>
                  
                  <div className="form-group" style={{ marginBottom: 24 }}>
                    <label className="form-label">Faculty Coordinator 1</label>
                    <select 
                      className="form-input"
                      value={formData.coord1}
                      onChange={(e) => setFormData(prev => ({ ...prev, coord1: e.target.value }))}
                    >
                      <option value="">Select Faculty...</option>
                      {coordinators.map(c => (
                        <option key={c.empId} value={c.empId}>{c.name} ({c.department})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Faculty Coordinator 2 (Optional)</label>
                    <select 
                      className="form-input"
                      value={formData.coord2}
                      onChange={(e) => setFormData(prev => ({ ...prev, coord2: e.target.value }))}
                    >
                      <option value="">Select Faculty...</option>
                      {coordinators.map(c => (
                        <option key={c.empId} value={c.empId}>{c.name} ({c.department})</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Step 3: Resource Person */}
              {step === 3 && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div>
                      <h2 className="step-question">Did you invite a Resource Person?</h2>
                      <p className="step-description" style={{ marginBottom: 0 }}>Toggle this section to add guest details.</p>
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
                </div>
              )}

              {/* Step 4: Event Report & Refinement */}
              {step === 4 && (
                <div>
                  <h2 className="step-question">Write the event report</h2>
                  <p className="step-description">Paste the summary, details, and outcomes of the event (200-500 words).</p>
                  
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

              {/* Step 5: Attendance CSV Upload */}
              {step === 5 && (
                <div>
                  <h2 className="step-question">Upload participant attendance</h2>
                  <p className="step-description">Provide a CSV file of participant attendance. Columns will be auto-mapped.</p>
                  
                  <div className="file-dropzone" onClick={() => csvInputRef.current?.click()}>
                    <Upload size={32} className="dropzone-icon" />
                    <p className="dropzone-text">Drag and drop your attendance CSV file here, or click to browse</p>
                    <p className="dropzone-hint">Accepted file type: .csv</p>
                  </div>
                  
                  <input 
                    type="file" 
                    ref={csvInputRef} 
                    onChange={handleCSVUpload} 
                    accept=".csv" 
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

              {/* Step 6: Brochure & Images */}
              {step === 6 && (
                <div>
                  <h2 className="step-question">Add event media</h2>
                  <p className="step-description">Upload the flyer/brochure and at least two photos of the event.</p>
                  
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
                    <label className="form-label">Event Execution Photos (Minimum 2)</label>
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

              {/* Step 7: Finance Section */}
              {step === 7 && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div>
                      <h2 className="step-question">Any expenditure details?</h2>
                      <p className="step-description" style={{ marginBottom: 0 }}>Toggle to include expenditure and revenue data.</p>
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
                  if (step === 7) {
                    setView('review');
                  } else {
                    setStep(step + 1);
                  }
                }}
              >
                <span>{step === 7 ? 'Review Summary' : 'Next'}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* VIEW: REVIEW & EDIT */}
        {view === 'review' && (
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
                <button className="btn btn-link" onClick={() => { setView('create'); setStep(2); }}>
                  Edit
                </button>
              </div>
              <div className="review-data-grid">
                <div className="review-data-item">
                  <span className="review-data-label">Coordinator 1</span>
                  <span className="review-data-value">
                    {coordinators.find(c => c.empId === formData.coord1)?.name || 'None selected'}
                  </span>
                </div>
                <div className="review-data-item">
                  <span className="review-data-label">Coordinator 2</span>
                  <span className="review-data-value">
                    {coordinators.find(c => c.empId === formData.coord2)?.name || 'None selected'}
                  </span>
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
                <button className="btn btn-link" onClick={() => { setView('create'); setStep(3); }}>
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
                <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Not enabled for this report.</div>
              )}
            </div>

            {/* Section 4: Report write up */}
            <div className="review-section-card">
              <div className="review-section-header">
                <span className="review-section-title">
                  <CheckCircle size={16} style={{ color: 'var(--accent)' }} />
                  <span>4. Report Text Outcomes</span>
                </span>
                <button className="btn btn-link" onClick={() => { setView('create'); setStep(4); }}>
                  Edit
                </button>
              </div>
              <div style={{ fontSize: 14, textOverflow: 'ellipsis', whiteSpace: 'pre-wrap', maxHeight: 120, overflowY: 'auto', backgroundColor: '#fafafb', padding: 12, borderRadius: 6, border: '1px solid #eee' }}>
                {formData.description || 'No report write-up added yet.'}
              </div>
            </div>

            {/* Section 5: Attendance */}
            <div className="review-section-card">
              <div className="review-section-header">
                <span className="review-section-title">
                  <CheckCircle size={16} style={{ color: 'var(--accent)' }} />
                  <span>5. Attendance & CSV Upload</span>
                </span>
                <button className="btn btn-link" onClick={() => { setView('create'); setStep(5); }}>
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
                  <span>6. Uploaded Media & Brochure</span>
                </span>
                <button className="btn btn-link" onClick={() => { setView('create'); setStep(6); }}>
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
                <button className="btn btn-link" onClick={() => { setView('create'); setStep(7); }}>
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
                <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Not enabled for this report.</div>
              )}
            </div>
          </div>
        )}

        {/* VIEW: DOCUMENT PREVIEW */}
        {view === 'preview' && (
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
                    <img src={formData.brochureImage} alt="Event Flyer" style={{ maxWidth: '60%', height: 'auto', border: '1px solid #ddd' }} />
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
                      <th style={{ width: '25%' }}>Reg. No. / Emp. ID.</th>
                      <th>Name</th>
                      <th style={{ width: '15%' }}>Signature</th>
                      <th style={{ width: '15%' }}>Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.attendanceData.map((p, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td>{p.regNo}</td>
                        <td>{p.name}</td>
                        <td></td>
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
        )}

        {/* VIEW: ADMIN INTERFACE */}
        {view === 'admin' && (
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
              </nav>
            </aside>
            
            <main className="admin-main">
              {/* Admin Panel: Reports */}
              {adminSection === 'reports' && (
                <div>
                  <div className="admin-page-header">
                    <h1 className="admin-page-title">Uploaded completed reports</h1>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
                      {uploadedReports.length} reports total
                    </span>
                  </div>
                  <div className="admin-card">
                    {uploadedReports.length > 0 ? (
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Event Name</th>
                            <th>Saved Filename</th>
                            <th>Upload Date</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {uploadedReports.map(rep => (
                            <tr key={rep.id}>
                              <td style={{ fontWeight: 500 }}>{rep.eventName}</td>
                              <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{rep.filename}</td>
                              <td>{rep.uploadDate}</td>
                              <td>
                                <span className="badge badge-success">{rep.status}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)', fontSize: 14 }}>
                        No event reports uploaded for review yet.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Admin Panel: Faculty Coordinators */}
              {adminSection === 'faculty' && (
                <div>
                  <div className="admin-page-header">
                    <h1 className="admin-page-title">Manage Faculty Coordinators</h1>
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
                        {coordinators.map(c => (
                          <tr key={c.empId}>
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
                              <button className="btn btn-danger" onClick={() => deleteFaculty(c.empId)} style={{ padding: '4px 8px', fontSize: 12 }}>
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
                        {eventTypes.map(t => (
                          <div key={t} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', border: '1px solid var(--border-light)', borderRadius: 6 }}>
                            <span style={{ fontSize: 14 }}>{t}</span>
                            <button className="btn btn-link" onClick={() => deleteEventType(t)} style={{ color: '#b91c1c' }}>
                              <Trash size={14} />
                            </button>
                          </div>
                        ))}
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
                        {venues.map(v => (
                          <div key={v} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', border: '1px solid var(--border-light)', borderRadius: 6 }}>
                            <span style={{ fontSize: 14 }}>{v}</span>
                            {v !== 'Classroom' && v !== 'Other' && (
                              <button className="btn btn-link" onClick={() => deleteVenue(v)} style={{ color: '#b91c1c' }}>
                                <Trash size={14} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Admin Panel: Templates */}
              {adminSection === 'template' && (
                <div>
                  <div className="admin-page-header">
                    <h1 className="admin-page-title">Manage Official templates</h1>
                  </div>
                  
                  <div className="admin-card">
                    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 24 }}>
                      <div style={{ padding: 12, backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-lg)' }}>
                        <FileText size={48} style={{ color: 'var(--text-muted)' }} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Current Template: template.docx</h3>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
                          This template is used automatically to construct new event report documents.
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
            </main>
          </div>
        )}
      </main>

      {/* Refined text comparison modal */}
      {showRefineModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 640 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
              <RefreshCw size={18} style={{ color: 'var(--accent)' }} />
              <span>Review Groq LLM Refinement</span>
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Original Draft</span>
                <div style={{ fontSize: 13, padding: 12, border: '1px solid var(--border-medium)', borderRadius: 6, maxHeight: 240, overflowY: 'auto', backgroundColor: '#fcfcfd', whiteSpace: 'pre-wrap' }}>
                  {formData.description}
                </div>
              </div>
              
              <div>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)', display: 'block', marginBottom: 6 }}>Refined Outcomes Text</span>
                <div style={{ fontSize: 13, padding: 12, border: '1px solid var(--accent-border)', borderRadius: 6, maxHeight: 240, overflowY: 'auto', backgroundColor: 'var(--accent-light)', whiteSpace: 'pre-wrap' }}>
                  {refinedText}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button className="btn btn-secondary" onClick={() => setShowRefineModal(false)}>
                Discard Refinement
              </button>
              <button className="btn btn-primary" onClick={applyRefinedText}>
                Accept & Apply Text
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notifications container */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className="toast">
            <Info size={16} />
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
