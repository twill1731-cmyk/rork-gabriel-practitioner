export interface Patient {
  id: string;
  name: string;
  avatar: string;
  age: number;
  sex: 'M' | 'F';
  primaryConditions: string[];
  lastVisit: string;
  nextAppointment: string | null;
  healthScore: number;
  healthScoreDelta: number;
  status: 'active' | 'review' | 'new' | 'inactive';
  protocolCount: number;
  complianceRate: number;
  alerts: PatientAlert[];
  recentLabs: LabFlag[];
  notes: string;
  medications: string[];
  supplements: string[];
  joinedDate: string;
}

export interface PatientAlert {
  id: string;
  type: 'lab' | 'compliance' | 'symptom' | 'appointment' | 'interaction';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  timestamp: number;
  patientId: string;
  read: boolean;
}

export interface LabFlag {
  marker: string;
  value: string;
  unit: string;
  range: string;
  status: 'normal' | 'low' | 'high' | 'critical';
  date: string;
}

export interface ProtocolTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  targetConditions: string[];
  items: ProtocolTemplateItem[];
  duration: string;
  createdBy: string;
  usageCount: number;
  rating: number;
}

export interface ProtocolTemplateItem {
  name: string;
  dosage: string;
  frequency: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  notes?: string;
}

export interface PractitionerMessage {
  id: string;
  patientId: string;
  patientName: string;
  patientAvatar: string;
  lastMessage: string;
  lastMessageTime: number;
  unreadCount: number;
  messages: MessageItem[];
}

export interface MessageItem {
  id: string;
  sender: 'practitioner' | 'patient' | 'system';
  content: string;
  timestamp: number;
  read: boolean;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientAvatar: string;
  type: 'initial' | 'follow-up' | 'lab-review' | 'protocol-review';
  time: string;
  duration: number;
  notes?: string;
}

export interface PractitionerStats {
  totalPatients: number;
  activeProtocols: number;
  avgCompliance: number;
  alertsToday: number;
  appointmentsToday: number;
  labsToReview: number;
}

const NOW = Date.now();
const DAY = 86400000;

