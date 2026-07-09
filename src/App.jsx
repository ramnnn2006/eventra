import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, Upload, ArrowRight, ArrowLeft, Check, Edit, Settings, LogOut, 
  Users, CheckCircle, Plus, Trash, MapPin, Calendar, Clock, DollarSign, 
  RefreshCw, AlertCircle, Eye, Download, Info, Sparkles, Mic
} from 'lucide-react';
import Papa from 'papaparse';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { useQuery, useMutation } from "convex/react";

// Import modular components
import LoginCard from './components/LoginCard';
import PortalLanding from './components/PortalLanding';
import CoordinatorLanding from './components/CoordinatorLanding';
import ReportWizard from './components/ReportWizard';
import ReviewSummary from './components/ReviewSummary';
import DocumentPreview from './components/DocumentPreview';
import AdminPanel from './components/AdminPanel';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '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';

const escapeHtml = (unsafe) => {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// base64/ArrayBuffer helpers
function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToArrayBuffer(base64) {
  const binary_string = window.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

async function fetchImageAsBase64(url) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.error('Failed to fetch image as base64', url, e);
    return null;
  }
}

function ConvexWrapper({ children, setDb }) {
  const coordinators = useQuery("db:getCoordinators");
  const venues = useQuery("db:getVenues");
  const eventTypes = useQuery("db:getEventTypes");
  const reports = useQuery("db:getReports");

  const addCoordinator = useMutation("db:addCoordinator");
  const removeCoordinator = useMutation("db:removeCoordinator");
  const addVenue = useMutation("db:addVenue");
  const removeVenue = useMutation("db:removeVenue");
  const addEventType = useMutation("db:addEventType");
  const removeEventType = useMutation("db:removeEventType");
  const addReport = useMutation("db:addReport");
  const removeReport = useMutation("db:removeReport");

  useEffect(() => {
    setDb({
      coordinators: coordinators || [],
      venues: venues || [],
      eventTypes: eventTypes || [],
      uploadedReports: reports || [],
      addCoordinator: async (empId, name, department, signature) => {
        await addCoordinator({ empId, name, department, signature });
      },
      removeCoordinator: async (id) => {
        await removeCoordinator({ id });
      },
      addVenue: async (name) => {
        await addVenue({ name });
      },
      removeVenue: async (id) => {
        await removeVenue({ id });
      },
      addEventType: async (name) => {
        await addEventType({ name });
      },
      removeEventType: async (id) => {
        await removeEventType({ id });
      },
      addReport: async (title, type, date, fileName, fileData) => {
        await addReport({ title, type, date, fileName, fileData, uploadedAt: new Date().toLocaleDateString() });
      },
      removeReport: async (id) => {
        await removeReport({ id });
      }
    });
  }, [
    coordinators, venues, eventTypes, reports,
    addCoordinator, removeCoordinator, addVenue, removeVenue,
    addEventType, removeEventType, addReport, removeReport,
    setDb
  ]);

  return children;
}

