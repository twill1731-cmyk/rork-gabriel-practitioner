export const HEALTH_GOALS = [
  'Optimize Energy',
  'Balance Hormones',
  'Gut Health',
  'Reduce Inflammation',
  'Mental Clarity',
  'Sleep',
  'Longevity',
  'Drug-to-Natural Transition',
] as const;

export type HealthGoal = typeof HEALTH_GOALS[number];

export interface VitalCard {
  id: string;
  title: string;
  value: string;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'optimal' | 'suboptimal' | 'attention';
  icon: string;
}

export const MOCK_VITALS: VitalCard[] = [
  { id: 'sleep', title: 'Sleep Quality', value: '7.4', unit: 'hrs', trend: 'up', status: 'optimal', icon: 'Moon' },
  { id: 'heart', title: 'Resting HR', value: '62', unit: 'bpm', trend: 'stable', status: 'optimal', icon: 'Heart' },
  { id: 'activity', title: 'Activity', value: '8,240', unit: 'steps', trend: 'up', status: 'suboptimal', icon: 'Activity' },
  { id: 'stress', title: 'Stress Level', value: 'Low', unit: '', trend: 'down', status: 'optimal', icon: 'Brain' },
  { id: 'hrv', title: 'HRV', value: '48', unit: 'ms', trend: 'up', status: 'optimal', icon: 'Waves' },
  { id: 'spo2', title: 'Blood Oxygen', value: '98', unit: '%', trend: 'stable', status: 'optimal', icon: 'Droplets' },
];

export interface ProtocolItem {
  id: string;
  name: string;
  dosage: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  evidenceTier: 1 | 2 | 3;
  reason: string;
  research: string;
  contraindications: string;
  scanned?: boolean;
  brand?: string;
}

export interface ProtocolScan {
  id: string;
  date: string;
  itemCount: number;
  imageUri: string;
}

export const MOCK_PROTOCOL: ProtocolItem[] = [
  {
    id: '1',
    name: 'Omega-3 (EPA/DHA)',
    dosage: '2,000mg',
    timeOfDay: 'morning',
    evidenceTier: 1,
    reason: 'Supports cardiovascular health, reduces systemic inflammation, and supports cognitive function.',
    research: 'Multiple meta-analyses show significant reduction in inflammatory markers (CRP, IL-6) with EPA/DHA supplementation at 2g+/day.',
    contraindications: 'May interact with blood thinners. Consult practitioner if on anticoagulant therapy.',
  },
  {
    id: '2',
    name: 'Vitamin D3 + K2',
    dosage: '5,000 IU / 100mcg',
    timeOfDay: 'morning',
    evidenceTier: 1,
    reason: 'Your vitamin D levels are suboptimal. D3+K2 synergy supports bone density, immune modulation, and mood regulation.',
    research: 'Systematic reviews confirm D3 supplementation improves serum 25(OH)D levels. K2 directs calcium to bones, not arteries.',
    contraindications: 'Monitor levels every 3 months. High doses without monitoring may cause hypercalcemia.',
  },
  {
    id: '3',
    name: 'Magnesium Glycinate',
    dosage: '400mg',
    timeOfDay: 'evening',
    evidenceTier: 1,
    reason: 'Supports deep sleep architecture, muscle recovery, and stress response via GABA receptor modulation.',
    research: 'RCTs demonstrate improved sleep quality scores and reduced cortisol with glycinate form. Superior bioavailability vs oxide.',
    contraindications: 'May cause loose stools at high doses. Reduce if GI discomfort occurs.',
  },
  {
    id: '4',
    name: 'Ashwagandha KSM-66',
    dosage: '600mg',
    timeOfDay: 'morning',
    evidenceTier: 1,
    reason: 'Adaptogenic support for HPA axis regulation. Helps modulate cortisol and supports thyroid function.',
    research: '8-week RCT showed 30% reduction in cortisol levels. Improves TSH in subclinical hypothyroidism.',
    contraindications: 'Avoid with hyperthyroidism. May potentiate thyroid medication effects.',
  },
  {
    id: '5',
    name: 'Berberine HCl',
    dosage: '500mg',
    timeOfDay: 'afternoon',
    evidenceTier: 1,
    reason: 'Supports healthy blood sugar metabolism and gut microbiome diversity.',
    research: 'Meta-analysis shows comparable A1C reduction to metformin in type 2 diabetes. Activates AMPK pathway.',
    contraindications: 'May interact with metformin and CYP3A4 substrates. Space 2hrs from other medications.',
  },
  {
    id: '6',
    name: 'L-Theanine',
    dosage: '200mg',
    timeOfDay: 'afternoon',
    evidenceTier: 2,
    reason: 'Promotes alpha brainwave activity for calm focus without sedation. Supports afternoon mental clarity.',
    research: 'EEG studies confirm increased alpha wave production within 30-40 minutes of ingestion.',
    contraindications: 'Generally well tolerated. May enhance effects of anti-anxiety medications.',
  },
  {
    id: '7',
    name: 'Reishi Mushroom',
    dosage: '1,000mg',
    timeOfDay: 'evening',
    evidenceTier: 2,
    reason: 'Supports immune modulation and sleep quality via triterpene compounds. Calming adaptogenic effect.',
    research: 'Preclinical and small clinical trials suggest immunomodulatory and sleep-promoting effects.',
    contraindications: 'Avoid 2 weeks before surgery. May interact with immunosuppressants.',
  },
  {
    id: '8',
    name: 'Probiotics (Multi-strain)',
    dosage: '50B CFU',
    timeOfDay: 'morning',
    evidenceTier: 2,
    reason: 'Supports gut-brain axis communication and microbiome diversity after identifying suboptimal gut markers.',
    research: 'Strain-specific evidence for Lactobacillus and Bifidobacterium species in gut barrier integrity.',
    contraindications: 'Introduce gradually. Temporary bloating may occur during first week.',
  },
];