export const MOCK_PATIENTS: Patient[] = [
  {
    id: 'p1',
    name: 'Sarah Mitchell',
    avatar: 'SM',
    age: 42,
    sex: 'F',
    primaryConditions: ['Hashimoto\'s', 'Adrenal Fatigue'],
    lastVisit: '2026-02-24',
    nextAppointment: '2026-03-04',
    healthScore: 72,
    healthScoreDelta: 5,
    status: 'active',
    protocolCount: 8,
    complianceRate: 89,
    alerts: [
      { id: 'a1', type: 'lab', severity: 'warning', title: 'TSH elevated', description: 'TSH 4.8 mIU/L — above optimal range', timestamp: NOW - DAY, patientId: 'p1', read: false },
    ],
    recentLabs: [
      { marker: 'TSH', value: '4.8', unit: 'mIU/L', range: '0.5-2.5', status: 'high', date: '2026-02-20' },
      { marker: 'Free T4', value: '0.9', unit: 'ng/dL', range: '0.8-1.8', status: 'normal', date: '2026-02-20' },
      { marker: 'Vitamin D', value: '32', unit: 'ng/mL', range: '40-80', status: 'low', date: '2026-02-20' },
      { marker: 'Ferritin', value: '28', unit: 'ng/mL', range: '40-150', status: 'low', date: '2026-02-20' },
    ],
    notes: 'Responding well to selenium + zinc protocol. Energy improving per check-ins. Retest thyroid panel in 6 weeks.',
    medications: ['Levothyroxine 50mcg'],
    supplements: ['Selenium 200mcg', 'Zinc 30mg', 'Vitamin D 5000IU', 'Ashwagandha 600mg', 'Magnesium Glycinate 400mg', 'B-Complex', 'Iron Bisglycinate 25mg', 'Omega-3 2g'],
    joinedDate: '2025-11-15',
  },
  {
    id: 'p2',
    name: 'James Kowalski',
    avatar: 'JK',
    age: 55,
    sex: 'M',
    primaryConditions: ['Type 2 Diabetes', 'Hypertension'],
    lastVisit: '2026-02-26',
    nextAppointment: '2026-03-10',
    healthScore: 64,
    healthScoreDelta: -2,
    status: 'review',
    protocolCount: 6,
    complianceRate: 72,
    alerts: [
      { id: 'a2', type: 'compliance', severity: 'warning', title: 'Compliance dropping', description: 'Missed 3 evening protocols this week', timestamp: NOW - DAY * 2, patientId: 'p2', read: false },
      { id: 'a3', type: 'lab', severity: 'critical', title: 'A1c elevated', description: 'HbA1c 7.2% — needs protocol adjustment', timestamp: NOW - DAY * 3, patientId: 'p2', read: false },
    ],
    recentLabs: [
      { marker: 'HbA1c', value: '7.2', unit: '%', range: '<5.7', status: 'critical', date: '2026-02-18' },
      { marker: 'Fasting Glucose', value: '142', unit: 'mg/dL', range: '70-100', status: 'high', date: '2026-02-18' },
      { marker: 'hs-CRP', value: '3.8', unit: 'mg/L', range: '<1.0', status: 'high', date: '2026-02-18' },
      { marker: 'Triglycerides', value: '198', unit: 'mg/dL', range: '<150', status: 'high', date: '2026-02-18' },
    ],
    notes: 'Berberine protocol started 8 weeks ago. A1c still elevated — consider adding chromium picolinate. Patient reports difficulty with evening routine.',
    medications: ['Metformin 1000mg', 'Lisinopril 10mg'],
    supplements: ['Berberine 500mg', 'Chromium 200mcg', 'Omega-3 3g', 'Magnesium 400mg', 'CoQ10 200mg', 'Alpha Lipoic Acid 600mg'],
    joinedDate: '2025-09-03',
  },
  {
    id: 'p3',
    name: 'Elena Vasquez',
    avatar: 'EV',
    age: 34,
    sex: 'F',
    primaryConditions: ['PCOS', 'Insulin Resistance'],
    lastVisit: '2026-02-22',
    nextAppointment: '2026-03-08',
    healthScore: 78,
    healthScoreDelta: 8,
    status: 'active',
    protocolCount: 7,
    complianceRate: 94,
    alerts: [],
    recentLabs: [
      { marker: 'Testosterone', value: '58', unit: 'ng/dL', range: '15-46', status: 'high', date: '2026-02-15' },
      { marker: 'DHEA-S', value: '410', unit: 'mcg/dL', range: '35-430', status: 'normal', date: '2026-02-15' },
      { marker: 'Fasting Insulin', value: '14', unit: 'uIU/mL', range: '<8', status: 'high', date: '2026-02-15' },
    ],
    notes: 'Excellent compliance. Inositol protocol showing great results — cycle regularity improving. Continue current protocol 8 more weeks.',
    medications: [],
    supplements: ['Myo-Inositol 4g', 'D-Chiro-Inositol 100mg', 'Berberine 500mg', 'Spearmint Tea', 'NAC 600mg', 'Vitamin D 4000IU', 'Omega-3 2g'],
    joinedDate: '2025-12-01',
  },
  {
    id: 'p4',
    name: 'David Chen',
    avatar: 'DC',
    age: 48,
    sex: 'M',
    primaryConditions: ['Chronic Fatigue', 'Gut Dysbiosis'],
    lastVisit: '2026-02-18',
    nextAppointment: null,
    healthScore: 58,
    healthScoreDelta: 3,
    status: 'review',
    protocolCount: 9,
    complianceRate: 81,
    alerts: [
      { id: 'a4', type: 'symptom', severity: 'info', title: 'New symptom reported', description: 'Patient reported increased brain fog this week', timestamp: NOW - DAY * 1, patientId: 'p4', read: true },
    ],
    recentLabs: [
      { marker: 'Cortisol (AM)', value: '8.2', unit: 'mcg/dL', range: '10-20', status: 'low', date: '2026-02-10' },
      { marker: 'DHEA-S', value: '128', unit: 'mcg/dL', range: '200-560', status: 'low', date: '2026-02-10' },
      { marker: 'B12', value: '310', unit: 'pg/mL', range: '500-1000', status: 'low', date: '2026-02-10' },
    ],
    notes: 'GI-MAP showed elevated Candida and low Akkermansia. Started antimicrobial protocol week 2. Adrenal support critical.',
    medications: [],
    supplements: ['Adrenal Support Complex', 'B12 Methylcobalamin 5000mcg', 'Probiotics 100B CFU', 'L-Glutamine 5g', 'Digestive Enzymes', 'Oregano Oil', 'Berberine 500mg', 'Saccharomyces Boulardii', 'Vitamin C 2g'],
    joinedDate: '2026-01-08',
  },
  {
    id: 'p5',
    name: 'Olivia Park',
    avatar: 'OP',
    age: 29,
    sex: 'F',
    primaryConditions: ['Anxiety', 'Insomnia'],
    lastVisit: '2026-02-27',
    nextAppointment: '2026-03-06',
    healthScore: 69,
    healthScoreDelta: 12,
    status: 'active',
    protocolCount: 5,
    complianceRate: 96,
    alerts: [],
    recentLabs: [
      { marker: 'Magnesium RBC', value: '4.2', unit: 'mg/dL', range: '4.2-6.8', status: 'normal', date: '2026-02-20' },
      { marker: 'Cortisol (PM)', value: '14.8', unit: 'mcg/dL', range: '3-10', status: 'high', date: '2026-02-20' },
    ],
    notes: 'Sleep improving significantly — from 4-5hrs to 6.5hrs avg. L-theanine + magnesium glycinate combo working well. Consider adding phosphatidylserine for cortisol.',
    medications: [],
    supplements: ['L-Theanine 400mg', 'Magnesium Glycinate 600mg', 'Ashwagandha KSM-66 600mg', 'Passionflower Extract', 'Melatonin 0.5mg'],
    joinedDate: '2026-01-20',
  },
  {
    id: 'p6',
    name: 'Robert Franklin',
    avatar: 'RF',
    age: 62,
    sex: 'M',
    primaryConditions: ['Rheumatoid Arthritis', 'Osteoporosis Risk'],
    lastVisit: '2026-02-15',
    nextAppointment: '2026-03-12',
    healthScore: 61,
    healthScoreDelta: 1,
    status: 'active',
    protocolCount: 7,
    complianceRate: 85,
    alerts: [
      { id: 'a5', type: 'interaction', severity: 'warning', title: 'Potential interaction', description: 'Turmeric may interact with Methotrexate — review dosing', timestamp: NOW - DAY * 5, patientId: 'p6', read: true },
    ],
    recentLabs: [
      { marker: 'hs-CRP', value: '5.2', unit: 'mg/L', range: '<1.0', status: 'high', date: '2026-02-08' },
      { marker: 'ESR', value: '38', unit: 'mm/hr', range: '<20', status: 'high', date: '2026-02-08' },
      { marker: 'Vitamin D', value: '24', unit: 'ng/mL', range: '40-80', status: 'low', date: '2026-02-08' },
    ],
    notes: 'Inflammation markers still elevated. Anti-inflammatory protocol in progress. Need to coordinate with rheumatologist on Methotrexate dosing.',
    medications: ['Methotrexate 15mg/week', 'Folic Acid 1mg'],
    supplements: ['Curcumin 1000mg', 'Omega-3 4g', 'Boswellia 800mg', 'Vitamin D 10000IU', 'Vitamin K2 200mcg', 'Probiotics', 'Glucosamine 1500mg'],
    joinedDate: '2025-08-20',
  },
  {
    id: 'p7',
    name: 'Maya Johnson',
    avatar: 'MJ',
    age: 38,
    sex: 'F',
    primaryConditions: ['IBS', 'SIBO'],
    lastVisit: '2026-02-25',
    nextAppointment: '2026-03-05',
    healthScore: 66,
    healthScoreDelta: 6,
    status: 'new',
    protocolCount: 4,
    complianceRate: 88,
    alerts: [],
    recentLabs: [
      { marker: 'Lactulose Breath Test', value: 'Positive', unit: '', range: 'Negative', status: 'high', date: '2026-02-22' },
    ],
    notes: 'New patient. SIBO confirmed via breath test. Starting with herbal antimicrobial protocol before probiotics. Low-FODMAP diet initiated.',
    medications: [],
    supplements: ['Allicin 450mg', 'Oregano Oil 200mg', 'Neem Extract', 'Digestive Enzymes'],
    joinedDate: '2026-02-20',
  },
  {
    id: 'p8',
    name: 'Thomas Wright',
    avatar: 'TW',
    age: 51,
    sex: 'M',
    primaryConditions: ['Cardiovascular Risk', 'Hyperlipidemia'],
    lastVisit: '2026-02-12',
    nextAppointment: null,
    healthScore: 71,
    healthScoreDelta: 4,
    status: 'inactive',
    protocolCount: 5,
    complianceRate: 65,
    alerts: [],
    recentLabs: [
      { marker: 'LDL-P', value: '1480', unit: 'nmol/L', range: '<1000', status: 'high', date: '2026-01-28' },
      { marker: 'Lp(a)', value: '82', unit: 'nmol/L', range: '<75', status: 'high', date: '2026-01-28' },
    ],
    notes: 'Patient hasn\'t scheduled follow-up. Compliance declining. Consider outreach.',
    medications: ['Atorvastatin 20mg'],
    supplements: ['CoQ10 300mg', 'Omega-3 4g', 'Red Yeast Rice 1200mg', 'Niacin 500mg', 'Berberine 500mg'],
    joinedDate: '2025-10-10',
  },
];