export default function App() {
  const isConvexEnabled = !!import.meta.env.VITE_CONVEX_URL;
  const [convexDb, setConvexDb] = useState(null);

  // Navigation & Auth (Session persisted via sessionStorage)
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [userRole, setUserRole] = useState(() => sessionStorage.getItem('mic_user_role') || null);
  const [view, setView] = useState('landing'); // landing, create, review, preview
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Sync state on popstate navigation
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };
  
  // Theme state
  const [accent, setAccent] = useState({ name: 'teal', h: 170, s: 75, l: 35 });
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    document.body.className = theme === 'dark' ? 'dark-theme' : '';
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  // App settings & collections (persisted in localStorage)
  const [coordinators, setCoordinators] = useState([]);
  const [venues, setVenues] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [uploadedReports, setUploadedReports] = useState([]);
  const [logos, setLogos] = useState([]);
  const [customTemplate, setCustomTemplate] = useState(null);
  
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
    coord1: '50930',
    coord2: '51327',
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
    },
    selectedLogos: [] // Selected optional logos list
  });

  // UI status
  const [refinementLoading, setRefinementLoading] = useState(false);
  const [csvErrors, setCsvErrors] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [showRefineModal, setShowRefineModal] = useState(false);
  const [refinedText, setRefinedText] = useState('');

  // Smart Fill state
  const [smartFillOpen, setSmartFillOpen] = useState(false);
  const [smartFillMode, setSmartFillMode] = useState('text'); // 'text' or 'voice'
  const [smartFillInput, setSmartFillInput] = useState('');
  const [smartFillLoading, setSmartFillLoading] = useState(false);
  const [smartFillFlags, setSmartFillFlags] = useState([]); // fields that couldn't be extracted
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [smartFillActiveField, setSmartFillActiveField] = useState(null); // field being prompted for
  const [smartFillAwaitingVoiceAnswer, setSmartFillAwaitingVoiceAnswer] = useState(false);
  const [voiceSpeakPrompt, setVoiceSpeakPrompt] = useState('');
  
  // Admin editing states
  const [adminSection, setAdminSection] = useState('reports'); // reports, faculty, config, template, logos
  const [newFaculty, setNewFaculty] = useState({ empId: '', name: '', department: '', signature: '' });
  const [newVenue, setNewVenue] = useState('');
  const [newEventType, setNewEventType] = useState('');
  
  // File inputs references
  const brochureInputRef = useRef(null);
  const imagesInputRef = useRef(null);
  const csvInputRef = useRef(null);
  const docxInputRef = useRef(null);
  const facSigInputRef = useRef(null);
  const templateInputRef = useRef(null);
  const logoInputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Available accent colors
  const accentColors = [
    { name: 'teal', h: 170, s: 75, l: 35 },
    { name: 'slate', h: 215, s: 60, l: 40 },
    { name: 'steel', h: 200, s: 70, l: 35 },
    { name: 'rose', h: 350, s: 65, l: 45 },
    { name: 'charcoal', h: 220, s: 15, l: 35 }
  ];

  // Role based redirection control
  useEffect(() => {
    if (userRole) {
      if (currentPath === '/') {
        navigate(userRole === 'admin' ? '/admin' : '/user');
      } else if (currentPath === '/admin' || currentPath === '/mic') {
        if (userRole !== 'admin') {
          navigate('/user');
          showToast('Access denied: Administrator role required');
        }
      }
    }
  }, [currentPath, userRole]);

  // Initialize data on mount
  useEffect(() => {
    // Load config from localStorage or fallback to defaults
    const savedCoordinators = localStorage.getItem('mic_coordinators');
    let coords = [];
    if (savedCoordinators) {
      try {
        coords = JSON.parse(savedCoordinators);
      } catch (e) {
        coords = [];
      }
    }
    const defaultCoords = [
      { empId: '50930', name: 'Dr Anusha K', department: 'SCOPE', signature: '' },
      { empId: '51327', name: 'Dr Braveen M', department: 'SCOPE', signature: '' }
    ];
    defaultCoords.forEach(def => {
      if (!coords.some(c => c.empId === def.empId)) {
        coords.push(def);
      }
    });
    setCoordinators(coords);
    localStorage.setItem('mic_coordinators', JSON.stringify(coords));

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

    // Load custom template state
    const savedTemplate = localStorage.getItem('mic_custom_template');
    if (savedTemplate) {
      setCustomTemplate(savedTemplate);
    }

    // Load and build logos list
    const loadLogos = async () => {
      const savedLogos = localStorage.getItem('mic_logos');
      let currentLogos = [];
      if (savedLogos) {
        try {
          currentLogos = JSON.parse(savedLogos);
        } catch (e) {
          currentLogos = [];
        }
      }
      
      const defaultLogos = [
        { id: 'vitc', name: 'VIT Chennai', isOptional: false, src: '/vitclogo.png', dataUrl: '' },
        { id: 'mic', name: 'Microsoft Innovations Club', isOptional: false, src: '/miclogo.png', dataUrl: '' },
        { id: 'swc', name: 'Student Welfare', isOptional: false, src: '/swc.png', dataUrl: '' },
        { id: 'iic', name: 'IIC', isOptional: true, src: '/iic.png', dataUrl: '' },
        { id: 'mlsa', name: 'MLSA', isOptional: true, src: '/mlsa.png', dataUrl: '' },
        { id: 'vnest', name: 'VNEST', isOptional: true, src: '/vnest.png', dataUrl: '' }
      ];

      if (currentLogos.length === 0) {
        currentLogos = defaultLogos;
      } else {
        // Ensure default required logos are always present
        defaultLogos.forEach(def => {
          if (!currentLogos.some(l => l.id === def.id)) {
            currentLogos.push(def);
          }
        });
      }

      // Fetch base64 for images if missing
      const updatedLogos = await Promise.all(currentLogos.map(async (logo) => {
        if (!logo.dataUrl && logo.src) {
          const dataUrl = await fetchImageAsBase64(logo.src);
          return { ...logo, dataUrl: dataUrl || '' };
        }
        return logo;
      }));
      setLogos(updatedLogos);
      localStorage.setItem('mic_logos', JSON.stringify(updatedLogos));
    };
    loadLogos();

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
      sessionStorage.setItem('mic_user_role', 'admin');
      sessionStorage.setItem('mic_username', 'admin');
      setView('landing');
      setUsername('');
      setPassword('');
      showToast('Logged in as administrator');
      navigate('/admin');
    } else if (username === 'user' && password === 'user123') {
      setUserRole('user');
      sessionStorage.setItem('mic_user_role', 'user');
      sessionStorage.setItem('mic_username', 'user');
      setView('landing');
      setUsername('');
      setPassword('');
      showToast('Logged in as club coordinator');
      navigate('/user');
    } else {
      showToast('Invalid username or password');
    }
  };

  const handleLogout = () => {
    setUserRole(null);
    sessionStorage.removeItem('mic_user_role');
    sessionStorage.removeItem('mic_username');
    setUsername('');
    setPassword('');
    setView('landing');
    navigate('/');
    showToast('Logged out successfully');
  };

  const discardDraft = () => {
    if (window.confirm('Are you sure you want to discard this report? All unsaved progress will be lost.')) {
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
        coord1: '50930',
        coord2: '51327',
        resourcePersonEnabled: false,
        resourcePerson: { name: '', designation: '', organization: '', place: '', email: '', mobile: '' },
        description: '',
        attendanceFileName: '',
        attendanceData: [],
        images: [],
        brochureImage: null,
        financeEnabled: false,
        finance: { expenditure: '', revenue: '', remarks: '' },
        selectedLogos: []
      });
      setStep(1);
      setView('landing');
      showToast('Draft discarded');
    }
  };

  // Generation of docx template
  const generateDocxFile = async () => {
    try {
      let buffer;
      const savedTemplate = localStorage.getItem('mic_custom_template') || customTemplate;
      if (savedTemplate) {
        buffer = base64ToArrayBuffer(savedTemplate);
      } else {
        const response = await fetch('/template.docx');
        if (!response.ok) throw new Error('Could not fetch template file from server.');
        buffer = await response.arrayBuffer();
      }
      
      const zip = new PizZip(buffer);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      // Fetch details of coordinators
      const f1 = coordinatorsList.find(c => c.empId === formData.coord1);
      const f2 = coordinatorsList.find(c => c.empId === formData.coord2);

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

        // Image text placeholders
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
      showToast('Report downloaded.');
    } catch (e) {
      console.error(e);
      showToast('DOCX generation error: ' + e.message);
    }
  };

  // Generate beautiful HTML-based Word Doc (preserves images perfectly)
  const generateRichWordDoc = () => {
    const f1 = coordinatorsList.find(c => c.empId === formData.coord1);
    const f2 = coordinatorsList.find(c => c.empId === formData.coord2);
    
    // Logos table html
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

    const logoCells = orderedLogos.map(logo => `
      <td style="border: none; text-align: center; vertical-align: middle;">
        <img src="${logo.dataUrl}" style="height: 50px; width: auto;" alt="${logo.name}" />
      </td>
    `).join('');

    const logosTableHtml = `
      <table style="width: 100%; border: none; margin-bottom: 20px;">
        <tr>
          ${logoCells}
        </tr>
      </table>
    `;

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
        ${logosTableHtml}
        <div class="title">Microsoft Innovations Club</div>
        <div class="subtitle">VALUE ADDED / GUEST LECTURE / SEMINAR / WORKSHOP / SYMPOSIUM / CONFERENCE / TRAINING PROGRAM DETAILS</div>
        
        <table>
          <tr>
            <td width="30%"><b>Event type</b></td>
            <td colspan="3">${escapeHtml(formData.eventType || '')}</td>
          </tr>
          <tr>
            <td><b>Title of the event</b></td>
            <td colspan="3">${escapeHtml(formData.eventTitle || '')}</td>
          </tr>
          <tr>
            <td><b>Date (From – To)</b></td>
            <td colspan="3">${escapeHtml(formData.startDate || '')} to ${escapeHtml(formData.endDate || '')}</td>
          </tr>
          <tr>
            <td><b>Time</b></td>
            <td colspan="3">${escapeHtml(formData.startTime || '')} (Duration: ${escapeHtml(formData.duration || '')})</td>
          </tr>
          <tr>
            <td><b>Venue</b></td>
            <td colspan="3">${escapeHtml(formData.venue === 'Classroom' || formData.venue === 'Other' ? formData.customVenue : formData.venue)}</td>
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
            <td>${f1 ? escapeHtml(f1.empId) : ''}</td>
            <td>${f1 ? escapeHtml(f1.name) : ''}</td>
            <td>${f1 ? escapeHtml(f1.department) : ''}</td>
          </tr>
          <tr>
            <td>${f2 ? escapeHtml(f2.empId) : ''}</td>
            <td>${f2 ? escapeHtml(f2.name) : ''}</td>
            <td>${f2 ? escapeHtml(f2.department) : ''}</td>
          </tr>
          ${formData.resourcePersonEnabled ? `
          <tr>
            <td><b>Resource Person Name</b></td>
            <td colspan="3">${escapeHtml(formData.resourcePerson.name || '')}</td>
          </tr>
          <tr>
            <td><b>Designation</b></td>
            <td colspan="3">${escapeHtml(formData.resourcePerson.designation || '')}</td>
          </tr>
          <tr>
            <td><b>Organization Details</b></td>
            <td colspan="3">${escapeHtml(formData.resourcePerson.organization || '')}</td>
          </tr>
          <tr>
            <td><b>Place</b></td>
            <td colspan="3">${escapeHtml(formData.resourcePerson.place || '')}</td>
          </tr>
          <tr>
            <td><b>E-mail</b></td>
            <td colspan="3">${escapeHtml(formData.resourcePerson.email || '')}</td>
          </tr>
          <tr>
            <td><b>Mobile no.</b></td>
            <td colspan="3">${escapeHtml(formData.resourcePerson.mobile || '')}</td>
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

        <div class="title" style="margin-top: 20px;">A REPORT ON ${escapeHtml(formData.eventTitle || '').toUpperCase()}</div>
        <div style="margin-top: 15px; text-align: justify;">
          ${(formData.description || '').split('\n').map(p => `<p>${escapeHtml(p)}</p>`).join('')}
        </div>

        ${formData.images && formData.images.length > 0 ? `
          <div class="section-title">Geotagged photos of the event with caption and date</div>
          <div class="images-grid">
            ${formData.images.map((img, i) => `
              <div class="image-container">
                <img src="${img}" alt="Event Photo ${i+1}" />
                <div style="font-size: 9pt; margin-top: 5px;">Photo ${i+1}: Event execution. Date: ${escapeHtml(formData.startDate || '')}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <div style="page-break-before: always;"></div>

        <div class="section-title">Attendance</div>
        <div class="subtitle" style="text-align: left; margin-bottom: 10px;">
          <b>Event Name:</b> ${escapeHtml(formData.eventTitle || '')}<br/>
          <b>Date:</b> ${escapeHtml(formData.startDate || '')}
        </div>
        
        <table>
          <tr class="header-row">
            <th width="8%">Sl. No.</th>
            <th width="30%">Reg. No. / Emp. ID.</th>
            <th>Name</th>
            <th width="15%">Type</th>
          </tr>
          ${formData.attendanceData.map((p, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td>${escapeHtml(p.regNo || '')}</td>
              <td>${escapeHtml(p.name || '')}</td>
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
              <td>${escapeHtml(formData.finance.expenditure || '0')}</td>
              <td>${escapeHtml(formData.finance.revenue || '0')}</td>
              <td>${escapeHtml(formData.finance.remarks || 'None')}</td>
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
    showToast('Full report downloaded.');
  };

  // Direct completed report upload
  const handleCompletedReportUpload = async (e) => {
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

    if (convexDb) {
      await convexDb.addReport(eventName, 'Direct Upload', new Date().toLocaleDateString(), newFilename, 'base64_simulated_contents');
    } else {
      const newReport = {
        id: Date.now(),
        eventName: eventName,
        filename: newFilename,
        uploadDate: new Date().toLocaleDateString(),
        status: 'Pending Review',
        fileData: 'base64_simulated_contents'
      };
      const updated = [...uploadedReports, newReport];
      setUploadedReports(updated);
      localStorage.setItem('mic_uploaded_reports', JSON.stringify(updated));
    }
    showToast(`Report uploaded and saved as ${newFilename}`);
    if (docxInputRef.current) docxInputRef.current.value = '';
  };

  const deleteReport = async (rep) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      const id = rep.id || rep._id;
      if (convexDb) {
        await convexDb.removeReport(id);
      } else {
        const updated = uploadedReports.filter(r => r.id !== id);
        setUploadedReports(updated);
        localStorage.setItem('mic_uploaded_reports', JSON.stringify(updated));
      }
      showToast('Report deleted.');
    }
  };

  // Add faculty coordinator in admin panel
  const handleAddFaculty = async (e) => {
    e.preventDefault();
    if (!newFaculty.empId || !newFaculty.name || !newFaculty.department) {
      showToast('Please fill all fields');
      return;
    }

    if (convexDb) {
      await convexDb.addCoordinator(newFaculty.empId, newFaculty.name, newFaculty.department, newFaculty.signature || '');
    } else {
      const updated = [...coordinators, newFaculty];
      setCoordinators(updated);
      localStorage.setItem('mic_coordinators', JSON.stringify(updated));
    }
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

  const deleteFaculty = async (coord) => {
    if (window.confirm('Delete this coordinator?')) {
      if (convexDb) {
        await convexDb.removeCoordinator(coord._id);
      } else {
        const updated = coordinators.filter(c => c.empId !== coord.empId);
        setCoordinators(updated);
        localStorage.setItem('mic_coordinators', JSON.stringify(updated));
      }
      showToast('Faculty coordinator deleted');
    }
  };

  // Config adjustments in admin panel
  const addVenue = async () => {
    if (newVenue.trim() && !venuesList.includes(newVenue.trim())) {
      if (convexDb) {
        await convexDb.addVenue(newVenue.trim());
      } else {
        const updated = [...venues, newVenue.trim()];
        setVenues(updated);
        localStorage.setItem('mic_venues', JSON.stringify(updated));
      }
      setNewVenue('');
      showToast('Venue added');
    }
  };

  const deleteVenue = async (venue) => {
    if (window.confirm(`Delete venue "${typeof venue === 'object' ? venue.name : venue}"?`)) {
      if (convexDb) {
        await convexDb.removeVenue(venue._id);
      } else {
        const updated = venues.filter(v => v !== venue);
        setVenues(updated);
        localStorage.setItem('mic_venues', JSON.stringify(updated));
      }
      showToast('Venue deleted');
    }
  };

  const addEventType = async () => {
    if (newEventType.trim() && !eventTypesList.includes(newEventType.trim())) {
      if (convexDb) {
        await convexDb.addEventType(newEventType.trim());
      } else {
        const updated = [...eventTypes, newEventType.trim()];
        setEventTypes(updated);
        localStorage.setItem('mic_event_types', JSON.stringify(updated));
      }
      setNewEventType('');
      showToast('Event type added');
    }
  };

  const deleteEventType = async (type) => {
    if (window.confirm(`Delete event type "${typeof type === 'object' ? type.name : type}"?`)) {
      if (convexDb) {
        await convexDb.removeEventType(type._id);
      } else {
        const updated = eventTypes.filter(t => t !== type);
        setEventTypes(updated);
        localStorage.setItem('mic_event_types', JSON.stringify(updated));
      }
      showToast('Event type deleted');
    }
  };

  // Replaced template upload
  const handleTemplateUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = arrayBufferToBase64(event.target.result);
        setCustomTemplate(base64);
        localStorage.setItem('mic_custom_template', base64);
        showToast('Template file replaced and saved.');
      };
      reader.readAsArrayBuffer(file);
      if (templateInputRef.current) templateInputRef.current.value = '';
    }
  };

  // Logo uploads and deletion
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const name = prompt('Enter a display name for this logo:');
      if (!name) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target.result;
        const newLogo = {
          id: 'logo_' + Date.now(),
          name: name,
          isOptional: true,
          src: '',
          dataUrl: base64
        };
        const updated = [...logos, newLogo];
        setLogos(updated);
        localStorage.setItem('mic_logos', JSON.stringify(updated));
        showToast(`Logo "${name}" uploaded successfully.`);
      };
      reader.readAsDataURL(file);
    }
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const deleteLogo = (id) => {
    const logoToDelete = logos.find(l => l.id === id);
    if (!logoToDelete) return;
    if (window.confirm(`Are you sure you want to delete the logo "${logoToDelete.name}"?`)) {
      const updated = logos.filter(l => l.id !== id);
      setLogos(updated);
      localStorage.setItem('mic_logos', JSON.stringify(updated));
      showToast(`Logo "${logoToDelete.name}" deleted.`);
    }
  };

  // Upload brochure handler
  const handleBrochureUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({ ...prev, brochureImage: event.target.result }));
        showToast('Brochure uploaded successfully.');
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload event photos handler
  const handleImagesUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({ ...prev, images: [...prev.images, event.target.result] }));
      };
      reader.readAsDataURL(file);
    });
    showToast(`${files.length} photo(s) selected.`);
  };

  // Refine description with Groq LLM
  const handleRefineReportText = async () => {
    if (!formData.description.trim()) {
      showToast('Please write some content first');
      return;
    }
    
    setRefinementLoading(true);
    try {
      const promptText = `Clean up this event report. Fix grammar and make it read better.
- Keep all facts, numbers, dates, names, and key outcomes.
- Write like a normal person. No fancy words, no corporate speak, no filler.
- Keep the length between 200 and 500 words.
- Don't add headings, intros, markdown, or extra notes. Just give back the cleaned-up text.

Report:
${formData.description}`;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: promptText }],
          temperature: 0.7
        })
      });

      if (!response.ok) throw new Error('API request failed');

      const data = await response.json();
      const text = data.choices[0].message.content.trim();
      setRefinedText(text);
      setShowRefineModal(true);
    } catch (e) {
      console.error(e);
      showToast('Couldn\'t reach Groq. Text left as-is.');
      setRefinedText(formData.description);
      setShowRefineModal(true);
    } finally {
      setRefinementLoading(false);
    }
  };

  const applyRefinedText = () => {
    setFormData(prev => ({ ...prev, description: refinedText }));
    setShowRefineModal(false);
    showToast('Write-up updated.');
  };

  // Text-To-Speech helper
  const speakOutLoud = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-IN';
      window.speechSynthesis.speak(utterance);
      setVoiceSpeakPrompt(text);
    }
  };

  // Missing fields helper for voice flows
  const getMissingMandatoryFields = (data) => {
    const missing = [];
    if (!data.eventType) missing.push('eventType');
    if (!data.eventTitle.trim()) missing.push('eventTitle');
    if (!data.startDate) missing.push('startDate');
    if (!data.endDate) missing.push('endDate');
    if (!data.startTime.trim()) missing.push('startTime');
    if (!data.duration.trim()) missing.push('duration');
    if (!data.venue) missing.push('venue');
    if ((data.venue === 'Classroom' || data.venue === 'Other') && !data.customVenue.trim()) {
      missing.push('customVenue');
    }
    if (!data.coord1) missing.push('coord1');
    return missing;
  };

  const fieldQuestions = {
    eventType: "What is the event type? Choose workshop, competition, hackathon, guest lecture, seminar, symposium, conference, or value added session.",
    eventTitle: "What is the title of the event?",
    startDate: "What is the start date of the event?",
    endDate: "What is the end date of the event?",
    startTime: "What is the start time of the event? For example, ten A M or two P M.",
    duration: "What is the duration of the event? For example, ninety minutes or three hours.",
    venue: "What is the venue? MG Auditorium, Kasturba Auditorium, Kamaraj Auditorium, Netaji Auditorium, VOC Auditorium, Classroom, or Online.",
    customVenue: "Could you specify the custom venue or classroom name?",
    coord1: "Which faculty coordinator is managing this event?"
  };

  // Smart Fill description parsing
  const handleSmartFill = async (text, isVoiceFlow = false) => {
    if (!text.trim()) return;
    setSmartFillLoading(true);
    try {
      const todayStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      const promptText = `You are a form parser for a college event report tool. Today's date is ${todayStr}.

Extract structured data from the user's description. Return ONLY valid JSON, no markdown, no explanation.

Available event types: ${eventTypesList.join(', ')}
Available venues: ${venuesList.join(', ')}

JSON schema:
{
  "eventType": "one of the available types or empty string",
  "eventTitle": "string or empty",
  "startDate": "YYYY-MM-DD or empty",
  "endDate": "YYYY-MM-DD or empty",
  "startTime": "h:mm AM/PM or empty",
  "duration": "e.g. 2 hours, 90 mins, or empty",
  "venue": "one of the available venues or empty",
  "customVenue": "if venue is Classroom or Other, the name, else empty",
  "description": "event summary text or empty",
  "resourcePersonEnabled": true/false,
  "resourcePerson": {
    "name": "", "designation": "", "organization": "", "place": "", "email": "", "mobile": ""
  },
  "unfilled": ["list of field names that could not be determined"]
}

Rules:
- If a date is relative (like "30th this month", "last Tuesday") resolve it using today's date.
- If a date is impossible (like "38th June") put it in unfilled and leave the field empty.
- If you cannot determine a field, leave it as empty string and add it to unfilled.
- Never guess. Only extract what is clearly stated or implied.

User input:
${text}`;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: promptText }],
          temperature: 0.3
        })
      });

      if (!response.ok) throw new Error('API request failed');

      const data = await response.json();
      const raw = data.choices[0].message.content.trim();
      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch {
        showToast("Couldn't parse that. Try being more specific.");
        return;
      }

      const flags = parsed.unfilled || [];
      setSmartFillFlags(flags);

      let updatedData;
      setFormData(prev => {
        const updated = { ...prev };
        if (parsed.eventType) updated.eventType = parsed.eventType;
        if (parsed.eventTitle) updated.eventTitle = parsed.eventTitle;
        if (parsed.startDate) updated.startDate = parsed.startDate;
        if (parsed.endDate) updated.endDate = parsed.endDate;
        if (parsed.startTime) updated.startTime = parsed.startTime;
        if (parsed.duration) updated.duration = parsed.duration;
        if (parsed.venue) updated.venue = parsed.venue;
        if (parsed.customVenue) updated.customVenue = parsed.customVenue;
        if (parsed.description) updated.description = parsed.description;
        if (parsed.resourcePersonEnabled !== undefined) updated.resourcePersonEnabled = parsed.resourcePersonEnabled;
        if (parsed.resourcePerson) {
          const rp = { ...updated.resourcePerson };
          if (parsed.resourcePerson.name) rp.name = parsed.resourcePerson.name;
          if (parsed.resourcePerson.designation) rp.designation = parsed.resourcePerson.designation;
          if (parsed.resourcePerson.organization) rp.organization = parsed.resourcePerson.organization;
          if (parsed.resourcePerson.place) rp.place = parsed.resourcePerson.place;
          if (parsed.resourcePerson.email) rp.email = parsed.resourcePerson.email;
          if (parsed.resourcePerson.mobile) rp.mobile = parsed.resourcePerson.mobile;
          updated.resourcePerson = rp;
        }
        updatedData = updated;
        return updated;
      });

      if (isVoiceFlow) {
        stopListening();
        const missing = getMissingMandatoryFields(updatedData);
        if (missing.length > 0) {
          setSmartFillAwaitingVoiceAnswer(true);
          setSmartFillActiveField(missing[0]);
          const qText = fieldQuestions[missing[0]];
          speakOutLoud(qText);
          setVoiceTranscript('');
          setTimeout(() => {
            startListening();
          }, 1000);
        } else {
          setView('create');
          setStep(1);
          setSmartFillOpen(false);
          setSmartFillInput('');
          setVoiceTranscript('');
          speakOutLoud("All mandatory fields are filled. Redirecting to review.");
          showToast('Smart Fill done. All fields filled.');
        }
      } else {
        setView('create');
        setStep(1);
        setSmartFillOpen(false);
        setSmartFillInput('');
        setVoiceTranscript('');
        if (flags.length > 0) {
          showToast(`Smart Fill done. ${flags.length} fields need your attention.`);
        } else {
          showToast('Smart Fill done. All fields filled.');
        }
      }
    } catch (e) {
      console.error(e);
      showToast("Couldn't reach Groq. Try again.");
    } finally {
      setSmartFillLoading(false);
    }
  };

  // Parse voice answer for a single prompt field
  const handleSmartFillAnswer = async (answerText) => {
    if (!answerText.trim() || !smartFillActiveField) return;
    setSmartFillLoading(true);
    stopListening();
    try {
      const todayStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      let fieldHint = '';
      if (smartFillActiveField === 'eventType') fieldHint = `Available types: ${eventTypesList.join(', ')}.`;
      if (smartFillActiveField === 'venue') fieldHint = `Available venues: ${venuesList.join(', ')}.`;

      const promptText = `You are a helper parsing a single field "${smartFillActiveField}" from user voice input.
Today's date is ${todayStr}.
${fieldHint}

User spoke: "${answerText}"

Extract the value for "${smartFillActiveField}" based on their speech.
Rules:
- For date fields, output in YYYY-MM-DD format. If relative, resolve using today's date. If impossible, leave empty.
- For all other fields, output the clean extracted value (e.g. if eventType, output one of the available types. If venue, output one of the available venues).
- Return ONLY a JSON object: {"value": "extracted_value_here", "unfilled": true/false} (unfilled should be true if it cannot be determined). Do not return any other text.`;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: promptText }],
          temperature: 0.2
        })
      });

      if (!response.ok) throw new Error('API request failed');

      const data = await response.json();
      const raw = data.choices[0].message.content.trim();
      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch {
        showToast("Couldn't parse that. Please speak clearly.");
        return;
      }

      let updatedData;
      setFormData(prev => {
        const nextData = { ...prev };
        if (parsed.unfilled) {
          setSmartFillFlags(f => [...new Set([...f, smartFillActiveField])]);
        } else {
          nextData[smartFillActiveField] = parsed.value;
          setSmartFillFlags(f => f.filter(x => x !== smartFillActiveField));
        }
        updatedData = nextData;
        return nextData;
      });

      const remaining = getMissingMandatoryFields(updatedData);
      if (remaining.length > 0) {
        const nextF = remaining[0];
        setSmartFillActiveField(nextF);
        const qText = fieldQuestions[nextF];
        speakOutLoud(qText);
        setVoiceTranscript('');
        setTimeout(() => {
          startListening();
        }, 1000);
      } else {
        setSmartFillActiveField(null);
        setSmartFillAwaitingVoiceAnswer(false);
        setSmartFillOpen(false);
        setVoiceTranscript('');
        setView('create');
        setStep(1);
        speakOutLoud("All mandatory fields are filled. Let's review the report.");
        showToast('Smart Fill voice flow complete!');
      }
    } catch (e) {
      console.error(e);
      showToast("Error processing voice answer.");
    } finally {
      setSmartFillLoading(false);
    }
  };

  const finishVoiceFlowManually = () => {
    stopListening();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    const remaining = getMissingMandatoryFields(formData);
    setSmartFillFlags(prev => [...new Set([...prev, ...remaining])]);
    setSmartFillActiveField(null);
    setSmartFillAwaitingVoiceAnswer(false);
    setSmartFillOpen(false);
    setVoiceTranscript('');
    setView('create');
    setStep(1);
    showToast('Voice flow ended. Please review the form.');
  };

  // Voice recognition - start listening
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('Speech recognition not supported in this browser.');
      return;
    }
    setVoiceTranscript('');
    setIsListening(true);
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognitionRef.current = recognition;

    let finalTranscript = '';
    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setVoiceTranscript(finalTranscript + interim);
    };

    recognition.onend = () => {
      if (recognitionRef.current && isListening) {
        try { recognition.start(); } catch {}
      }
    };

    recognition.onerror = (e) => {
      console.error('Speech recognition error:', e.error);
      if (e.error !== 'no-speech') {
        setIsListening(false);
      }
    };

    recognition.start();
  };

  // Voice recognition - stop listening
  const stopListening = () => {
    setIsListening(false);
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  };

  // CSV uploaded mapper handler
  const handleCSVUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvErrors([]);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data;
        if (rows.length === 0) {
          showToast('CSV is empty');
          return;
        }

        // Map column headers
        const headers = Object.keys(rows[0]);
        let nameCol = headers.find(h => ['name', 'student name', 'full name', 'participant name'].includes(h.toLowerCase().trim()));
        let regCol = headers.find(h => ['reg no', 'registration no', 'reg_no', 'registration_number', 'regno', 'employee id', 'emp id', 'id'].includes(h.toLowerCase().trim()));
        
        if (!nameCol || !regCol) {
          // Fallback guess first two cols
          nameCol = headers[1] || headers[0];
          regCol = headers[0];
        }

        const mapped = rows.map(r => {
          const rawReg = (r[regCol] || '').toString().trim();
          let type = 'External';
          if (/^[0-9]{2}[a-zA-Z]{3}[0-9]{4}$/.test(rawReg)) {
            type = 'Student';
          } else if (/^[0-9]{5}$/.test(rawReg)) {
            type = 'Faculty';
          } else if (!rawReg) {
            type = '';
          }
          return {
            regNo: rawReg,
            name: (r[nameCol] || '').toString().trim(),
            type: type
          };
        }).filter(item => item.name); // Filter out blank name rows

        setFormData(prev => ({
          ...prev,
          attendanceFileName: file.name,
          attendanceData: mapped
        }));
        showToast(`Parsed ${mapped.length} participants.`);
      },
      error: () => {
        showToast('Error parsing CSV file');
      }
    });
    if (csvInputRef.current) csvInputRef.current.value = '';
  };

  const coordinatorsList = convexDb ? convexDb.coordinators : coordinators;
  const venuesRaw = convexDb ? convexDb.venues : venues;
  const venuesList = convexDb ? convexDb.venues.map(v => typeof v === 'object' ? v.name : v) : venues;
  const eventTypesRaw = convexDb ? convexDb.eventTypes : eventTypes;
  const eventTypesList = convexDb ? convexDb.eventTypes.map(t => typeof t === 'object' ? t.name : t) : eventTypes;
  const uploadedReportsList = convexDb ? convexDb.uploadedReports : uploadedReports;

  // Render variables
  const mainContent = (
    <div className="app-container">
      {/* Top navbar */}
      <nav className="top-nav">
        <div className="top-nav-logo">
          <FileText size={18} className="text-muted" />
          <span>Eventra</span>
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

          {/* Theme Mode Toggle */}
          <button 
            className="btn btn-secondary" 
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            style={{ display: 'flex', alignItems: 'center', padding: '6px 12px', fontSize: 13, cursor: 'pointer' }}
          >
            <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
          </button>
          
          {userRole && (
            <>
              {userRole === 'admin' && (
                <button className="btn btn-secondary" onClick={() => navigate((currentPath === '/mic' || currentPath === '/admin') ? '/user' : '/admin')}>
                  {(currentPath === '/mic' || currentPath === '/admin') ? 'Coordinators View' : 'Admin Panel'}
                </button>
              )}
              <button className="btn btn-link" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Main layout */}
      <main className="main-content">
        {!userRole ? (
          <LoginCard 
            username={username}
            setUsername={setUsername}
            password={password}
            setPassword={setPassword}
            handleLogin={handleLogin}
          />
        ) : (
          <>
            {/* VIEW: PORTAL/LANDING for logged-in user at root path */}
            {currentPath === '/' && (
              userRole === 'admin' ? navigate('/admin') : navigate('/user')
            )}

            {/* VIEW: ADMIN INTERFACE */}
            {(currentPath === '/admin' || currentPath === '/mic') && userRole === 'admin' && (
              <AdminPanel
                adminSection={adminSection}
                setAdminSection={setAdminSection}
                uploadedReports={uploadedReports}
                uploadedReportsList={uploadedReportsList}
                deleteReport={deleteReport}
                coordinators={coordinators}
                coordinatorsList={coordinatorsList}
                newFaculty={newFaculty}
                setNewFaculty={setNewFaculty}
                handleAddFaculty={handleAddFaculty}
                facSigInputRef={facSigInputRef}
                handleFacultySignatureUpload={handleFacultySignatureUpload}
                deleteFaculty={deleteFaculty}
                newVenue={newVenue}
                setNewVenue={setNewVenue}
                addVenue={addVenue}
                venuesRaw={venuesRaw}
                deleteVenue={deleteVenue}
                newEventType={newEventType}
                setNewEventType={setNewEventType}
                addEventType={addEventType}
                eventTypesRaw={eventTypesRaw}
                deleteEventType={deleteEventType}
                templateInputRef={templateInputRef}
                handleTemplateUpload={handleTemplateUpload}
                logos={logos}
                logoInputRef={logoInputRef}
                handleLogoUpload={handleLogoUpload}
                deleteLogo={deleteLogo}
                showToast={showToast}
              />
            )}

            {/* VIEW: COORDINATOR WORKSPACE (Path /user) */}
            {currentPath === '/user' && (
              <>
                {view === 'landing' && (
                  <CoordinatorLanding
                    setView={setView}
                    docxInputRef={docxInputRef}
                    handleCompletedReportUpload={handleCompletedReportUpload}
                  />
                )}

                {view === 'create' && (
                  <ReportWizard
                    formData={formData}
                    setFormData={setFormData}
                    step={step}
                    setStep={setStep}
                    setView={setView}
                    validationErrors={validationErrors}
                    setValidationErrors={setValidationErrors}
                    coordinatorsList={coordinatorsList}
                    venuesList={venuesList}
                    eventTypesList={eventTypesList}
                    smartFillFlags={smartFillFlags}
                    refinementLoading={refinementLoading}
                    handleRefineReportText={handleRefineReportText}
                    csvInputRef={csvInputRef}
                    handleCSVUpload={handleCSVUpload}
                    csvErrors={csvErrors}
                    brochureInputRef={brochureInputRef}
                    handleBrochureUpload={handleBrochureUpload}
                    imagesInputRef={imagesInputRef}
                    handleImagesUpload={handleImagesUpload}
                    discardDraft={discardDraft}
                    showToast={showToast}
                    logos={logos}
                  />
                )}

                {view === 'review' && (
                  <ReviewSummary
                    formData={formData}
                    setFormData={setFormData}
                    setView={setView}
                    setStep={setStep}
                    coordinators={coordinatorsList}
                    discardDraft={discardDraft}
                  />
                )}

                {view === 'preview' && (
                  <DocumentPreview
                    formData={formData}
                    setView={setView}
                    generateDocxFile={generateDocxFile}
                    generateRichWordDoc={generateRichWordDoc}
                    coordinators={coordinatorsList}
                    logos={logos}
                  />
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* Refined text comparison modal */}
      {showRefineModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 640 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
              <RefreshCw size={18} style={{ color: 'var(--accent)' }} />
              <span>Compare drafts</span>
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div>
                <span className="form-label" style={{ marginBottom: 8 }}>Original Draft</span>
                <div style={{ fontSize: 13, height: 280, overflowY: 'auto', padding: 12, border: '1px solid var(--border-light)', borderRadius: 8, whiteSpace: 'pre-wrap', backgroundColor: 'var(--bg)' }}>
                  {formData.description}
                </div>
              </div>
              <div>
                <span className="form-label" style={{ marginBottom: 8 }}>Refined Outcome</span>
                <div style={{ fontSize: 13, height: 280, overflowY: 'auto', padding: 12, border: '1px solid var(--border-light)', borderRadius: 8, whiteSpace: 'pre-wrap', backgroundColor: 'var(--bg)' }}>
                  {refinedText}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button className="btn btn-secondary" onClick={() => setShowRefineModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={applyRefinedText}>
                Use Refined Draft
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Smart Fill FAB - only on /user workspace */}
      {currentPath === '/user' && (view === 'landing' || view === 'create') && (
        <>
          {smartFillOpen && (
            <div 
              className="modal-overlay" 
              style={{ zIndex: 1100 }} 
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  if (smartFillAwaitingVoiceAnswer) {
                    finishVoiceFlowManually();
                  } else {
                    setSmartFillOpen(false);
                    stopListening();
                  }
                }
              }}
            >
              <div 
                className="smart-fill-panel" 
                style={{ width: '100%', maxWidth: '440px', margin: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                {smartFillAwaitingVoiceAnswer ? (
                  // Conversational voice prompt view
                  <>
                    <div className="smart-fill-header">
                      <span className="smart-fill-title">Conversational Assist</span>
                      <button className="smart-fill-close" onClick={finishVoiceFlowManually}>
                        &times;
                      </button>
                    </div>
                    <div className="smart-fill-body">
                      <div className="smart-fill-prompt-card">
                        <span className="smart-fill-prompt-label">
                          Please provide: <strong>{{
                            eventType: 'Event Type',
                            eventTitle: 'Event Title',
                            startDate: 'Start Date',
                            endDate: 'End Date',
                            startTime: 'Start Time',
                            duration: 'Duration',
                            venue: 'Venue',
                            customVenue: 'Custom Venue Name',
                            coord1: 'Primary Faculty Coordinator'
                          }[smartFillActiveField] || smartFillActiveField}</strong>
                        </span>
                        <p className="smart-fill-prompt-question">{voiceSpeakPrompt}</p>
                      </div>

                      <div className="smart-fill-voice-area">
                        <button 
                          className={`smart-fill-mic-btn ${isListening ? 'listening' : ''}`}
                          onClick={isListening ? stopListening : startListening}
                        >
                          <div className="mic-icon">{isListening ? '...' : <Mic size={28} />}</div>
                        </button>
                        <p className="smart-fill-voice-hint">
                          {isListening ? 'Listening... speak now' : 'Tap to start speaking'}
                        </p>
                      </div>

                      {voiceTranscript && (
                        <div className="smart-fill-transcript">
                          <span className="transcript-label">Your answer:</span>
                          <p>{voiceTranscript}</p>
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                        <button 
                          className="btn btn-secondary" 
                          onClick={finishVoiceFlowManually}
                          style={{ flex: 1, fontSize: 13 }}
                        >
                          Finish manually
                        </button>
                        <button 
                          className="btn btn-primary" 
                          onClick={() => handleSmartFillAnswer(voiceTranscript)}
                          disabled={smartFillLoading || !voiceTranscript.trim()}
                          style={{ flex: 1, fontSize: 13, gap: 6 }}
                        >
                          {smartFillLoading ? <RefreshCw size={14} className="spin" /> : <Check size={14} />}
                          Submit
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  // Normal Text / Voice modes selection
                  <>
                    <div className="smart-fill-header">
                      <span className="smart-fill-title">Smart Fill</span>
                      <button className="smart-fill-close" onClick={() => { setSmartFillOpen(false); stopListening(); }}>
                        &times;
                      </button>
                    </div>
                    <div className="smart-fill-tabs">
                      <button 
                        className={`smart-fill-tab ${smartFillMode === 'text' ? 'active' : ''}`}
                        onClick={() => { setSmartFillMode('text'); stopListening(); }}
                      >Type it</button>
                      <button 
                        className={`smart-fill-tab ${smartFillMode === 'voice' ? 'active' : ''}`}
                        onClick={() => setSmartFillMode('voice')}
                      >Say it</button>
                    </div>
                    <div className="smart-fill-body">
                      {smartFillMode === 'text' ? (
                        <>
                          <textarea
                            className="smart-fill-textarea"
                            rows={5}
                            placeholder={'Describe your event in plain English...\ne.g. "We held a cybersecurity workshop on the 25th at MG Auditorium, 2pm, 3 hours"'}
                            value={smartFillInput}
                            onChange={(e) => setSmartFillInput(e.target.value)}
                          />
                          <button 
                            className="btn btn-primary smart-fill-submit"
                            onClick={() => handleSmartFill(smartFillInput)}
                            disabled={smartFillLoading || !smartFillInput.trim()}
                          >
                            {smartFillLoading ? <RefreshCw size={14} className="spin" /> : <Sparkles size={14} />}
                            {smartFillLoading ? 'Parsing...' : 'Fill form'}
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="smart-fill-voice-area">
                            <button 
                              className={`smart-fill-mic-btn ${isListening ? 'listening' : ''}`}
                              onClick={isListening ? stopListening : startListening}
                            >
                              <div className="mic-icon">{isListening ? '...' : <Mic size={28} />}</div>
                            </button>
                            <p className="smart-fill-voice-hint">
                              {isListening ? 'Listening... tap again when done' : 'Tap to start speaking'}
                            </p>
                          </div>
                          {voiceTranscript && (
                            <div className="smart-fill-transcript">
                              <span className="transcript-label">Heard:</span>
                              <p>{voiceTranscript}</p>
                            </div>
                          )}
                          {voiceTranscript && !isListening && (
                            <button 
                              className="btn btn-primary smart-fill-submit"
                              onClick={() => handleSmartFill(voiceTranscript, true)}
                              disabled={smartFillLoading}
                            >
                              {smartFillLoading ? <RefreshCw size={14} className="spin" /> : <Sparkles size={14} />}
                              {smartFillLoading ? 'Parsing...' : 'Start Voice Flow'}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                    {smartFillFlags.length > 0 && (
                      <div className="smart-fill-flags">
                        <AlertCircle size={13} />
                        <span>Couldn't fill: {smartFillFlags.join(', ')}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
          <div className="smart-fill-container">
            <button 
              className={`smart-fill-fab ${smartFillOpen ? 'active' : ''}`}
              onClick={() => {
                if (smartFillOpen && smartFillAwaitingVoiceAnswer) {
                  finishVoiceFlowManually();
                } else {
                  setSmartFillOpen(!smartFillOpen);
                }
              }}
              title="Smart Fill"
            >
              <img src="/miclogo.png" alt="MIC" style={{ width: 18, height: 18, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
              <span>AI Smart Fill</span>
            </button>
          </div>
        </>
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

  if (isConvexEnabled) {
    return <ConvexWrapper setDb={setConvexDb}>{mainContent}</ConvexWrapper>;
  }
  return mainContent;
}