export const generateScannedProtocol = (): ProtocolItem[] => [
  {
    id: `scan-catalyn-${Date.now()}`,
    name: 'Catalyn (Whole Food Multi)',
    brand: 'Standard Process',
    dosage: '3 tablets',
    timeOfDay: 'morning',
    evidenceTier: 2,
    reason: 'Whole-food multivitamin providing bioavailable micronutrients from organic plant sources. Fills nutritional gaps without synthetic isolates.',
    research: 'Whole-food multivitamins show improved nutrient retention vs synthetic forms in observational studies. Standard Process uses nutrient-dense organ and plant concentrates.',
    contraindications: 'Generally well tolerated. Contains soy — avoid if soy-allergic.',
    scanned: true,
  },
  {
    id: `scan-codliver-${Date.now()}`,
    name: 'Cod Liver Oil',
    brand: 'Standard Process',
    dosage: '1 tsp (5mL)',
    timeOfDay: 'morning',
    evidenceTier: 1,
    reason: 'Natural source of vitamins A & D plus EPA/DHA. Supports immune function, skin health, and anti-inflammatory pathways.',
    research: 'Meta-analyses confirm cod liver oil supports vitamin D status and provides anti-inflammatory omega-3 fatty acids with superior absorption from whole-food matrix.',
    contraindications: 'May interact with blood thinners. Monitor vitamin A intake if supplementing separately.',
    scanned: true,
  },
  {
    id: `scan-adrenal-${Date.now()}`,
    name: 'Adrenal Complex',
    brand: 'Standard Process',
    dosage: '2 capsules',
    timeOfDay: 'morning',
    evidenceTier: 2,
    reason: 'Bovine adrenal glandular concentrate with adaptogenic herbs to support HPA axis function during periods of stress and fatigue.',
    research: 'Glandular therapy has traditional use in naturopathic medicine. Adaptogenic ingredients (ashwagandha, eleuthero) have RCT support for cortisol modulation.',
    contraindications: 'Avoid with hyperthyroidism or autoimmune conditions affecting adrenals. Not suitable for vegetarians.',
    scanned: true,
  },
  {
    id: `scan-d3-${Date.now()}`,
    name: 'Vitamin D3',
    brand: 'Standard Process',
    dosage: '5,000 IU',
    timeOfDay: 'morning',
    evidenceTier: 1,
    reason: 'Corrects suboptimal vitamin D status. Essential for immune modulation, calcium metabolism, and mood regulation.',
    research: 'Systematic reviews confirm D3 supplementation at 4,000-5,000 IU/day safely raises serum 25(OH)D to functional optimal range (60-80 ng/mL).',
    contraindications: 'Monitor serum levels quarterly. Pair with K2 if not included. Caution with granulomatous diseases.',
    scanned: true,
  },
  {
    id: `scan-zypan-${Date.now()}`,
    name: 'Zypan (Digestive Enzymes)',
    brand: 'Standard Process',
    dosage: '2 tablets with meals',
    timeOfDay: 'afternoon',
    evidenceTier: 2,
    reason: 'Combines betaine HCl, pepsin, and pancreatin to support optimal protein digestion and nutrient absorption, especially important with age-related HCl decline.',
    research: 'Studies show betaine HCl supplementation restores gastric pH in hypochlorhydric patients, improving protein and mineral absorption.',
    contraindications: 'Avoid with active gastric ulcers or NSAID use. Discontinue if burning sensation occurs.',
    scanned: true,
  },
  {
    id: `scan-turmeric-${Date.now()}`,
    name: 'Turmeric Forte',
    brand: 'Standard Process / MediHerb',
    dosage: '1 tablet',
    timeOfDay: 'afternoon',
    evidenceTier: 1,
    reason: 'Standardized curcumin extract with fenugreek fiber for enhanced bioavailability. Targets NF-κB and COX-2 inflammatory pathways.',
    research: 'Multiple RCTs demonstrate curcumin reduces hs-CRP, IL-6, and TNF-α. MediHerb formulation shows 30x improved bioavailability vs standard curcumin.',
    contraindications: 'May interact with blood thinners and diabetes medications. Avoid before surgery.',
    scanned: true,
  },
  {
    id: `scan-maglactate-${Date.now()}`,
    name: 'Magnesium Lactate',
    brand: 'Standard Process',
    dosage: '2 capsules',
    timeOfDay: 'evening',
    evidenceTier: 1,
    reason: 'Highly bioavailable magnesium form that supports relaxation, sleep quality, and muscle recovery. Gentler on GI than citrate or oxide.',
    research: 'Clinical trials show magnesium supplementation improves sleep onset latency and sleep efficiency. Lactate form shows excellent tolerability.',
    contraindications: 'Reduce dose if loose stools occur. Caution with kidney impairment.',
    scanned: true,
  },
  {
    id: `scan-mintran-${Date.now()}`,
    name: 'Min-Tran (Calming Mineral)',
    brand: 'Standard Process',
    dosage: '3 tablets',
    timeOfDay: 'evening',
    evidenceTier: 3,
    reason: 'Mineral complex with calcium, iodine, and kelp that supports parasympathetic nervous system tone. Traditional use for promoting calm and restful sleep.',
    research: 'Traditional naturopathic formulation. Mineral co-factors support GABA and serotonin pathways. Clinical use data supports calming effects.',
    contraindications: 'Contains iodine from kelp — monitor if on thyroid medication. Not recommended with Hashimoto\'s without practitioner guidance.',
    scanned: true,
  },
];