export const MOCK_PROTOCOL_TEMPLATES: ProtocolTemplate[] = [
  {
    id: 'pt1',
    name: 'Thyroid Support Protocol',
    description: 'Comprehensive naturopathic support for hypothyroidism and Hashimoto\'s thyroiditis',
    category: 'Endocrine',
    targetConditions: ['Hypothyroidism', 'Hashimoto\'s'],
    items: [
      { name: 'Selenium', dosage: '200mcg', frequency: 'Daily', timeOfDay: 'morning' },
      { name: 'Zinc Picolinate', dosage: '30mg', frequency: 'Daily', timeOfDay: 'morning' },
      { name: 'Vitamin D3', dosage: '5000IU', frequency: 'Daily', timeOfDay: 'morning' },
      { name: 'Ashwagandha KSM-66', dosage: '600mg', frequency: 'Daily', timeOfDay: 'morning' },
      { name: 'Magnesium Glycinate', dosage: '400mg', frequency: 'Daily', timeOfDay: 'evening' },
      { name: 'Iron Bisglycinate', dosage: '25mg', frequency: 'Daily', timeOfDay: 'afternoon', notes: 'Take away from thyroid medication' },
    ],
    duration: '12 weeks',
    createdBy: 'Dr. Gabriel Protocol Library',
    usageCount: 34,
    rating: 4.8,
  },
  {
    id: 'pt2',
    name: 'Metabolic Optimization',
    description: 'Blood sugar regulation and insulin sensitivity support for T2D and metabolic syndrome',
    category: 'Metabolic',
    targetConditions: ['Type 2 Diabetes', 'Insulin Resistance', 'Metabolic Syndrome'],
    items: [
      { name: 'Berberine', dosage: '500mg', frequency: '2x Daily', timeOfDay: 'morning' },
      { name: 'Chromium Picolinate', dosage: '200mcg', frequency: 'Daily', timeOfDay: 'morning' },
      { name: 'Alpha Lipoic Acid', dosage: '600mg', frequency: 'Daily', timeOfDay: 'afternoon' },
      { name: 'Omega-3 EPA/DHA', dosage: '3g', frequency: 'Daily', timeOfDay: 'morning' },
      { name: 'Magnesium', dosage: '400mg', frequency: 'Daily', timeOfDay: 'evening' },
      { name: 'CoQ10', dosage: '200mg', frequency: 'Daily', timeOfDay: 'morning' },
    ],
    duration: '16 weeks',
    createdBy: 'Dr. Gabriel Protocol Library',
    usageCount: 28,
    rating: 4.6,
  },
  {
    id: 'pt3',
    name: 'Gut Restoration',
    description: '5R gut healing protocol for dysbiosis, SIBO, and leaky gut',
    category: 'Gastrointestinal',
    targetConditions: ['SIBO', 'IBS', 'Dysbiosis', 'Leaky Gut'],
    items: [
      { name: 'Oregano Oil', dosage: '200mg', frequency: '2x Daily', timeOfDay: 'morning', notes: 'Phase 1: Weeks 1-4' },
      { name: 'Berberine', dosage: '500mg', frequency: '2x Daily', timeOfDay: 'morning', notes: 'Phase 1: Weeks 1-4' },
      { name: 'L-Glutamine', dosage: '5g', frequency: 'Daily', timeOfDay: 'morning' },
      { name: 'Probiotics 100B CFU', dosage: '1 capsule', frequency: 'Daily', timeOfDay: 'morning', notes: 'Phase 2: Start week 5' },
      { name: 'Digestive Enzymes', dosage: '1 capsule', frequency: 'With meals', timeOfDay: 'morning' },
      { name: 'Saccharomyces Boulardii', dosage: '250mg', frequency: '2x Daily', timeOfDay: 'afternoon' },
    ],
    duration: '12 weeks',
    createdBy: 'Dr. Gabriel Protocol Library',
    usageCount: 42,
    rating: 4.7,
  },
  {
    id: 'pt4',
    name: 'Adrenal Recovery',
    description: 'HPA axis support and cortisol regulation for chronic fatigue and burnout',
    category: 'Endocrine',
    targetConditions: ['Adrenal Fatigue', 'Chronic Fatigue', 'Burnout'],
    items: [
      { name: 'Ashwagandha KSM-66', dosage: '600mg', frequency: 'Daily', timeOfDay: 'morning' },
      { name: 'Rhodiola Rosea', dosage: '400mg', frequency: 'Daily', timeOfDay: 'morning' },
      { name: 'Phosphatidylserine', dosage: '300mg', frequency: 'Daily', timeOfDay: 'evening' },
      { name: 'B-Complex', dosage: '1 capsule', frequency: 'Daily', timeOfDay: 'morning' },
      { name: 'Vitamin C', dosage: '2g', frequency: 'Daily', timeOfDay: 'morning' },
      { name: 'Magnesium Glycinate', dosage: '400mg', frequency: 'Daily', timeOfDay: 'evening' },
    ],
    duration: '8 weeks',
    createdBy: 'Dr. Gabriel Protocol Library',
    usageCount: 51,
    rating: 4.9,
  },
  {
    id: 'pt5',
    name: 'Anti-Inflammatory Stack',
    description: 'Systemic inflammation reduction for autoimmune and chronic pain conditions',
    category: 'Immune/Inflammatory',
    targetConditions: ['Rheumatoid Arthritis', 'Chronic Pain', 'Autoimmune'],
    items: [
      { name: 'Curcumin (BCM-95)', dosage: '1000mg', frequency: 'Daily', timeOfDay: 'morning' },
      { name: 'Omega-3 EPA/DHA', dosage: '4g', frequency: 'Daily', timeOfDay: 'morning' },
      { name: 'Boswellia', dosage: '800mg', frequency: 'Daily', timeOfDay: 'afternoon' },
      { name: 'Quercetin', dosage: '500mg', frequency: '2x Daily', timeOfDay: 'morning' },
      { name: 'Vitamin D3', dosage: '5000IU', frequency: 'Daily', timeOfDay: 'morning' },
      { name: 'Probiotics', dosage: '50B CFU', frequency: 'Daily', timeOfDay: 'morning' },
    ],
    duration: '12 weeks',
    createdBy: 'Dr. Gabriel Protocol Library',
    usageCount: 39,
    rating: 4.5,
  },
  {
    id: 'pt6',
    name: 'Sleep & Calm Protocol',
    description: 'Natural anxiolytic and sleep support for anxiety and insomnia',
    category: 'Neurological',
    targetConditions: ['Anxiety', 'Insomnia', 'Stress'],
    items: [
      { name: 'L-Theanine', dosage: '400mg', frequency: 'Daily', timeOfDay: 'evening' },
      { name: 'Magnesium Glycinate', dosage: '600mg', frequency: 'Daily', timeOfDay: 'evening' },
      { name: 'Ashwagandha KSM-66', dosage: '600mg', frequency: 'Daily', timeOfDay: 'evening' },
      { name: 'Passionflower Extract', dosage: '500mg', frequency: 'Daily', timeOfDay: 'evening' },
      { name: 'Melatonin', dosage: '0.5mg', frequency: 'As needed', timeOfDay: 'evening', notes: 'Low dose — higher is not better' },
    ],
    duration: '8 weeks',
    createdBy: 'Dr. Gabriel Protocol Library',
    usageCount: 63,
    rating: 4.8,
  },
];