export interface LabMarker {
  id: string;
  name: string;
  value: number;
  unit: string;
  conventionalLow: number;
  conventionalHigh: number;
  gabrielLow: number;
  gabrielHigh: number;
  status: 'optimal' | 'suboptimal' | 'attention';
  interpretation: string;
}

export const MOCK_LAB_RESULTS: LabMarker[] = [
  {
    id: '1',
    name: 'Vitamin D, 25-OH',
    value: 38,
    unit: 'ng/mL',
    conventionalLow: 30,
    conventionalHigh: 100,
    gabrielLow: 60,
    gabrielHigh: 90,
    status: 'suboptimal',
    interpretation: 'While conventional ranges consider 30+ adequate, naturopathic evidence suggests 60-90 ng/mL is optimal for immune function, mood regulation, and cancer prevention. Gabriel recommends increasing D3 supplementation.',
  },
  {
    id: '2',
    name: 'Ferritin',
    value: 28,
    unit: 'ng/mL',
    conventionalLow: 12,
    conventionalHigh: 150,
    gabrielLow: 50,
    gabrielHigh: 100,
    status: 'attention',
    interpretation: 'Ferritin below 50 is associated with fatigue, hair loss, and impaired thyroid conversion. This may explain your energy concerns. Consider iron bisglycinate with vitamin C for enhanced absorption.',
  },
  {
    id: '3',
    name: 'TSH',
    value: 2.8,
    unit: 'mIU/L',
    conventionalLow: 0.45,
    conventionalHigh: 4.5,
    gabrielLow: 1.0,
    gabrielHigh: 2.0,
    status: 'suboptimal',
    interpretation: 'Functional medicine considers optimal TSH between 1.0-2.0. At 2.8, your thyroid may be working harder than ideal. Consider supporting with selenium, zinc, and ashwagandha.',
  },
  {
    id: '4',
    name: 'hs-CRP',
    value: 0.8,
    unit: 'mg/L',
    conventionalLow: 0,
    conventionalHigh: 3.0,
    gabrielLow: 0,
    gabrielHigh: 0.5,
    status: 'suboptimal',
    interpretation: 'While under the conventional cutoff, optimal inflammatory status is below 0.5 mg/L. Consider increasing omega-3 intake and adding curcumin to reduce low-grade systemic inflammation.',
  },
  {
    id: '5',
    name: 'Hemoglobin A1C',
    value: 5.2,
    unit: '%',
    conventionalLow: 4.0,
    conventionalHigh: 5.6,
    gabrielLow: 4.5,
    gabrielHigh: 5.3,
    status: 'optimal',
    interpretation: 'Your blood sugar regulation is within optimal range. Continue supporting with berberine and a low-glycemic whole foods diet.',
  },
  {
    id: '6',
    name: 'Magnesium RBC',
    value: 4.8,
    unit: 'mg/dL',
    conventionalLow: 4.2,
    conventionalHigh: 6.8,
    gabrielLow: 5.5,
    gabrielHigh: 6.5,
    status: 'suboptimal',
    interpretation: 'Serum magnesium often appears normal even when intracellular levels are depleted. RBC magnesium below 5.5 suggests suboptimal status. Continue magnesium glycinate supplementation.',
  },
];

export const SUGGESTED_QUESTIONS = [
  'What supplements help with inflammation?',
  'Interpret my latest labs',
  'Natural alternatives to metformin',
  'How to improve deep sleep naturally?',
  'Best adaptogens for stress management',
  'Should I take vitamin D with K2?',
];

export const HEALTH_CONDITIONS = [
  'Anxiety', 'Arthritis', 'Asthma', 'Autoimmune Disease', 'Back Pain',
  'Celiac Disease', 'Chronic Fatigue', 'Chronic Pain', 'COPD', 'Crohn\'s Disease',
  'Depression', 'Diabetes Type 1', 'Diabetes Type 2', 'Eczema', 'Endometriosis',
  'Fibromyalgia', 'Food Allergies', 'GERD', 'Hashimoto\'s', 'Heart Disease',
  'High Blood Pressure', 'High Cholesterol', 'Hormonal Imbalance', 'Hypothyroidism',
  'IBS', 'Infertility', 'Insomnia', 'Iron Deficiency', 'Joint Pain',
  'Kidney Disease', 'Leaky Gut', 'Liver Disease', 'Lyme Disease', 'Menopause',
  'Migraines', 'Multiple Sclerosis', 'Obesity', 'Osteoporosis', 'PCOS',
  'Psoriasis', 'Rheumatoid Arthritis', 'Rosacea', 'SIBO', 'Sleep Apnea',
  'Thyroid Nodules', 'Ulcerative Colitis', 'Vitamin B12 Deficiency',
] as const;