export const MOCK_MESSAGES: PractitionerMessage[] = [
  {
    id: 'm1',
    patientId: 'p1',
    patientName: 'Sarah Mitchell',
    patientAvatar: 'SM',
    lastMessage: 'My energy has been so much better this week! The afternoon slump is almost gone.',
    lastMessageTime: NOW - 3600000,
    unreadCount: 2,
    messages: [
      { id: 'msg1', sender: 'patient', content: 'Hi Dr., I wanted to update you on how I\'m feeling.', timestamp: NOW - 7200000, read: true },
      { id: 'msg2', sender: 'patient', content: 'My energy has been so much better this week! The afternoon slump is almost gone.', timestamp: NOW - 3600000, read: false },
      { id: 'msg3', sender: 'system', content: 'Patient completed morning protocol — 7 day streak', timestamp: NOW - 3600000 * 4, read: true },
    ],
  },
  {
    id: 'm2',
    patientId: 'p2',
    patientName: 'James Kowalski',
    patientAvatar: 'JK',
    lastMessage: 'I\'ve been having trouble remembering the evening supplements. Any tips?',
    lastMessageTime: NOW - DAY,
    unreadCount: 1,
    messages: [
      { id: 'msg4', sender: 'practitioner', content: 'Hi James, just checking in on your evening protocol. I noticed some missed days.', timestamp: NOW - DAY * 2, read: true },
      { id: 'msg5', sender: 'patient', content: 'I\'ve been having trouble remembering the evening supplements. Any tips?', timestamp: NOW - DAY, read: false },
    ],
  },
  {
    id: 'm3',
    patientId: 'p4',
    patientName: 'David Chen',
    patientAvatar: 'DC',
    lastMessage: 'Attached my latest GI-MAP results for your review.',
    lastMessageTime: NOW - DAY * 2,
    unreadCount: 0,
    messages: [
      { id: 'msg6', sender: 'patient', content: 'Attached my latest GI-MAP results for your review.', timestamp: NOW - DAY * 2, read: true },
      { id: 'msg7', sender: 'practitioner', content: 'Thanks David, I\'ll review these and update your protocol by end of week.', timestamp: NOW - DAY * 1.5, read: true },
    ],
  },
  {
    id: 'm4',
    patientId: 'p5',
    patientName: 'Olivia Park',
    patientAvatar: 'OP',
    lastMessage: 'Slept 7 hours last night for the first time in months! 🎉',
    lastMessageTime: NOW - DAY * 3,
    unreadCount: 0,
    messages: [
      { id: 'msg8', sender: 'patient', content: 'Slept 7 hours last night for the first time in months! 🎉', timestamp: NOW - DAY * 3, read: true },
      { id: 'msg9', sender: 'practitioner', content: 'That\'s wonderful news Olivia! The protocol is clearly working. Let\'s keep this momentum going.', timestamp: NOW - DAY * 2.8, read: true },
    ],
  },
  {
    id: 'm5',
    patientId: 'p7',
    patientName: 'Maya Johnson',
    patientAvatar: 'MJ',
    lastMessage: 'Should I continue the low-FODMAP diet during the antimicrobial phase?',
    lastMessageTime: NOW - DAY * 1,
    unreadCount: 1,
    messages: [
      { id: 'msg10', sender: 'patient', content: 'Should I continue the low-FODMAP diet during the antimicrobial phase?', timestamp: NOW - DAY, read: false },
    ],
  },
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  { id: 'apt1', patientId: 'p7', patientName: 'Maya Johnson', patientAvatar: 'MJ', type: 'follow-up', time: '9:00 AM', duration: 30, notes: 'SIBO protocol check — week 2' },
  { id: 'apt2', patientId: 'p5', patientName: 'Olivia Park', patientAvatar: 'OP', type: 'protocol-review', time: '10:30 AM', duration: 45, notes: 'Sleep protocol 4-week review' },
  { id: 'apt3', patientId: 'p1', patientName: 'Sarah Mitchell', patientAvatar: 'SM', type: 'lab-review', time: '2:00 PM', duration: 30, notes: 'Thyroid panel + iron retest review' },
  { id: 'apt4', patientId: 'p2', patientName: 'James Kowalski', patientAvatar: 'JK', type: 'follow-up', time: '3:30 PM', duration: 45, notes: 'A1c follow-up, compliance discussion' },
];