export interface LabUpload {
  id: string;
  date: string;
  source: 'camera' | 'gallery';
  imageUri: string;
  markersCount: number;
}

export const generateCBCMarkers = (): LabMarker[] => [
  {
    id: `cbc-wbc-${Date.now()}`,
    name: 'WBC (White Blood Cells)',
    value: 6.2,
    unit: 'K/uL',
    conventionalLow: 4.5,
    conventionalHigh: 11.0,
    gabrielLow: 5.0,
    gabrielHigh: 8.0,
    status: 'optimal',
    interpretation: 'White blood cell count is within optimal functional range, indicating a balanced immune response without signs of infection or immune suppression.',
  },
  {
    id: `cbc-rbc-${Date.now()}`,
    name: 'RBC (Red Blood Cells)',
    value: 4.1,
    unit: 'M/uL',
    conventionalLow: 4.0,
    conventionalHigh: 5.5,
    gabrielLow: 4.5,
    gabrielHigh: 5.2,
    status: 'suboptimal',
    interpretation: 'Your RBC count is at the lower end of conventional range but below naturopathic optimal. This may correlate with fatigue. Consider supporting with B12 (methylcobalamin), folate, and iron-rich whole foods.',
  },
  {
    id: `cbc-hgb-${Date.now()}`,
    name: 'Hemoglobin',
    value: 12.8,
    unit: 'g/dL',
    conventionalLow: 12.0,
    conventionalHigh: 17.5,
    gabrielLow: 13.5,
    gabrielHigh: 15.5,
    status: 'suboptimal',
    interpretation: 'Hemoglobin is conventionally "normal" but functionally suboptimal. Values below 13.5 g/dL are associated with reduced oxygen-carrying capacity, fatigue, and impaired exercise tolerance. Support with iron bisglycinate and vitamin C.',
  },
  {
    id: `cbc-hct-${Date.now()}`,
    name: 'Hematocrit',
    value: 38.5,
    unit: '%',
    conventionalLow: 36.0,
    conventionalHigh: 46.0,
    gabrielLow: 40.0,
    gabrielHigh: 44.0,
    status: 'suboptimal',
    interpretation: 'Hematocrit reflects the percentage of blood volume occupied by red blood cells. At 38.5%, your oxygen delivery may be compromised. This aligns with the RBC and hemoglobin findings.',
  },
  {
    id: `cbc-plt-${Date.now()}`,
    name: 'Platelets',
    value: 245,
    unit: 'K/uL',
    conventionalLow: 150,
    conventionalHigh: 400,
    gabrielLow: 200,
    gabrielHigh: 300,
    status: 'optimal',
    interpretation: 'Platelet count is well within functional optimal range, suggesting healthy clotting capacity and no signs of bone marrow stress or inflammatory platelet production.',
  },
  {
    id: `cbc-mcv-${Date.now()}`,
    name: 'MCV (Mean Corpuscular Vol.)',
    value: 94.2,
    unit: 'fL',
    conventionalLow: 80,
    conventionalHigh: 100,
    gabrielLow: 85,
    gabrielHigh: 92,
    status: 'attention',
    interpretation: 'MCV above 92 fL may indicate early B12 or folate insufficiency even when serum levels appear normal. Elevated MCV is an early functional marker. Consider methylated B-complex supplementation and testing serum B12 and methylmalonic acid.',
  },
];

export interface ChatMessage {
  id: string;
  role: 'user' | 'gabriel';
  content: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}