export const PROTOCOL_CATEGORIES = [
  'All',
  'Endocrine',
  'Metabolic',
  'Gastrointestinal',
  'Immune/Inflammatory',
  'Neurological',
  'Cardiovascular',
];

export function getPatientById(id: string): Patient | undefined {
  return MOCK_PATIENTS.find(p => p.id === id);
}

export function getAllAlerts(): PatientAlert[] {
  return MOCK_PATIENTS.flatMap(p => p.alerts).sort((a, b) => b.timestamp - a.timestamp);
}

export function getUnreadAlertCount(): number {
  return getAllAlerts().filter(a => !a.read).length;
}

export function getTotalUnreadMessages(): number {
  return MOCK_MESSAGES.reduce((sum, m) => sum + m.unreadCount, 0);
}

export function getPractitionerStats(): PractitionerStats {
  const activePatients = MOCK_PATIENTS.filter(p => p.status !== 'inactive');
  return {
    totalPatients: MOCK_PATIENTS.length,
    activeProtocols: MOCK_PATIENTS.reduce((sum, p) => sum + p.protocolCount, 0),
    avgCompliance: Math.round(activePatients.reduce((sum, p) => sum + p.complianceRate, 0) / activePatients.length),
    alertsToday: getAllAlerts().filter(a => !a.read).length,
    appointmentsToday: MOCK_APPOINTMENTS.length,
    labsToReview: MOCK_PATIENTS.filter(p => p.recentLabs.some(l => l.status === 'critical' || l.status === 'high')).length,
  };
}
