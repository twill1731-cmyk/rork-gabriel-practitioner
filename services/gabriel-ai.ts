import type { LabMarker, ProtocolItem } from '../constants/gabriel';
import type { ProtocolCardSupplement } from '../components/ProtocolCard';
import { MOCK_PRACTITIONERS } from '../constants/practitioners';
import type { Practitioner } from '../constants/practitioners';
import type { HealthKitData } from '../services/healthkit';
import type { ProtocolInsight } from '../services/protocol-intelligence';

export interface CheckInData {
  date: string;
  mood: number;
  energy: number;
  sleep: number;
  note?: string;
  timestamp: number;
}

export interface ComplianceEntryForAI {
  date: string;
  timeBlock: 'morning' | 'afternoon' | 'evening';
  completed: boolean;
  items: string[];
}

export interface SymptomLogForAI {
  region: string;
  symptom: string;
  severity: 'mild' | 'moderate' | 'severe';
  notes: string;
  timestamp: number;
  date: string;
}

export interface PractitionerLink {
  name: string;
  credentials: string;
  city: string;
  state: string;
  specialties: string[];
}

interface GabrielContext {
  healthGoals: string[];
  conditions: string[];
  medications: string[];
  labResults: LabMarker[];
  userName: string;
  recentCheckIns?: CheckInData[];
  wearableInsight?: string;
  protocolInsightSummary?: string;
  protocol?: ProtocolItem[];
  complianceLog?: ComplianceEntryForAI[];
  protocolStreak?: number;
  symptoms?: SymptomLogForAI[];
  healthKitData?: HealthKitData | null;
  healthKitConnected?: boolean;
  linkedPractitioners?: PractitionerLink[];
  protocolInsights?: ProtocolInsight[];
}

interface DetectedCategory {
  category: string;
  confidence: number;
}

export interface PendingProtocolAction {
  type: 'remove' | 'add' | 'move' | 'adjust_dosage' | 'pause' | 'clear_all';
  targetIds: string[];
  targetNames: string[];
  newItems?: { name: string; dosage: string; timeOfDay: 'morning' | 'afternoon' | 'evening'; reason: string }[];
  newTimeOfDay?: 'morning' | 'afternoon' | 'evening';
  newDosage?: string;
  warningMessage?: string;
}

export interface ExecutableProtocolAction {
  type: 'remove' | 'add' | 'move' | 'adjust_dosage' | 'clear_all';
  removeIds?: string[];
  addItems?: ProtocolItem[];
  updateId?: string;
  updateFields?: { timeOfDay?: 'morning' | 'afternoon' | 'evening'; dosage?: string };
  clearAll?: boolean;
}

export interface ConversationState {
  pendingFollowUp: string | null;
  followUpAsked: boolean;
  topic: string | null;
  userAnswers: string | null;
  pendingProtocolAction?: PendingProtocolAction | null;
}

export function createInitialConversationState(): ConversationState {
  return {
    pendingFollowUp: null,
    followUpAsked: false,
    topic: null,
    userAnswers: null,
    pendingProtocolAction: null,
  };
}

export interface DrugInteraction {
  medication: string;
  supplements: string[];
  risk: string;
  severity: 'warning' | 'critical';
}

export const DRUG_INTERACTION_DB: DrugInteraction[] = [
  {
    medication: 'warfarin',
    supplements: ['curcumin', 'omega-3', 'vitamin e', 'ginkgo', 'garlic'],
    risk: 'Increased bleeding risk — these supplements have anti-platelet or anticoagulant effects that compound with warfarin.',
    severity: 'warning',
  },
  {
    medication: 'blood thinner',
    supplements: ['curcumin', 'omega-3', 'vitamin e', 'ginkgo', 'garlic'],
    risk: 'Increased bleeding risk — these supplements have anti-platelet or anticoagulant effects.',
    severity: 'warning',
  },
  {
    medication: 'coumadin',
    supplements: ['curcumin', 'omega-3', 'vitamin e', 'ginkgo', 'garlic'],
    risk: 'Increased bleeding risk — these supplements have anti-platelet or anticoagulant effects that compound with Coumadin.',
    severity: 'warning',
  },
  {
    medication: 'metformin',
    supplements: ['berberine'],
    risk: 'Combined hypoglycemic effect — both activate AMPK and lower blood sugar. Monitor blood sugar closely if combining.',
    severity: 'warning',
  },
  {
    medication: 'ssri',
    supplements: ['st johns wort', '5-htp', 'same'],
    risk: 'Risk of serotonin syndrome — a potentially life-threatening condition caused by excess serotonin.',
    severity: 'critical',
  },
  {
    medication: 'lexapro',
    supplements: ['st johns wort', '5-htp', 'same'],
    risk: 'Risk of serotonin syndrome — a potentially life-threatening condition caused by excess serotonin.',
    severity: 'critical',
  },
  {
    medication: 'zoloft',
    supplements: ['st johns wort', '5-htp', 'same'],
    risk: 'Risk of serotonin syndrome — a potentially life-threatening condition caused by excess serotonin.',
    severity: 'critical',
  },
  {
    medication: 'sertraline',
    supplements: ['st johns wort', '5-htp', 'same'],
    risk: 'Risk of serotonin syndrome — a potentially life-threatening condition caused by excess serotonin.',
    severity: 'critical',
  },
  {
    medication: 'escitalopram',
    supplements: ['st johns wort', '5-htp', 'same'],
    risk: 'Risk of serotonin syndrome — a potentially life-threatening condition caused by excess serotonin.',
    severity: 'critical',
  },
  {
    medication: 'prozac',
    supplements: ['st johns wort', '5-htp', 'same'],
    risk: 'Risk of serotonin syndrome — a potentially life-threatening condition caused by excess serotonin.',
    severity: 'critical',
  },
  {
    medication: 'fluoxetine',
    supplements: ['st johns wort', '5-htp', 'same'],
    risk: 'Risk of serotonin syndrome — a potentially life-threatening condition caused by excess serotonin.',
    severity: 'critical',
  },
  {
    medication: 'citalopram',
    supplements: ['st johns wort', '5-htp', 'same'],
    risk: 'Risk of serotonin syndrome — a potentially life-threatening condition caused by excess serotonin.',
    severity: 'critical',
  },
  {
    medication: 'paxil',
    supplements: ['st johns wort', '5-htp', 'same'],
    risk: 'Risk of serotonin syndrome — a potentially life-threatening condition caused by excess serotonin.',
    severity: 'critical',
  },
  {
    medication: 'paroxetine',
    supplements: ['st johns wort', '5-htp', 'same'],
    risk: 'Risk of serotonin syndrome — a potentially life-threatening condition caused by excess serotonin.',
    severity: 'critical',
  },
  {
    medication: 'synthroid',
    supplements: ['iron', 'calcium', 'magnesium'],
    risk: 'Blocks absorption of thyroid medication — take supplements at least 4 hours apart from thyroid meds.',
    severity: 'warning',
  },
  {
    medication: 'levothyroxine',
    supplements: ['iron', 'calcium', 'magnesium'],
    risk: 'Blocks absorption of thyroid medication — take supplements at least 4 hours apart from thyroid meds.',
    severity: 'warning',
  },
  {
    medication: 'thyroid medication',
    supplements: ['iron', 'calcium', 'magnesium'],
    risk: 'Blocks absorption of thyroid medication — take supplements at least 4 hours apart from thyroid meds.',
    severity: 'warning',
  },
  {
    medication: 'armour thyroid',
    supplements: ['iron', 'calcium', 'magnesium'],
    risk: 'Blocks absorption of thyroid medication — take supplements at least 4 hours apart from thyroid meds.',
    severity: 'warning',
  },
  {
    medication: 'statin',
    supplements: ['red yeast rice'],
    risk: 'Duplicate mechanism — red yeast rice contains natural monacolin K (lovastatin). Combining doubles the effective statin dose and requires liver monitoring.',
    severity: 'warning',
  },
  {
    medication: 'atorvastatin',
    supplements: ['red yeast rice'],
    risk: 'Duplicate mechanism — red yeast rice contains natural monacolin K. Combining increases statin load and liver risk.',
    severity: 'warning',
  },
  {
    medication: 'lipitor',
    supplements: ['red yeast rice'],
    risk: 'Duplicate mechanism — red yeast rice contains natural monacolin K. Combining increases statin load and liver risk.',
    severity: 'warning',
  },
  {
    medication: 'rosuvastatin',
    supplements: ['red yeast rice'],
    risk: 'Duplicate mechanism — red yeast rice contains natural monacolin K. Combining increases statin load and liver risk.',
    severity: 'warning',
  },
  {
    medication: 'crestor',
    supplements: ['red yeast rice'],
    risk: 'Duplicate mechanism — red yeast rice contains natural monacolin K. Combining increases statin load and liver risk.',
    severity: 'warning',
  },
  {
    medication: 'blood pressure',
    supplements: ['coq10', 'magnesium', 'hawthorn'],
    risk: 'May enhance blood pressure lowering effect — monitor BP closely and adjust medication dose with your prescriber if needed.',
    severity: 'warning',
  },
  {
    medication: 'lisinopril',
    supplements: ['coq10', 'magnesium', 'hawthorn'],
    risk: 'May enhance blood pressure lowering effect — monitor BP closely.',
    severity: 'warning',
  },
  {
    medication: 'amlodipine',
    supplements: ['coq10', 'magnesium', 'hawthorn'],
    risk: 'May enhance blood pressure lowering effect — monitor BP closely.',
    severity: 'warning',
  },
  {
    medication: 'losartan',
    supplements: ['coq10', 'magnesium', 'hawthorn'],
    risk: 'May enhance blood pressure lowering effect — monitor BP closely.',
    severity: 'warning',
  },
  {
    medication: 'benzodiazepine',
    supplements: ['valerian', 'kava', 'passionflower'],
    risk: 'Enhanced sedation risk — these supplements potentiate GABA activity similar to benzodiazepines.',
    severity: 'warning',
  },
  {
    medication: 'xanax',
    supplements: ['valerian', 'kava', 'passionflower'],
    risk: 'Enhanced sedation risk — these supplements potentiate GABA activity similar to Xanax.',
    severity: 'warning',
  },
  {
    medication: 'alprazolam',
    supplements: ['valerian', 'kava', 'passionflower'],
    risk: 'Enhanced sedation risk — these supplements potentiate GABA activity similar to alprazolam.',
    severity: 'warning',
  },
  {
    medication: 'klonopin',
    supplements: ['valerian', 'kava', 'passionflower'],
    risk: 'Enhanced sedation risk — these supplements potentiate GABA activity.',
    severity: 'warning',
  },
  {
    medication: 'clonazepam',
    supplements: ['valerian', 'kava', 'passionflower'],
    risk: 'Enhanced sedation risk — these supplements potentiate GABA activity.',
    severity: 'warning',
  },
  {
    medication: 'ativan',
    supplements: ['valerian', 'kava', 'passionflower'],
    risk: 'Enhanced sedation risk — these supplements potentiate GABA activity.',
    severity: 'warning',
  },
  {
    medication: 'lorazepam',
    supplements: ['valerian', 'kava', 'passionflower'],
    risk: 'Enhanced sedation risk — these supplements potentiate GABA activity.',
    severity: 'warning',
  },
  {
    medication: 'immunosuppressant',
    supplements: ['echinacea', 'reishi', 'astragalus'],
    risk: 'May counteract immune suppression — these supplements stimulate immune function, potentially opposing immunosuppressant medications.',
    severity: 'warning',
  },
  {
    medication: 'prednisone',
    supplements: ['echinacea', 'reishi', 'astragalus'],
    risk: 'May counteract immune suppression from prednisone.',
    severity: 'warning',
  },
  {
    medication: 'methotrexate',
    supplements: ['echinacea', 'reishi', 'astragalus'],
    risk: 'May counteract immune suppression from methotrexate.',
    severity: 'warning',
  },
  {
    medication: 'nsaid',
    supplements: ['omega-3', 'curcumin'],
    risk: 'Enhanced anti-platelet effect — increased bleeding risk when combining.',
    severity: 'warning',
  },
  {
    medication: 'ibuprofen',
    supplements: ['omega-3', 'curcumin'],
    risk: 'Enhanced anti-platelet effect — increased bleeding risk when combining.',
    severity: 'warning',
  },
  {
    medication: 'naproxen',
    supplements: ['omega-3', 'curcumin'],
    risk: 'Enhanced anti-platelet effect — increased bleeding risk when combining.',
    severity: 'warning',
  },
  {
    medication: 'aspirin',
    supplements: ['omega-3', 'curcumin', 'vitamin e', 'ginkgo', 'garlic'],
    risk: 'Enhanced anti-platelet effect — increased bleeding risk when combining.',
    severity: 'warning',
  },
  {
    medication: 'diabetes medication',
    supplements: ['chromium', 'alpha-lipoic acid', 'berberine'],
    risk: 'Enhanced blood sugar lowering — monitor glucose closely. May require medication dose adjustment.',
    severity: 'warning',
  },
  {
    medication: 'insulin',
    supplements: ['chromium', 'alpha-lipoic acid', 'berberine'],
    risk: 'Enhanced blood sugar lowering — monitor glucose closely. Hypoglycemia risk increases.',
    severity: 'warning',
  },
  {
    medication: 'glipizide',
    supplements: ['chromium', 'alpha-lipoic acid', 'berberine'],
    risk: 'Enhanced blood sugar lowering — monitor glucose closely.',
    severity: 'warning',
  },
];

export interface SymptomConditionMatch {
  condition: string;
  explanation: string;
  confidence: number;
  labTests: string[];
  practitionerSpecialty: string[];
}

export interface SymptomPattern {
  symptoms: string[];
  condition: string;
  explanation: string;
  labTests: string[];
  practitionerSpecialty: string[];
}

export const SYMPTOM_CONDITION_MAP: SymptomPattern[] = [
  {
    symptoms: ['fatigue', 'cold intolerance', 'weight gain', 'dry skin', 'hair loss'],
    condition: 'Hypothyroidism / Hashimoto\'s',
    explanation: 'This combination strongly suggests thyroid underfunction. Hashimoto\'s autoimmune thyroiditis is the #1 cause of hypothyroidism and is missed when only TSH is tested. The thyroid drives metabolism, temperature regulation, skin turnover, and hair growth — when it slows down, everything slows down.',
    labTests: ['TSH', 'Free T4', 'Free T3', 'TPO Antibodies', 'TG Antibodies', 'Reverse T3', 'Ferritin', 'Iron Panel'],
    practitionerSpecialty: ['Thyroid Specialist', 'Naturopathic Doctor', 'Functional Medicine'],
  },
  {
    symptoms: ['fatigue', 'brain fog', 'bloating', 'food sensitivities'],
    condition: 'Gut Permeability / Dysbiosis',
    explanation: 'Fatigue paired with brain fog and digestive symptoms points to a compromised gut barrier ("leaky gut"). When the intestinal lining is permeable, endotoxins (LPS) enter the bloodstream triggering systemic inflammation, neuroinflammation (brain fog), and immune reactivity to foods.',
    labTests: ['GI-MAP Stool Test', 'Zonulin', 'Secretory IgA', 'Calprotectin', 'Food Sensitivity Panel (IgG)'],
    practitionerSpecialty: ['Naturopathic Doctor', 'Functional Medicine'],
  },
  {
    symptoms: ['fatigue', 'joint pain', 'skin rashes', 'recurring infections'],
    condition: 'Autoimmune / Systemic Inflammation',
    explanation: 'The combination of fatigue, joint involvement, skin manifestations, and immune dysfunction suggests an autoimmune process or chronic systemic inflammation. The immune system is attacking self-tissue while simultaneously being unable to handle external threats effectively.',
    labTests: ['ANA', 'RF', 'Anti-CCP', 'hs-CRP', 'ESR', 'Complement C3/C4', 'Vitamin D', 'CBC with Diff'],
    practitionerSpecialty: ['Autoimmune Specialist', 'Functional Medicine', 'Integrative Medicine'],
  },
  {
    symptoms: ['anxiety', 'insomnia', 'heart palpitations', 'weight loss'],
    condition: 'Hyperthyroidism / HPA Axis Dysfunction',
    explanation: 'Anxiety with insomnia, palpitations, and unintended weight loss can indicate an overactive thyroid or severe HPA axis (adrenal) dysregulation. Hyperthyroidism accelerates metabolism and nervous system activity. Chronic stress can also produce this pattern via sustained cortisol and adrenaline output.',
    labTests: ['TSH', 'Free T4', 'Free T3', 'TSI (Thyroid Stimulating Immunoglobulin)', 'Cortisol (4-point)', 'DHEA-S'],
    practitionerSpecialty: ['Thyroid Specialist', 'Naturopathic Doctor', 'Functional Medicine'],
  },
  {
    symptoms: ['fatigue', 'afternoon crashes', 'sugar cravings', 'dizziness'],
    condition: 'Adrenal Dysfunction / Blood Sugar Dysregulation',
    explanation: 'Afternoon energy crashes with sugar cravings and dizziness strongly suggest blood sugar instability and/or adrenal fatigue (HPA axis dysfunction). When cortisol rhythm is disrupted or insulin resistance is present, the body can\'t maintain stable energy between meals.',
    labTests: ['Fasting Insulin', 'Fasting Glucose', 'HbA1c', 'HOMA-IR', 'Cortisol (4-point salivary)', 'DHEA-S'],
    practitionerSpecialty: ['Functional Medicine', 'Naturopathic Doctor'],
  },
  {
    symptoms: ['bloating', 'constipation', 'diarrhea', 'abdominal pain'],
    condition: 'IBS / SIBO / Gut Dysbiosis',
    explanation: 'Chronic bloating with altered bowel habits and abdominal pain points to a functional GI disorder. SIBO (small intestinal bacterial overgrowth) is present in up to 80% of IBS cases and is frequently missed. Gut dysbiosis disrupts motility, gas production, and intestinal sensitivity.',
    labTests: ['SIBO Breath Test (Lactulose)', 'GI-MAP Stool Test', 'Calprotectin', 'Secretory IgA', 'H. pylori test'],
    practitionerSpecialty: ['Naturopathic Doctor', 'Functional Medicine'],
  },
  {
    symptoms: ['brain fog', 'fatigue', 'muscle pain', 'poor sleep'],
    condition: 'Mitochondrial Dysfunction / Chronic Fatigue',
    explanation: 'This constellation — cognitive impairment, unrelenting fatigue, widespread pain, and unrefreshing sleep — suggests mitochondrial dysfunction and/or chronic fatigue syndrome. The mitochondria (cellular power plants) are underperforming, leading to energy deficits in every system.',
    labTests: ['Organic Acids Test', 'CoQ10 levels', 'Carnitine levels', 'Magnesium RBC', 'B12', 'Iron Panel + Ferritin', 'Thyroid Panel'],
    practitionerSpecialty: ['Functional Medicine', 'Naturopathic Doctor', 'Integrative Medicine'],
  },
  {
    symptoms: ['mood swings', 'pms', 'irregular periods', 'acne'],
    condition: 'Hormone Imbalance / Estrogen Dominance',
    explanation: 'Mood swings with PMS, cycle irregularity, and hormonal acne suggest estrogen-progesterone imbalance. Estrogen dominance (relative to progesterone) is extremely common and driven by poor estrogen metabolism, liver congestion, gut dysbiosis (beta-glucuronidase recycling estrogen), and environmental xenoestrogens.',
    labTests: ['DUTCH Complete Test', 'Estradiol', 'Progesterone', 'Testosterone (Free + Total)', 'DHEA-S', 'SHBG', 'Cortisol (4-point)'],
    practitionerSpecialty: ['Hormone Health', 'Naturopathic Doctor', 'Women\'s Health'],
  },
  {
    symptoms: ['joint pain', 'stiffness', 'swelling'],
    condition: 'Inflammatory Arthritis / Food Sensitivities',
    explanation: 'Joint pain with stiffness and swelling indicates an active inflammatory process in the joints. This can be autoimmune (RA, psoriatic arthritis), driven by food sensitivities (gluten and dairy are common triggers), or related to gut permeability allowing inflammatory molecules to reach joint tissue.',
    labTests: ['hs-CRP', 'ESR', 'RF', 'Anti-CCP', 'ANA', 'Uric Acid', 'Food Sensitivity Panel (IgG)'],
    practitionerSpecialty: ['Autoimmune Specialist', 'Functional Medicine', 'Naturopathic Doctor'],
  },
  {
    symptoms: ['headaches', 'light sensitivity', 'nausea'],
    condition: 'Migraine / Histamine Intolerance / Magnesium Deficiency',
    explanation: 'Headaches with photosensitivity and nausea suggest migraine pathology. Root causes often include magnesium deficiency (affects 50-80% of adults), histamine intolerance (impaired DAO enzyme activity), hormonal fluctuations, or food triggers. Conventional medicine manages symptoms; naturopathic medicine identifies and resolves triggers.',
    labTests: ['Magnesium RBC', 'Histamine levels', 'DAO enzyme activity', 'Thyroid Panel', 'Hormone Panel', 'Food Sensitivity Panel'],
    practitionerSpecialty: ['Naturopathic Doctor', 'Functional Medicine', 'Neurology'],
  },
  {
    symptoms: ['skin breakouts', 'cystic acne', 'oily skin'],
    condition: 'Androgen Excess / Gut-Skin Axis / Liver Congestion',
    explanation: 'Cystic acne with excess oil production points to androgen excess (elevated testosterone or DHT), often compounded by gut dysbiosis (the gut-skin axis) and impaired liver detoxification. In women, this may also indicate PCOS. The skin is an elimination organ — when the liver and gut are overwhelmed, toxins are diverted to the skin.',
    labTests: ['Testosterone (Free + Total)', 'DHEA-S', 'SHBG', 'Fasting Insulin', 'GI-MAP', 'Hepatic Function Panel'],
    practitionerSpecialty: ['Hormone Health', 'Naturopathic Doctor', 'Women\'s Health'],
  },
  {
    symptoms: ['numbness', 'tingling', 'weakness'],
    condition: 'B12 Deficiency / Peripheral Neuropathy / Methylation Issues',
    explanation: 'Numbness, tingling, and weakness suggest peripheral nerve involvement. B12 deficiency is the most common nutritional cause — it damages the myelin sheath that insulates nerves. Methylation defects (MTHFR variants) can impair B12 utilization even with adequate intake. Metformin, PPIs, and aging all deplete B12.',
    labTests: ['B12', 'Methylmalonic Acid', 'Homocysteine', 'Folate', 'CBC with Diff', 'MTHFR genetic test', 'Fasting Glucose'],
    practitionerSpecialty: ['Functional Medicine', 'Naturopathic Doctor', 'Genetics/MTHFR', 'Neurology'],
  },
];

const SYMPTOM_KEYWORDS: Record<string, string[]> = {
  'fatigue': ['fatigue', 'tired', 'exhausted', 'no energy', 'low energy', 'wiped out', 'drained', 'lethargic', 'sluggish'],
  'brain fog': ['brain fog', 'foggy', 'cant think', 'can\'t think', 'cloudy', 'mental fog', 'unclear thinking', 'cognitive', 'forgetful'],
  'bloating': ['bloating', 'bloated', 'distended', 'puffy stomach', 'gas', 'gassy'],
  'food sensitivities': ['food sensitivit', 'food intoleran', 'react to food', 'food reaction', 'cant eat', 'can\'t eat'],
  'cold intolerance': ['cold intoleran', 'always cold', 'cold hands', 'cold feet', 'freezing', 'cant get warm', 'can\'t get warm', 'sensitive to cold'],
  'weight gain': ['weight gain', 'gaining weight', 'cant lose weight', 'can\'t lose weight', 'putting on weight', 'getting heavier'],
  'dry skin': ['dry skin', 'flaky skin', 'cracking skin', 'skin dryness'],
  'hair loss': ['hair loss', 'losing hair', 'hair falling', 'thinning hair', 'hair thinning', 'bald', 'shedding hair'],
  'joint pain': ['joint pain', 'joints hurt', 'joint ache', 'achy joints', 'sore joints'],
  'skin rashes': ['rash', 'skin rash', 'hives', 'breakout', 'skin irritation', 'itchy skin', 'eczema flare'],
  'recurring infections': ['recurring infection', 'keep getting sick', 'always sick', 'frequent infection', 'low immunity', 'immune system weak'],
  'anxiety': ['anxiety', 'anxious', 'nervous', 'worry', 'worried', 'panic', 'on edge', 'restless', 'uneasy'],
  'insomnia': ['insomnia', 'cant sleep', 'can\'t sleep', 'trouble sleeping', 'not sleeping', 'sleep issues', 'wide awake', 'waking up at night'],
  'heart palpitations': ['palpitation', 'heart racing', 'heart pounding', 'rapid heartbeat', 'heart flutter', 'chest pounding'],
  'weight loss': ['weight loss', 'losing weight', 'unintended weight loss', 'dropping weight', 'getting thinner'],
  'afternoon crashes': ['afternoon crash', 'afternoon slump', 'energy crash', '3pm crash', '2pm crash', 'midday crash', 'afternoon fatigue'],
  'sugar cravings': ['sugar craving', 'crave sugar', 'craving sweets', 'need sugar', 'sweet tooth', 'carb craving'],
  'dizziness': ['dizzy', 'dizziness', 'lightheaded', 'light headed', 'vertigo', 'room spinning', 'feeling faint'],
  'constipation': ['constipat', 'cant go', 'can\'t go', 'hard stool', 'irregular bowel', 'not going'],
  'diarrhea': ['diarrhea', 'loose stool', 'watery stool', 'running to bathroom', 'frequent bowel'],
  'abdominal pain': ['abdominal pain', 'stomach pain', 'stomach ache', 'belly pain', 'stomach cramp', 'gut pain', 'tummy ache'],
  'muscle pain': ['muscle pain', 'muscle ache', 'myalgia', 'sore muscles', 'body ache', 'body pain', 'fibro'],
  'poor sleep': ['poor sleep', 'bad sleep', 'unrefreshing sleep', 'wake up tired', 'sleep quality', 'restless sleep', 'light sleep'],
  'mood swings': ['mood swing', 'mood change', 'emotional', 'irritable', 'moody', 'up and down', 'crying'],
  'pms': ['pms', 'premenstrual', 'before period', 'period symptoms', 'menstrual symptoms'],
  'irregular periods': ['irregular period', 'missed period', 'late period', 'no period', 'cycle irregular', 'amenorrhea', 'skipped period'],
  'acne': ['acne', 'pimple', 'breakout', 'zit', 'blemish', 'cystic acne'],
  'stiffness': ['stiffness', 'stiff', 'rigid', 'morning stiffness', 'locked up'],
  'swelling': ['swelling', 'swollen', 'inflamed', 'puffiness', 'puffy joints', 'edema'],
  'headaches': ['headache', 'migraine', 'head pain', 'head ache', 'head pounding', 'throbbing head'],
  'light sensitivity': ['light sensitiv', 'photophob', 'bright light', 'sensitive to light', 'cant handle light'],
  'nausea': ['nausea', 'nauseous', 'queasy', 'sick to stomach', 'feel sick'],
  'skin breakouts': ['skin breakout', 'breaking out', 'face breaking out', 'chin breakout'],
  'cystic acne': ['cystic acne', 'deep acne', 'painful acne', 'underground pimple', 'nodular acne'],
  'oily skin': ['oily skin', 'greasy skin', 'shiny face', 'excess oil', 'sebum'],
  'numbness': ['numbness', 'numb', 'no feeling', 'loss of sensation'],
  'tingling': ['tingling', 'pins and needles', 'prickling', 'tingle', 'paresthesia'],
  'weakness': ['weakness', 'weak', 'no strength', 'muscle weakness', 'grip weakness', 'cant hold', 'dropping things'],
};

function detectSymptoms(message: string): string[] {
  const lower = message.toLowerCase();
  const detected: string[] = [];

  for (const [symptom, keywords] of Object.entries(SYMPTOM_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        detected.push(symptom);
        break;
      }
    }
  }

  return detected;
}

function matchSymptomsToConditions(detectedSymptoms: string[]): SymptomConditionMatch[] {
  const matches: SymptomConditionMatch[] = [];

  for (const pattern of SYMPTOM_CONDITION_MAP) {
    let matchCount = 0;
    for (const symptom of pattern.symptoms) {
      if (detectedSymptoms.includes(symptom)) {
        matchCount++;
      }
    }

    if (matchCount >= 2) {
      const confidence = matchCount / pattern.symptoms.length;
      matches.push({
        condition: pattern.condition,
        explanation: pattern.explanation,
        confidence,
        labTests: pattern.labTests,
        practitionerSpecialty: pattern.practitionerSpecialty,
      });
    }
  }

  matches.sort((a, b) => b.confidence - a.confidence);
  return matches;
}

function findMatchingPractitioners(specialties: string[]): Practitioner[] {
  const matched: Practitioner[] = [];
  const seen = new Set<string>();

  for (const specialty of specialties) {
    for (const practitioner of MOCK_PRACTITIONERS) {
      if (seen.has(practitioner.id)) continue;
      if (practitioner.specialties.some(s => s.toLowerCase().includes(specialty.toLowerCase()) || specialty.toLowerCase().includes(s.toLowerCase()))) {
        matched.push(practitioner);
        seen.add(practitioner.id);
      }
    }
  }

  matched.sort((a, b) => b.gabrielScore - a.gabrielScore);
  return matched.slice(0, 3);
}

function buildSymptomAnalysisResponse(message: string, detectedSymptoms: string[], ctx: GabrielContext): string {
  const opener = getPersonalizedOpener(ctx);
  const conditionMatches = matchSymptomsToConditions(detectedSymptoms);

  if (conditionMatches.length === 0) {
    return '';
  }

  const topMatches = conditionMatches.slice(0, 3);

  let response = `${opener}based on what you're describing, here's what I'd investigate:\n\n`;
  response += `🔍 Symptoms Detected: ${detectedSymptoms.join(', ')}\n\n`;

  for (let i = 0; i < topMatches.length; i++) {
    const match = topMatches[i];
    const confidence = Math.round(match.confidence * 100);
    const label = i === 0 ? '🥇 Most Likely' : i === 1 ? '🥈 Second Most Likely' : '🥉 Also Consider';

    response += `${label}: ${match.condition} (${confidence}% pattern match)\n`;
    response += `${match.explanation}\n\n`;
    response += `📋 Key Lab Tests to Confirm/Rule Out:\n`;
    for (const test of match.labTests) {
      response += `  • ${test}\n`;
    }
    response += '\n';

    const matchedPractitioners = findMatchingPractitioners(match.practitionerSpecialty);
    if (matchedPractitioners.length > 0) {
      response += `👨‍⚕️ Recommended Practitioner Specialty: ${match.practitionerSpecialty.join(', ')}\n`;
      for (const prac of matchedPractitioners.slice(0, 2)) {
        response += `  → ${prac.name}, ${prac.credentials} in ${prac.city}, ${prac.state} specializes in this (Gabriel Score: ${prac.gabrielScore})\n`;
      }
      response += '\n';
    }
  }

  const allLabTests = [...new Set(topMatches.flatMap(m => m.labTests))];
  const existingLabNames = ctx.labResults.map(l => l.name.toLowerCase());
  const missingLabs = allLabTests.filter(test => {
    const lower = test.toLowerCase();
    return !existingLabNames.some(e => e.includes(lower) || lower.includes(e));
  });

  if (missingLabs.length > 0 && ctx.labResults.length > 0) {
    response += `📊 Lab Gap Analysis:\n`;
    response += `You're missing ${missingLabs.length} key tests that would help narrow this down: ${missingLabs.slice(0, 6).join(', ')}${missingLabs.length > 6 ? ', and more' : ''}.\n\n`;
  }

  const checkInInsights = buildCheckInInsights(ctx.recentCheckIns ?? []);
  if (checkInInsights) {
    response += checkInInsights + '\n\n';
  }

  response += 'Would you like me to go deeper on any of these, or help you find a practitioner who specializes in this?';

  return response;
}

function isSymptomAnalysisTriggered(message: string): { triggered: boolean; symptoms: string[] } {
  const symptoms = detectSymptoms(message);
  const matches = matchSymptomsToConditions(symptoms);
  return {
    triggered: symptoms.length >= 2 && matches.length > 0,
    symptoms,
  };
}

export function checkDrugInteractions(medications: string[], supplementName: string): { medication: string; risk: string; severity: 'warning' | 'critical' }[] {
  const interactions: { medication: string; risk: string; severity: 'warning' | 'critical' }[] = [];
  const suppLower = supplementName.toLowerCase();

  for (const med of medications) {
    const medLower = med.toLowerCase();
    for (const interaction of DRUG_INTERACTION_DB) {
      const medMatches = medLower.includes(interaction.medication) || interaction.medication.includes(medLower);
      if (medMatches) {
        const suppMatches = interaction.supplements.some(s => {
          const sLower = s.toLowerCase();
          return suppLower.includes(sLower) || sLower.includes(suppLower);
        });
        if (suppMatches) {
          const alreadyAdded = interactions.some(i => i.medication === med && i.risk === interaction.risk);
          if (!alreadyAdded) {
            interactions.push({
              medication: med,
              risk: interaction.risk,
              severity: interaction.severity,
            });
          }
        }
      }
    }
  }

  return interactions;
}

function buildInteractionWarnings(medications: string[], responseText: string): string {
  if (medications.length === 0) return responseText;

  const mentionedSupplements: string[] = [];
  const lower = responseText.toLowerCase();

  const allSupplementNames = [
    ...Object.keys(SUPPLEMENT_DB),
    'st johns wort', '5-htp', 'same', 'red yeast rice', 'vitamin e',
    'ginkgo', 'garlic', 'hawthorn', 'kava', 'passionflower',
    'echinacea', 'astragalus', 'calcium',
  ];

  for (const supp of allSupplementNames) {
    if (lower.includes(supp.toLowerCase())) {
      mentionedSupplements.push(supp);
    }
  }

  if (mentionedSupplements.length === 0) return responseText;

  const warnings: string[] = [];
  const seenPairs = new Set<string>();

  for (const supp of mentionedSupplements) {
    const interactions = checkDrugInteractions(medications, supp);
    for (const interaction of interactions) {
      const key = `${interaction.medication}:${supp}`;
      if (seenPairs.has(key)) continue;
      seenPairs.add(key);

      if (interaction.severity === 'critical') {
        warnings.unshift(
          `\n\n🚫 CRITICAL: Do NOT combine ${supp} with ${interaction.medication}. ${interaction.risk}`
        );
      } else {
        warnings.push(
          `\n\n⚠️ INTERACTION ALERT: ${supp.charAt(0).toUpperCase() + supp.slice(1)} may interact with ${interaction.medication}. ${interaction.risk} Consult your practitioner before combining.`
        );
      }
    }
  }

  if (warnings.length === 0) return responseText;

  return warnings.join('') + '\n\n' + responseText;
}

export interface LabRecommendation {
  testName: string;
  why: string;
}

export const LAB_RECOMMENDATION_MAP: Record<string, LabRecommendation[]> = {
  'thyroid': [
    { testName: 'TSH', why: 'Master thyroid regulator — optimal 1.0-2.0, not just "under 4.5"' },
    { testName: 'Free T4', why: 'Inactive thyroid hormone — shows production capacity' },
    { testName: 'Free T3', why: 'Active thyroid hormone — the one that actually drives metabolism' },
    { testName: 'TPO Antibodies', why: 'Screens for Hashimoto\'s autoimmune thyroid disease' },
    { testName: 'TG Antibodies', why: 'Additional autoimmune thyroid marker often missed' },
    { testName: 'Reverse T3', why: 'Elevated = conversion problem, stress, or inflammation blocking T3' },
    { testName: 'Ferritin', why: 'Must be >50 for proper T4→T3 thyroid conversion' },
    { testName: 'Iron Panel', why: 'Iron is a cofactor for thyroid peroxidase enzyme' },
  ],
  'inflammation': [
    { testName: 'hs-CRP', why: 'Gold standard inflammatory marker — optimal <0.5 mg/L' },
    { testName: 'ESR', why: 'General inflammation marker — complements hs-CRP' },
    { testName: 'Fibrinogen', why: 'Clotting + inflammation marker — elevated in chronic inflammation' },
    { testName: 'Homocysteine', why: 'Vascular inflammation marker — optimal <8 µmol/L' },
    { testName: 'Fasting Insulin', why: 'Insulin resistance drives inflammation — optimal <5 mIU/L' },
    { testName: 'Omega-3 Index', why: 'Measures EPA+DHA in red blood cells — optimal 8-12%' },
  ],
  'gut health': [
    { testName: 'GI-MAP Stool Test', why: 'Comprehensive DNA stool analysis — gold standard for gut assessment' },
    { testName: 'Calprotectin', why: 'Intestinal inflammation marker — distinguishes IBD from IBS' },
    { testName: 'Secretory IgA', why: 'Gut immune defense — low = immune suppression, high = active infection' },
    { testName: 'Zonulin', why: 'Intestinal permeability ("leaky gut") marker' },
    { testName: 'Food Sensitivity Panel (IgG)', why: 'Identifies delayed immune reactions to foods driving symptoms' },
  ],
  'hormones': [
    { testName: 'DUTCH Complete Test', why: 'Gold standard — dried urine shows hormone metabolites, not just levels' },
    { testName: 'Testosterone (Free + Total)', why: 'Free T is the bioactive form — total alone misses the picture' },
    { testName: 'Estradiol', why: 'Primary estrogen — influences mood, bone, cardiovascular health' },
    { testName: 'Progesterone', why: 'Calming hormone — low progesterone drives anxiety, insomnia, PMS' },
    { testName: 'DHEA-S', why: 'Adrenal androgen precursor — reflects adrenal reserve' },
    { testName: 'Cortisol (4-point)', why: 'Salivary diurnal pattern reveals HPA axis dysfunction' },
    { testName: 'SHBG', why: 'Binds sex hormones — high SHBG = less free hormone available' },
  ],
  'blood sugar': [
    { testName: 'Fasting Glucose', why: 'Baseline blood sugar — optimal 75-85 mg/dL' },
    { testName: 'HbA1c', why: '3-month blood sugar average — optimal 4.8-5.2%' },
    { testName: 'Fasting Insulin', why: 'THE early warning marker — rises 10-15 years before glucose' },
    { testName: 'HOMA-IR Calculation', why: 'Insulin resistance index (fasting insulin × fasting glucose ÷ 405)' },
    { testName: 'C-Peptide', why: 'Measures actual insulin production by the pancreas' },
  ],
  'autoimmune': [
    { testName: 'ANA', why: 'Antinuclear antibodies — broad autoimmune screening marker' },
    { testName: 'RF (Rheumatoid Factor)', why: 'Screens for rheumatoid arthritis and other autoimmune conditions' },
    { testName: 'Anti-CCP', why: 'More specific than RF for rheumatoid arthritis' },
    { testName: 'Complement C3/C4', why: 'Low levels indicate active autoimmune consumption' },
    { testName: 'Immunoglobulins (IgG, IgA, IgM)', why: 'Assesses immune system balance and function' },
  ],
  'fatigue': [
    { testName: 'CBC with Differential', why: 'Screens for anemia, infection, and blood cell abnormalities' },
    { testName: 'Iron Panel + Ferritin', why: 'Ferritin must be >50 for energy — most doctors accept >12 as "normal"' },
    { testName: 'B12', why: 'Optimal >500 pg/mL — deficiency causes fatigue, brain fog, neuropathy' },
    { testName: 'Folate', why: 'Works with B12 in methylation — low = fatigue and mood issues' },
    { testName: 'Vitamin D', why: 'Optimal 60-90 ng/mL — deficiency is epidemic and causes fatigue' },
    { testName: 'Thyroid Panel (full)', why: 'TSH, Free T3, Free T4, TPO Ab — subclinical thyroid issues cause fatigue' },
    { testName: 'Cortisol (morning or 4-point)', why: 'Adrenal dysfunction is a top cause of "tired but wired"' },
  ],
  'anxiety': [
    { testName: 'Cortisol (4-point salivary)', why: 'Maps your stress hormone rhythm — dysregulation drives anxiety' },
    { testName: 'GABA', why: 'Primary calming neurotransmitter — low GABA = anxiety, insomnia' },
    { testName: 'Serotonin', why: '95% made in the gut — low serotonin linked to anxiety and depression' },
    { testName: 'Magnesium RBC', why: 'Intracellular magnesium — serum misses deficiency. Low Mg = anxiety' },
    { testName: 'B6 (Pyridoxine)', why: 'Cofactor for GABA and serotonin synthesis' },
    { testName: 'Neurotransmitter Panel', why: 'Comprehensive look at dopamine, serotonin, GABA, norepinephrine' },
  ],
  'sleep': [
    { testName: 'Cortisol (4-point salivary)', why: 'Elevated nighttime cortisol is the #1 cause of insomnia' },
    { testName: 'Magnesium RBC', why: 'GABA receptor modulator — deficiency fragments sleep architecture' },
    { testName: 'Ferritin', why: 'Low ferritin linked to restless legs and poor sleep quality' },
    { testName: 'Thyroid Panel', why: 'Both hyper and hypothyroidism disrupt sleep patterns' },
    { testName: 'Vitamin D', why: 'Deficiency associated with sleep disorders and daytime sleepiness' },
    { testName: 'Fasting Insulin', why: 'Blood sugar instability causes middle-of-night waking (3 AM)' },
  ],
};

const LAB_RECOMMENDATION_KEYWORD_TRIGGERS = [
  /what (tests?|labs?|bloodwork|panels?) (do i|should i|to) (need|get|order|run|request)/i,
  /which (labs?|tests?|bloodwork|panels?) (should|do|to)/i,
  /lab recommendations/i,
  /what labs should i get/i,
  /what bloodwork/i,
  /recommend.*(labs?|tests?|bloodwork|panels?)/i,
  /(labs?|tests?|bloodwork|panels?).*recommend/i,
  /what.*test.*for my/i,
  /what.*should.*test/i,
  /labs? i need/i,
  /tests? i need/i,
  /what to test/i,
  /testing.*recommend/i,
];

function isLabRecommendationQuery(message: string): boolean {
  return LAB_RECOMMENDATION_KEYWORD_TRIGGERS.some(r => r.test(message));
}

function buildLabRecommendationResponse(ctx: GabrielContext): string {
  const opener = getPersonalizedOpener(ctx);
  const conditions = ctx.conditions.map(c => c.toLowerCase());
  const goals = ctx.healthGoals.map(g => g.toLowerCase());

  const conditionToMapKey: [RegExp, string][] = [
    [/thyroid|hashimoto/i, 'thyroid'],
    [/inflammat/i, 'inflammation'],
    [/gut|ibs|sibo|digest|leaky gut|bloat/i, 'gut health'],
    [/hormone|pcos|menopause|estrogen|testosterone/i, 'hormones'],
    [/blood sugar|diabetes|insulin|metabolic/i, 'blood sugar'],
    [/autoimmune|lupus|rheumatoid|psoriasis|celiac/i, 'autoimmune'],
    [/fatigue|tired|energy|exhausted/i, 'fatigue'],
    [/anxiety|anxious|panic|nervous/i, 'anxiety'],
    [/sleep|insomnia/i, 'sleep'],
  ];

  const goalToMapKey: Record<string, string> = {
    'optimize energy': 'fatigue',
    'balance hormones': 'hormones',
    'gut health': 'gut health',
    'reduce inflammation': 'inflammation',
    'sleep': 'sleep',
  };

  const matchedKeys = new Set<string>();

  for (const cond of conditions) {
    for (const [regex, key] of conditionToMapKey) {
      if (regex.test(cond)) {
        matchedKeys.add(key);
      }
    }
  }

  for (const goal of goals) {
    const mapped = Object.entries(goalToMapKey).find(([k]) => goal.includes(k));
    if (mapped) {
      matchedKeys.add(mapped[1]);
    }
  }

  if (matchedKeys.size === 0) {
    matchedKeys.add('fatigue');
  }

  const existingMarkerNames = ctx.labResults.map(m => m.name.toLowerCase());

  function hasExistingLab(testName: string): boolean {
    const lower = testName.toLowerCase();
    for (const existing of existingMarkerNames) {
      if (existing.includes(lower) || lower.includes(existing)) return true;
      if (lower === 'thyroid panel (full)' || lower === 'thyroid panel') {
        if (existing.includes('tsh') || existing.includes('free t3') || existing.includes('free t4')) return true;
      }
      if (lower === 'iron panel + ferritin' || lower === 'iron panel') {
        if (existing.includes('ferritin') || existing.includes('iron')) return true;
      }
      if (lower === 'cbc with differential' || lower === 'cbc with diff') {
        if (existing.includes('wbc') || existing.includes('rbc') || existing.includes('hemoglobin') || existing.includes('platelet')) return true;
      }
      if (lower.includes('vitamin d') && existing.includes('vitamin d')) return true;
      if (lower.includes('b12') && existing.includes('b12')) return true;
      if (lower.includes('ferritin') && existing.includes('ferritin')) return true;
      if (lower.includes('tsh') && existing === 'tsh') return true;
      if (lower.includes('hs-crp') && existing.includes('crp')) return true;
      if (lower.includes('hba1c') && existing.includes('a1c')) return true;
      if (lower.includes('fasting glucose') && existing.includes('glucose')) return true;
      if (lower.includes('fasting insulin') && existing.includes('insulin')) return true;
      if (lower.includes('magnesium rbc') && existing.includes('magnesium')) return true;
      if (lower.includes('cortisol') && existing.includes('cortisol')) return true;
      if (lower.includes('homocysteine') && existing.includes('homocysteine')) return true;
      if (lower.includes('esr') && existing.includes('esr')) return true;
      if (lower.includes('folate') && existing.includes('folate')) return true;
    }
    return false;
  }

  let response = `${opener}based on your health profile, here are the lab tests I recommend. I've compared what you already have against what's needed:\n\n`;

  let totalTests = 0;
  let haveCount = 0;
  let needCount = 0;

  const keysArray = Array.from(matchedKeys);
  for (const key of keysArray) {
    const recs = LAB_RECOMMENDATION_MAP[key];
    if (!recs) continue;

    const displayKey = key.charAt(0).toUpperCase() + key.slice(1);
    response += `📋 ${displayKey}:\n`;

    for (const rec of recs) {
      totalTests++;
      const has = hasExistingLab(rec.testName);
      if (has) {
        haveCount++;
        response += `  ✅ ${rec.testName} — ${rec.why}\n`;
      } else {
        needCount++;
        response += `  ❌ ${rec.testName} — ${rec.why}\n`;
      }
    }
    response += '\n';
  }

  response += `📊 Summary: ${haveCount} of ${totalTests} recommended tests on file. ${needCount} still needed.\n\n`;

  if (needCount === 0) {
    response += `Great news — you have comprehensive coverage for your conditions! I\'d recommend retesting flagged markers every 90 days to track progress.\n\n`;
  } else if (needCount <= 3) {
    response += `You\'re almost there! Just ${needCount} more test${needCount === 1 ? '' : 's'} to get the complete picture.\n\n`;
  } else {
    response += `There are some key gaps in your testing. I\'d prioritize the ❌ tests — these could reveal root causes that are currently invisible.\n\n`;
  }

  response += 'Would you like me to explain any of these tests in detail, or help you prepare a lab order to bring to your provider?';

  return response;
}

const LAB_TOPIC_MAP: Record<string, { markers: string[]; optimalRanges: Record<string, { low: number; high: number; unit: string; convLow: number; convHigh: number }> }> = {
  'thyroid': {
    markers: ['tsh', 'free t4', 'free t3', 'tpo antibodies', 'ferritin', 'iron'],
    optimalRanges: {
      'tsh': { low: 1.0, high: 2.0, unit: 'mIU/L', convLow: 0.45, convHigh: 4.5 },
      'free t4': { low: 1.1, high: 1.8, unit: 'ng/dL', convLow: 0.8, convHigh: 2.0 },
      'free t3': { low: 3.0, high: 4.0, unit: 'pg/mL', convLow: 2.3, convHigh: 4.2 },
      'tpo antibodies': { low: 0, high: 15, unit: 'IU/mL', convLow: 0, convHigh: 35 },
      'ferritin': { low: 50, high: 100, unit: 'ng/mL', convLow: 12, convHigh: 150 },
      'iron': { low: 60, high: 170, unit: 'mcg/dL', convLow: 30, convHigh: 170 },
    },
  },
  'inflammation': {
    markers: ['hs-crp', 'esr', 'fibrinogen', 'homocysteine', 'wbc'],
    optimalRanges: {
      'hs-crp': { low: 0, high: 0.5, unit: 'mg/L', convLow: 0, convHigh: 3.0 },
      'esr': { low: 0, high: 10, unit: 'mm/hr', convLow: 0, convHigh: 20 },
      'fibrinogen': { low: 200, high: 300, unit: 'mg/dL', convLow: 200, convHigh: 400 },
      'homocysteine': { low: 5, high: 8, unit: 'µmol/L', convLow: 5, convHigh: 15 },
      'wbc': { low: 5.0, high: 8.0, unit: 'K/uL', convLow: 4.5, convHigh: 11.0 },
    },
  },
  'gut': {
    markers: ['calprotectin', 'secretory iga', 'zonulin'],
    optimalRanges: {
      'calprotectin': { low: 0, high: 50, unit: 'mcg/g', convLow: 0, convHigh: 120 },
      'secretory iga': { low: 51, high: 204, unit: 'mg/dL', convLow: 51, convHigh: 204 },
      'zonulin': { low: 0, high: 30, unit: 'ng/mL', convLow: 0, convHigh: 107 },
    },
  },
  'blood sugar': {
    markers: ['fasting glucose', 'hemoglobin a1c', 'fasting insulin'],
    optimalRanges: {
      'fasting glucose': { low: 75, high: 85, unit: 'mg/dL', convLow: 65, convHigh: 99 },
      'hemoglobin a1c': { low: 4.5, high: 5.2, unit: '%', convLow: 4.0, convHigh: 5.6 },
      'fasting insulin': { low: 2, high: 5, unit: 'mIU/L', convLow: 2.6, convHigh: 24.9 },
    },
  },
  'hormone': {
    markers: ['testosterone', 'estradiol', 'progesterone', 'dhea-s', 'cortisol'],
    optimalRanges: {
      'testosterone': { low: 500, high: 900, unit: 'ng/dL', convLow: 264, convHigh: 916 },
      'estradiol': { low: 20, high: 50, unit: 'pg/mL', convLow: 10, convHigh: 60 },
      'progesterone': { low: 5, high: 20, unit: 'ng/mL', convLow: 0.1, convHigh: 25 },
      'dhea-s': { low: 200, high: 400, unit: 'mcg/dL', convLow: 80, convHigh: 560 },
      'cortisol': { low: 10, high: 18, unit: 'mcg/dL', convLow: 6.2, convHigh: 19.4 },
    },
  },
  'energy': {
    markers: ['ferritin', 'tsh', 'b12', 'vitamin d', 'fasting insulin', 'hemoglobin'],
    optimalRanges: {
      'ferritin': { low: 50, high: 100, unit: 'ng/mL', convLow: 12, convHigh: 150 },
      'tsh': { low: 1.0, high: 2.0, unit: 'mIU/L', convLow: 0.45, convHigh: 4.5 },
      'b12': { low: 500, high: 1000, unit: 'pg/mL', convLow: 200, convHigh: 1100 },
      'vitamin d': { low: 60, high: 90, unit: 'ng/mL', convLow: 30, convHigh: 100 },
      'fasting insulin': { low: 2, high: 5, unit: 'mIU/L', convLow: 2.6, convHigh: 24.9 },
      'hemoglobin': { low: 13.5, high: 15.5, unit: 'g/dL', convLow: 12.0, convHigh: 17.5 },
    },
  },
  'sleep': {
    markers: ['magnesium rbc', 'ferritin', 'tsh', 'cortisol', 'vitamin d'],
    optimalRanges: {
      'magnesium rbc': { low: 5.5, high: 6.5, unit: 'mg/dL', convLow: 4.2, convHigh: 6.8 },
      'ferritin': { low: 50, high: 100, unit: 'ng/mL', convLow: 12, convHigh: 150 },
      'tsh': { low: 1.0, high: 2.0, unit: 'mIU/L', convLow: 0.45, convHigh: 4.5 },
      'cortisol': { low: 10, high: 18, unit: 'mcg/dL', convLow: 6.2, convHigh: 19.4 },
      'vitamin d': { low: 60, high: 90, unit: 'ng/mL', convLow: 30, convHigh: 100 },
    },
  },
  'anxiety': {
    markers: ['magnesium rbc', 'tsh', 'vitamin d', 'b12', 'cortisol', 'ferritin'],
    optimalRanges: {
      'magnesium rbc': { low: 5.5, high: 6.5, unit: 'mg/dL', convLow: 4.2, convHigh: 6.8 },
      'tsh': { low: 1.0, high: 2.0, unit: 'mIU/L', convLow: 0.45, convHigh: 4.5 },
      'vitamin d': { low: 60, high: 90, unit: 'ng/mL', convLow: 30, convHigh: 100 },
      'b12': { low: 500, high: 1000, unit: 'pg/mL', convLow: 200, convHigh: 1100 },
      'cortisol': { low: 10, high: 18, unit: 'mcg/dL', convLow: 6.2, convHigh: 19.4 },
      'ferritin': { low: 50, high: 100, unit: 'ng/mL', convLow: 12, convHigh: 150 },
    },
  },
  'autoimmune': {
    markers: ['vitamin d', 'hs-crp', 'tsh', 'tpo antibodies', 'ferritin', 'esr'],
    optimalRanges: {
      'vitamin d': { low: 60, high: 80, unit: 'ng/mL', convLow: 30, convHigh: 100 },
      'hs-crp': { low: 0, high: 0.5, unit: 'mg/L', convLow: 0, convHigh: 3.0 },
      'tsh': { low: 1.0, high: 2.0, unit: 'mIU/L', convLow: 0.45, convHigh: 4.5 },
      'tpo antibodies': { low: 0, high: 15, unit: 'IU/mL', convLow: 0, convHigh: 35 },
      'ferritin': { low: 50, high: 100, unit: 'ng/mL', convLow: 12, convHigh: 150 },
      'esr': { low: 0, high: 10, unit: 'mm/hr', convLow: 0, convHigh: 20 },
    },
  },
  'detox': {
    markers: ['hs-crp', 'ferritin', 'wbc', 'vitamin d'],
    optimalRanges: {
      'hs-crp': { low: 0, high: 0.5, unit: 'mg/L', convLow: 0, convHigh: 3.0 },
      'ferritin': { low: 50, high: 100, unit: 'ng/mL', convLow: 12, convHigh: 150 },
      'wbc': { low: 5.0, high: 8.0, unit: 'K/uL', convLow: 4.5, convHigh: 11.0 },
      'vitamin d': { low: 60, high: 90, unit: 'ng/mL', convLow: 30, convHigh: 100 },
    },
  },
  'general': {
    markers: ['vitamin d', 'b12', 'ferritin', 'tsh', 'hs-crp', 'hemoglobin a1c', 'magnesium rbc', 'wbc', 'rbc', 'hemoglobin', 'platelets'],
    optimalRanges: {
      'vitamin d': { low: 60, high: 90, unit: 'ng/mL', convLow: 30, convHigh: 100 },
      'b12': { low: 500, high: 1000, unit: 'pg/mL', convLow: 200, convHigh: 1100 },
      'ferritin': { low: 50, high: 100, unit: 'ng/mL', convLow: 12, convHigh: 150 },
      'tsh': { low: 1.0, high: 2.0, unit: 'mIU/L', convLow: 0.45, convHigh: 4.5 },
      'hs-crp': { low: 0, high: 0.5, unit: 'mg/L', convLow: 0, convHigh: 3.0 },
      'hemoglobin a1c': { low: 4.5, high: 5.2, unit: '%', convLow: 4.0, convHigh: 5.6 },
      'magnesium rbc': { low: 5.5, high: 6.5, unit: 'mg/dL', convLow: 4.2, convHigh: 6.8 },
      'wbc': { low: 5.0, high: 8.0, unit: 'K/uL', convLow: 4.5, convHigh: 11.0 },
      'rbc': { low: 4.5, high: 5.2, unit: 'M/uL', convLow: 4.0, convHigh: 5.5 },
      'hemoglobin': { low: 13.5, high: 15.5, unit: 'g/dL', convLow: 12.0, convHigh: 17.5 },
      'platelets': { low: 200, high: 300, unit: 'K/uL', convLow: 150, convHigh: 400 },
    },
  },
};

function normalizeMarkerName(name: string): string {
  return name.toLowerCase()
    .replace(/[,()]/g, '')
    .replace(/25-oh/i, '')
    .replace(/mean corpuscular vol\./i, '')
    .replace(/white blood cells/i, 'wbc')
    .replace(/red blood cells/i, 'rbc')
    .trim();
}

function findMatchingLabMarker(labResults: LabMarker[], targetName: string): LabMarker | null {
  const target = targetName.toLowerCase();
  for (const lab of labResults) {
    const normalized = normalizeMarkerName(lab.name);
    if (normalized === target) return lab;
    if (normalized.includes(target) || target.includes(normalized)) return lab;
    if (target === 'vitamin d' && lab.name.toLowerCase().includes('vitamin d')) return lab;
    if (target === 'b12' && lab.name.toLowerCase().includes('b12')) return lab;
    if (target === 'hemoglobin a1c' && lab.name.toLowerCase().includes('a1c')) return lab;
    if (target === 'hemoglobin' && lab.name.toLowerCase() === 'hemoglobin') return lab;
    if (target === 'hs-crp' && lab.name.toLowerCase().includes('hs-crp')) return lab;
    if (target === 'magnesium rbc' && lab.name.toLowerCase().includes('magnesium rbc')) return lab;
    if (target === 'wbc' && (lab.name.toLowerCase().includes('wbc') || lab.name.toLowerCase().includes('white blood'))) return lab;
    if (target === 'rbc' && (lab.name.toLowerCase().includes('rbc') || lab.name.toLowerCase().includes('red blood'))) return lab;
    if (target === 'tsh' && lab.name.toLowerCase() === 'tsh') return lab;
    if (target === 'ferritin' && lab.name.toLowerCase() === 'ferritin') return lab;
    if (target === 'platelets' && lab.name.toLowerCase().includes('platelet')) return lab;
  }
  return null;
}

function buildLabContextInsights(ctx: GabrielContext, topic: string): string {
  const topicConfig = LAB_TOPIC_MAP[topic] || LAB_TOPIC_MAP['general'];
  if (!topicConfig || ctx.labResults.length === 0) {
    return buildMissingLabSuggestion(topic);
  }

  const relevantFindings: string[] = [];
  const matchedMarkers: string[] = [];

  for (const markerName of topicConfig.markers) {
    const labMarker = findMatchingLabMarker(ctx.labResults, markerName);
    const optRange = topicConfig.optimalRanges[markerName];

    if (labMarker && optRange) {
      matchedMarkers.push(markerName);
      const val = labMarker.value;
      const isOptimal = val >= optRange.low && val <= optRange.high;
      const isConventionalNormal = val >= optRange.convLow && val <= optRange.convHigh;

      if (isOptimal) {
        relevantFindings.push(
          `✅ Your ${labMarker.name} at ${val} ${labMarker.unit} is within the naturopathic optimal range (${optRange.low}-${optRange.high} ${optRange.unit}). This is excellent.`
        );
      } else if (isConventionalNormal && !isOptimal) {
        let direction = '';
        if (val < optRange.low) direction = 'below';
        else if (val > optRange.high) direction = 'above';
        relevantFindings.push(
          `⚠️ Your ${labMarker.name} is ${val} ${labMarker.unit} — within the conventional range (${optRange.convLow}-${optRange.convHigh}) but ${direction} the naturopathic optimal range (${optRange.low}-${optRange.high} ${optRange.unit}). This is a key area to address.`
        );
      } else {
        relevantFindings.push(
          `🔴 Your ${labMarker.name} at ${val} ${labMarker.unit} is outside both conventional (${optRange.convLow}-${optRange.convHigh}) and naturopathic optimal ranges (${optRange.low}-${optRange.high} ${optRange.unit}). This needs priority attention.`
        );
      }
    }
  }

  if (relevantFindings.length === 0) {
    return buildMissingLabSuggestion(topic);
  }

  let insight = '\n\n📊 Looking at Your Labs:\n';
  insight += relevantFindings.join('\n');

  const missingMarkers = topicConfig.markers.filter(m => !matchedMarkers.includes(m));
  if (missingMarkers.length > 0) {
    insight += `\n\nI don't have results for: ${missingMarkers.join(', ')}. I'd recommend testing these to get the complete picture.`;
  }

  const crossPatterns = buildCrossReferencePatterns(ctx, matchedMarkers, topic);
  if (crossPatterns) {
    insight += crossPatterns;
  }

  return insight;
}

function buildMissingLabSuggestion(_topic: string): string {
  return '';
}

function buildCrossReferencePatterns(ctx: GabrielContext, matchedMarkers: string[], topic: string): string {
  const patterns: string[] = [];

  const hasTSH = findMatchingLabMarker(ctx.labResults, 'tsh');
  const hasFerritin = findMatchingLabMarker(ctx.labResults, 'ferritin');
  const hasCRP = findMatchingLabMarker(ctx.labResults, 'hs-crp');
  const hasVitD = findMatchingLabMarker(ctx.labResults, 'vitamin d');
  const hasMagRBC = findMatchingLabMarker(ctx.labResults, 'magnesium rbc');

  if (hasTSH && hasFerritin && hasTSH.value > 2.0 && hasFerritin.value < 50) {
    patterns.push(
      `🔗 Pattern: Your TSH (${hasTSH.value}) is suboptimal AND your ferritin (${hasFerritin.value}) is low. Ferritin must be above 50 for proper T4→T3 thyroid conversion — this combination is likely a major factor in your symptoms.`
    );
  }

  if (hasCRP && hasCRP.value > 0.5 && hasFerritin && hasFerritin.value < 50) {
    patterns.push(
      `🔗 Pattern: Elevated hs-CRP (${hasCRP.value}) with low ferritin (${hasFerritin.value}) suggests chronic inflammation may be driving iron depletion. Address inflammation first, then replete iron.`
    );
  }

  if (hasVitD && hasVitD.value < 50 && hasCRP && hasCRP.value > 0.5) {
    patterns.push(
      `🔗 Pattern: Low vitamin D (${hasVitD.value}) paired with elevated hs-CRP (${hasCRP.value}) — vitamin D deficiency impairs immune regulation and can perpetuate inflammatory cycles.`
    );
  }

  if (hasMagRBC && hasMagRBC.value < 5.5 && hasTSH && hasTSH.value > 2.0) {
    patterns.push(
      `🔗 Pattern: Suboptimal magnesium RBC (${hasMagRBC.value}) and elevated TSH (${hasTSH.value}) — magnesium is a cofactor in thyroid hormone production and over 300 enzymatic reactions. Repleting magnesium may support thyroid function.`
    );
  }

  if (patterns.length === 0) return '';
  return '\n\n' + patterns.join('\n');
}

export interface FoodRecommendation {
  food: string;
  compound: string;
  mechanism: string;
}

export const FOOD_MEDICINE_MAP: Record<string, FoodRecommendation[]> = {
  'inflammation': [
    { food: 'Wild salmon', compound: 'omega-3 EPA/DHA', mechanism: 'produces specialized pro-resolving mediators (SPMs) that actively turn off inflammation at the cellular level' },
    { food: 'Turmeric / golden milk', compound: 'curcuminoids', mechanism: 'inhibits NF-κB, the master inflammatory transcription factor, reducing downstream cytokine production' },
    { food: 'Tart cherry juice', compound: 'anthocyanins', mechanism: 'inhibits COX-1 and COX-2 enzymes comparable to NSAIDs, reduces post-exercise inflammation and uric acid' },
    { food: 'Extra virgin olive oil', compound: 'oleocanthal', mechanism: 'mimics ibuprofen\'s COX inhibition — 3.4 tbsp provides ~10% of a standard ibuprofen dose daily' },
    { food: 'Wild blueberries', compound: 'pterostilbene', mechanism: 'crosses the blood-brain barrier to reduce neuroinflammation and upregulate antioxidant defense genes' },
    { food: 'Bone broth', compound: 'glycine + collagen', mechanism: 'glycine activates anti-inflammatory glycine receptors on immune cells and supports gut lining integrity' },
    { food: 'Ginger root', compound: 'gingerols', mechanism: 'inhibits prostaglandin and leukotriene synthesis, comparable to aspirin in anti-platelet activity' },
  ],
  'thyroid': [
    { food: 'Brazil nuts (1-2 daily max)', compound: 'selenium', mechanism: 'provides ~75mcg selenium per nut — cofactor for deiodinase enzymes that convert T4 to active T3' },
    { food: 'Seaweed / kelp (moderate)', compound: 'iodine', mechanism: 'essential building block of thyroid hormones T3 and T4 — moderate intake supports production without overstimulation' },
    { food: 'Wild-caught fish', compound: 'omega-3 + selenium', mechanism: 'dual thyroid support — omega-3 reduces thyroid inflammation while selenium powers hormone conversion' },
    { food: 'Pumpkin seeds', compound: 'zinc', mechanism: 'zinc is required for thyroid hormone synthesis and TRH (thyrotropin-releasing hormone) production in the hypothalamus' },
    { food: 'Coconut oil', compound: 'MCTs', mechanism: 'medium-chain triglycerides bypass normal fat digestion, providing quick energy that supports sluggish metabolism' },
    { food: 'Grass-fed liver', compound: 'iron + B12 + copper', mechanism: 'provides the iron trifecta needed for thyroid peroxidase enzyme function and oxygen transport to the thyroid gland' },
  ],
  'gut health': [
    { food: 'Fermented foods — sauerkraut/kimchi/kefir', compound: 'live probiotics', mechanism: 'introduce diverse Lactobacillus and Bifidobacterium species that produce short-chain fatty acids and strengthen tight junctions' },
    { food: 'Bone broth', compound: 'L-glutamine', mechanism: 'L-glutamine is the primary fuel source for enterocytes (intestinal cells), directly repairing and maintaining the gut lining' },
    { food: 'Prebiotic foods — garlic/onions/asparagus', compound: 'FOS/inulin', mechanism: 'fructooligosaccharides selectively feed beneficial Bifidobacterium, increasing butyrate production for colon health' },
    { food: 'Aloe vera juice', compound: 'acemannan polysaccharides', mechanism: 'stimulates mucosal healing, modulates gut immune response, and soothes inflamed intestinal tissue' },
    { food: 'Collagen peptides', compound: 'glycine + proline', mechanism: 'glycine supports tight junction assembly between enterocytes, reducing intestinal permeability ("leaky gut")' },
  ],
  'anxiety': [
    { food: 'Chamomile tea', compound: 'apigenin', mechanism: 'binds GABA-A receptors as a positive allosteric modulator, producing anxiolytic effects without sedation at normal doses' },
    { food: 'Dark chocolate 85%+', compound: 'magnesium + theobromine', mechanism: 'provides bioavailable magnesium for GABA receptor support plus theobromine for gentle mood elevation via adenosine modulation' },
    { food: 'Fatty fish (salmon, sardines)', compound: 'omega-3 EPA/DHA', mechanism: 'EPA modulates serotonin receptor sensitivity and reduces neuroinflammation that drives anxiety signaling' },
    { food: 'Turkey / pumpkin seeds', compound: 'tryptophan', mechanism: 'rate-limiting precursor for serotonin synthesis — the calming neurotransmitter that modulates mood and anxiety' },
    { food: 'Avocado', compound: 'B vitamins + magnesium', mechanism: 'B6 is a cofactor for GABA and serotonin synthesis, while magnesium calms the HPA axis stress response' },
  ],
  'sleep': [
    { food: 'Tart cherry juice', compound: 'natural melatonin', mechanism: 'one of the few food sources of bioavailable melatonin — studies show it increases sleep time by 84 minutes' },
    { food: 'Kiwi (2 before bed)', compound: 'serotonin precursors', mechanism: 'high serotonin content plus folate and antioxidants — RCTs show improved sleep onset, duration, and efficiency' },
    { food: 'Almonds', compound: 'magnesium', mechanism: 'provides magnesium that modulates GABA receptors and melatonin production for natural sleep-wake regulation' },
    { food: 'Passionflower tea', compound: 'chrysin', mechanism: 'chrysin binds benzodiazepine receptors at sub-anxiolytic levels, promoting relaxation and sleep onset' },
    { food: 'Warm raw milk with nutmeg', compound: 'tryptophan', mechanism: 'tryptophan converts to serotonin then melatonin — the warmth and ritual amplify the parasympathetic relaxation response' },
  ],
  'hormones': [
    { food: 'Cruciferous vegetables — broccoli sprouts', compound: 'DIM (diindolylmethane)', mechanism: 'promotes healthy estrogen metabolism via the 2-OH pathway over the proliferative 16-OH and 4-OH pathways' },
    { food: 'Flax seeds (days 1-14 of cycle)', compound: 'lignans', mechanism: 'phytoestrogenic lignans modulate estrogen receptor binding during the follicular phase — part of seed cycling protocol' },
    { food: 'Pumpkin seeds (days 15-28)', compound: 'zinc', mechanism: 'zinc supports progesterone production during the luteal phase and inhibits excess 5-alpha reductase (DHT conversion)' },
    { food: 'Maca root', compound: 'macamides + macaenes', mechanism: 'adaptogenic compounds that modulate the hypothalamic-pituitary axis without containing hormones directly' },
    { food: 'Pomegranate', compound: 'ellagitannins', mechanism: 'ellagitannins inhibit aromatase enzyme activity, supporting healthy estrogen-testosterone balance' },
  ],
  'blood sugar': [
    { food: 'Cinnamon (1 tsp daily)', compound: 'cinnamaldehyde', mechanism: 'enhances insulin receptor phosphorylation and GLUT4 transporter activity, improving cellular glucose uptake' },
    { food: 'Apple cider vinegar (before meals)', compound: 'acetic acid', mechanism: 'slows gastric emptying and inhibits disaccharidase enzymes, reducing post-meal glucose spikes by 20-30%' },
    { food: 'Chia seeds', compound: 'soluble fiber + omega-3', mechanism: 'forms a gel matrix that slows carbohydrate digestion and glucose absorption in the small intestine' },
    { food: 'Bitter melon', compound: 'charantin', mechanism: 'charantin has insulin-mimetic properties that increase glucose uptake and glycogen synthesis in liver and muscle' },
    { food: 'Fenugreek seeds', compound: 'galactomannan fiber', mechanism: 'soluble galactomannan fiber delays gastric emptying and modulates insulin signaling pathways' },
  ],
  'energy': [
    { food: 'Matcha', compound: 'L-theanine + caffeine', mechanism: 'L-theanine and caffeine synergize to provide sustained alertness with alpha-wave calm — no jitters or crash' },
    { food: 'Beetroot juice', compound: 'dietary nitrates', mechanism: 'converts to nitric oxide, vasodilating blood vessels to improve oxygen delivery to tissues by up to 16%' },
    { food: 'Eggs', compound: 'choline + B12 + protein', mechanism: 'choline supports acetylcholine (focus neurotransmitter), B12 drives methylation, and protein stabilizes blood sugar' },
    { food: 'Spirulina', compound: 'complete protein + iron + B vitamins', mechanism: '60% protein by weight with highly bioavailable iron and B12 — directly supports oxygen transport and energy metabolism' },
    { food: 'Raw cacao', compound: 'theobromine + magnesium + PEA', mechanism: 'theobromine provides gentle stimulation, magnesium fuels ATP production, and PEA (phenylethylamine) elevates mood' },
  ],
  'autoimmune': [
    { food: 'Wild-caught salmon', compound: 'omega-3 EPA/DHA', mechanism: 'SPMs (specialized pro-resolving mediators) actively resolve immune-driven inflammation without suppressing immune function' },
    { food: 'Bone broth', compound: 'glycine + collagen + gelatin', mechanism: 'repairs intestinal permeability — the modifiable factor in the autoimmune triad — while glycine calms immune activation' },
    { food: 'Turmeric', compound: 'curcumin', mechanism: 'modulates Th1/Th2/Th17 immune balance and suppresses autoimmune NF-κB signaling without broad immunosuppression' },
    { food: 'Fermented vegetables', compound: 'probiotics + postbiotics', mechanism: 'diverse Lactobacillus strains promote regulatory T-cell differentiation, building immune tolerance' },
  ],
  'brain': [
    { food: 'Wild salmon / sardines', compound: 'DHA omega-3', mechanism: 'DHA comprises 40% of brain polyunsaturated fats — essential for synaptic membrane fluidity and neurotransmission' },
    { food: 'Blueberries', compound: 'anthocyanins', mechanism: 'cross the blood-brain barrier to reduce neuroinflammation, increase BDNF, and improve memory consolidation' },
    { food: 'Eggs', compound: 'choline', mechanism: 'precursor to acetylcholine, the primary neurotransmitter for memory, learning, and focus' },
    { food: 'Walnuts', compound: 'ALA omega-3 + polyphenols', mechanism: 'walnut polyphenols reduce oxidative stress in brain tissue while ALA provides additional anti-inflammatory support' },
  ],
  'detox': [
    { food: 'Cruciferous vegetables (broccoli, kale)', compound: 'sulforaphane + I3C', mechanism: 'upregulates Phase II liver detox enzymes (glutathione transferase, glucuronidation) for efficient toxin conjugation' },
    { food: 'Cilantro', compound: 'chelating compounds', mechanism: 'binds heavy metals (mercury, lead) in the GI tract, facilitating their excretion through stool' },
    { food: 'Lemon water (morning)', compound: 'citric acid + vitamin C', mechanism: 'stimulates bile flow for Phase III elimination and provides vitamin C for glutathione recycling' },
    { food: 'Beets', compound: 'betaine (TMG)', mechanism: 'supports methylation — a critical Phase II detox pathway — and increases bile flow for toxin excretion' },
  ],
  'skin': [
    { food: 'Wild salmon', compound: 'astaxanthin + omega-3', mechanism: 'astaxanthin is 6,000x more potent than vitamin C as an antioxidant — protects skin from UV damage and reduces wrinkles' },
    { food: 'Bone broth / collagen', compound: 'proline + glycine', mechanism: 'provides direct building blocks for collagen synthesis in the dermis, improving skin elasticity and hydration' },
    { food: 'Berries (mixed)', compound: 'vitamin C + ellagic acid', mechanism: 'vitamin C is required for prolyl hydroxylase (collagen production) while ellagic acid inhibits MMP enzymes that break down collagen' },
    { food: 'Avocado', compound: 'vitamin E + healthy fats', mechanism: 'vitamin E protects skin cell membranes from lipid peroxidation while monounsaturated fats maintain skin barrier integrity' },
  ],
  'joint': [
    { food: 'Bone broth', compound: 'collagen type II + glycosaminoglycans', mechanism: 'provides direct building blocks for cartilage matrix repair — glucosamine and chondroitin in their natural form' },
    { food: 'Tart cherry juice', compound: 'anthocyanins', mechanism: 'inhibits COX enzymes and reduces uric acid levels, benefiting both inflammatory and gouty arthritis' },
    { food: 'Turmeric', compound: 'curcumin', mechanism: 'head-to-head trials show comparable efficacy to ibuprofen for knee osteoarthritis pain without GI damage' },
    { food: 'Pineapple (between meals)', compound: 'bromelain', mechanism: 'proteolytic enzyme with anti-inflammatory and anti-edema properties — most effective when consumed away from protein meals' },
  ],
  'cardiovascular': [
    { food: 'Wild salmon / sardines', compound: 'EPA/DHA', mechanism: 'reduces triglycerides 15-30%, has anti-arrhythmic properties, and produces cardioprotective resolvins' },
    { food: 'Extra virgin olive oil', compound: 'oleocanthal + polyphenols', mechanism: 'oleocanthal has ibuprofen-like anti-inflammatory effects; polyphenols protect LDL from oxidation (the actual atherogenic event)' },
    { food: 'Garlic', compound: 'allicin', mechanism: 'allicin inhibits HMG-CoA reductase (the statin target), reduces arterial stiffness, and has mild anticoagulant effects' },
    { food: 'Walnuts', compound: 'ALA + L-arginine', mechanism: 'L-arginine is a nitric oxide precursor for vasodilation, while ALA provides anti-inflammatory omega-3 support' },
  ],
  'weight': [
    { food: 'Green tea / matcha', compound: 'EGCG + caffeine', mechanism: 'EGCG inhibits catechol-O-methyltransferase, extending norepinephrine activity and increasing thermogenesis by 4-5%' },
    { food: 'Apple cider vinegar', compound: 'acetic acid', mechanism: 'activates AMPK in liver and muscle, promoting fat oxidation and reducing lipogenesis (new fat creation)' },
    { food: 'Chili peppers', compound: 'capsaicin', mechanism: 'activates TRPV1 receptors, increasing metabolic rate, enhancing fat oxidation, and reducing appetite via GLP-1 release' },
    { food: 'Protein-rich foods (eggs, fish, turkey)', compound: 'amino acids', mechanism: 'highest thermic effect of food (20-30% of calories burned during digestion) plus glucagon release opposing insulin\'s fat-storage signal' },
  ],
};

const FOOD_KEYWORD_TRIGGERS = [
  /what should i eat/i,
  /diet for/i,
  /foods? for/i,
  /nutrition for/i,
  /what.*eat.*for/i,
  /best foods?/i,
  /food.*help/i,
  /eat.*to (help|heal|fix|improve|support|reduce|boost)/i,
  /healing foods?/i,
  /therapeutic foods?/i,
  /food.*(medicine|remedy|remedies)/i,
];

function isFoodQuery(message: string): boolean {
  return FOOD_KEYWORD_TRIGGERS.some(r => r.test(message));
}

function detectFoodTopics(message: string, conditions: string[]): string[] {
  const lower = message.toLowerCase();
  const topics: string[] = [];

  const topicPatterns: [RegExp, string][] = [
    [/inflammat|joint|arthritis/i, 'inflammation'],
    [/thyroid|hashimoto|tsh/i, 'thyroid'],
    [/gut|digest|bloat|ibs|sibo|leaky gut|microbiome/i, 'gut health'],
    [/anxiety|anxious|stress|nervous|calm/i, 'anxiety'],
    [/sleep|insomnia/i, 'sleep'],
    [/hormone|estrogen|progesterone|testosterone|pcos|menopause/i, 'hormones'],
    [/blood sugar|diabetes|insulin|glucose|metabolic/i, 'blood sugar'],
    [/energy|fatigue|tired|exhausted/i, 'energy'],
    [/autoimmune|lupus|rheumatoid/i, 'autoimmune'],
    [/brain|cognitive|memory|focus|brain fog/i, 'brain'],
    [/detox|liver|cleanse/i, 'detox'],
    [/skin|acne|eczema|psoriasis/i, 'skin'],
    [/joint|knee|hip|cartilage/i, 'joint'],
    [/heart|cardio|cholesterol|blood pressure/i, 'cardiovascular'],
    [/weight|lose weight|fat loss|metabolism/i, 'weight'],
  ];

  for (const [regex, topic] of topicPatterns) {
    if (regex.test(lower)) {
      topics.push(topic);
    }
  }

  const conditionToFood: Record<string, string> = {
    'thyroid': 'thyroid', 'thyroid issues': 'thyroid', 'hashimoto': 'thyroid',
    'gut health': 'gut health', 'gut issues': 'gut health', 'ibs': 'gut health', 'sibo': 'gut health',
    'inflammation': 'inflammation', 'anxiety': 'anxiety', 'sleep': 'sleep', 'insomnia': 'sleep',
    'hormones': 'hormones', 'hormone imbalance': 'hormones', 'pcos': 'hormones',
    'autoimmune': 'autoimmune', 'fatigue': 'energy', 'brain fog': 'brain',
    'diabetes': 'blood sugar', 'weight': 'weight', 'acne': 'skin', 'eczema': 'skin',
  };

  for (const cond of conditions) {
    const key = cond.toLowerCase();
    for (const [pattern, topic] of Object.entries(conditionToFood)) {
      if (key.includes(pattern) || pattern.includes(key)) {
        if (!topics.includes(topic)) topics.push(topic);
      }
    }
  }

  return topics;
}

function buildFoodMedicineSection(topics: string[]): string {
  if (topics.length === 0) return '';

  const usedFoods = new Set<string>();
  const foods: FoodRecommendation[] = [];

  for (const topic of topics) {
    const topicFoods = FOOD_MEDICINE_MAP[topic];
    if (!topicFoods) continue;
    for (const food of topicFoods) {
      if (!usedFoods.has(food.food) && foods.length < 4) {
        usedFoods.add(food.food);
        foods.push(food);
      }
    }
  }

  if (foods.length === 0) return '';

  let section = '\n\n🍽 Food as Medicine:\n';
  for (const food of foods) {
    section += `• ${food.food} — rich in ${food.compound}, which ${food.mechanism}\n`;
  }

  return section;
}

function buildFoodQueryResponse(message: string, ctx: GabrielContext): string {
  const opener = getPersonalizedOpener(ctx);
  const topics = detectFoodTopics(message, ctx.conditions);

  if (topics.length === 0) {
    const fallbackTopics = ctx.conditions.length > 0
      ? detectFoodTopics(ctx.conditions.join(' '), ctx.conditions)
      : ['inflammation', 'energy'];
    topics.push(...fallbackTopics);
  }

  let response = `${opener}food is the most powerful medicine we have — every meal is an opportunity to move toward or away from health. Here are my top therapeutic food recommendations:\n\n`;

  for (const topic of topics.slice(0, 3)) {
    const topicFoods = FOOD_MEDICINE_MAP[topic];
    if (!topicFoods) continue;
    const displayName = topic.charAt(0).toUpperCase() + topic.slice(1);
    response += `🍽 ${displayName} Support:\n`;
    for (const food of topicFoods.slice(0, 4)) {
      response += `• ${food.food} — ${food.compound}: ${food.mechanism}\n`;
    }
    response += '\n';
  }

  response += 'General Principles:\n';
  response += '• Eat the rainbow — diverse polyphenols feed diverse gut bacteria\n';
  response += '• Prioritize wild-caught, grass-fed, and organic when possible\n';
  response += '• Cook with anti-inflammatory fats: olive oil, avocado oil, ghee\n';
  response += '• Include fermented foods daily for microbiome diversity\n';
  response += '• Protein first at every meal to stabilize blood sugar\n\n';
  response += 'Would you like me to create a specific meal plan, or dive deeper into therapeutic foods for a particular condition?';

  return response;
}

const FOLLOW_UP_CONDITIONS = new Set([
  'inflammation', 'thyroid', 'energy', 'gut', 'anxiety', 'sleep', 'autoimmune', 'hormone', 'detox',
]);

const SKIP_FOLLOW_UP_PATTERNS = /just tell me|skip question|skip the question|don'?t ask|no questions|give me the (full |)answer|just give me|i don'?t want to answer|get to the point|tldr|tl;dr/i;

const CONDITION_FOLLOW_UPS: Record<string, string> = {
  'inflammation': `Inflammation is a big topic and the right approach depends on your situation. Let me ask a few questions so I can give you targeted recommendations instead of generic ones:\n\n1. What are your main symptoms? (joint pain, brain fog, fatigue, skin issues, digestive)\n2. Have you had any recent bloodwork? (especially hs-CRP, ESR, or a CBC)\n3. Are you currently taking any medications or supplements?`,
  'thyroid': `Thyroid health is nuanced — the right protocol depends heavily on what's actually going on. A few quick questions so I can be precise:\n\n1. Have you had a full thyroid panel? (TSH, free T3, free T4, TPO antibodies — or just TSH?)\n2. Any diagnosis yet? (Hashimoto's, hypothyroid, hyperthyroid, or just "off"?)\n3. What symptoms are you experiencing? (fatigue, weight changes, hair loss, cold intolerance, anxiety)`,
  'energy': `Low energy can come from many different places — I want to make sure I point you in the right direction. Quick questions:\n\n1. When is your energy worst? (morning, afternoon crash, all day, wired-but-tired at night)\n2. Have you had bloodwork recently? (especially ferritin, thyroid, B12, vitamin D)\n3. How's your sleep quality, and are you under significant stress right now?`,
  'gut': `Gut health is the cornerstone of naturopathic medicine, but the approach varies a lot depending on your situation. Let me narrow it down:\n\n1. What are your main GI symptoms? (bloating, constipation, diarrhea, reflux, pain, food reactions)\n2. Have you been tested for anything? (SIBO, H. pylori, food sensitivities, stool analysis)\n3. Are you currently on any medications? (PPIs, antibiotics recently, NSAIDs)`,
  'anxiety': `Anxiety has many possible root causes — I want to give you targeted support, not a generic list. A few questions:\n\n1. Is your anxiety more constant/generalized, or does it come in waves/panic episodes?\n2. Do you notice it's worse at certain times? (morning, evening, after eating, with caffeine)\n3. Are you currently taking any medications or supplements for it?`,
  'sleep': `Sleep issues can stem from very different root causes, and the fix depends on the pattern. Let me ask:\n\n1. What's your main sleep issue? (trouble falling asleep, waking at 2-4 AM, light/unrefreshing sleep, or all of the above)\n2. What does your evening routine look like? (screen time, caffeine cutoff, stress levels)\n3. Are you taking any sleep aids or medications currently?`,
  'autoimmune': `Autoimmune conditions require a careful, personalized approach. Let me understand your situation better:\n\n1. Do you have a specific autoimmune diagnosis? (Hashimoto's, RA, lupus, MS, psoriasis, celiac, etc.)\n2. What are your current symptoms and how long have you been dealing with this?\n3. What's your current treatment? (immunosuppressants, biologics, steroids, or nothing yet)`,
  'hormone': `Hormonal balance is a complex system — the right approach depends on which hormones and which direction. Let me ask:\n\n1. What symptoms are you experiencing? (fatigue, weight gain, mood swings, irregular cycles, low libido, hot flashes)\n2. Have you had any hormone testing? (cortisol, thyroid, estrogen/progesterone, testosterone, DUTCH test)\n3. Any relevant context? (age range, menopause/perimenopause, PCOS diagnosis, stress level)`,
  'detox': `Detoxification is important but needs to be approached correctly for your situation. A few questions:\n\n1. What's driving your interest in detox? (specific exposure like mold or metals, general wellness, or symptoms like brain fog/fatigue)\n2. How are your elimination pathways? (regular bowel movements, adequate hydration, do you sweat regularly)\n3. Any known exposures or test results? (heavy metals panel, mycotoxin test, or just a feeling something's off)`,
};

function personalizeConditionResponse(condition: string, userAnswers: string, fullResponse: string, ctx: GabrielContext): string {
  const opener = getPersonalizedOpener(ctx);
  const lower = userAnswers.toLowerCase();

  let personalizationNote = '';

  if (/joint|knee|hip|shoulder/i.test(lower)) {
    personalizationNote += 'Based on your joint-related symptoms, I\'ve prioritized anti-inflammatory compounds with strong evidence for musculoskeletal support. ';
  }
  if (/brain fog|cognitive|memory|focus/i.test(lower)) {
    personalizationNote += 'Given the brain fog you mentioned, I\'ve included compounds that cross the blood-brain barrier and address neuroinflammation. ';
  }
  if (/fatigue|tired|exhausted|no energy/i.test(lower)) {
    personalizationNote += 'Since fatigue is a key concern, I\'ve emphasized mitochondrial support and nutrient repletion alongside the targeted protocol. ';
  }
  if (/hashimoto|autoimmune thyroid/i.test(lower)) {
    personalizationNote += 'With Hashimoto\'s in the picture, I\'ve prioritized selenium for antibody reduction and gluten elimination. ';
  }
  if (/no medication|not taking|none|no meds/i.test(lower)) {
    personalizationNote += 'Since you\'re not currently on medications, we have more flexibility with the protocol. ';
  }
  if (/statin|metformin|ppi|ssri|blood pressure|medication/i.test(lower)) {
    personalizationNote += 'I\'ve noted your medications and factored potential interactions into the recommendations below. ';
  }
  if (/stress|anxious|overwhelmed/i.test(lower)) {
    personalizationNote += 'Given the stress component you mentioned, I\'ve included adaptogenic support for HPA axis regulation. ';
  }
  if (/sleep|insomnia|waking/i.test(lower)) {
    personalizationNote += 'Sleep disruption affects every system — I\'ve included evening support in the protocol. ';
  }
  if (/bloat|constipat|diarrhea|reflux|sibo/i.test(lower)) {
    personalizationNote += 'Your GI symptoms suggest the gut healing phase of the protocol should be your starting point. ';
  }
  if (/crp|esr|blood ?work|labs|panel/i.test(lower)) {
    personalizationNote += 'Great that you have bloodwork — upload it in the Labs tab and I can cross-reference these recommendations with your specific markers. ';
  }
  if (/no blood ?work|no labs|haven\'?t tested|no test/i.test(lower)) {
    personalizationNote += 'I\'d recommend getting a baseline panel (hs-CRP, full thyroid, ferritin, vitamin D, fasting insulin) to guide us more precisely. ';
  }

  if (personalizationNote) {
    return `${opener}thanks for sharing that context. ${personalizationNote}\n\nHere\'s your personalized protocol:\n\n${fullResponse}`;
  }

  return `${opener}thanks for the context. Here\'s a comprehensive protocol tailored to your situation:\n\n${fullResponse}`;
}

const SUPPLEMENT_DB: Record<string, { dosage: string; tier: number; benefit: string; contraindication: string; mechanism: string; timing: string; bestForm: string }> = {
  'omega-3': { dosage: '2-4g EPA/DHA daily', tier: 1, benefit: 'reduces CRP and IL-6, supports cardiovascular and cognitive function', contraindication: 'May interact with blood thinners', mechanism: 'Resolvin and protectin synthesis via COX/LOX pathways; incorporates into cell membranes improving fluidity and receptor signaling', timing: 'With meals containing fat for optimal absorption. Split dose AM/PM if >2g', bestForm: 'Triglyceride-form fish oil (Nordic Naturals, Carlson) or algae-based for vegans' },
  'curcumin': { dosage: '500-1000mg with piperine daily', tier: 1, benefit: 'modulates NF-κB inflammatory pathway', contraindication: 'May interact with blood thinners and gallbladder medications', mechanism: 'Inhibits NF-κB nuclear translocation, blocks COX-2 and 5-LOX enzymes, upregulates Nrf2 antioxidant pathway', timing: 'With meals. Piperine (black pepper extract) increases bioavailability by 2,000%', bestForm: 'Meriva (phytosome), Longvida, or BCM-95 — all have enhanced bioavailability over standard curcumin' },
  'berberine': { dosage: '500mg 2-3x daily', tier: 1, benefit: 'AMPK activation, comparable A1C reduction to metformin', contraindication: 'May interact with metformin and CYP3A4 substrates', mechanism: 'Activates AMP-activated protein kinase (AMPK), the master metabolic switch. Modulates gut microbiome composition favorably', timing: 'With meals, spaced throughout the day. Take 2 hours apart from other medications', bestForm: 'Berberine HCl or dihydroberberine (GlucoVantage) for better absorption and fewer GI effects' },
  'magnesium': { dosage: '400mg glycinate before bed', tier: 1, benefit: 'supports sleep architecture, GABA modulation, muscle recovery', contraindication: 'May cause loose stools at high doses', mechanism: 'Binds GABA-A receptors promoting relaxation, blocks NMDA receptor excitotoxicity, cofactor in 300+ enzymatic reactions', timing: '1 hour before bed for sleep support. Can split 200mg morning/200mg evening', bestForm: 'Glycinate/bisglycinate for sleep and calm. Threonate (Magtein) for cognitive support. Malate for energy/muscle' },
  'ashwagandha': { dosage: '600mg KSM-66 daily', tier: 1, benefit: 'HPA axis regulation, 30% cortisol reduction in RCTs', contraindication: 'Avoid with hyperthyroidism', mechanism: 'Withanolides modulate the HPA axis, reducing cortisol output. Also enhances GABA signaling and supports thyroid hormone conversion', timing: 'Morning for energy/cortisol support, or evening for sleep. Consistent daily use for 4-8 weeks for full effects', bestForm: 'KSM-66 (full-spectrum root extract) or Sensoril (root + leaf). Standardized to withanolides' },
  'vitamin d': { dosage: '5,000 IU D3 + 100mcg K2 daily', tier: 1, benefit: 'immune modulation, bone density, mood regulation', contraindication: 'Monitor levels every 3 months', mechanism: 'Vitamin D receptor (VDR) activation influences 2,000+ genes. Regulates calcium homeostasis, immune cell differentiation, and serotonin synthesis', timing: 'With the largest meal containing fat. Morning preferred to avoid potential sleep disruption', bestForm: 'D3 (cholecalciferol) + K2 (MK-7 form). Liquid drops or softgels for best absorption' },
  'probiotics': { dosage: '50B CFU multi-strain daily', tier: 2, benefit: 'gut-brain axis support, microbiome diversity', contraindication: 'Introduce gradually, temporary bloating possible', mechanism: 'Colonize the intestinal lining, produce short-chain fatty acids (butyrate), enhance tight junction integrity, and modulate vagus nerve signaling', timing: 'On an empty stomach, 30 minutes before breakfast. Or before bed', bestForm: 'Multi-strain with Lactobacillus and Bifidobacterium species. Spore-based (Megasporebiotic) for resilience' },
  'l-theanine': { dosage: '200mg daily', tier: 2, benefit: 'alpha brainwave promotion, calm focus without sedation', contraindication: 'May enhance anti-anxiety medication effects', mechanism: 'Crosses the blood-brain barrier, promotes alpha wave activity (8-13 Hz), increases GABA, serotonin, and dopamine in targeted brain regions', timing: 'As needed for anxiety, or 30 min before stressful situations. Can stack with caffeine for focused calm', bestForm: 'Suntheanine (patented L-isomer form) for guaranteed purity and efficacy' },
  'reishi': { dosage: '1,000mg daily', tier: 2, benefit: 'immune modulation and sleep support via triterpenes', contraindication: 'Avoid 2 weeks before surgery', mechanism: 'Beta-glucans activate innate immune cells (NK cells, macrophages). Triterpenes provide calming, anti-histamine, and hepatoprotective effects', timing: 'Evening for sleep support, or morning for immune modulation', bestForm: 'Dual-extracted (hot water + alcohol) fruiting body. Look for >30% polysaccharides' },
  'boswellia': { dosage: '300-500mg daily', tier: 2, benefit: 'inhibits 5-LOX enzyme, joint support', contraindication: 'May interact with NSAIDs', mechanism: 'Boswellic acids (especially AKBA) selectively inhibit 5-lipoxygenase, reducing leukotriene synthesis without GI side effects of NSAIDs', timing: 'With meals, 2-3 times daily for joint pain. Takes 2-4 weeks for noticeable effects', bestForm: 'AKBA-enriched extract (Boswellia serrata) standardized to 30%+ AKBA' },
  'chromium': { dosage: '200-1000mcg picolinate daily', tier: 2, benefit: 'enhances insulin receptor sensitivity', contraindication: 'Monitor blood sugar closely if on diabetes medication', mechanism: 'Potentiates insulin receptor signaling via chromodulin, enhances GLUT4 transporter translocation to cell membranes', timing: 'With meals, especially higher-carb meals. Split dose if taking >400mcg', bestForm: 'Chromium picolinate (most studied) or chromium polynicotinate' },
  'alpha-lipoic acid': { dosage: '600mg daily', tier: 2, benefit: 'glucose uptake support and potent antioxidant', contraindication: 'May lower blood sugar; monitor if diabetic', mechanism: 'Universal antioxidant (works in both fat and water-soluble environments). Regenerates vitamins C and E. Enhances mitochondrial function and glucose uptake', timing: 'On an empty stomach, 30 minutes before meals. Split 300mg twice daily for blood sugar', bestForm: 'R-lipoic acid (R-ALA) is the bioactive form. Na-R-ALA for enhanced stability' },
  'b12': { dosage: '1000mcg methylcobalamin daily', tier: 1, benefit: 'energy production, nerve function, RBC formation', contraindication: 'Generally well tolerated', mechanism: 'Essential cofactor for methionine synthase (methylation) and L-methylmalonyl-CoA mutase (mitochondrial energy). Critical for myelin sheath maintenance', timing: 'Morning, sublingual for best absorption. Especially important if taking metformin or PPIs which deplete B12', bestForm: 'Methylcobalamin (active form) sublingual. Hydroxocobalamin for those with MTHFR variants who dont tolerate methyl forms' },
  'iron': { dosage: '25-45mg bisglycinate with vitamin C', tier: 1, benefit: 'oxygen transport, energy, thyroid conversion', contraindication: 'Only supplement if ferritin is below 50. Retest in 3 months', mechanism: 'Central atom in hemoglobin for oxygen transport. Required for thyroid peroxidase enzyme (T4 to T3 conversion) and mitochondrial cytochrome enzymes', timing: 'On an empty stomach with 500mg vitamin C. Take 2 hours away from coffee, tea, calcium, and thyroid medications', bestForm: 'Iron bisglycinate (Ferrochel) — gentlest on the gut with excellent absorption. Avoid ferrous sulfate (poor tolerance)' },
  'zinc': { dosage: '30mg daily', tier: 1, benefit: 'immune function, thyroid support, wound healing', contraindication: 'Take with food. Long-term use requires copper balance', mechanism: 'Cofactor for 300+ enzymes. Supports thymic function for T-cell maturation, stabilizes cell membranes, and is critical for taste/smell receptors', timing: 'With dinner to minimize nausea. If taking long-term, pair with 2mg copper to prevent depletion', bestForm: 'Zinc picolinate or zinc bisglycinate for best absorption. Zinc carnosine specifically for gut healing' },
  'selenium': { dosage: '200mcg daily', tier: 1, benefit: 'thyroid conversion T4 to T3, antioxidant defense', contraindication: 'Do not exceed 400mcg/day', mechanism: 'Incorporated into selenoproteins including glutathione peroxidase (antioxidant) and deiodinase enzymes (thyroid hormone conversion T4→T3)', timing: 'With meals. Can combine with zinc and iodine for comprehensive thyroid support', bestForm: 'Selenomethionine (organic form) or selenium glycinate. Brazil nuts provide ~75mcg per nut' },
  'melatonin': { dosage: '0.5-3mg 30min before bed', tier: 2, benefit: 'circadian rhythm regulation, sleep onset', contraindication: 'Start low. May cause vivid dreams', mechanism: 'Endogenous hormone produced by the pineal gland. Binds MT1/MT2 receptors, reducing core body temperature and promoting sleep onset. Also a potent antioxidant', timing: '30-60 minutes before desired sleep time. Use the lowest effective dose. Extended-release for sleep maintenance issues', bestForm: 'Sublingual for fastest onset. Extended-release for middle-of-night waking. Consider time-release for maintenance' },
  'valerian': { dosage: '300-600mg before bed', tier: 3, benefit: 'GABA support for sleep onset', contraindication: 'May enhance sedative medications', mechanism: 'Valerenic acid inhibits GABA transaminase enzyme, increasing GABA availability at synapses. May also bind benzodiazepine receptors at sub-anxiolytic levels', timing: '30-60 minutes before bed. Takes 2-4 weeks of consistent use for optimal effects', bestForm: 'Standardized to 0.8% valerenic acid. Water-based extract preferred over tincture for sleep' },
  'nac': { dosage: '600-1200mg daily', tier: 1, benefit: 'glutathione precursor, liver support, mucolytic', contraindication: 'Rare GI upset at high doses', mechanism: 'Rate-limiting precursor for glutathione synthesis (the bodys master antioxidant). Also modulates glutamate signaling and breaks disulfide bonds in mucus', timing: 'On an empty stomach for best absorption. Split dose for higher amounts. Pair with vitamin C to prevent oxidation', bestForm: 'NAC (N-acetyl-L-cysteine) capsules. Some prefer liposomal glutathione directly for those with severe depletion' },
  'coq10': { dosage: '200-400mg daily', tier: 1, benefit: 'mitochondrial energy production, cardiovascular support, statin depletion recovery', contraindication: 'May reduce blood pressure slightly. Generally very well tolerated', mechanism: 'Essential electron carrier in mitochondrial complex III of the electron transport chain. Also a lipid-soluble antioxidant protecting cell membranes from oxidation', timing: 'With meals containing fat. Morning and lunch doses preferred. Essential if taking statins which deplete CoQ10 by up to 40%', bestForm: 'Ubiquinol (reduced form) for those over 40. Ubiquinone for younger individuals. Kaneka QH is a well-studied brand' },
  'lions mane': { dosage: '1000-2000mg daily', tier: 2, benefit: 'nerve growth factor stimulation, cognitive support, neuroprotection', contraindication: 'May worsen symptoms in those with mushroom allergies. Rare reports of skin sensitivity', mechanism: 'Hericenones and erinacines cross the blood-brain barrier and stimulate NGF (nerve growth factor) and BDNF production, supporting neuroplasticity and myelin synthesis', timing: 'Morning or early afternoon for cognitive benefits. Can take with or without food', bestForm: 'Dual-extracted fruiting body (hot water + alcohol extraction). Look for >25% beta-glucans. Real Mushrooms and Host Defense are reputable brands' },
  'glutathione': { dosage: '500-1000mg liposomal daily', tier: 2, benefit: 'master antioxidant, phase II detoxification, immune support', contraindication: 'May chelate minerals — space from mineral supplements', mechanism: 'Tripeptide antioxidant that neutralizes free radicals, regenerates vitamins C and E, and conjugates toxins in phase II liver detoxification for excretion', timing: 'On an empty stomach. Morning preferred. Liposomal form bypasses GI degradation', bestForm: 'Liposomal glutathione (Quicksilver Scientific) or S-acetyl glutathione. IV push for acute depletion. NAC as oral precursor alternative' },
  'quercetin': { dosage: '500-1000mg daily', tier: 2, benefit: 'mast cell stabilization, antihistamine, antiviral support', contraindication: 'May interact with certain antibiotics and blood thinners', mechanism: 'Flavonoid that stabilizes mast cells (preventing histamine release), inhibits viral replication pathways, and acts as a zinc ionophore enhancing intracellular zinc levels', timing: 'Away from meals for anti-histamine effect, or with meals for general antioxidant support. Pairs well with vitamin C and bromelain', bestForm: 'Quercetin phytosome (Thorne) or quercetin dihydrate with bromelain for enhanced absorption' },
};

const DRUG_ALTERNATIVES: Record<string, string> = {
  'metformin': 'Berberine HCl (500mg 2-3x daily) shows comparable A1C reduction in meta-analyses via AMPK activation — Tier 1 evidence. Chromium picolinate (200-1000mcg) enhances insulin receptor sensitivity — Tier 2. Alpha-lipoic acid (600mg R-ALA) supports glucose uptake and is neuroprotective — Tier 2. Ceylon cinnamon (1-3g daily) provides modest fasting glucose reduction — Tier 3.\n\nTransition Protocol:\n• Week 1-2: Begin berberine 500mg once daily alongside metformin\n• Week 3-4: Increase berberine to 500mg 2x daily, discuss reducing metformin with practitioner\n• Week 5-8: Full berberine dose (500mg 3x daily), monitor fasting glucose and A1C\n• Month 3: Retest A1C to confirm efficacy',
  'statin': 'Red yeast rice (1200mg, contains natural monacolin K) has statin-like effects — Tier 2. Omega-3 (2-4g EPA/DHA) reduces triglycerides 15-30% — Tier 1. Plant sterols (2g daily) block cholesterol absorption 10-15% — Tier 1. CoQ10 (200-400mg ubiquinol) is ESSENTIAL if currently on statins to counter mitochondrial depletion — Tier 1.\n\nAdditional support: Berberine (500mg 2x daily) has lipid-lowering effects via LDLR upregulation. Niacin (500-1000mg slow-release) raises HDL but discuss liver monitoring with your practitioner.\n\n⚠️ Safety: Statins should only be tapered under direct medical supervision with lipid panel monitoring every 4-6 weeks during transition.',
  'ppi': 'DGL licorice (400mg chewable before meals) coats and soothes gastric lining — Tier 2. Zinc carnosine (75mg 2x daily) supports mucosal repair and H. pylori defense — Tier 2. Slippery elm (400mg) provides demulcent protection — Tier 3. Betaine HCl (with protein meals) if testing confirms low stomach acid.\n\nRoot Cause Investigation:\nMany GERD cases are actually caused by LOW stomach acid (hypochlorhydria), not excess acid. The Heidelberg pH test or baking soda challenge can help differentiate.\n\nPPI Tapering Protocol:\n• Weeks 1-2: Alternate PPI and DGL/zinc carnosine every other day\n• Weeks 3-4: PPI every 3rd day, with DGL before each meal\n• Week 5+: Discontinue PPI, maintain DGL and zinc carnosine for 8 weeks',
  'ssri': 'St. John\'s Wort (900mg standardized to 0.3% hypericin) shows comparable efficacy to mild-moderate SSRIs in Cochrane meta-analyses — Tier 1 for mild-moderate depression. Saffron extract (30mg, Affron brand) demonstrates antidepressant effects in multiple RCTs — Tier 2. 5-HTP (100-300mg) supports serotonin synthesis directly — Tier 2. SAMe (400-800mg) is well-studied for mood support — Tier 1.\n\n⚠️ Critical Safety Warning: NEVER combine St. John\'s Wort or 5-HTP with SSRIs — risk of serotonin syndrome. SSRI tapering must be done VERY gradually under psychiatric supervision over months, not weeks. Abrupt discontinuation can cause severe withdrawal.',
  'nsaid': 'Curcumin with piperine (1000mg phytosome form) is a potent COX-2 inhibitor comparable to ibuprofen in some RCTs — Tier 1. Boswellia AKBA (500mg) inhibits 5-LOX without GI damage — Tier 2. Omega-3 (2-4g) resolves inflammation via specialized pro-resolving mediators (SPMs) — Tier 1. Bromelain (500mg between meals) provides enzymatic anti-inflammatory action — Tier 2.\n\nTopical alternatives: Arnica gel, comfrey cream, and CBD topical for localized pain.\n\nUnlike NSAIDs, these compounds support tissue healing rather than merely masking pain, and they don\'t damage the GI lining.',
  'benzodiazepine': 'L-theanine (200-400mg) promotes alpha waves for calm without sedation — Tier 2. Magnesium glycinate (400-600mg) supports GABA receptors — Tier 1. Passionflower extract (500mg, standardized) has anxiolytic properties in RCTs comparable to oxazepam — Tier 2. Ashwagandha KSM-66 (600mg) modulates cortisol response — Tier 1.\n\n⚠️ Critical Safety Warning: Benzodiazepine withdrawal can be medically dangerous and potentially life-threatening. NEVER discontinue abruptly. Tapering must be done under medical supervision, typically reducing by 5-10% every 2-4 weeks. Natural compounds can support the tapering process but should not replace medical oversight.',
  'thyroid': 'Selenium (200mcg selenomethionine) is essential for T4 to T3 conversion via deiodinase enzymes — Tier 1. Zinc (30mg picolinate) supports thyroid hormone synthesis — Tier 1. Ashwagandha (600mg KSM-66) improves TSH in subclinical hypothyroidism — Tier 2. Iodine (150-300mcg from kelp) if deficiency is confirmed by urinary iodine testing — Tier 2.\n\nSupporting nutrients: Iron (ferritin must be >50 for proper thyroid conversion), vitamin D (60-90 ng/mL optimal), and B12. Address all nutrient cofactors before expecting thyroid improvement.',
  'blood pressure': 'Magnesium (400-600mg glycinate) relaxes vascular smooth muscle — Tier 1. CoQ10 (200mg ubiquinol) supports endothelial function, shown to reduce systolic BP 11-17 mmHg — Tier 1. Hibiscus tea (3 cups daily) reduces systolic BP by 7-10 mmHg in meta-analyses — Tier 2. Beetroot juice (250ml daily) provides nitric oxide support for vasodilation — Tier 2.\n\nLifestyle interventions with strong evidence: DASH diet pattern, sodium reduction to <2,300mg, 150 min/week moderate exercise, stress management (meditation reduces BP 4-5 mmHg), and maintaining healthy weight.',
  'sleep medication': 'Magnesium glycinate (400mg) 1 hour before bed for GABA support — Tier 1. Melatonin (0.5-3mg, start low) 30 min before bed for circadian reset — Tier 2. L-theanine (200mg) for pre-sleep relaxation — Tier 2. Reishi mushroom (1,000mg) for calming triterpene effects — Tier 2. Valerian root (300-600mg) for GABA enhancement — Tier 3.\n\nCircadian hygiene (Tier 1 evidence):\n• Morning bright light within 30 min of waking\n• Blue light blocking glasses 2 hours before bed\n• Room temperature 65-68°F\n• Consistent wake time 7 days/week\n• No caffeine after 12 PM',
};

const CONDITION_RESPONSES: Record<string, (ctx: GabrielContext) => string> = {
  'inflammation': (ctx) => {
    const opener = getPersonalizedOpener(ctx);
    const labInsights = buildLabContextInsights(ctx, 'inflammation');
    return `${opener}inflammation is at the root of nearly every chronic disease. Let me break this down comprehensively.${labInsights}

Root Causes (Naturopathic Perspective):
• Gut permeability ("leaky gut") — allows endotoxins (LPS) into bloodstream
• Chronic infections (dental, sinus, gut biofilms)
• Blood sugar dysregulation — glucose spikes trigger NF-κB
• Industrial seed oil overconsumption (omega-6 excess)
• Chronic psychological stress — cortisol dysregulation
• Environmental toxins (mold, heavy metals, pesticides)
• Sleep deprivation — even one night increases IL-6 by 30%

Conventional Approach: NSAIDs, corticosteroids, biologics — suppress symptoms but don't address root cause, and carry significant side effects with long-term use.

Naturopathic Approach — Targeted Anti-Inflammatory Protocol:

Morning:
• Omega-3 (EPA/DHA) — 2-4g daily (Tier 1). SPM production resolves inflammation at the cellular level
• Curcumin phytosome — 500mg (Tier 1). Inhibits NF-κB, the master inflammatory switch

Afternoon:
• Quercetin — 500mg (Tier 2). Mast cell stabilization + antioxidant
• Bromelain — 500mg between meals (Tier 2). Enzymatic anti-inflammatory

Evening:
• Magnesium glycinate — 400mg (Tier 1). Reduces CRP, supports recovery

Key Lab Markers to Track:
• hs-CRP (optimal <0.5 mg/L)
• ESR, fibrinogen, homocysteine
• Omega-3 Index (optimal 8-12%)
• Fasting insulin (optimal <5 mIU/L)

Diet is foundational — an anti-inflammatory whole foods diet eliminates 60-70% of inflammatory burden for most people.

Would you like me to create a detailed anti-inflammatory meal plan, or shall we dive deeper into testing to identify your specific inflammatory triggers?`;
  },

  'gut': (ctx) => {
    const opener = getPersonalizedOpener(ctx);
    const labInsights = buildLabContextInsights(ctx, 'gut');
    return `${opener}gut health is the cornerstone of naturopathic medicine — Hippocrates said "all disease begins in the gut," and modern research confirms this.${labInsights}

The Gut-Health Framework (5R Protocol):

1. REMOVE — Eliminate irritants
• Common triggers: gluten, dairy, sugar, alcohol, NSAIDs
• Test for: SIBO (breath test), H. pylori, parasites, Candida overgrowth
• 30-day elimination diet is the gold standard for identifying food sensitivities

2. REPLACE — Restore digestive capacity
• Betaine HCl with pepsin (if low stomach acid confirmed) — Tier 2
• Digestive enzymes with meals — Tier 2
• Bile support (ox bile, artichoke extract) if gallbladder issues — Tier 3

3. REINOCULATE — Repopulate beneficial bacteria
• Multi-strain probiotic 50B CFU (Lactobacillus + Bifidobacterium) — Tier 2
• Saccharomyces boulardii for yeast/SIBO — Tier 2
• Prebiotic fiber (partially hydrolyzed guar gum, FOS) — Tier 2
• Fermented foods: sauerkraut, kimchi, kefir (if tolerated)

4. REPAIR — Heal the intestinal lining
• L-Glutamine 5g 2x daily — Tier 2. Primary fuel for enterocytes
• Zinc carnosine 75mg 2x daily — Tier 2. Mucosal repair
• DGL licorice 400mg before meals — Tier 2. Mucus production
• Collagen peptides 10-20g daily — Tier 3. Provides glycine and proline for gut lining

5. REBALANCE — Lifestyle factors
• Stress management (vagus nerve activation via cold exposure, gargling, singing)
• Chewing food thoroughly (20-30 chews per bite)
• Mindful eating — parasympathetic state is required for proper digestion
• Sleep optimization — gut repair happens during deep sleep

Key Tests to Consider:
• GI-MAP (comprehensive stool DNA analysis)
• SIBO breath test (lactulose or glucose)
• Food sensitivity panel (IgG/IgA)
• Zonulin (intestinal permeability marker)

Would you like me to help you identify which stage of the 5R protocol would be most impactful for your situation?`;
  },

  'thyroid': (ctx) => {
    const opener = getPersonalizedOpener(ctx);
    const labInsights = buildLabContextInsights(ctx, 'thyroid');
    return `${opener}thyroid health is one of the most commonly mismanaged areas in conventional medicine. Here's what you need to know.${labInsights}

Why Conventional Testing Falls Short:
Most doctors only test TSH. A complete thyroid panel includes:
• TSH (optimal: 1.0-2.0 mIU/L, not just "under 4.5")
• Free T4 (optimal: 1.1-1.8 ng/dL)
• Free T3 (optimal: 3.0-4.0 pg/mL) — this is the ACTIVE hormone
• Reverse T3 (optimal: <15 ng/dL) — elevated = conversion problem
• TPO antibodies — screen for Hashimoto's autoimmunity
• Thyroglobulin antibodies — additional autoimmune marker

Naturopathic Thyroid Support Protocol:

Essential Nutrient Cofactors:
• Selenium — 200mcg daily (Tier 1). Required for deiodinase enzymes that convert T4→T3. In Hashimoto's, reduces TPO antibodies by 40-60% in RCTs
• Zinc — 30mg daily (Tier 1). Supports thyroid hormone synthesis and receptor binding
• Iron — ferritin must be >50 ng/mL for proper thyroid conversion (Tier 1)
• Iodine — 150-300mcg IF deficient (test first via urinary iodine). Excess iodine can worsen Hashimoto's (Tier 2)
• Vitamin D — 60-90 ng/mL optimal. Deficiency correlates with autoimmune thyroid disease (Tier 1)

Adaptogenic Support:
• Ashwagandha KSM-66 — 600mg daily (Tier 2). Improves TSH and T4 in subclinical hypothyroidism
• Guggul extract — 500mg daily (Tier 3). Traditional Ayurvedic thyroid support

If Hashimoto's (Autoimmune):
• Strict gluten elimination — molecular mimicry between gliadin and thyroid tissue (Tier 2)
• Selenium 200mcg — strongest evidence for reducing antibodies (Tier 1)
• Vitamin D optimization — immune regulation (Tier 1)
• Gut healing — 70% of immune system is in the gut
• Low-dose naltrexone (LDN) — discuss with practitioner (Tier 2)

Lifestyle Factors:
• Manage stress — cortisol inhibits T4→T3 conversion
• Avoid excessive raw cruciferous vegetables (moderate cooked is fine)
• Filter chlorine and fluoride from drinking water (thyroid disruptors)
• Support liver health — 60% of T4→T3 conversion occurs in the liver

Would you like me to analyze your current thyroid labs through a functional lens, or help you request the right panel from your provider?`;
  },

  'hormone': (ctx) => {
    const opener = getPersonalizedOpener(ctx);
    const labInsights = buildLabContextInsights(ctx, 'hormone');
    return `${opener}hormonal balance is a symphony — when one instrument is off-key, the entire system is affected. Let's take a systematic approach.${labInsights}

The Hormonal Hierarchy:
1. Blood sugar / Insulin (foundation)
2. Cortisol / Adrenals (stress response)
3. Thyroid (metabolism)
4. Sex hormones (estrogen, progesterone, testosterone)

You MUST address them in this order. Trying to fix sex hormones while blood sugar and cortisol are dysregulated is like building a house on sand.

Core Hormonal Support:

Adrenal / Cortisol Balance:
• Ashwagandha KSM-66 — 600mg daily (Tier 1). 30% cortisol reduction in 8-week RCTs
• Rhodiola rosea — 400mg morning (Tier 2). Adaptogenic, improves stress resilience
• Phosphatidylserine — 400mg (Tier 2). Blunts excessive cortisol response
• Magnesium glycinate — 400mg (Tier 1). Depleted rapidly under stress

Estrogen Metabolism:
• DIM (diindolylmethane) — 200mg daily (Tier 2). Promotes healthy estrogen metabolism (2-OH pathway over 16-OH)
• Calcium D-glucarate — 500mg daily (Tier 2). Supports glucuronidation for estrogen clearance
• Cruciferous vegetables daily — natural source of I3C/DIM
• Fiber 30-40g daily — binds and excretes excess estrogen

Testosterone Support (both sexes):
• Zinc — 30mg daily (Tier 1). Required for testosterone synthesis
• Vitamin D — 5,000 IU (Tier 1). Low D correlates with low T
• Ashwagandha — also supports testosterone in men (Tier 2)
• Resistance training — most potent natural testosterone booster
• Sleep 7-9 hours — testosterone peaks during deep sleep

Key Testing:
• DUTCH test (dried urine) — gold standard for hormone metabolites
• 4-point salivary cortisol — assess diurnal rhythm
• Fasting insulin + glucose
• Complete thyroid panel

Would you like me to recommend specific testing based on your symptoms, or create a targeted hormonal support protocol?`;
  },

  'sleep': (ctx) => {
    const opener = getPersonalizedOpener(ctx);
    const labInsights = buildLabContextInsights(ctx, 'sleep');
    return `${opener}sleep is the single most underrated health intervention. During deep sleep, your body repairs tissue, consolidates memory, clears brain metabolites (via the glymphatic system), and produces growth hormone.${labInsights}

Why You're Not Sleeping (Common Root Causes):
• HPA axis dysregulation — cortisol elevated at night (should be lowest)
• Blue light exposure — suppresses melatonin production by 50-85%
• Blood sugar instability — nocturnal hypoglycemia causes 3 AM waking
• Magnesium deficiency — affects 50-80% of adults
• Caffeine half-life — still 50% active 6 hours after consumption
• Gut-brain axis — 95% of serotonin (melatonin precursor) is made in the gut

Comprehensive Sleep Protocol:

Evening Supplement Stack:
• Magnesium glycinate — 400mg, 1 hour before bed (Tier 1). GABA receptor modulation, muscle relaxation
• L-theanine — 200mg, 45 min before bed (Tier 2). Alpha wave promotion without sedation
• Reishi mushroom — 1,000mg, with dinner (Tier 2). Triterpene-mediated calming effect
• Melatonin — 0.5-1mg if needed, 30 min before bed (Tier 2). Start LOW. More is not better

For Difficulty Falling Asleep:
Add passionflower extract 500mg or valerian 300-600mg (Tier 3)

For Middle-of-Night Waking:
• Time-release melatonin (instead of regular)
• Small protein + fat snack before bed (stabilizes blood sugar)
• Glycine 3g — promotes deeper sleep architecture (Tier 2)

Sleep Hygiene (Tier 1 Evidence):
• Morning sunlight 10-30 min within 1 hour of waking — sets circadian clock
• Blue light blocking glasses 2 hours before bed
• Room temperature 65-68°F — facilitates core temperature drop
• Total darkness — even small light sources disrupt melatonin
• No caffeine after 12 PM (or eliminate if highly sensitive)
• Consistent wake time 7 days/week — most important factor
• Last meal 3+ hours before bed
• 10-min evening wind-down: journaling, stretching, or meditation

Advanced Biohacks:
• Hot bath/sauna 1-2 hours before bed — the subsequent cooling promotes sleep onset
• Mouth taping (if nasal breathing is adequate) — prevents mouth breathing that fragments sleep
• Weighted blanket — deep pressure stimulation activates parasympathetic nervous system

Would you like me to create a personalized evening routine based on your specific sleep challenges?`;
  },

  'anxiety': (ctx) => {
    const opener = getPersonalizedOpener(ctx);
    const labInsights = buildLabContextInsights(ctx, 'anxiety');
    return `${opener}anxiety is not a character flaw — it's often a physiological signal of nervous system dysregulation, nutrient depletion, or gut-brain axis disruption. Let's address all layers.${labInsights}

Root Causes to Investigate:
• Magnesium deficiency (depleted by stress, caffeine, sugar)
• Gut dysbiosis — the vagus nerve carries signals from gut to brain
• Blood sugar instability — glucose crashes trigger adrenaline release
• Thyroid dysfunction — both hyper and hypothyroidism cause anxiety
• HPA axis dysregulation — chronic stress rewires the cortisol response
• Histamine intolerance — excess histamine mimics anxiety symptoms

Supplement Protocol for Anxiety:

Foundational (Daily):
• Magnesium glycinate — 400-600mg (Tier 1). Direct GABA receptor support. Most anxious patients are magnesium depleted
• L-theanine — 200-400mg (Tier 2). Promotes calming alpha brainwaves within 30-40 min. Can use as-needed for acute anxiety
• Ashwagandha KSM-66 — 600mg (Tier 1). Reduces cortisol 30%, comparable to lorazepam in one trial for GAD
• Omega-3 (EPA dominant) — 2g (Tier 1). EPA specifically has anxiolytic properties

Additional Support:
• Passionflower extract — 500mg (Tier 2). Comparable to oxazepam in one RCT
• GABA (pharma-grade) — 750mg as needed (Tier 3). Crosses BBB more than previously thought
• B-complex (methylated) — stress depletes B vitamins rapidly (Tier 2)
• Probiotics (Lactobacillus rhamnosus, B. longum) — gut-brain axis support (Tier 2)

Lifestyle Interventions (Tier 1 Evidence):
• Box breathing (4-4-4-4) — direct vagus nerve activation
• Cold exposure (30-60 sec cold shower) — builds stress resilience via hormesis
• Mindfulness meditation 10 min/day — shrinks amygdala, thickens prefrontal cortex in 8 weeks
• Regular exercise — as effective as SSRIs for mild-moderate anxiety in meta-analyses
• Nature exposure 20+ min — reduces cortisol 12%, heart rate, and blood pressure

Investigate if persistent:
• 4-point salivary cortisol
• Complete thyroid panel
• Histamine/DAO enzyme levels
• Comprehensive stool analysis (gut-brain axis)

Would you like me to prioritize which interventions to start with, or explore whether your anxiety might have a specific physiological trigger?`;
  },

  'energy': (ctx) => {
    const opener = getPersonalizedOpener(ctx);
    const labInsights = buildLabContextInsights(ctx, 'energy');
    return `${opener}chronic low energy is one of the most common complaints I encounter, and it almost always has identifiable root causes that conventional medicine overlooks.${labInsights}

The Energy Equation — What's Actually Happening:

Mitochondrial Function:
Your mitochondria are the power plants of every cell. When they're underfueled or damaged, you feel it as fatigue. Key mitochondrial nutrients:
• CoQ10 — 200mg ubiquinol (Tier 1). Essential electron carrier in ATP production
• B-complex (methylated) — cofactors for Krebs cycle (Tier 1)
• Magnesium — cofactor for ATP synthesis itself (Mg-ATP complex) (Tier 1)
• Alpha-lipoic acid — 300mg, mitochondrial antioxidant (Tier 2)

Thyroid Optimization:
Even "normal" TSH can mean suboptimal energy. Optimal TSH: 1.0-2.0
• Selenium 200mcg + Zinc 30mg for T4→T3 conversion (Tier 1)
• Ashwagandha 600mg for subclinical hypothyroidism (Tier 2)

Iron/Oxygen Delivery:
Ferritin below 50 = fatigue, even if hemoglobin is "normal"
• Iron bisglycinate 25-45mg + vitamin C if ferritin <50 (Tier 1)
• B12 methylcobalamin 1000mcg (Tier 1)

Adrenal Support:
Chronic stress depletes cortisol reserves → "tired but wired" pattern
• Ashwagandha KSM-66 600mg (Tier 1)
• Rhodiola rosea 400mg morning (Tier 2)
• Vitamin C 1000mg — adrenals have highest concentration in the body (Tier 2)
• Pantothenic acid (B5) 500mg — adrenal cortex support (Tier 2)

Blood Sugar Stability:
Energy crashes = insulin/glucose rollercoaster
• Berberine 500mg with meals if insulin resistance present (Tier 1)
• Chromium 200mcg with meals (Tier 2)
• Eat protein + fat at every meal
• Avoid naked carbohydrates

Morning Energy Protocol:
• Morning sunlight (10 min) — cortisol awakening response
• Cold shower finish (30-60 sec) — norepinephrine boost 200-300%
• Protein-rich breakfast within 90 min of waking
• B-complex + CoQ10 + ashwagandha with breakfast

Essential Testing:
• Complete thyroid panel (TSH, free T3, free T4, reverse T3)
• Iron studies with ferritin
• Vitamin D 25-OH
• B12 + methylmalonic acid
• Fasting insulin + glucose
• 4-point salivary cortisol

Would you like me to prioritize which tests to request first, or build a morning energy stack based on your profile?`;
  },

  'detox': (ctx) => {
    const opener = getPersonalizedOpener(ctx);
    const labInsights = buildLabContextInsights(ctx, 'detox');
    return `${opener}let's talk about detoxification from an evidence-based perspective — not juice cleanses, but supporting your body's actual detox pathways.${labInsights}

Your Body's Detox Systems:

Phase I (Liver — Cytochrome P450):
Transforms fat-soluble toxins into intermediate metabolites. These intermediates are often MORE toxic than the originals, which is why Phase II must be robust.
• Support: B-vitamins, glutathione, vitamin C, flavonoids

Phase II (Liver — Conjugation):
Binds Phase I intermediates to molecules that make them water-soluble for excretion.
• Glucuronidation — supported by calcium D-glucarate
• Sulfation — supported by sulfur-rich foods, NAC, MSM
• Glutathione conjugation — NAC, glycine, glutamine
• Methylation — methylated B-vitamins, betaine (TMG)
• Acetylation — pantothenic acid (B5)

Phase III (Elimination):
Actually removing conjugated toxins via bile, stool, urine, and sweat.
• Fiber (30-40g daily) binds toxins in bile
• Hydration (half body weight in oz)
• Regular bowel movements (1-3x daily)
• Sweating (sauna, exercise)

Evidence-Based Detox Protocol:

Core Supplements:
• NAC — 600-1200mg daily (Tier 1). Rate-limiting glutathione precursor
• Milk thistle (silymarin) — 200-400mg (Tier 2). Hepatoprotective, stimulates glutathione production
• Alpha-lipoic acid — 300-600mg (Tier 2). Chelates heavy metals, regenerates glutathione
• Calcium D-glucarate — 500mg (Tier 2). Prevents beta-glucuronidase from reactivating conjugated toxins
• Glutathione liposomal — 500mg (Tier 2). Direct antioxidant and conjugation support
• Chlorella — 3-5g (Tier 3). Binds heavy metals in the GI tract

Lifestyle Detox Practices:
• Infrared sauna — 20-40 min, 3-4x/week. Mobilizes stored toxins via sweat
• Dry brushing — stimulates lymphatic drainage before showering
• Castor oil packs over liver — 30-60 min, 3-4x/week. Traditional but clinically observed hepatic support
• Filtered water — remove chlorine, fluoride, heavy metals
• Organic produce for the "Dirty Dozen" at minimum

⚠️ Important: Detox should be gentle and gradual. Aggressive detox protocols can mobilize more toxins than the body can eliminate, causing "herx" reactions. Always ensure elimination pathways (bowels, kidneys, skin) are open before intensifying.

Would you like me to create a gentle 30-day detox protocol, or focus on a specific toxin concern like heavy metals or mold?`;
  },

  'autoimmune': (ctx) => {
    const opener = getPersonalizedOpener(ctx);
    const labInsights = buildLabContextInsights(ctx, 'autoimmune');
    return `${opener}autoimmune conditions are one of the areas where naturopathic medicine truly shines, because the conventional approach (immunosuppression) manages symptoms without addressing triggers.${labInsights}

The Autoimmune Triad:
For autoimmunity to develop, you need ALL THREE:
1. Genetic predisposition (HLA genes)
2. Environmental trigger (infection, toxin, stress)
3. Intestinal permeability ("leaky gut") — this is the modifiable factor

Naturopathic Approach — Remove Triggers, Heal Barriers:

Gut Healing (Priority #1):
• L-Glutamine — 5g 2x daily (Tier 2). Primary fuel for enterocytes, repairs tight junctions
• Zinc carnosine — 75mg 2x daily (Tier 2). Mucosal repair
• Bone broth collagen — 20g daily (Tier 3). Glycine and proline for gut lining
• Probiotics (spore-based) — 50B CFU (Tier 2). Restore barrier function

Immune Modulation (not suppression):
• Vitamin D — optimize to 60-80 ng/mL (Tier 1). Regulates Th1/Th2 balance. Low D strongly correlates with autoimmune risk
• Omega-3 — 3-4g EPA/DHA (Tier 1). Resolves inflammation via SPMs
• Curcumin phytosome — 500-1000mg (Tier 1). NF-κB modulation
• Glutathione liposomal — 500mg (Tier 2). Oxidative stress is elevated in all autoimmune conditions
• Low-dose naltrexone (LDN) — 1.5-4.5mg (Tier 2). Discuss with practitioner. Upregulates endorphins and modulates immune response

Dietary Framework:
• Autoimmune Paleo (AIP) Protocol — eliminates all potential immune triggers for 30-60 days, then systematic reintroduction
• Remove: gluten (priority #1 — molecular mimicry), dairy, eggs, nightshades, nuts, seeds, alcohol
• Include: organ meats, bone broth, fermented vegetables, wild fish, colorful vegetables

Testing to Consider:
• Comprehensive stool analysis (GI-MAP)
• Zonulin (intestinal permeability)
• Full autoimmune antibody panel
• Vitamin D, B12, ferritin, comprehensive metabolic panel
• DUTCH hormone test (cortisol affects immune regulation)

Would you like me to tailor this specifically to your autoimmune condition, or help you implement the AIP elimination diet?`;
  },

  'blood sugar': (ctx) => {
    const opener = getPersonalizedOpener(ctx);
    const labInsights = buildLabContextInsights(ctx, 'blood sugar');
    return `${opener}blood sugar regulation is foundational — it affects energy, mood, hormones, inflammation, and long-term disease risk. Let's optimize this.${labInsights}

Understanding the Spectrum:
Conventional medicine waits for A1C >6.5% (diabetes). But functional medicine recognizes a metabolic dysfunction spectrum:
• Optimal: Fasting glucose 75-85 mg/dL, fasting insulin <5 mIU/L, A1C 4.8-5.2%
• Insulin resistance: Fasting insulin >7 mIU/L (even with normal glucose)
• Pre-diabetes: Fasting glucose 100-125, A1C 5.7-6.4%
• Type 2 diabetes: Fasting glucose >125, A1C >6.5%

Most people are insulin resistant for 10-15 years before glucose rises. Fasting insulin is the early warning marker most doctors don't test.

Supplement Protocol:

Tier 1 (Strong Evidence):
• Berberine HCl — 500mg 2-3x daily with meals. AMPK activation comparable to metformin. Also improves lipid profile and gut microbiome
• Chromium picolinate — 200-1000mcg daily with meals. Enhances insulin receptor sensitivity
• Magnesium — 400mg glycinate. Involved in insulin signaling. Deficiency = insulin resistance

Tier 2 (Moderate Evidence):
• Alpha-lipoic acid — 600mg R-ALA daily. Enhances glucose uptake, neuroprotective
• Ceylon cinnamon — 1-3g daily. Modest fasting glucose reduction
• Gymnema sylvestre — 400mg (Tier 3). Called "sugar destroyer" in Ayurveda. Reduces sugar cravings and supports pancreatic beta cells

Dietary Strategies:
• Protein first, carbs last at every meal — reduces glucose spike 30-50%
• Apple cider vinegar (1 tbsp before carb-heavy meals) — slows gastric emptying
• 10-minute walk after meals — lowers post-meal glucose by 30%
• Time-restricted eating (12-16 hour overnight fast)
• Eliminate liquid sugars entirely

Key Monitoring:
• Continuous glucose monitor (CGM) for 2 weeks — reveals your personal response to foods
• Fasting insulin (most important marker)
• A1C every 3 months during intervention
• HOMA-IR calculation (fasting insulin × fasting glucose ÷ 405)

Would you like me to create a blood sugar optimization protocol, or help you interpret your metabolic markers?`;
  },

  'cardiovascular': (ctx) => {
    const opener = getPersonalizedOpener(ctx);
    const labInsights = buildLabContextInsights(ctx, 'inflammation');
    return `${opener}cardiovascular health extends far beyond cholesterol numbers. Let me share the naturopathic perspective on true heart health.${labInsights}

Beyond Cholesterol — What Actually Matters:
Standard lipid panels miss the story. Advanced cardiac markers to request:
• ApoB — actual number of atherogenic particles (better than LDL-C)
• Lp(a) — genetic risk factor, 20% of population has elevated levels
• LDL particle size (NMR) — small dense LDL is atherogenic; large buoyant is benign
• hs-CRP — inflammation is the primary driver of atherosclerosis
• Homocysteine — elevated levels damage arterial endothelium (optimal <8 µmol/L)
• Fasting insulin — insulin resistance drives CVD risk more than cholesterol
• Coronary artery calcium (CAC) score — direct imaging of arterial plaque

Naturopathic Cardiovascular Protocol:

Core Supplements:
• Omega-3 (EPA/DHA) — 2-4g daily (Tier 1). Reduces triglycerides 15-30%, anti-arrhythmic, anti-inflammatory
• CoQ10 — 200-400mg ubiquinol (Tier 1). Supports cardiac mitochondria. ESSENTIAL if on statins
• Magnesium — 400-600mg (Tier 1). Natural calcium channel blocker, supports rhythm and blood pressure
• Vitamin K2 (MK-7) — 200mcg (Tier 2). Directs calcium to bones, away from arteries (arterial decalcification)

Additional Support:
• Aged garlic extract — 1200mg (Tier 2). Reduces arterial stiffness and BP
• Nattokinase — 2000 FU daily (Tier 2). Fibrinolytic enzyme, supports healthy clotting
• Berberine — 500mg 2x daily (Tier 1). Improves lipid profile via LDLR upregulation
• Vitamin D — optimize to 60-80 ng/mL (Tier 1). Deficiency associated with CVD risk

Homocysteine Reduction:
• Methylfolate — 800mcg (Tier 1)
• Methylcobalamin (B12) — 1000mcg (Tier 1)
• B6 (P5P form) — 50mg (Tier 1)
• Betaine (TMG) — 500mg (Tier 2)

Lifestyle (Tier 1 evidence for all):
• Zone 2 cardio 150+ min/week
• Mediterranean/DASH dietary pattern
• Stress management (high cortisol drives CVD)
• Sleep 7-8 hours (sleep apnea dramatically increases CVD risk)
• Social connection — loneliness is a CVD risk factor comparable to smoking

Would you like me to help you interpret your lipid panel with these advanced markers, or create a heart-protective supplement protocol?`;
  },

  'brain': (ctx) => {
    const opener = getPersonalizedOpener(ctx);
    const labInsights = buildLabContextInsights(ctx, 'energy');
    return `${opener}cognitive health — whether you're dealing with brain fog now or optimizing for long-term neuroprotection — is one of the most empowering areas of naturopathic medicine.${labInsights}

Brain Fog Root Causes:
• Neuroinflammation (microglial activation)
• Blood sugar instability (brain uses 20% of glucose)
• Thyroid dysfunction (brain is highly thyroid-dependent)
• Gut dysbiosis (gut-brain axis via vagus nerve)
• Nutrient deficiencies (B12, iron, omega-3, vitamin D)
• Mold/mycotoxin exposure (often overlooked)
• Chronic stress (cortisol damages hippocampus)

Cognitive Enhancement Protocol:

Neuroplasticity & NGF Support:
• Lion's Mane mushroom — 1000-2000mg daily (Tier 2). Stimulates NGF and BDNF production. Supports myelin synthesis
• Omega-3 (DHA dominant) — 2g daily (Tier 1). DHA comprises 40% of brain polyunsaturated fats. Essential for synaptic membranes

Neurotransmitter Support:
• L-theanine — 200mg (Tier 2). Alpha wave promotion for calm focus
• Phosphatidylserine — 300mg (Tier 2). Cell membrane phospholipid, improves memory and cortisol regulation
• B12 methylcobalamin — 1000mcg (Tier 1). Nerve function and myelin maintenance

Neuroprotection:
• Curcumin phytosome — 500mg (Tier 1). Crosses BBB, reduces neuroinflammation, promotes BDNF
• NAC — 600mg (Tier 1). Glutathione precursor, protects against oxidative brain damage
• CoQ10 — 200mg (Tier 1). Mitochondrial support for high-energy-demand brain tissue
• Alpha-lipoic acid — 300mg (Tier 2). Crosses BBB, regenerates other antioxidants in brain tissue

Lifestyle for Brain Health:
• Exercise — most potent BDNF stimulator known. 30+ min moderate intensity
• Sleep — glymphatic system clears amyloid-beta ONLY during deep sleep
• Intermittent fasting — triggers autophagy (cellular cleanup) and BDNF release
• Novel experiences — neuroplasticity requires novelty and challenge
• Social engagement — strongest predictor of cognitive longevity
• Cold exposure — norepinephrine boost supports focus and alertness

Would you like me to create a targeted nootropic stack, or investigate potential root causes of your cognitive symptoms?`;
  },

  'joint': (ctx) => {
    const opener = getPersonalizedOpener(ctx);
    const labInsights = buildLabContextInsights(ctx, 'inflammation');
    return `${opener}joint pain is your body signaling inflammation, degeneration, or both. The naturopathic approach addresses both symptom relief AND tissue repair — not just masking pain.${labInsights}

Root Cause Assessment:
• Osteoarthritis — cartilage wear, mechanical + inflammatory
• Inflammatory arthritis (RA, psoriatic) — autoimmune-driven
• Gut-joint axis — intestinal permeability drives systemic inflammation to joints
• Food sensitivities — nightshades, gluten, dairy are common joint triggers
• Nutrient deficiencies — collagen, vitamin C, sulfur compounds

Anti-Inflammatory Joint Protocol:

Pain & Inflammation Relief:
• Curcumin phytosome — 1000mg daily (Tier 1). COX-2 and 5-LOX inhibition. Head-to-head trials show comparable efficacy to ibuprofen for knee OA without GI damage
• Boswellia AKBA — 500mg daily (Tier 2). Selective 5-LOX inhibitor. Significant improvement in WOMAC scores for knee OA
• Omega-3 — 3-4g EPA/DHA (Tier 1). Reduces morning stiffness and joint tenderness in RA trials

Cartilage & Tissue Repair:
• Collagen peptides (Type II) — 10-15g daily (Tier 2). Provides building blocks for cartilage matrix
• Glucosamine sulfate — 1500mg daily (Tier 2). Supports glycosaminoglycan synthesis. Takes 4-8 weeks for effect
• MSM (methylsulfonylmethane) — 3-6g daily (Tier 2). Sulfur donor for connective tissue. Anti-inflammatory
• Vitamin C — 1000mg daily (Tier 1). Required for collagen synthesis. Cofactor for prolyl and lysyl hydroxylase

Topical Support:
• Arnica gel — anti-inflammatory, reduces bruising
• CBD topical — local anti-inflammatory without systemic effects
• Capsaicin cream — depletes substance P (pain neurotransmitter)
• Frankincense (Boswellia) essential oil — topical anti-inflammatory

Lifestyle:
• Low-impact movement daily — swimming, cycling, yoga. Motion is lotion for joints
• Anti-inflammatory diet — eliminate nightshades (tomatoes, peppers, eggplant, potatoes) for 30 days to assess
• Weight optimization — every 1 lb lost = 4 lbs less force on knees
• Epsom salt baths — transdermal magnesium + heat therapy

Would you like me to create a joint recovery protocol tailored to your specific type of joint pain?`;
  },

  'skin': (ctx) => {
    const opener = getPersonalizedOpener(ctx);
    const labInsights = buildLabContextInsights(ctx, 'general');
    return `${opener}in naturopathic medicine, the skin is a mirror of internal health — particularly gut health, liver function, and hormonal balance. Let's address this from the inside out.${labInsights}

The Skin-Gut Connection:
Research confirms that skin conditions like acne, eczema, psoriasis, and rosacea are strongly linked to gut dysbiosis and intestinal permeability. The gut-skin axis is mediated by:
• Immune activation from leaky gut → systemic inflammation → skin
• Microbiome imbalances → altered immune tolerance
• Liver congestion → toxins diverted to skin for elimination

Internal Support Protocol:

Gut Healing (Foundation):
• Probiotics (L. rhamnosus, L. plantarum) — 50B CFU (Tier 2). These strains specifically benefit skin conditions
• L-Glutamine — 5g daily (Tier 2). Gut barrier repair
• Zinc carnosine — 75mg (Tier 2). Mucosal healing

Essential Skin Nutrients:
• Zinc — 30mg picolinate daily (Tier 1). Central to skin cell turnover, wound healing, and sebum regulation. Low zinc = acne, slow healing
• Omega-3 — 2-3g EPA/DHA (Tier 1). Anti-inflammatory, supports skin barrier lipids
• Vitamin D — optimize to 60-80 ng/mL (Tier 1). Immune regulation, keratinocyte differentiation
• Vitamin A (retinol) — 5,000-10,000 IU daily (Tier 2). Supports cell turnover and sebaceous gland regulation. Caution in pregnancy
• Vitamin C — 1000mg (Tier 1). Collagen synthesis, photoprotection, brightening
• Collagen peptides — 10-15g (Tier 2). Improved skin elasticity and hydration in RCTs

Liver & Detox Support:
• NAC — 600mg (Tier 1). Glutathione production for phase II detox
• Milk thistle — 200mg (Tier 2). Hepatoprotective
• Dandelion root tea — traditional liver and skin support (Tier 3)

Condition-Specific:
• Acne: Address insulin resistance (berberine), balance hormones (DIM 200mg), zinc
• Eczema: Heal gut (probiotics, glutamine), eliminate dairy/gluten trial, evening primrose oil 1000mg (GLA)
• Psoriasis: Vitamin D (high dose under supervision), omega-3 4g, curcumin, gut healing
• Rosacea: Gut testing for SIBO/H. pylori (common triggers), histamine-lowering diet, quercetin 500mg

Would you like me to focus on a specific skin concern, or help you investigate the internal root cause of your skin issues?`;
  },

  'weight': (ctx) => {
    const opener = getPersonalizedOpener(ctx);
    const labInsights = buildLabContextInsights(ctx, 'blood sugar');
    return `${opener}sustainable weight management is about correcting metabolic dysfunction — not counting calories. Let me share the naturopathic approach.${labInsights}

Why Diets Fail — The Metabolic Picture:
Weight resistance is usually driven by one or more of these factors:
1. Insulin resistance — the #1 driver. Elevated insulin = fat storage mode
2. Thyroid dysfunction — even subclinical hypothyroidism slows metabolism
3. Cortisol dysregulation — chronic stress drives visceral fat accumulation
4. Estrogen dominance — promotes fat storage in hips/thighs/abdomen
5. Gut microbiome — certain bacterial profiles extract more calories from food
6. Inflammation — adipose tissue is an inflammatory organ, creating a cycle
7. Toxin storage — fat cells sequester fat-soluble toxins as a protective mechanism
8. Sleep deprivation — one night of poor sleep increases ghrelin (hunger) 28%

Metabolic Optimization Protocol:

Insulin Sensitization (Priority #1):
• Berberine — 500mg 2-3x daily with meals (Tier 1). AMPK activation, comparable to metformin
• Chromium picolinate — 200-1000mcg (Tier 2). Insulin receptor sensitivity
• Alpha-lipoic acid — 600mg (Tier 2). Glucose uptake support
• Apple cider vinegar — 1 tbsp before meals. Slows gastric emptying, reduces glucose spikes

Thyroid & Metabolism:
• Selenium 200mcg + Zinc 30mg (Tier 1). T4→T3 conversion support
• Ashwagandha 600mg (Tier 2). Supports thyroid in subclinical hypothyroidism
• CoQ10 200mg (Tier 1). Mitochondrial energy production

Cortisol & Stress:
• Ashwagandha (Tier 1). 30% cortisol reduction
• Phosphatidylserine 400mg (Tier 2). Blunts cortisol response
• Magnesium 400mg (Tier 1). Stress mineral, depleted rapidly

Dietary Framework:
• Protein: 0.8-1g per pound of lean body mass (preserves muscle, highest TEF)
• Eat protein first at every meal — reduces total caloric intake naturally
• Time-restricted eating (16:8 or 14:10) — improves insulin sensitivity
• Eliminate liquid calories and seed oils
• 30g+ fiber daily — microbiome support and satiety
• Adequate hydration — thirst is often misinterpreted as hunger

Movement Strategy:
• Resistance training 3x/week — muscle is your metabolic engine
• 8,000+ steps daily — non-exercise activity thermogenesis (NEAT)
• Zone 2 cardio 150 min/week — fat oxidation training

Essential Testing:
• Fasting insulin (optimal <5 mIU/L)
• Complete thyroid panel
• 4-point cortisol
• DUTCH hormone test
• Fasting lipid + A1C

Would you like me to help identify which metabolic driver is most likely behind your weight resistance, or create a personalized metabolic reset protocol?`;
  },
};

function detectCategories(message: string): DetectedCategory[] {
  const lower = message.toLowerCase();
  const categories: DetectedCategory[] = [];

  const patterns: [string, RegExp[]][] = [
    ['supplements', [/supplement/i, /vitamin/i, /mineral/i, /herb/i, /dosage/i, /take for/i, /help with/i, /recommend/i, /natural.*(for|to)/i, /what.*take/i, /stack/i, /protocol/i, /nootropic/i, /adaptogen/i, /how much/i, /best form/i, /brand/i]],
    ['lab_interpretation', [/lab/i, /result/i, /blood.?work/i, /interpret/i, /panel/i, /marker/i, /level/i, /test result/i, /range/i, /optimal/i, /functional range/i, /what does my/i]],
    ['drug_alternatives', [/alternative/i, /replace/i, /instead of/i, /natural.*for/i, /get off/i, /transition/i, /switch from/i, /metformin/i, /statin/i, /ppi/i, /ssri/i, /nsaid/i, /drug/i, /medication/i, /prescription/i, /pharmaceutical/i, /wean/i, /taper/i]],
    ['condition', [/inflammation/i, /gut health/i, /thyroid/i, /hormone/i, /autoimmune/i, /blood sugar/i, /cardiovascular/i, /heart/i, /brain health/i, /cognitive/i, /brain fog/i, /joint/i, /arthritis/i, /skin/i, /acne/i, /eczema/i, /psoriasis/i, /weight/i, /lose weight/i, /metabolism/i, /hashimoto/i, /pcos/i, /ibs/i, /sibo/i, /leaky gut/i, /candida/i, /mold/i]],
    ['symptoms', [/symptom/i, /feel/i, /pain/i, /fatigue/i, /tired/i, /headache/i, /bloat/i, /digest/i, /anxiety/i, /sleep/i, /insomnia/i, /brain fog/i, /energy/i, /stress/i, /mood/i, /hair loss/i, /depression/i, /nausea/i, /dizziness/i, /cramp/i, /numbness/i]],
    ['diet', [/diet/i, /food/i, /eat/i, /nutrition/i, /meal/i, /fast/i, /keto/i, /paleo/i, /vegan/i, /gluten/i, /dairy/i, /sugar/i, /microbiome/i, /anti-inflammatory/i, /recipe/i, /aip/i, /elimination/i, /fodmap/i, /carnivore/i, /mediterranean/i]],
    ['lifestyle', [/exercise/i, /workout/i, /meditat/i, /breath/i, /cold/i, /sauna/i, /sun/i, /circadian/i, /routine/i, /habit/i, /bio.?hack/i, /grounding/i, /detox/i, /morning routine/i, /red light/i, /fasting/i]],
    ['practitioner', [/doctor/i, /practitioner/i, /naturopath/i, /referral/i, /consult/i, /appointment/i, /find.*provider/i, /holistic/i, /functional medicine/i, /find.*near/i]],
    ['protocol_build', [/build.*protocol/i, /create.*plan/i, /supplement schedule/i, /morning.*evening/i, /daily routine/i, /what should i take/i, /my protocol/i, /personalize/i]],
  ];

  for (const [category, regexes] of patterns) {
    let score = 0;
    for (const regex of regexes) {
      if (regex.test(lower)) score++;
    }
    if (score > 0) {
      categories.push({ category, confidence: Math.min(score / 3, 1) });
    }
  }

  categories.sort((a, b) => b.confidence - a.confidence);

  if (categories.length === 0) {
    categories.push({ category: 'general', confidence: 0.5 });
  }

  return categories;
}

function getPersonalizedOpener(ctx: GabrielContext): string {
  if (ctx.userName) {
    return `${ctx.userName}, `;
  }
  return '';
}

function getSoftenedDataLead(ctx: GabrielContext, topic?: string): string {
  const leads: string[] = [];

  if (ctx.labResults.length > 0 && topic) {
    const topicLower = (topic || '').toLowerCase();
    const relevant = ctx.labResults.some(m => {
      const mLower = m.name.toLowerCase();
      if (topicLower.includes('thyroid') && (mLower.includes('tsh') || mLower.includes('t3') || mLower.includes('t4'))) return true;
      if (topicLower.includes('inflam') && (mLower.includes('crp') || mLower.includes('esr'))) return true;
      if (topicLower.includes('energy') && (mLower.includes('ferritin') || mLower.includes('b12') || mLower.includes('iron'))) return true;
      if (topicLower.includes('sleep') && (mLower.includes('magnesium') || mLower.includes('cortisol'))) return true;
      return false;
    });
    if (relevant) {
      leads.push('Based on your labs, ');
    }
  }

  if (ctx.protocol && ctx.protocol.length > 0) {
    leads.push('From your protocol, ');
  }

  if (ctx.recentCheckIns && ctx.recentCheckIns.length >= 3) {
    leads.push('With your recent check-in data, ');
  }

  if (ctx.healthKitConnected && ctx.healthKitData && ctx.healthKitData.snapshot.sleepDuration !== null) {
    leads.push('With your sleep data, ');
  }

  if (leads.length === 0) return '';
  return leads[Math.floor(Math.random() * leads.length)];
}

function getGoalReference(ctx: GabrielContext): string {
  if (ctx.healthGoals.length === 0) return '';
  const goal = ctx.healthGoals[Math.floor(Math.random() * ctx.healthGoals.length)];
  return ` Given your focus on ${goal.toLowerCase()}, this is particularly relevant.`;
}

function getLabInsights(ctx: GabrielContext, topic?: string): string {
  if (topic && ctx.labResults.length > 0) {
    return buildLabContextInsights(ctx, topic);
  }
  const flagged = ctx.labResults.filter(m => m.status !== 'optimal');
  if (flagged.length === 0) return '';
  const marker = flagged[Math.floor(Math.random() * flagged.length)];
  return `\n\nLooking at your labs, your ${marker.name} at ${marker.value} ${marker.unit} is ${marker.status === 'attention' ? 'a priority area' : 'worth monitoring'}. This connects to what we're discussing.`;
}

function getMedicationContext(ctx: GabrielContext): string {
  if (ctx.medications.length === 0) return '';
  return `\n\n⚠️ Note: I see you're taking ${ctx.medications.join(', ')}. I've factored potential interactions into my recommendations. Always discuss supplement additions with your prescribing practitioner.`;
}

function detectSupplementTopic(message: string): string | undefined {
  const lower = message.toLowerCase();
  const topicPatterns: [RegExp, string][] = [
    [/inflammat|joint|arthritis/i, 'inflammation'],
    [/thyroid|hashimoto|tsh/i, 'thyroid'],
    [/gut|digest|bloat|ibs|sibo/i, 'gut'],
    [/sleep|insomnia/i, 'sleep'],
    [/anxiety|stress|calm/i, 'anxiety'],
    [/energy|fatigue|tired/i, 'energy'],
    [/hormone|estrogen|testosterone|cortisol/i, 'hormone'],
    [/blood sugar|diabetes|insulin|glucose/i, 'blood sugar'],
    [/autoimmune|lupus|rheumatoid/i, 'autoimmune'],
    [/detox|liver|cleanse/i, 'detox'],
    [/heart|cardio|cholesterol|blood pressure/i, 'inflammation'],
    [/brain|focus|cognitive|memory/i, 'energy'],
  ];
  for (const [regex, topic] of topicPatterns) {
    if (regex.test(lower)) return topic;
  }
  return undefined;
}

function buildSupplementResponse(message: string, ctx: GabrielContext): string {
  const lower = message.toLowerCase();
  const opener = getPersonalizedOpener(ctx);

  for (const [name, info] of Object.entries(SUPPLEMENT_DB)) {
    if (lower.includes(name) || (name === 'coq10' && /co.?q.?10/i.test(lower)) || (name === 'lions mane' && /lion.?s?\s*mane/i.test(lower))) {
      const tierLabel = info.tier === 1 ? 'Tier 1 (Strong RCT Evidence)' : info.tier === 2 ? 'Tier 2 (Moderate Evidence)' : 'Tier 3 (Traditional/Emerging)';
      let response = `${opener}here's a comprehensive breakdown of ${name.charAt(0).toUpperCase() + name.slice(1)}:\n\n`;
      response += `Evidence Level: ${tierLabel}\n\n`;
      response += `Mechanism of Action:\n${info.mechanism}\n\n`;
      response += `Optimal Dosage: ${info.dosage}\n\n`;
      response += `Timing: ${info.timing}\n\n`;
      response += `Best Forms/Brands: ${info.bestForm}\n\n`;
      response += `Key Benefits: ${info.benefit}\n\n`;
      response += `Contraindications & Interactions: ${info.contraindication}`;
      response += getMedicationContext(ctx);
      response += getGoalReference(ctx);
      response += '\n\nWould you like me to explain how this fits into a complete protocol, or compare it with similar supplements?';
      return response;
    }
  }

  const relevantSupplements: string[] = [];

  const symptomToSupplements: Record<string, string[]> = {
    'inflammation': ['omega-3', 'curcumin', 'boswellia', 'quercetin'],
    'sleep': ['magnesium', 'reishi', 'melatonin', 'l-theanine'],
    'insomnia': ['magnesium', 'melatonin', 'valerian', 'l-theanine'],
    'energy': ['b12', 'iron', 'ashwagandha', 'coq10'],
    'fatigue': ['b12', 'iron', 'ashwagandha', 'coq10'],
    'stress': ['ashwagandha', 'magnesium', 'l-theanine', 'reishi'],
    'anxiety': ['magnesium', 'l-theanine', 'ashwagandha'],
    'gut': ['probiotics', 'glutathione', 'zinc'],
    'immune': ['vitamin d', 'zinc', 'reishi', 'nac', 'quercetin'],
    'thyroid': ['selenium', 'zinc', 'ashwagandha', 'iron'],
    'hormone': ['ashwagandha', 'magnesium', 'vitamin d', 'zinc'],
    'blood sugar': ['berberine', 'chromium', 'alpha-lipoic acid'],
    'brain': ['omega-3', 'lions mane', 'l-theanine', 'b12'],
    'focus': ['lions mane', 'l-theanine', 'omega-3'],
    'clarity': ['omega-3', 'l-theanine', 'b12', 'lions mane'],
    'liver': ['nac', 'alpha-lipoic acid', 'glutathione'],
    'detox': ['nac', 'alpha-lipoic acid', 'glutathione'],
    'joint': ['omega-3', 'curcumin', 'boswellia'],
    'heart': ['omega-3', 'magnesium', 'coq10'],
    'longevity': ['omega-3', 'nac', 'vitamin d', 'reishi', 'coq10'],
    'hair': ['iron', 'zinc', 'b12', 'vitamin d'],
    'skin': ['zinc', 'omega-3', 'vitamin d', 'probiotics', 'quercetin'],
    'mood': ['omega-3', 'vitamin d', 'magnesium', 'b12'],
    'weight': ['berberine', 'chromium', 'alpha-lipoic acid'],
    'allergy': ['quercetin', 'nac', 'vitamin d', 'probiotics'],
    'histamine': ['quercetin', 'vitamin c', 'probiotics'],
  };

  for (const [symptom, supps] of Object.entries(symptomToSupplements)) {
    if (lower.includes(symptom)) {
      relevantSupplements.push(...supps);
    }
  }

  const unique = [...new Set(relevantSupplements)];
  if (unique.length === 0) {
    const goalMap: Record<string, string[]> = {
      'Optimize Energy': ['b12', 'iron', 'ashwagandha', 'coq10'],
      'Balance Hormones': ['ashwagandha', 'magnesium', 'vitamin d', 'zinc'],
      'Gut Health': ['probiotics', 'zinc', 'glutathione'],
      'Reduce Inflammation': ['omega-3', 'curcumin', 'boswellia', 'quercetin'],
      'Mental Clarity': ['omega-3', 'lions mane', 'l-theanine', 'b12'],
      'Sleep': ['magnesium', 'reishi', 'melatonin', 'l-theanine'],
      'Longevity': ['omega-3', 'nac', 'reishi', 'coq10'],
      'Drug-to-Natural Transition': ['berberine', 'curcumin', 'ashwagandha', 'nac'],
    };
    for (const goal of ctx.healthGoals) {
      if (goalMap[goal]) unique.push(...goalMap[goal]);
    }
  }

  const finalSupps = [...new Set(unique)].slice(0, 5);
  if (finalSupps.length === 0) {
    finalSupps.push('omega-3', 'magnesium', 'vitamin d');
  }

  let response = `${opener}here's what the evidence supports for your question:\n\n`;

  for (const suppName of finalSupps) {
    const supp = SUPPLEMENT_DB[suppName];
    if (supp) {
      const tierLabel = supp.tier === 1 ? 'Tier 1' : supp.tier === 2 ? 'Tier 2' : 'Tier 3';
      response += `• ${suppName.charAt(0).toUpperCase() + suppName.slice(1)} — ${supp.dosage}\n  ${tierLabel} evidence. ${supp.benefit}.\n  Best form: ${supp.bestForm.split('.')[0]}.\n  ⚠️ ${supp.contraindication}.\n\n`;
    }
  }

  const detectedTopic = detectSupplementTopic(message);
  response += getGoalReference(ctx);
  response += getLabInsights(ctx, detectedTopic);
  response += getMedicationContext(ctx);
  response += '\n\nWould you like me to add any of these to your protocol, explain mechanisms in more detail, or compare specific forms and brands?';

  return response;
}

function buildLabResponse(ctx: GabrielContext): string {
  const opener = getPersonalizedOpener(ctx);

  if (ctx.labResults.length === 0) {
    return `${opener}you can upload your labs in the Labs tab — just photograph your results and I'll interpret them through a naturopathic lens, comparing your values against functional optimal ranges (which are often much tighter than conventional reference ranges).\n\nKey panels I recommend requesting:\n• Complete metabolic panel + lipid panel\n• Complete thyroid panel (TSH, free T3, free T4, reverse T3, TPO/TG antibodies)\n• Iron studies with ferritin\n• Vitamin D 25-OH\n• B12 + methylmalonic acid\n• hs-CRP (inflammation)\n• Fasting insulin (not just glucose)\n• Homocysteine\n• Magnesium RBC (not serum)\n\nWould you like guidance on how to request these from your provider?`;
  }

  const flagged = ctx.labResults.filter(m => m.status !== 'optimal');
  const optimal = ctx.labResults.filter(m => m.status === 'optimal');

  let response = `${opener}here's my comprehensive interpretation of your current lab panel through a naturopathic/functional lens:\n\n`;

  response += 'Important Context: Naturopathic "optimal" ranges are tighter than conventional ranges. Conventional ranges represent the middle 95% of a sick population — they tell you when disease is present, not when you\'re truly thriving.\n\n';

  const freshness = assessDataFreshness(ctx);
  if (freshness.labsStale && freshness.labsAge) {
    response += `📅 Note: Your labs are about ${freshness.labsAge} old — the insights below are based on available data, but retesting would give us a clearer picture.\n\n`;
  }

  if (flagged.length > 0) {
    response += '⚠️ Areas Requiring Attention:\n\n';
    for (const marker of flagged.slice(0, 5)) {
      const statusIcon = marker.status === 'attention' ? '🔴' : '🟡';
      response += `${statusIcon} ${marker.name}: ${marker.value} ${marker.unit}\n`;
      response += `  Conventional range: ${marker.conventionalLow}-${marker.conventionalHigh} ${marker.unit}\n`;
      response += `  Gabriel's optimal range: ${marker.gabrielLow}-${marker.gabrielHigh} ${marker.unit}\n`;
      response += `  ${marker.interpretation}\n\n`;
    }
  }

  if (optimal.length > 0) {
    response += `✅ Within Optimal Range: ${optimal.map(m => `${m.name} (${m.value} ${m.unit})`).join(', ')}\n\n`;
  }

  if (flagged.length > 0) {
    response += 'Patterns I Notice:\n';
    const hasThyroid = flagged.some(m => m.name.toLowerCase().includes('tsh') || m.name.toLowerCase().includes('t3') || m.name.toLowerCase().includes('t4'));
    const hasIron = flagged.some(m => m.name.toLowerCase().includes('ferritin') || m.name.toLowerCase().includes('iron') || m.name.toLowerCase().includes('hemoglobin'));
    const hasInflam = flagged.some(m => m.name.toLowerCase().includes('crp') || m.name.toLowerCase().includes('esr'));

    if (hasThyroid && hasIron) {
      response += '• Your thyroid and iron markers together suggest impaired thyroid hormone conversion — ferritin must be above 50 for proper T4→T3 conversion.\n';
    }
    if (hasInflam) {
      response += '• Elevated inflammatory markers suggest systemic inflammation — this can drive fatigue, pain, and brain fog. An anti-inflammatory protocol would be high priority.\n';
    }
    if (hasIron) {
      response += '• Low iron stores are likely contributing to fatigue and may be impacting thyroid function, immune health, and exercise tolerance.\n';
    }
    response += '\n';
  }

  response += 'Would you like me to create a targeted supplement protocol based on these specific lab findings, or discuss which markers to retest and when?';

  return response;
}

function buildDrugAlternativeResponse(message: string, ctx: GabrielContext): string {
  const lower = message.toLowerCase();
  const opener = getPersonalizedOpener(ctx);

  for (const [drug, alternative] of Object.entries(DRUG_ALTERNATIVES)) {
    if (lower.includes(drug)) {
      let response = `${opener}here are evidence-based natural compounds that share mechanisms with ${drug}:\n\n${alternative}\n\n`;
      response += '⚠️ Important: Never discontinue prescribed medications without your practitioner\'s guidance. These natural compounds can complement your current plan, and your practitioner can help you transition safely if appropriate. The goal is informed partnership with your healthcare team, not going it alone.';
      response += getGoalReference(ctx);
      response += getMedicationContext(ctx);
      response += '\n\nWould you like me to check for interactions with your current medications, or help you prepare questions for your practitioner about a transition plan?';
      return response;
    }
  }

  if (ctx.medications.length > 0) {
    const med = ctx.medications[0];
    let response = `${opener}I see you're currently taking ${med}. Let me help you explore evidence-based natural alternatives.\n\n`;
    response += 'To give you the most accurate and safe alternatives, I need to understand:\n\n';
    response += '1. What condition is the medication treating?\n';
    response += '2. How long have you been taking it?\n';
    response += '3. What dosage are you currently on?\n';
    response += '4. Have you discussed transitioning with your prescribing practitioner?\n';
    response += '5. Are you experiencing any side effects?\n\n';
    response += 'This information helps me recommend the safest and most effective natural protocol. Drug-to-natural transitions should always be gradual, monitored, and ideally supervised by an integrative practitioner.';
    return response;
  }

  let response = `${opener}I'd love to help you explore natural alternatives. The Drug-to-Natural Transition approach is a systematic, evidence-based process:\n\n`;
  response += '1. Assessment — Understanding your current medications, why they were prescribed, and your complete health picture\n';
  response += '2. Research — Identifying natural compounds with comparable mechanisms and clinical evidence\n';
  response += '3. Foundation — Optimizing nutrition, gut health, and lifestyle factors that may reduce medication needs\n';
  response += '4. Bridging — Creating a gradual transition protocol with practitioner oversight, introducing naturals alongside pharmaceuticals\n';
  response += '5. Tapering — Slowly reducing pharmaceutical doses under medical supervision as natural alternatives take effect\n';
  response += '6. Monitoring — Tracking biomarkers every 4-6 weeks to ensure efficacy and safety\n\n';
  response += '⚠️ Some medications (benzodiazepines, SSRIs, corticosteroids, blood pressure meds) require especially careful, gradual tapering. Never stop these abruptly.\n\n';
  response += 'Which specific medication would you like to explore alternatives for?';
  return response;
}

function buildConditionResponse(message: string, ctx: GabrielContext): string {
  const lower = message.toLowerCase();

  const conditionMap: [RegExp, string][] = [
    [/inflammat/i, 'inflammation'],
    [/gut|ibs|sibo|leaky gut|digest|bloat|microbiome|candida/i, 'gut'],
    [/thyroid|hashimoto|tsh|hypothyroid|hyperthyroid/i, 'thyroid'],
    [/hormone|estrogen|progesterone|testosterone|pcos|menopause|hpa|adrenal|cortisol/i, 'hormone'],
    [/sleep|insomnia/i, 'sleep'],
    [/anxiety|anxious|panic|nervous|worry/i, 'anxiety'],
    [/energy|fatigue|tired|exhausted|burnout/i, 'energy'],
    [/detox|cleanse|liver|toxin|heavy metal|mold/i, 'detox'],
    [/autoimmune|lupus|multiple sclerosis|rheumatoid/i, 'autoimmune'],
    [/blood sugar|diabetes|insulin|glucose|a1c|metabolic/i, 'blood sugar'],
    [/cardiovascular|heart|cholesterol|blood pressure|ldl|hdl|triglyceride/i, 'cardiovascular'],
    [/brain|cognitive|memory|focus|brain fog|nootropic|alzheimer|dementia/i, 'brain'],
    [/joint|arthritis|knee|hip|shoulder|cartilage/i, 'joint'],
    [/skin|acne|eczema|psoriasis|rosacea|dermatitis|rash/i, 'skin'],
    [/weight|lose weight|obesity|fat loss|metabolism|overweight/i, 'weight'],
  ];

  for (const [regex, conditionKey] of conditionMap) {
    if (regex.test(lower) && CONDITION_RESPONSES[conditionKey]) {
      return CONDITION_RESPONSES[conditionKey](ctx);
    }
  }

  return buildSymptomResponse(message, ctx);
}

function buildSymptomResponse(message: string, ctx: GabrielContext): string {
  const lower = message.toLowerCase();
  const opener = getPersonalizedOpener(ctx);

  const symptomResponses: Record<string, string> = {
    'headache': `${opener}chronic headaches often have identifiable naturopathic root causes:\n\nCommon Triggers:\n• Magnesium deficiency — the #1 overlooked cause. 400mg glycinate daily reduces migraine frequency 40-50% in RCTs (Tier 1)\n• Dehydration — even 2% dehydration triggers headaches\n• Blood sugar instability — skipping meals or sugar crashes\n• Histamine excess — aged foods, wine, fermented foods in sensitive individuals\n• Cervical spine tension — forward head posture from screens\n• Food sensitivities — gluten, dairy, MSG, artificial sweeteners\n• Hormonal fluctuations — especially estrogen drops (menstrual migraines)\n\nImmediate Support:\n• Magnesium glycinate — 400-600mg daily (Tier 1)\n• Riboflavin (B2) — 400mg daily for migraine prevention (Tier 1)\n• CoQ10 — 300mg daily (Tier 2). Mitochondrial support for neurons\n• Feverfew — 250mg standardized extract (Tier 2)\n• Ginger — 250mg, acute anti-inflammatory comparable to sumatriptan in one RCT (Tier 2)`,
    'hair loss': `${opener}hair loss is almost always a signal of internal imbalance. The hair follicle is one of the most metabolically active tissues in the body, so deficiencies show up here early.\n\nMost Common Root Causes:\n• Ferritin below 50 ng/mL (even with "normal" iron) — #1 cause in women\n• Thyroid dysfunction — even subclinical hypothyroidism\n• Zinc deficiency\n• Vitamin D deficiency\n• Hormonal — elevated DHT, PCOS, postpartum, perimenopause\n• Stress (telogen effluvium) — typically 3 months after a stressful event\n\nNaturopathic Hair Support Protocol:\n• Iron bisglycinate — 25-45mg with vitamin C if ferritin <50 (Tier 1)\n• Zinc — 30mg picolinate (Tier 1)\n• Biotin — 5000mcg daily (Tier 2)\n• Vitamin D — optimize to 60-80 ng/mL (Tier 1)\n• Selenium — 200mcg for thyroid support (Tier 1)\n• Saw palmetto — 320mg for DHT-driven loss (Tier 2)\n• Collagen peptides — 10g daily (Tier 2)\n\nEssential Testing: Ferritin, full thyroid panel, zinc, vitamin D, DHEA-S, testosterone, DHT`,
    'depression': `${opener}depression has biological underpinnings that naturopathic medicine addresses directly:\n\nBeyond Serotonin — Root Causes:\n• Neuroinflammation — hs-CRP >1.0 correlates with treatment-resistant depression\n• Gut dysbiosis — 95% of serotonin is produced in the gut\n• Vitamin D deficiency — strong association with seasonal and chronic depression\n• Omega-3 deficiency — EPA specifically has antidepressant properties\n• B-vitamin depletion — methylation affects neurotransmitter synthesis\n• Thyroid dysfunction — depression is often the first sign\n• Hormonal imbalance — progesterone, testosterone, cortisol\n\nEvidence-Based Natural Support:\n• Omega-3 (EPA dominant) — 2g EPA daily (Tier 1). Multiple meta-analyses confirm efficacy for mild-moderate depression\n• Vitamin D — optimize to 60-80 ng/mL (Tier 1)\n• SAMe — 400-800mg daily (Tier 1). Well-studied for mood support\n• Saffron extract (Affron) — 30mg daily (Tier 2). Multiple RCTs showing antidepressant effects\n• Curcumin — 500mg phytosome (Tier 2). Reduces neuroinflammation, enhances BDNF\n• Magnesium — 400mg glycinate (Tier 1). Rapid mood improvement in deficient individuals\n• Exercise — 30 min moderate intensity 3-5x/week (Tier 1). As effective as SSRIs in meta-analyses\n\n⚠️ Important: If you're currently on antidepressant medication, never adjust dosing without psychiatric guidance. Natural compounds like St. John's Wort and 5-HTP must NOT be combined with SSRIs.`,
  };

  for (const [symptom, response] of Object.entries(symptomResponses)) {
    if (lower.includes(symptom)) {
      let finalResponse = response;
      const symptomTopic = symptom === 'headache' ? 'inflammation' : symptom === 'hair loss' ? 'thyroid' : symptom === 'depression' ? 'anxiety' : 'general';
      finalResponse += getGoalReference(ctx);
      finalResponse += getLabInsights(ctx, symptomTopic);
      finalResponse += getMedicationContext(ctx);
      finalResponse += '\n\nWould you like me to dive deeper into any of these areas, or help you identify the root cause through targeted testing?';
      return finalResponse;
    }
  }

  let response = `${opener}I'd like to understand your symptoms holistically. In naturopathic medicine, symptoms are signals — not problems to suppress, but messages to decode.\n\n`;
  response += 'The body communicates through symptoms, and our job is to listen and trace them back to their root cause. This often involves looking at:\n\n';
  response += '• Nutrient status — deficiencies in magnesium, B12, iron, vitamin D, and zinc underlie many common symptoms\n';
  response += '• Gut health — the gut-brain axis, gut-skin axis, and gut-immune axis connect digestive health to nearly every system\n';
  response += '• Hormonal balance — thyroid, adrenals, and sex hormones all interact\n';
  response += '• Inflammatory load — chronic low-grade inflammation drives most chronic symptoms\n';
  response += '• Toxic burden — environmental exposures accumulate over time\n\n';
  response += 'To give you the most targeted guidance, could you share:\n';
  response += '1. When did this begin, and has it changed over time?\n';
  response += '2. What makes it better or worse?\n';
  response += '3. Any other symptoms occurring alongside it?\n';
  response += '4. What does your current diet and lifestyle look like?\n\n';
  response += 'This helps me identify patterns and potential root causes rather than just addressing surface symptoms.';
  return response;
}

function buildDietResponse(message: string, ctx: GabrielContext): string {
  const opener = getPersonalizedOpener(ctx);
  const lower = message.toLowerCase();

  if (lower.includes('anti-inflammatory') || lower.includes('inflammation')) {
    return `${opener}an anti-inflammatory diet is foundational. Here's the framework I recommend:\n\nInclude Daily:\n• Wild-caught fatty fish (salmon, sardines) — 3-4x/week\n• Colorful vegetables (aim for 8+ servings) — polyphenols\n• Turmeric with black pepper — bioavailable curcumin\n• Extra virgin olive oil — oleocanthal is a natural COX inhibitor\n• Berries — anthocyanins reduce inflammatory markers\n• Green tea — EGCG is a potent anti-inflammatory\n• Bone broth — glycine and proline for gut lining repair\n\nMinimize or Eliminate:\n• Refined sugar and processed carbohydrates\n• Industrial seed oils (canola, soybean, corn, safflower)\n• Conventional dairy (try A2, goat, or eliminate 30 days)\n• Gluten (trial elimination for 30 days to assess sensitivity)\n• Alcohol (directly increases intestinal permeability)\n• Processed/ultra-processed foods\n\nMeal Timing:\n• Consider time-restricted eating (12-16 hour overnight fast)\n• Front-load calories — larger meals earlier in the day\n• Protein first at every meal — stabilizes blood sugar\n\nShall I help create a weekly anti-inflammatory meal framework, or focus on a specific dietary approach like AIP or Mediterranean?`;
  }

  if (lower.includes('gut') || lower.includes('microbiome') || lower.includes('fodmap')) {
    return `${opener}diet is the most powerful tool for reshaping your gut microbiome. Here's the framework:\n\nMicrobiome-Supporting Foods:\n• Prebiotic-rich: garlic, onions, leeks, asparagus, artichoke, green bananas, oats\n• Fermented: sauerkraut, kimchi, kefir, yogurt (if tolerated), kombucha, miso\n• Polyphenol-rich: berries, dark chocolate, green tea, extra virgin olive oil\n• Fiber diversity: aim for 30+ different plant foods per week (research shows this is the strongest predictor of microbiome diversity)\n\nIf experiencing bloating/SIBO symptoms:\n• Consider a Low-FODMAP approach for 2-4 weeks, then systematic reintroduction\n• Cooked vegetables may be better tolerated than raw initially\n• Bone broth fast (1-2 days) can calm acute GI inflammation\n\nFoods to Eliminate:\n• Artificial sweeteners — alter microbiome composition\n• Emulsifiers (carrageenan, polysorbate 80) — damage mucus layer\n• Glyphosate-sprayed grains — antimicrobial to gut bacteria\n\nWould you like a specific meal plan for gut restoration, or guidance on the FODMAP approach?`;
  }

  return `${opener}nutrition is the foundation of naturopathic medicine. The best dietary approach depends on your unique biochemistry, goals, and current health status.\n\nCore Principles I Recommend:\n• Whole, unprocessed foods as the base — if it has a barcode, approach with caution\n• Adequate protein (0.8-1g per pound of lean mass) — essential for detox, hormones, and repair\n• Healthy fats from diverse sources — olive oil, avocado, nuts, wild fish, grass-fed ghee\n• Fiber-rich vegetables for microbiome support — aim for 30g+ daily\n• 30+ different plant foods per week — diversity is key for microbiome health\n• Mindful eating practices — parasympathetic state required for proper digestion\n• Hydrate adequately — half your body weight in ounces of filtered water\n\n${ctx.healthGoals.length > 0 ? `Based on your focus on ${ctx.healthGoals[0].toLowerCase()}, I can create a more specific dietary framework tailored to that goal.` : 'Tell me about your health goals and current symptoms, and I can tailor specific dietary recommendations.'}\n\nWhat does your current diet look like, and are there any foods you suspect don't agree with you?`;
}

function buildLifestyleResponse(ctx: GabrielContext): string {
  const opener = getPersonalizedOpener(ctx);

  return `${opener}lifestyle interventions are powerful medicine — often more impactful than any supplement. Here are evidence-based practices I recommend:\n\nMorning Routine (first 90 minutes):\n• Sunlight exposure within 30 min of waking — sets circadian clock, triggers cortisol awakening response\n• Cold shower finish (30-90 seconds) — 200-300% norepinephrine boost, builds stress resilience via hormesis\n• Movement before food — enhances insulin sensitivity and fat oxidation\n• Protein-rich breakfast — stabilizes blood sugar for sustained energy\n\nStress Management:\n• Box breathing (4-4-4-4) — direct vagus nerve stimulation\n• Nature exposure 20+ min — reduces cortisol 12%, lowers heart rate and blood pressure\n• Meditation 10 min/day — 8 weeks shrinks amygdala, thickens prefrontal cortex\n• Gratitude journaling — shown to improve HRV (a marker of autonomic balance)\n\nEvening Wind-Down:\n• Blue light blocking glasses 2 hours before bed\n• Magnesium bath (2 cups Epsom salts) — transdermal magnesium absorption\n• Journaling or meditation — processes cortisol, clears mental load\n• Room at 65-68°F with total darkness\n\nMovement Protocol:\n• Zone 2 cardio: 150+ min/week (conversational pace) — mitochondrial biogenesis\n• Resistance training: 2-3x/week — strongest longevity predictor after VO2max\n• Daily walking: 8,000-10,000 steps — non-exercise activity thermogenesis (NEAT)\n• Flexibility/mobility: yoga or stretching 2x/week\n\nAdvanced Biohacks:\n• Infrared sauna: 20-40 min, 3-4x/week — heat shock proteins, detoxification via sweat\n• Red light therapy: 10 min daily — mitochondrial support, skin health, wound healing\n• Grounding/earthing: 20 min barefoot on natural ground — electron transfer reduces inflammation\n\nWhich area would you like to focus on first, or shall I build a complete daily routine for you?`;
}

function buildPractitionerResponse(ctx: GabrielContext): string {
  const opener = getPersonalizedOpener(ctx);

  return `${opener}connecting with the right practitioner can transform your health journey. I'd recommend checking out the Practitioners tab — I've curated a directory of verified naturopathic and functional medicine practitioners with Gabriel Scores to help you find the best match.\n\nTypes of Practitioners to Consider:\n• Naturopathic Doctor (ND) — comprehensive natural medicine, best for whole-body optimization. 4-year graduate medical training focused on root-cause medicine\n• Functional Medicine MD/DO — conventional training + root-cause approach. Good bridge between worlds\n• Integrative Medicine — bridges conventional and natural approaches\n• Clinical Nutritionist — specialized dietary therapy\n\nWhat to Look For:\n• They order comprehensive lab panels (not just basic CBC/CMP)\n• They use functional/optimal ranges, not just conventional\n• They spend 30-60 min per appointment (not 7 min)\n• They create individualized protocols\n• They treat root causes, not just symptoms\n\nQuestions to Ask at First Visit:\n• What's your approach to identifying root causes?\n• Do you order comprehensive lab panels including functional markers?\n• How do you feel about supplement protocols?\n• Are you comfortable working alongside my conventional doctor?\n\nHead to the Practitioners tab to browse verified practitioners near you, or would you like me to help you prepare specific questions based on your health profile?`;
}

function buildProtocolResponse(ctx: GabrielContext): string {
  const opener = getPersonalizedOpener(ctx);

  let response = `${opener}here's a personalized daily supplement protocol based on your profile:\n\n`;

  response += '☀️ MORNING (with breakfast):\n';
  response += '• Omega-3 (EPA/DHA) — 2g (Tier 1). Cardiovascular, cognitive, anti-inflammatory\n';
  response += '• Vitamin D3 + K2 — 5,000 IU / 100mcg (Tier 1). Immune, bone, mood\n';
  response += '• Ashwagandha KSM-66 — 600mg (Tier 1). Cortisol regulation, thyroid support\n';
  response += '• B-Complex (methylated) — 1 capsule (Tier 1). Energy, methylation, nerve function\n';
  response += '• Probiotics — 50B CFU (Tier 2). Take on empty stomach 30 min before breakfast\n\n';

  response += '🌤️ AFTERNOON (with lunch):\n';
  response += '• Berberine — 500mg (Tier 1). Blood sugar regulation, metabolic support\n';
  response += '• L-Theanine — 200mg (Tier 2). Calm focus for the afternoon\n';
  response += '• Curcumin phytosome — 500mg (Tier 1). Anti-inflammatory\n\n';

  response += '🌙 EVENING (with dinner or before bed):\n';
  response += '• Magnesium glycinate — 400mg (Tier 1). Sleep, GABA support, recovery\n';
  response += '• Omega-3 — 1g second dose (Tier 1). Split dosing for better absorption\n';
  response += '• Reishi mushroom — 1,000mg (Tier 2). Immune modulation + sleep onset\n';
  response += '• NAC — 600mg (Tier 1). Glutathione production, liver support\n\n';

  if (ctx.healthGoals.length > 0) {
    response += 'Personalized Additions Based on Your Goals:\n';
    for (const goal of ctx.healthGoals.slice(0, 3)) {
      const additions: Record<string, string> = {
        'Optimize Energy': '• CoQ10 200mg with breakfast + Iron bisglycinate 25mg (if ferritin <50)',
        'Balance Hormones': '• DIM 200mg with dinner + Zinc picolinate 30mg with dinner',
        'Gut Health': '• L-Glutamine 5g morning + Zinc carnosine 75mg before meals',
        'Reduce Inflammation': '• Boswellia AKBA 500mg morning + Quercetin 500mg afternoon',
        'Mental Clarity': '• Lion\'s Mane 1000mg morning + Phosphatidylserine 300mg',
        'Sleep': '• Melatonin 0.5-1mg 30min before bed + Glycine 3g before bed',
        'Longevity': '• CoQ10 200mg morning + Resveratrol 200mg morning',
        'Drug-to-Natural Transition': '• Discuss specific transitions with your practitioner using the alternatives I can provide',
      };
      if (additions[goal]) {
        response += `  ${goal}: ${additions[goal]}\n`;
      }
    }
    response += '\n';
  }

  response += 'Protocol Notes:\n';
  response += '• Start with 2-3 supplements, add one new one every 3-5 days to identify any reactions\n';
  response += '• Take fat-soluble vitamins (D, K2, omega-3, CoQ10, curcumin) with meals containing fat\n';
  response += '• Space iron 2 hours from coffee, tea, calcium, and thyroid meds\n';
  response += '• Reassess and adjust every 90 days based on symptoms and lab retesting\n';
  response += getMedicationContext(ctx);
  response += '\n\nYou can view and manage your protocol in the Protocol tab. Would you like me to adjust any part of this schedule, or explain the rationale for a specific supplement?';

  return response;
}

function buildMetaResponse(message: string, ctx: GabrielContext): string | null {
  const lower = message.toLowerCase();
  const opener = getPersonalizedOpener(ctx);

  const greetingPatterns = /^(hello|hi|hey|howdy|yo|sup|good morning|good evening|good afternoon|what'?s up|hiya)/i;
  if (greetingPatterns.test(lower.trim())) {
    const name = ctx.userName ? `, ${ctx.userName}` : '';
    return `Hey${name}! Great to have you here. I'm Gabriel — your naturopathic health intelligence. I can help you interpret lab results, build supplement protocols, explore natural alternatives to medications, and understand health conditions from a root-cause perspective.\n\nWhat would you like to explore today?`;
  }

  if (/thank(s| you)|appreciate it|thx/i.test(lower)) {
    const name = ctx.userName ? `, ${ctx.userName}` : '';
    return `You're welcome${name}! I'm always here when you need me. Let me know if there's anything else I can help with — whether it's diving deeper into what we discussed, interpreting labs, or exploring a new topic.`;
  }

  if (/what makes you different|why should i use you|what can you do|what are you|who are you|tell me about yourself/i.test(lower)) {
    return `${opener}I'm not just another health chatbot. I'm built on the largest curated naturopathic knowledge base — over 1,000 vetted resources covering conditions, supplements, drug alternatives, and lab interpretation. When you upload your labs, I read them through a naturopathic lens with tighter optimal ranges than conventional medicine uses. I cross-reference your medications with natural alternatives, flag interactions, and connect you with verified practitioners. Most health apps track data. I interpret it.\n\nWant to try me out? Ask about a condition, supplement, or upload your lab results.`;
  }

  if (/how are you different from (chatgpt|gpt|openai|claude|gemini|ai)|vs (other )?ai|compared to (chatgpt|gpt|other ai|regular ai)/i.test(lower)) {
    return `${opener}ChatGPT is a general AI. I'm specifically trained on naturopathic medicine, functional health, and integrative wellness. I know evidence tiers for supplements, optimal lab ranges that conventional doctors ignore, drug-to-natural transition protocols, and I'm connected to a network of 2,300+ verified practitioners. I'm not guessing — I'm referencing a curated knowledge base built by health professionals.\n\nTry asking me about a specific supplement, condition, or upload your labs to see the difference.`;
  }

  if (/what can you help (me )?(with|do)|what do you do|how can you help|what.*your capabilities|what.*you offer/i.test(lower)) {
    return `${opener}I can interpret your lab results through a naturopathic lens, build personalized supplement protocols, suggest natural alternatives to medications, explain health conditions from a root-cause perspective, and connect you with verified practitioners near you.\n\nHere's a quick taste of what I do:\n• Ask about any condition (thyroid, gut health, inflammation, anxiety, etc.)\n• Ask about any supplement (dosage, timing, best forms, interactions)\n• Upload labs and I'll flag what conventional medicine misses\n• Tell me your medications and I'll show evidence-based natural alternatives\n• Say "build my protocol" and I'll create a personalized supplement schedule\n\nTry asking me about a specific condition or supplement to get started!`;
  }

  if (/^(ok|okay|sure|cool|nice|great|awesome|got it|i see|interesting|wow|alright|right|hmm|hm|ah|oh)\s*[.!]?$/i.test(lower.trim())) {
    const name = ctx.userName ? `, ${ctx.userName}` : '';
    return `Glad to hear it${name}! Is there anything specific you'd like to explore? I can help with supplement recommendations, lab interpretation, natural medication alternatives, or deep-dive into any health condition.`;
  }

  if (/\b(yes|yeah|yep|yup|sure|please|go ahead|do it|let'?s do it|absolutely)\b/i.test(lower) && lower.length < 30) {
    return `${opener}I'd love to help! Could you be a bit more specific about what you'd like to explore? For example:\n\n• A specific health condition or symptom\n• A supplement you're curious about\n• Your lab results interpretation\n• Natural alternatives to a medication\n• A personalized supplement protocol\n\nWhat interests you most?`;
  }

  return null;
}

function buildGeneralResponse(ctx: GabrielContext): string {
  const opener = getPersonalizedOpener(ctx);

  let response = `${opener}that's a great question. While I'm still expanding my knowledge base, here's what I can help you with right now: interpreting lab results, building supplement protocols, exploring natural alternatives to medications, and understanding health conditions from a naturopathic perspective.\n\n`;

  if (ctx.healthGoals.length > 0) {
    response += `Based on your goals of ${ctx.healthGoals.slice(0, 3).join(', ').toLowerCase()}, I can provide targeted, evidence-based guidance with specific supplement recommendations, dosages, and evidence tiers.\n\n`;
  }

  if (ctx.labResults.length > 0) {
    const flagged = ctx.labResults.filter(m => m.status !== 'optimal');
    if (flagged.length > 0) {
      response += `I also notice ${flagged.length} marker${flagged.length > 1 ? 's' : ''} in your labs that could benefit from attention — this gives us concrete data to work with.\n\n`;
    }
  }

  response += 'Try asking me something like:\n';
  response += '• "What supplements help with inflammation?"\n';
  response += '• "Interpret my lab results"\n';
  response += '• "Natural alternatives to metformin"\n';
  response += '• "Build my supplement protocol"\n';
  response += '• "Tell me about magnesium"\n';
  response += '• "How to improve sleep naturally"\n\n';
  response += 'Want to try one of these?';
  return response;
}

export const PROTOCOL_CARD_MARKER = '%%PROTOCOL%%';
export const PROTOCOL_CARD_END_MARKER = '%%ENDPROTOCOL%%';

export const ACTION_CARD_MARKER = '%%ACTION%%';
export const ACTION_CARD_END_MARKER = '%%END_ACTION%%';

export function extractSupplementsFromText(text: string): string[] {
  const lower = text.toLowerCase();
  const found: string[] = [];
  for (const name of Object.keys(SUPPLEMENT_DB)) {
    if (lower.includes(name) || (name === 'coq10' && /co.?q.?10/i.test(lower)) || (name === 'lions mane' && /lion.?s?\s*mane/i.test(lower))) {
      found.push(name);
    }
  }
  return found;
}

function getSimpleTiming(timing: string): string {
  const lower = timing.toLowerCase();
  if (lower.includes('bed') || lower.includes('evening') || lower.includes('dinner') || lower.includes('night')) return 'evening';
  if (lower.includes('afternoon') || lower.includes('lunch')) return 'afternoon';
  return 'morning';
}

function buildProtocolCardResponse(supplementNames: string[], ctx: GabrielContext): string {
  const opener = getPersonalizedOpener(ctx);
  const supplements: ProtocolCardSupplement[] = [];

  for (const name of supplementNames) {
    const info = SUPPLEMENT_DB[name];
    if (info) {
      supplements.push({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        dosage: info.dosage,
        timing: getSimpleTiming(info.timing),
        tier: info.tier,
      });
    }
  }

  supplements.sort((a, b) => {
    const order = { morning: 0, afternoon: 1, evening: 2 };
    return (order[a.timing as keyof typeof order] ?? 0) - (order[b.timing as keyof typeof order] ?? 0);
  });

  const json = JSON.stringify(supplements);
  const footerNote = 'Start with 2-3 supplements, adding one new one every 3-5 days to identify any reactions. Reassess after 90 days.';

  let response = `${PROTOCOL_CARD_MARKER}${json}${PROTOCOL_CARD_END_MARKER}`;
  response += `${opener}here's a structured protocol based on what we discussed:\n\n`;
  response += footerNote;
  response += getMedicationContext(ctx);

  return response;
}

interface ActionCardData {
  type: 'supplement' | 'diagnostic' | 'treatment' | 'device' | 'booking';
  title: string;
  subtitle: string;
  price?: string;
  ctaText: string;
  ctaUrl: string;
  icon: string;
  isAffiliate?: boolean;
  location?: string;
  availability?: string;
}

function buildActionCardResponse(cards: ActionCardData[], introText: string): string {
  const json = JSON.stringify(cards);
  return `${introText}\n\n${ACTION_CARD_MARKER}${json}${ACTION_CARD_END_MARKER}`;
}

function detectActionCardTriggers(message: string, ctx: GabrielContext): string | null {
  const lower = message.toLowerCase();
  const opener = getPersonalizedOpener(ctx);

  // IV/Treatment triggers
  if (/iv therapy|iv drip|vitamin c iv|infrared sauna|float tank|cryotherapy|cryo|red light therapy|hyperbaric|near me|book a treatment|treatment center|wellness center/i.test(lower)) {
    const cards: ActionCardData[] = [
      {
        type: 'treatment',
        title: 'Next Health - Studio City',
        subtitle: 'IV therapy, Cryotherapy, Diagnostics',
        ctaText: 'View Details',
        ctaUrl: 'https://www.next-health.com',
        icon: '💧',
        location: '12100 Ventura Blvd, Studio City, CA',
      },
      {
        type: 'treatment',
        title: 'Restore Hyper Wellness - WeHo',
        subtitle: 'IV, Cryo, Red Light Therapy',
        ctaText: 'View Details',
        ctaUrl: 'https://www.restore.com',
        icon: '❄️',
        location: '8500 Melrose Ave, West Hollywood, CA',
      },
      {
        type: 'treatment',
        title: 'The Drip Bar - Santa Monica',
        subtitle: 'IV Therapy & Vitamin Infusions',
        ctaText: 'View Details',
        ctaUrl: 'https://www.thedripbar.com',
        icon: '💉',
        location: '2901 Ocean Park Blvd, Santa Monica, CA',
      },
    ];

    const intro = `${opener}here are some treatment centers near you. All offer evidence-based IV therapy and wellness treatments:`;
    return buildActionCardResponse(cards, intro);
  }

  // Blood test/diagnostic triggers
  if (/blood test|blood work|blood panel|siphox|prenuvo|dutch test|gi-map|oat test|full body mri|lab work|get tested|book a test|diagnostics|check my levels/i.test(lower)) {
    const cards: ActionCardData[] = [
      {
        type: 'diagnostic',
        title: 'SiPhox Health - At-Home Blood Panel',
        subtitle: '70+ biomarkers including vitamins, hormones, metabolic markers',
        price: '$149',
        ctaText: 'Book Test',
        ctaUrl: 'https://siphox.com',
        icon: '🩸',
      },
      {
        type: 'diagnostic',
        title: 'Prenuvo - Full Body MRI',
        subtitle: 'Early cancer & disease detection, no radiation',
        price: '$2,499',
        ctaText: 'Book Test',
        ctaUrl: 'https://www.prenuvo.com',
        icon: '🔬',
      },
      {
        type: 'diagnostic',
        title: 'DUTCH Test - Complete Hormones',
        subtitle: 'Comprehensive hormone panel with metabolites',
        price: '$399',
        ctaText: 'Book Test',
        ctaUrl: 'https://dutchtest.com',
        icon: '🧬',
      },
    ];

    const intro = `${opener}getting tested is one of the smartest moves you can make. Here are my top recommendations for comprehensive diagnostics:`;
    return buildActionCardResponse(cards, intro);
  }

  // Energy Intelligence triggers
  if (/energy|tired|fatigue|when should i work|peak time|afternoon slump|flow state|focus|when am i most productive|energy forecast|morning routine|second wind|energy level/i.test(lower)) {
    const cards: ActionCardData[] = [
      {
        type: 'device',
        title: 'View Energy Intelligence',
        subtitle: 'See your full energy forecast',
        ctaText: 'Open',
        ctaUrl: 'gabriel://energy-intelligence',
        icon: '⚡',
      },
    ];

    const intro = `${opener}based on your sleep data, your peak energy window today is 10:00-11:30 AM. Block your hardest work there. Your afternoon dip usually hits around 2 PM — perfect time for a walk or light tasks. Your HRV is solid at 48ms, suggesting good recovery.`;
    return buildActionCardResponse(cards, intro);
  }

  // Supplement purchase triggers
  if (/buy supplements|order supplements|where to buy|fullscript|standard process|order my protocol|purchase|buy magnesium|buy vitamin d|where can i get/i.test(lower)) {
    const cards: ActionCardData[] = [
      {
        type: 'supplement',
        title: 'Magnesium Glycinate - Pure Encapsulations',
        subtitle: 'Highly bioavailable, supports sleep & relaxation',
        price: '$32',
        ctaText: 'Order on Fullscript',
        ctaUrl: 'https://fullscript.com',
        icon: '💊',
        isAffiliate: true,
      },
      {
        type: 'supplement',
        title: 'Vitamin D3+K2 - Thorne',
        subtitle: '5000 IU with K2 for optimal absorption',
        price: '$28',
        ctaText: 'Order on Fullscript',
        ctaUrl: 'https://fullscript.com',
        icon: '☀️',
        isAffiliate: true,
      },
      {
        type: 'supplement',
        title: 'Omega-3 Fish Oil - Nordic Naturals',
        subtitle: '1280mg EPA/DHA, molecularly distilled',
        price: '$38',
        ctaText: 'Order on Fullscript',
        ctaUrl: 'https://fullscript.com',
        icon: '🐟',
        isAffiliate: true,
      },
      {
        type: 'supplement',
        title: 'NAC - Designs for Health',
        subtitle: 'N-Acetyl Cysteine 900mg, supports detox & glutathione',
        price: '$34',
        ctaText: 'Order on Fullscript',
        ctaUrl: 'https://fullscript.com',
        icon: '🛡️',
        isAffiliate: true,
      },
    ];

    const intro = `${opener}I recommend ordering through Fullscript — practitioner-grade supplements with third-party testing. Here are some high-quality options:`;
    return buildActionCardResponse(cards, intro);
  }

  // Device triggers
  if (/heartmath|bio-well|cgm|continuous glucose|inner balance|biofeedback device|health tracker|which device/i.test(lower)) {
    const cards: ActionCardData[] = [
      {
        type: 'device',
        title: 'HeartMath Inner Balance',
        subtitle: 'HRV biofeedback trainer for stress & coherence',
        price: '$199',
        ctaText: 'Learn More',
        ctaUrl: 'https://www.heartmath.com/inner-balance/',
        icon: '💓',
      },
      {
        type: 'device',
        title: 'Bio-Well GDV Camera',
        subtitle: 'Energy field measurement & chakra analysis',
        price: '$3,500',
        ctaText: 'Learn More',
        ctaUrl: 'https://www.bio-well.com',
        icon: '⚡',
      },
      {
        type: 'device',
        title: 'Levels CGM',
        subtitle: 'Continuous glucose monitoring with AI insights',
        price: '$199/mo',
        ctaText: 'Learn More',
        ctaUrl: 'https://www.levels.com',
        icon: '📊',
      },
    ];

    const intro = `${opener}these devices integrate beautifully with your Health Twin, giving you real-time biometric feedback:`;
    return buildActionCardResponse(cards, intro);
  }

  // Practitioner booking triggers
  if (/book appointment|book with|schedule appointment|see a doctor|find a practitioner|make an appointment|appointment with dr/i.test(lower)) {
    const cards: ActionCardData[] = [
      {
        type: 'booking',
        title: 'Dr. Sarah Chen, ND',
        subtitle: 'Naturopathic Doctor — Hormones & Gut Health',
        ctaText: 'Book Appointment',
        ctaUrl: 'https://calendly.com',
        icon: '🩺',
        location: 'Los Angeles, CA',
        availability: 'Next available: Thu 2PM',
      },
    ];

    const intro = ctx.linkedPractitioners && ctx.linkedPractitioners.length > 0
      ? `${opener}you're linked with ${ctx.linkedPractitioners[0].name}, ${ctx.linkedPractitioners[0].credentials}. Would you like to book with them?`
      : `${opener}I can help you find a practitioner. Here's a naturopathic doctor in your area:`;
    
    return buildActionCardResponse(cards, intro);
  }

  return null;
}

export const WELCOME_MESSAGE = "Welcome to Gabriel. I'm your naturopathic health intelligence, here to help you understand your body through the lens of evidence-based natural medicine. Whether you're looking to interpret lab results, explore natural alternatives to medications, build a supplement protocol, or simply understand your symptoms better — I'm here to guide you with calm confidence and rigorous evidence.\n\nWhat brings you here today?";

function detectFollowUpCondition(message: string): string | null {
  const lower = message.toLowerCase();
  const conditionMap: [RegExp, string][] = [
    [/inflammat/i, 'inflammation'],
    [/gut|ibs|sibo|leaky gut|digest|bloat|microbiome|candida/i, 'gut'],
    [/thyroid|hashimoto|tsh|hypothyroid|hyperthyroid/i, 'thyroid'],
    [/hormone|estrogen|progesterone|testosterone|pcos|menopause|hpa|adrenal|cortisol/i, 'hormone'],
    [/sleep|insomnia/i, 'sleep'],
    [/anxiety|anxious|panic|nervous|worry/i, 'anxiety'],
    [/energy|fatigue|tired|exhausted|burnout/i, 'energy'],
    [/detox|cleanse|liver|toxin|heavy metal|mold/i, 'detox'],
    [/autoimmune|lupus|multiple sclerosis|rheumatoid/i, 'autoimmune'],
  ];

  for (const [regex, conditionKey] of conditionMap) {
    if (regex.test(lower) && FOLLOW_UP_CONDITIONS.has(conditionKey)) {
      return conditionKey;
    }
  }
  return null;
}

function buildCheckInInsights(checkIns: CheckInData[]): string {
  if (!checkIns || checkIns.length === 0) return '';

  const sorted = [...checkIns].sort((a, b) => b.timestamp - a.timestamp);
  const latest = sorted[0];
  const recent3 = sorted.slice(0, 3);
  const recent7 = sorted.slice(0, 7);

  const insights: string[] = [];

  const avgMood = recent7.reduce((s, c) => s + c.mood, 0) / recent7.length;
  const avgEnergy = recent7.reduce((s, c) => s + c.energy, 0) / recent7.length;
  const avgSleep = recent7.reduce((s, c) => s + c.sleep, 0) / recent7.length;

  const lowEnergyStreak = recent3.filter(c => c.energy <= 2).length;
  const lowMoodStreak = recent3.filter(c => c.mood <= 2).length;
  const lowSleepStreak = recent3.filter(c => c.sleep <= 2).length;

  if (lowEnergyStreak >= 3) {
    insights.push(`I see your energy has been low the past ${lowEnergyStreak} days (averaging ${avgEnergy.toFixed(1)}/5). This pattern could indicate nutrient depletion, poor sleep recovery, or HPA axis dysregulation.`);
  } else if (avgEnergy <= 2.5 && recent7.length >= 3) {
    insights.push(`Your energy has been trending low recently (${avgEnergy.toFixed(1)}/5 average). Worth investigating root causes — ferritin, thyroid, and B12 are common culprits.`);
  }

  if (lowMoodStreak >= 3) {
    insights.push(`Your mood has been consistently low for ${lowMoodStreak}+ days. This is worth paying attention to — mood can reflect inflammation, gut-brain axis issues, or nutrient deficiencies (especially vitamin D, omega-3, and magnesium).`);
  }

  if (lowSleepStreak >= 3) {
    insights.push(`Your sleep quality has been poor for ${lowSleepStreak}+ consecutive days. Poor sleep compounds every other health issue — this should be a priority to address.`);
  }

  if (latest.energy >= 4 && latest.mood >= 4 && latest.sleep >= 4) {
    insights.push(`Today's check-in looks strong across the board — mood ${latest.mood}/5, energy ${latest.energy}/5, sleep ${latest.sleep}/5. Keep doing what you're doing.`);
  }

  if (latest.note) {
    insights.push(`You mentioned: "${latest.note}" — I'll factor this into my recommendations.`);
  }

  if (insights.length === 0) return '';

  return '\n\n🩺 Based on Your Check-Ins:\n' + insights.join('\n');
}

export interface AskGabrielContext {
  healthGoals: string[];
  conditions: string[];
  medications: string[];
  labResults: LabMarker[];
  userName?: string;
  chatHistory?: string[];
  conversationState?: ConversationState;
  recentCheckIns?: CheckInData[];
  wearableInsight?: string;
  protocolInsightSummary?: string;
  protocol?: ProtocolItem[];
  complianceLog?: ComplianceEntryForAI[];
  protocolStreak?: number;
  symptoms?: SymptomLogForAI[];
  healthKitData?: HealthKitData | null;
  healthKitConnected?: boolean;
  linkedPractitioners?: PractitionerLink[];
  protocolInsights?: ProtocolInsight[];
}

function buildProtocolContextSummary(ctx: GabrielContext): string {
  if (!ctx.protocol || ctx.protocol.length === 0) return '';

  const morning = ctx.protocol.filter(p => p.timeOfDay === 'morning');
  const afternoon = ctx.protocol.filter(p => p.timeOfDay === 'afternoon');
  const evening = ctx.protocol.filter(p => p.timeOfDay === 'evening');

  let summary = '\n\n💊 Your Current Protocol:\n';
  if (morning.length > 0) {
    summary += `  ☀️ Morning: ${morning.map(p => `${p.name} (${p.dosage})`).join(', ')}\n`;
  }
  if (afternoon.length > 0) {
    summary += `  🌤️ Afternoon: ${afternoon.map(p => `${p.name} (${p.dosage})`).join(', ')}\n`;
  }
  if (evening.length > 0) {
    summary += `  🌙 Evening: ${evening.map(p => `${p.name} (${p.dosage})`).join(', ')}\n`;
  }

  if (ctx.complianceLog && ctx.complianceLog.length > 0) {
    const last7Days = ctx.complianceLog.filter(e => {
      const entryDate = new Date(e.date);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 7);
      return entryDate >= cutoff;
    });
    const totalPossible = 7 * 3;
    const completed = last7Days.filter(e => e.items.length > 0).length;
    const complianceRate = totalPossible > 0 ? Math.round((completed / totalPossible) * 100) : 0;
    summary += `  📊 7-Day Compliance: ${complianceRate}%`;

    const skippedSupps = getSkippedSupplementsFromCompliance(ctx);
    if (skippedSupps.length > 0) {
      summary += `\n  ⚠️ Recently skipped: ${skippedSupps.map(s => `${s.name} (${s.skipped}/${s.total} days)`).join(', ')}`;
    }
  }

  if (ctx.protocolStreak !== undefined && ctx.protocolStreak > 0) {
    summary += `\n  🔥 Current streak: ${ctx.protocolStreak} days`;
  }

  return summary;
}

function getSkippedSupplementsFromCompliance(ctx: GabrielContext): { name: string; skipped: number; total: number }[] {
  if (!ctx.protocol || !ctx.complianceLog) return [];
  const results: { name: string; skipped: number; total: number }[] = [];
  const today = new Date();

  for (const item of ctx.protocol) {
    let taken = 0;
    const total = 7;
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const wasTaken = ctx.complianceLog.some(e => e.date === dateStr && e.items.includes(item.name));
      if (wasTaken) taken++;
    }
    const skipped = total - taken;
    if (skipped >= 3 && total >= 3) {
      results.push({ name: item.name, skipped, total });
    }
  }
  return results.sort((a, b) => b.skipped - a.skipped);
}

function buildCheckInTrendSummary(ctx: GabrielContext): string {
  if (!ctx.recentCheckIns || ctx.recentCheckIns.length < 2) return '';

  const sorted = [...ctx.recentCheckIns].sort((a, b) => b.timestamp - a.timestamp);
  const recent = sorted.slice(0, 7);
  const avgMood = recent.reduce((s, c) => s + c.mood, 0) / recent.length;
  const avgEnergy = recent.reduce((s, c) => s + c.energy, 0) / recent.length;
  const avgSleep = recent.reduce((s, c) => s + c.sleep, 0) / recent.length;

  let summary = `\n\n📈 Check-In Trends (Last ${recent.length} days):\n`;
  summary += `  Mood: ${avgMood.toFixed(1)}/5`;
  summary += ` | Energy: ${avgEnergy.toFixed(1)}/5`;
  summary += ` | Sleep: ${avgSleep.toFixed(1)}/5`;

  if (recent.length >= 4) {
    const firstHalf = recent.slice(Math.floor(recent.length / 2));
    const secondHalf = recent.slice(0, Math.floor(recent.length / 2));
    const firstEnergy = firstHalf.reduce((s, c) => s + c.energy, 0) / firstHalf.length;
    const secondEnergy = secondHalf.reduce((s, c) => s + c.energy, 0) / secondHalf.length;
    const energyChange = secondEnergy - firstEnergy;
    if (Math.abs(energyChange) >= 0.5) {
      summary += `\n  Energy trend: ${energyChange > 0 ? '↑ improving' : '↓ declining'}`;
    }
    const firstSleep = firstHalf.reduce((s, c) => s + c.sleep, 0) / firstHalf.length;
    const secondSleep = secondHalf.reduce((s, c) => s + c.sleep, 0) / secondHalf.length;
    const sleepChange = secondSleep - firstSleep;
    if (Math.abs(sleepChange) >= 0.5) {
      summary += `\n  Sleep trend: ${sleepChange > 0 ? '↑ improving' : '↓ declining'}`;
    }
  }

  return summary;
}

function buildSymptomLogSummary(ctx: GabrielContext): string {
  if (!ctx.symptoms || ctx.symptoms.length === 0) return '';

  const recent = ctx.symptoms.filter(s => s.timestamp >= Date.now() - 7 * 24 * 60 * 60 * 1000);
  if (recent.length === 0) return '';

  const grouped: Record<string, { count: number; severities: string[] }> = {};
  for (const s of recent) {
    if (!grouped[s.symptom]) grouped[s.symptom] = { count: 0, severities: [] };
    grouped[s.symptom].count++;
    grouped[s.symptom].severities.push(s.severity);
  }

  const entries = Object.entries(grouped).sort((a, b) => b[1].count - a[1].count);
  let summary = '\n\n📍 Recent Symptoms (Last 7 Days):\n';
  for (const [symptom, data] of entries.slice(0, 5)) {
    const worstSeverity = data.severities.includes('severe') ? 'severe' : data.severities.includes('moderate') ? 'moderate' : 'mild';
    summary += `  • ${symptom} — ${data.count}x (${worstSeverity})\n`;
  }

  return summary;
}

function buildWearableDataSummary(ctx: GabrielContext): string {
  if (!ctx.healthKitConnected || !ctx.healthKitData) return '';

  const { snapshot, sleepTrend, hrvTrend, hrTrend, stepsTrend } = ctx.healthKitData;
  let summary = '\n\n⌚ Wearable Biometrics:\n';

  if (snapshot.sleepDuration !== null) {
    summary += `  Sleep: ${snapshot.sleepDuration.toFixed(1)}h last night (${sleepTrend.avg7d.toFixed(1)}h avg/week, ${sleepTrend.trend === 'up' ? '↑' : sleepTrend.trend === 'down' ? '↓' : '→'} ${sleepTrend.trendPercent}%)\n`;
  }
  if (snapshot.hrv !== null) {
    summary += `  HRV: ${snapshot.hrv}ms (${hrvTrend.avg7d.toFixed(0)}ms avg, ${hrvTrend.trend === 'up' ? '↑' : hrvTrend.trend === 'down' ? '↓' : '→'} ${hrvTrend.trendPercent}%)\n`;
  }
  if (snapshot.restingHR !== null) {
    summary += `  Resting HR: ${snapshot.restingHR} bpm (${hrTrend.avg7d.toFixed(0)} avg)\n`;
  }
  if (snapshot.steps !== null) {
    summary += `  Steps: ${Math.round(snapshot.steps).toLocaleString()} today (${Math.round(stepsTrend.avg7d).toLocaleString()} avg)\n`;
  }

  return summary;
}

function buildPractitionerSummary(ctx: GabrielContext): string {
  if (!ctx.linkedPractitioners || ctx.linkedPractitioners.length === 0) return '';

  let summary = '\n\n👨‍⚕️ Your Practitioners:\n';
  for (const prac of ctx.linkedPractitioners.slice(0, 3)) {
    summary += `  • ${prac.name}, ${prac.credentials} — ${prac.city}, ${prac.state} (${prac.specialties.slice(0, 2).join(', ')})\n`;
  }
  return summary;
}

function buildInsightsSummary(ctx: GabrielContext): string {
  if (!ctx.protocolInsights || ctx.protocolInsights.length === 0) return '';

  let summary = '\n\n🧠 Active Protocol Insights:\n';
  for (const insight of ctx.protocolInsights.slice(0, 3)) {
    const icon = insight.type === 'positive' ? '✅' : insight.type === 'warning' ? '⚠️' : insight.type === 'suggestion' ? '💡' : '🏆';
    summary += `  ${icon} ${insight.title}\n`;
  }
  return summary;
}

const STALE_LABS_THRESHOLD_MS = 8 * 7 * 24 * 60 * 60 * 1000;
const STALE_CHECKINS_THRESHOLD_MS = 14 * 24 * 60 * 60 * 1000;

interface DataFreshness {
  labsStale: boolean;
  checkInsStale: boolean;
  labsAge: string | null;
  checkInsAge: string | null;
}

function assessDataFreshness(ctx: GabrielContext): DataFreshness {
  let labsStale = false;
  let labsAge: string | null = null;
  let checkInsStale = false;
  let checkInsAge: string | null = null;

  if (ctx.labResults.length > 0) {
    const latestLabDate = ctx.labResults.reduce((latest, m) => {
      const mAny = m as unknown as Record<string, unknown>;
      const d = mAny.date;
      if (typeof d === 'string' || typeof d === 'number') {
        const ts = new Date(d).getTime();
        return ts > latest ? ts : latest;
      }
      return latest;
    }, 0);
    if (latestLabDate > 0) {
      const ageMs = Date.now() - latestLabDate;
      labsStale = ageMs > STALE_LABS_THRESHOLD_MS;
      if (labsStale) {
        const weeks = Math.round(ageMs / (7 * 24 * 60 * 60 * 1000));
        labsAge = `${weeks} weeks`;
      }
    }
  }

  if (ctx.recentCheckIns && ctx.recentCheckIns.length > 0) {
    const sorted = [...ctx.recentCheckIns].sort((a, b) => b.timestamp - a.timestamp);
    const latestTs = sorted[0].timestamp;
    const ageMs = Date.now() - latestTs;
    checkInsStale = ageMs > STALE_CHECKINS_THRESHOLD_MS;
    if (checkInsStale) {
      const days = Math.round(ageMs / (24 * 60 * 60 * 1000));
      checkInsAge = `${days} days`;
    }
  }

  return { labsStale, checkInsStale, labsAge, checkInsAge };
}

function buildFreshnessNote(freshness: DataFreshness): string {
  const notes: string[] = [];
  if (freshness.labsStale && freshness.labsAge) {
    notes.push(`Your labs are about ${freshness.labsAge} old — would you like me to suggest updated testing?`);
  }
  if (freshness.checkInsStale && freshness.checkInsAge) {
    notes.push(`Your last check-in was ${freshness.checkInsAge} ago — a fresh check-in would help me give more accurate insights.`);
  }
  if (notes.length === 0) return '';
  return '\n\n📅 ' + notes.join(' ');
}

function buildWovenMultiStreamInsight(ctx: GabrielContext): string {
  const insights: string[] = [];

  const hasLabs = ctx.labResults.length > 0;
  const hasCheckIns = ctx.recentCheckIns && ctx.recentCheckIns.length >= 2;
  const hasWearable = ctx.healthKitConnected && ctx.healthKitData;
  const hasSymptoms = ctx.symptoms && ctx.symptoms.length > 0;
  const hasProtocol = ctx.protocol && ctx.protocol.length > 0;

  if (hasLabs && hasCheckIns) {
    const flaggedLabs = ctx.labResults.filter(m => m.status !== 'optimal');
    const sorted = [...ctx.recentCheckIns!].sort((a, b) => b.timestamp - a.timestamp);
    const recent3 = sorted.slice(0, 3);
    const avgEnergy = recent3.reduce((s, c) => s + c.energy, 0) / recent3.length;

    const lowVitD = flaggedLabs.find(m => m.name.toLowerCase().includes('vitamin d') && m.value < m.gabrielLow);
    const lowFerritin = flaggedLabs.find(m => m.name.toLowerCase().includes('ferritin') && m.value < 50);

    if (lowVitD && avgEnergy <= 3) {
      insights.push(`Your Vitamin D at ${lowVitD.value} ${lowVitD.unit} and recent energy averaging ${avgEnergy.toFixed(1)}/5 suggest supplementation could make a noticeable difference.`);
    } else if (lowFerritin && avgEnergy <= 2.5) {
      insights.push(`Your ferritin at ${lowFerritin.value} ${lowFerritin.unit} paired with low energy scores (${avgEnergy.toFixed(1)}/5) points to iron as a priority.`);
    }
  }

  if (hasWearable && hasCheckIns) {
    const sleepDur = ctx.healthKitData!.snapshot.sleepDuration;
    const sorted = [...ctx.recentCheckIns!].sort((a, b) => b.timestamp - a.timestamp);
    const avgSleep = sorted.slice(0, 3).reduce((s, c) => s + c.sleep, 0) / Math.min(sorted.length, 3);
    if (sleepDur !== null && sleepDur < 6.5 && avgSleep <= 2.5) {
      insights.push(`Your wearable shows ${sleepDur.toFixed(1)}h of sleep and your self-reported quality is ${avgSleep.toFixed(1)}/5 — sleep optimization should be a top priority.`);
    }
  }

  if (hasLabs && hasWearable) {
    const lowMag = ctx.labResults.find(m => m.name.toLowerCase().includes('magnesium') && m.value < m.gabrielLow);
    const sleepDur = ctx.healthKitData!.snapshot.sleepDuration;
    if (lowMag && sleepDur !== null && sleepDur < 7) {
      insights.push(`Your magnesium level (${lowMag.value} ${lowMag.unit}) and sleep duration (${sleepDur.toFixed(1)}h) both suggest magnesium supplementation could help.`);
    }
  }

  if (hasSymptoms && hasLabs) {
    const recentSymptoms = ctx.symptoms!.filter(s => s.timestamp >= Date.now() - 7 * 24 * 60 * 60 * 1000);
    const hasHeadaches = recentSymptoms.some(s => s.symptom.toLowerCase().includes('headache'));
    const lowMag = ctx.labResults.find(m => m.name.toLowerCase().includes('magnesium') && m.value < m.gabrielLow);
    if (hasHeadaches && lowMag) {
      insights.push(`Your recent headaches and low magnesium (${lowMag.value} ${lowMag.unit}) are likely connected — magnesium deficiency is a top trigger.`);
    }
  }

  if (hasProtocol && hasCheckIns) {
    const skipped = getSkippedSupplementsFromCompliance(ctx);
    const sorted = [...ctx.recentCheckIns!].sort((a, b) => b.timestamp - a.timestamp);
    const recent3 = sorted.slice(0, 3);
    const avgEnergy = recent3.reduce((s, c) => s + c.energy, 0) / recent3.length;
    const avgSleep = recent3.reduce((s, c) => s + c.sleep, 0) / recent3.length;

    const skipMag = skipped.find(s => s.name.toLowerCase().includes('magnesium'));
    if (skipMag && avgSleep <= 2.5) {
      insights.push(`Skipping ${skipMag.name} (${skipMag.skipped}/${skipMag.total} days) while sleep is at ${avgSleep.toFixed(1)}/5 — these are likely related.`);
    }

    const skipEnergy = skipped.find(s => {
      const lower = s.name.toLowerCase();
      return lower.includes('b12') || lower.includes('iron') || lower.includes('coq10');
    });
    if (skipEnergy && avgEnergy <= 2.5) {
      insights.push(`Your energy is ${avgEnergy.toFixed(1)}/5 and you've been missing ${skipEnergy.name} — consistency here could help.`);
    }
  }

  if (insights.length === 0) return '';
  return '\n\n🔗 Connecting Your Data:\n' + insights.slice(0, 2).map(i => `  • ${i}`).join('\n');
}

function buildFullUserContextPreamble(ctx: GabrielContext): string {
  let preamble = '';
  preamble += buildProtocolContextSummary(ctx);
  preamble += buildCheckInTrendSummary(ctx);
  preamble += buildSymptomLogSummary(ctx);
  preamble += buildWearableDataSummary(ctx);
  preamble += buildPractitionerSummary(ctx);
  preamble += buildInsightsSummary(ctx);

  const wovenInsight = buildWovenMultiStreamInsight(ctx);
  if (wovenInsight) {
    preamble += wovenInsight;
  }

  const freshness = assessDataFreshness(ctx);
  const freshnessNote = buildFreshnessNote(freshness);
  if (freshnessNote) {
    preamble += freshnessNote;
  }

  return preamble;
}

interface UserDataTrigger {
  patterns: RegExp[];
  handler: (ctx: GabrielContext) => string;
}

function getCorrelatedSkipInsight(ctx: GabrielContext): string {
  if (!ctx.protocol || !ctx.complianceLog || !ctx.recentCheckIns) return '';
  const skipped = getSkippedSupplementsFromCompliance(ctx);
  if (skipped.length === 0) return '';

  const sorted = [...ctx.recentCheckIns].sort((a, b) => b.timestamp - a.timestamp);
  const recent3 = sorted.slice(0, 3);
  if (recent3.length < 2) return '';

  const insights: string[] = [];

  const magSkip = skipped.find(s => s.name.toLowerCase().includes('magnesium'));
  const avgSleep = recent3.reduce((s, c) => s + c.sleep, 0) / recent3.length;
  if (magSkip && avgSleep <= 3) {
    insights.push(`I notice you haven't taken your ${magSkip.name} for ${magSkip.skipped} of the last ${magSkip.total} days, and your sleep scores have been declining. Magnesium is key for sleep architecture — this could be connected.`);
  }

  const energySupps = skipped.filter(s => {
    const lower = s.name.toLowerCase();
    return lower.includes('b12') || lower.includes('iron') || lower.includes('coq10') || lower.includes('ashwagandha');
  });
  const avgEnergy = recent3.reduce((s, c) => s + c.energy, 0) / recent3.length;
  if (energySupps.length > 0 && avgEnergy <= 2.5) {
    insights.push(`Your energy scores have been low (${avgEnergy.toFixed(1)}/5), and you've been skipping ${energySupps[0].name}. Consistency with this supplement is important for energy production.`);
  }

  return insights.length > 0 ? '\n\n🔗 Correlation I Noticed:\n' + insights[0] : '';
}

function buildMyProtocolResponse(ctx: GabrielContext): string {
  const opener = getPersonalizedOpener(ctx);
  const dataLead = getSoftenedDataLead(ctx, 'protocol');
  if (!ctx.protocol || ctx.protocol.length === 0) {
    return `${opener}you don't have a protocol set up yet. You can scan your supplements in the Protocol tab, or tell me about your health goals and I'll build one for you.`;
  }

  const morning = ctx.protocol.filter(p => p.timeOfDay === 'morning');
  const afternoon = ctx.protocol.filter(p => p.timeOfDay === 'afternoon');
  const evening = ctx.protocol.filter(p => p.timeOfDay === 'evening');

  let response = `${opener}${dataLead ? dataLead.toLowerCase() + 'h' : 'H'}ere's your current protocol:\n\n`;

  if (morning.length > 0) {
    response += '☀️ Morning:\n';
    for (const item of morning) {
      response += `  • ${item.name} — ${item.dosage}${item.brand ? ` (${item.brand})` : ''}\n`;
    }
    response += '\n';
  }
  if (afternoon.length > 0) {
    response += '🌤️ Afternoon:\n';
    for (const item of afternoon) {
      response += `  • ${item.name} — ${item.dosage}${item.brand ? ` (${item.brand})` : ''}\n`;
    }
    response += '\n';
  }
  if (evening.length > 0) {
    response += '🌙 Evening:\n';
    for (const item of evening) {
      response += `  • ${item.name} — ${item.dosage}${item.brand ? ` (${item.brand})` : ''}\n`;
    }
    response += '\n';
  }

  response += `Total: ${ctx.protocol.length} supplements\n`;

  if (ctx.complianceLog && ctx.complianceLog.length > 0) {
    const last7Days = ctx.complianceLog.filter(e => {
      const entryDate = new Date(e.date);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 7);
      return entryDate >= cutoff;
    });
    const completed = last7Days.filter(e => e.items.length > 0).length;
    const totalPossible = 7 * 3;
    const rate = Math.round((completed / totalPossible) * 100);
    response += `\n📊 Your 7-day compliance: ${rate}%\n`;

    const skipped = getSkippedSupplementsFromCompliance(ctx);
    if (skipped.length > 0) {
      response += '\n⚠️ You\'ve been skipping:\n';
      for (const s of skipped.slice(0, 3)) {
        response += `  • ${s.name} — missed ${s.skipped} of the last ${s.total} days\n`;
      }
    }
  }

  if (ctx.protocolStreak !== undefined && ctx.protocolStreak > 0) {
    response += `\n🔥 Current streak: ${ctx.protocolStreak} days — keep going!\n`;
  }

  const correlationInsight = getCorrelatedSkipInsight(ctx);
  if (correlationInsight) {
    response += correlationInsight;
  }

  response += '\nWould you like me to optimize your timing, check for interactions, or suggest additions based on your goals?';
  return response;
}

function buildMyLabsResponse(ctx: GabrielContext): string {
  const opener = getPersonalizedOpener(ctx);
  if (ctx.labResults.length === 0) {
    return `${opener}upload your labs in the Labs tab and I'll interpret them through a naturopathic lens with optimal functional ranges.`;
  }

  const flagged = ctx.labResults.filter(m => m.status !== 'optimal');
  const optimal = ctx.labResults.filter(m => m.status === 'optimal');

  const freshness = assessDataFreshness(ctx);
  let response = `${opener}here's a summary of your lab results:\n\n`;
  response += `📊 ${ctx.labResults.length} markers on file | ${optimal.length} optimal | ${flagged.length} need attention\n\n`;
  if (freshness.labsStale && freshness.labsAge) {
    response += `📅 These labs are about ${freshness.labsAge} old — retesting priority markers would sharpen these insights.\n\n`;
  }

  if (flagged.length > 0) {
    response += '⚠️ Priority Markers:\n';
    for (const marker of flagged.slice(0, 5)) {
      const icon = marker.status === 'attention' ? '🔴' : '🟡';
      response += `  ${icon} ${marker.name}: ${marker.value} ${marker.unit} (optimal: ${marker.gabrielLow}-${marker.gabrielHigh})\n`;
    }
    response += '\n';
  }

  if (optimal.length > 0) {
    response += `✅ Looking Good: ${optimal.map(m => `${m.name} (${m.value} ${m.unit})`).join(', ')}\n\n`;
  }

  const crossPatterns = buildCrossReferencePatterns(ctx, ctx.labResults.map(m => normalizeMarkerName(m.name)), 'general');
  if (crossPatterns) {
    response += crossPatterns + '\n';
  }

  response += '\nWould you like me to dive deeper into any specific marker, or recommend what to test next?';
  return response;
}

function buildMyWellnessResponse(ctx: GabrielContext): string {
  const opener = getPersonalizedOpener(ctx);
  let response = `${opener}here's how you're doing based on the data I have:\n`;

  const checkInSummary = buildCheckInTrendSummary(ctx);
  if (checkInSummary) {
    response += checkInSummary;
  } else {
    response += '\n📈 Start daily check-ins on the Profile tab to see trends here.';
  }

  const wearableSummary = buildWearableDataSummary(ctx);
  if (wearableSummary) {
    response += wearableSummary;
  }

  const correlationInsight = getCorrelatedSkipInsight(ctx);
  if (correlationInsight) {
    response += correlationInsight;
  }

  const insightSummary = buildInsightsSummary(ctx);
  if (insightSummary) {
    response += insightSummary;
  }

  const wovenInsight = buildWovenMultiStreamInsight(ctx);
  if (wovenInsight) {
    response += wovenInsight;
  }

  const freshness = assessDataFreshness(ctx);
  const freshnessNote = buildFreshnessNote(freshness);
  if (freshnessNote) {
    response += freshnessNote;
  }

  response += '\n\nWould you like specific recommendations to improve any of these areas?';
  return response;
}

function buildMyPractitionersResponse(ctx: GabrielContext): string {
  const opener = getPersonalizedOpener(ctx);
  if (!ctx.linkedPractitioners || ctx.linkedPractitioners.length === 0) {
    return `${opener}check out the Practitioners tab to find verified naturopathic and functional medicine providers near you.`;
  }

  let response = `${opener}here are your linked practitioners:\n\n`;
  for (const prac of ctx.linkedPractitioners) {
    response += `👨‍⚕️ ${prac.name}, ${prac.credentials}\n`;
    response += `  📍 ${prac.city}, ${prac.state}\n`;
    response += `  🏥 Specialties: ${prac.specialties.join(', ')}\n\n`;
  }

  response += 'Would you like me to prepare a health summary for your next appointment, or find additional specialists?';
  return response;
}

function buildMySymptomsResponse(ctx: GabrielContext): string {
  const opener = getPersonalizedOpener(ctx);
  if (!ctx.symptoms || ctx.symptoms.length === 0) {
    return `${opener}log symptoms from the Symptoms screen and I'll track patterns to help refine your protocol.`;
  }

  const recent = ctx.symptoms.filter(s => s.timestamp >= Date.now() - 14 * 24 * 60 * 60 * 1000);
  if (recent.length === 0) {
    return `${opener}no symptoms logged in the past 2 weeks — that's a great sign! Keep logging when anything comes up so I can track patterns over time.`;
  }

  const grouped: Record<string, { count: number; severities: string[]; dates: string[] }> = {};
  for (const s of recent) {
    if (!grouped[s.symptom]) grouped[s.symptom] = { count: 0, severities: [], dates: [] };
    grouped[s.symptom].count++;
    grouped[s.symptom].severities.push(s.severity);
    grouped[s.symptom].dates.push(s.date);
  }

  const entries = Object.entries(grouped).sort((a, b) => b[1].count - a[1].count);

  let response = `${opener}here's your symptom log from the past 2 weeks:\n\n`;
  response += `📍 ${recent.length} total entries across ${entries.length} unique symptoms\n\n`;

  for (const [symptom, data] of entries.slice(0, 6)) {
    const worstSev = data.severities.includes('severe') ? '🔴 severe' : data.severities.includes('moderate') ? '🟡 moderate' : '🟢 mild';
    response += `  • ${symptom} — ${data.count}x (worst: ${worstSev})\n`;
  }

  const detectedSymptomNames = entries.map(([name]) => name);
  const conditionMatches = matchSymptomsToConditions(detectedSymptomNames);
  if (conditionMatches.length > 0) {
    response += '\n🔍 Patterns I Notice:\n';
    for (const match of conditionMatches.slice(0, 2)) {
      response += `  → ${match.condition} (${Math.round(match.confidence * 100)}% pattern match)\n`;
    }
  }

  response += '\nWould you like me to analyze these symptoms in detail, or suggest labs to investigate root causes?';
  return response;
}

function buildDoctorReportResponse(ctx: GabrielContext): string {
  const opener = getPersonalizedOpener(ctx);
  let report = `${opener}here's a comprehensive health summary you can share with your practitioner:\n\n`;
  report += '━━━━━━━━━━━━━━━━━━━━━━━━\n';
  report += '📋 GABRIEL HEALTH SUMMARY\n';
  report += '━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

  if (ctx.userName) {
    report += `Patient: ${ctx.userName}\n`;
  }
  report += `Date: ${new Date().toLocaleDateString()}\n\n`;

  if (ctx.healthGoals.length > 0) {
    report += `🎯 Health Goals: ${ctx.healthGoals.join(', ')}\n`;
  }
  if (ctx.conditions.length > 0) {
    report += `🏥 Conditions: ${ctx.conditions.join(', ')}\n`;
  }
  if (ctx.medications.length > 0) {
    report += `💊 Medications: ${ctx.medications.join(', ')}\n`;
  }
  report += '\n';

  if (ctx.protocol && ctx.protocol.length > 0) {
    report += '📦 Current Supplement Protocol:\n';
    for (const item of ctx.protocol) {
      report += `  • ${item.name} — ${item.dosage} (${item.timeOfDay})${item.brand ? ` [${item.brand}]` : ''}\n`;
    }
    report += '\n';
  }

  if (ctx.labResults.length > 0) {
    report += '🔬 Lab Results (with Functional Optimal Ranges):\n';
    for (const marker of ctx.labResults) {
      const icon = marker.status === 'optimal' ? '✅' : marker.status === 'attention' ? '🔴' : '🟡';
      report += `  ${icon} ${marker.name}: ${marker.value} ${marker.unit} (conventional: ${marker.conventionalLow}-${marker.conventionalHigh} | optimal: ${marker.gabrielLow}-${marker.gabrielHigh})\n`;
    }
    report += '\n';
  }

  if (ctx.recentCheckIns && ctx.recentCheckIns.length > 0) {
    const sorted = [...ctx.recentCheckIns].sort((a, b) => b.timestamp - a.timestamp);
    const recent7 = sorted.slice(0, 7);
    const avgMood = recent7.reduce((s, c) => s + c.mood, 0) / recent7.length;
    const avgEnergy = recent7.reduce((s, c) => s + c.energy, 0) / recent7.length;
    const avgSleep = recent7.reduce((s, c) => s + c.sleep, 0) / recent7.length;
    report += `📈 7-Day Self-Reported Averages:\n`;
    report += `  Mood: ${avgMood.toFixed(1)}/5 | Energy: ${avgEnergy.toFixed(1)}/5 | Sleep Quality: ${avgSleep.toFixed(1)}/5\n\n`;
  }

  if (ctx.healthKitConnected && ctx.healthKitData) {
    const { snapshot, sleepTrend, hrvTrend, hrTrend, stepsTrend } = ctx.healthKitData;
    report += '⌚ Wearable Biometrics (7-Day Averages):\n';
    if (snapshot.sleepDuration !== null) report += `  Sleep: ${sleepTrend.avg7d.toFixed(1)} hrs\n`;
    if (snapshot.hrv !== null) report += `  HRV: ${hrvTrend.avg7d.toFixed(0)} ms\n`;
    if (snapshot.restingHR !== null) report += `  Resting HR: ${hrTrend.avg7d.toFixed(0)} bpm\n`;
    if (snapshot.steps !== null) report += `  Steps: ${Math.round(stepsTrend.avg7d).toLocaleString()}/day\n`;
    report += '\n';
  }

  if (ctx.symptoms && ctx.symptoms.length > 0) {
    const recentSymptoms = ctx.symptoms.filter(s => s.timestamp >= Date.now() - 14 * 24 * 60 * 60 * 1000);
    if (recentSymptoms.length > 0) {
      const grouped: Record<string, number> = {};
      for (const s of recentSymptoms) {
        grouped[s.symptom] = (grouped[s.symptom] || 0) + 1;
      }
      report += '📍 Symptoms (Last 14 Days):\n';
      for (const [sym, count] of Object.entries(grouped).sort((a, b) => b[1] - a[1]).slice(0, 6)) {
        report += `  • ${sym} — ${count}x\n`;
      }
      report += '\n';
    }
  }

  if (ctx.linkedPractitioners && ctx.linkedPractitioners.length > 0) {
    report += '👨‍⚕️ Care Team:\n';
    for (const prac of ctx.linkedPractitioners) {
      report += `  • ${prac.name}, ${prac.credentials} — ${prac.city}, ${prac.state}\n`;
    }
    report += '\n';
  }

  report += '━━━━━━━━━━━━━━━━━━━━━━━━\n';
  report += 'Generated by Gabriel Health Intelligence\n\n';
  report += 'You can share this summary using the share button, or copy it to bring to your next appointment.';

  return report;
}

const USER_DATA_TRIGGERS: UserDataTrigger[] = [
  {
    patterns: [
      /\bmy (protocol|supplements?|stack|what am i taking|what i.?m taking)\b/i,
      /\bwhat (am i|i.?m) taking\b/i,
      /\bshow me my (protocol|supplements)\b/i,
      /\bmy current (protocol|supplements|stack)\b/i,
    ],
    handler: buildMyProtocolResponse,
  },
  {
    patterns: [
      /\bmy (labs?|results?|bloodwork|blood work|panels?)\b/i,
      /\bshow me my (labs?|results)\b/i,
      /\bmy latest (labs?|results|bloodwork)\b/i,
    ],
    handler: buildMyLabsResponse,
  },
  {
    patterns: [
      /\b(my sleep|my energy|how am i doing|my wellness|my progress|my health|how.?s my health)\b/i,
      /\bhow have i been\b/i,
      /\bmy check.?ins?\b/i,
      /\bmy (mood|energy|sleep) (score|trend|data)\b/i,
    ],
    handler: buildMyWellnessResponse,
  },
  {
    patterns: [
      /\bmy (practitioner|doctor|provider|naturopath|specialist)s?\b/i,
      /\bwho.?s my (doctor|practitioner)\b/i,
      /\bmy care team\b/i,
    ],
    handler: buildMyPractitionersResponse,
  },
  {
    patterns: [
      /\bmy symptoms?\b/i,
      /\bwhat symptoms have i\b/i,
      /\bsymptoms? i.?ve (logged|reported|had)\b/i,
      /\bmy symptom (log|history)\b/i,
    ],
    handler: buildMySymptomsResponse,
  },
  {
    patterns: [
      /\b(prepare|generate|create|make|build).*(report|summary).*(doctor|practitioner|provider|visit|appointment)\b/i,
      /\bsummary for my (doctor|practitioner|provider|appointment|visit)\b/i,
      /\b(doctor|practitioner|provider).*(report|summary)\b/i,
      /\bhealth (report|summary)\b/i,
      /\bprepare a report\b/i,
    ],
    handler: buildDoctorReportResponse,
  },
];

function checkUserDataTriggers(message: string, ctx: GabrielContext): string | null {
  for (const trigger of USER_DATA_TRIGGERS) {
    for (const pattern of trigger.patterns) {
      if (pattern.test(message)) {
        console.log('[Gabriel AI] User data trigger matched:', pattern.source);
        return trigger.handler(ctx);
      }
    }
  }
  return null;
}

// Feature explanation responses for "Ask Gabriel" pill
function checkFeatureExplanation(message: string): string | null {
  const lower = message.toLowerCase();
  
  // Energy Intelligence
  if (/what is energy intelligence|explain energy intelligence|how does energy work|how does energy intelligence work/i.test(lower)) {
    return "Energy Intelligence tracks your daily energy patterns using sleep data, HRV, and heart rate. It predicts when you'll peak, when you'll dip, and when your second wind kicks in — so you can schedule your hardest work when your body is ready for it. Over time, I learn YOUR specific patterns and get more accurate.";
  }
  
  // Health Twin
  if (/what is (the )?health twin|explain health twin|what does my body score mean|what is my health twin/i.test(lower)) {
    return "Your Health Twin is a living digital map of your body. Each organ has a score based on your lab results, wearable data, symptoms, and lifestyle. The scores update as you connect more data sources. Think of it like a video game character sheet — but for your actual body.";
  }
  
  // Heart-Brain Coherence
  if (/what is coherence|explain coherence|heart brain coherence|what is heart.brain coherence/i.test(lower)) {
    return "Heart-Brain Coherence measures how synchronized your heart rhythm and brain waves are. When they're in sync, you're in a state of optimal function — better focus, lower stress, clearer thinking. You can measure it with devices like HeartMath, or I can estimate it from your HRV data.";
  }
  
  // Treatment Intelligence
  if (/what is treatment intelligence|explain treatment (tracking|intelligence|log)|how does treatment tracking work/i.test(lower)) {
    return "Treatment Intelligence tracks everything you do for your health — IVs, acupuncture, supplements, whatever — and measures the actual impact using your wearable data. Over time, I build your personal response profile so I can tell you exactly which treatments work best for YOUR body.";
  }
  
  // Character Stats
  if (/what are character stats|explain leveling|how does xp work|what is the leveling system/i.test(lower)) {
    return "Gabriel turns your health journey into an RPG. You earn XP for logging data, completing check-ins, following your protocol, and sharing your progress. Your character has 6 stats — Vitality, Clarity, Resilience, Digestion, Balance, and Structure — that level up as your actual health improves.";
  }
  
  // Connect Health / Data Sources
  if (/how do i connect data|what data sources|connect apple health|what can i connect/i.test(lower)) {
    return "You can connect Apple Health to sync your heart rate, HRV, sleep, steps, and more. In the future, you'll also be able to connect HeartMath, Bio-Well, CGMs, and upload lab results. The more data Gabriel has, the smarter your Health Twin becomes.";
  }
  
  return null;
}

const CONFIRMATION_PATTERNS = /^\s*(yes|yeah|yep|yup|sure|go ahead|do it|go for it|let'?s do it|absolutely|please|confirm|ok|okay|proceed|make it happen|approved)\s*[.!]?\s*$/i;

const REJECTION_PATTERNS = /^\s*(no|nah|nope|don'?t|cancel|nevermind|never mind|stop|wait|hold on|actually no|scratch that)\s*[.!]?\s*$/i;

const PROTOCOL_REMOVE_PATTERNS: RegExp[] = [
  /\b(remove|drop|stop taking|cut|delete|take out|get rid of|ditch|eliminate)\b.*\b(supplement|vitamin|magnesium|omega|ashwagandha|berberine|curcumin|probiotics|l-theanine|reishi|boswellia|chromium|alpha-lipoic|b12|iron|zinc|selenium|melatonin|valerian|nac|coq10|fish oil|turmeric|lion.?s? mane|rhodiola|d3|k2)/i,
  /\b(remove|drop|stop taking|cut|delete|take out|get rid of|ditch|eliminate)\b.*\b(morning|afternoon|evening)\b.*\b(supplement|routine|block|stack)s?\b/i,
  /\b(remove|drop|stop|cut|delete|ditch|eliminate)\b.*\b(all|every|everything)\b.*\b(morning|afternoon|evening)\b/i,
  /\b(remove|drop|stop|cut|delete|ditch|eliminate)\b.*\b(all|every)\b.*\bmy\b.*\b(supplement|protocol)s?\b/i,
];

const PROTOCOL_ADD_PATTERNS: RegExp[] = [
  /\b(add|start taking|start|begin|include|put)\b.*\b(supplement|vitamin|magnesium|omega|ashwagandha|berberine|curcumin|probiotics|l-theanine|reishi|boswellia|chromium|alpha-lipoic|b12|iron|zinc|selenium|melatonin|valerian|nac|coq10|fish oil|turmeric|lion.?s? mane|rhodiola)/i,
  /\b(add|start taking|start|begin|include|put)\b.*\b(to my|to the|in my|in the)\b.*\b(morning|afternoon|evening|protocol|routine)\b/i,
];

const PROTOCOL_MOVE_PATTERNS: RegExp[] = [
  /\b(move|switch|change|shift|transfer)\b.*\b(to|from)\b.*\b(morning|afternoon|evening)\b/i,
  /\b(move|switch|change|shift|transfer)\b.*\b(morning|afternoon|evening)\b.*\b(instead|to)\b/i,
];

const PROTOCOL_DOSAGE_PATTERNS: RegExp[] = [
  /\b(increase|decrease|raise|lower|double|halve|cut|bump|adjust|change)\b.*\b(dose|dosage|amount|mg|iu|mcg|gram)s?\b/i,
  /\b(increase|decrease|raise|lower|double|halve|cut|bump|adjust|change)\b.*\b(my|the)\b.*\b(vitamin|magnesium|omega|ashwagandha|berberine|curcumin|probiotics|l-theanine|reishi|b12|iron|zinc|selenium|melatonin|nac|coq10|fish oil|turmeric)/i,
];

const PROTOCOL_PAUSE_PATTERNS: RegExp[] = [
  /\b(pause|break|hold|suspend|skip|taking a break)\b.*\b(supplement|protocol|routine|everything|all)s?\b/i,
  /\b(taking a break|need a break|want a break)\b.*\b(from|supplement|protocol|everything)\b/i,
  /\b(pause|break|hold|suspend)\b.*\b(morning|afternoon|evening)\b.*\b(supplement|routine|block)s?\b/i,
];

const PROTOCOL_CLEAR_ALL_PATTERNS: RegExp[] = [
  /\b(remove|clear|delete|wipe|reset)\b.*\b(all|every|everything|entire)\b.*\b(protocol|supplement|stack|routine)s?\b/i,
  /\b(start fresh|start over|clean slate|from scratch)\b/i,
  /\b(reset|clear|wipe|delete)\b.*\b(my )?(protocol|supplement|stack|routine)s?\b/i,
  /\b(protocol|supplement|stack|routine)s?\b.*\b(reset|clear|wipe|delete)\b/i,
  /\bwipe\b.*\b(protocol|supplement|stack)s?\b.*\b(clean|clear)?\b/i,
  /\bstart(ing)?\b.*\b(from scratch|over|fresh|new)\b/i,
];

function matchSupplementInProtocol(query: string, protocol: ProtocolItem[]): ProtocolItem[] {
  const lower = query.toLowerCase();
  const matched: ProtocolItem[] = [];

  const nameAliases: Record<string, string[]> = {
    'vitamin d': ['vitamin d', 'd3', 'vitamin d3', 'd3 + k2', 'd3+k2'],
    'magnesium': ['magnesium', 'mag'],
    'omega': ['omega', 'omega-3', 'omega 3', 'fish oil', 'epa', 'dha', 'epa/dha'],
    'ashwagandha': ['ashwagandha', 'ksm-66', 'ksm66'],
    'berberine': ['berberine'],
    'curcumin': ['curcumin', 'turmeric'],
    'probiotics': ['probiotic', 'probiotics'],
    'l-theanine': ['l-theanine', 'theanine'],
    'reishi': ['reishi'],
    'b12': ['b12', 'b-12', 'methylcobalamin'],
    'iron': ['iron'],
    'zinc': ['zinc'],
    'selenium': ['selenium'],
    'melatonin': ['melatonin'],
    'nac': ['nac', 'n-acetyl'],
    'coq10': ['coq10', 'co-q10', 'ubiquinol', 'ubiquinone'],
    'boswellia': ['boswellia'],
    'chromium': ['chromium'],
    'lion\'s mane': ['lion\'s mane', 'lions mane', 'lion mane'],
    'rhodiola': ['rhodiola'],
  };

  for (const item of protocol) {
    const itemLower = item.name.toLowerCase();
    if (lower.includes(itemLower)) {
      matched.push(item);
      continue;
    }
    for (const [, aliases] of Object.entries(nameAliases)) {
      const queryMatch = aliases.some(a => lower.includes(a));
      const itemMatch = aliases.some(a => itemLower.includes(a));
      if (queryMatch && itemMatch && !matched.includes(item)) {
        matched.push(item);
      }
    }
  }

  return matched;
}

function detectTimeBlock(message: string): 'morning' | 'afternoon' | 'evening' | null {
  const lower = message.toLowerCase();
  if (/\bmorning\b/i.test(lower)) return 'morning';
  if (/\bafternoon\b|\blunch\b/i.test(lower)) return 'afternoon';
  if (/\bevening\b|\bnight\b|\bbedtime\b|\bbefore bed\b/i.test(lower)) return 'evening';
  return null;
}

function extractDosageFromMessage(message: string): string | null {
  const dosageMatch = message.match(/(\d+[,.]?\d*)\s*(mg|iu|mcg|g|gram|ml|capsule|tablet|drop)s?/i);
  if (dosageMatch) {
    return `${dosageMatch[1]}${dosageMatch[2].toLowerCase()}`;
  }
  if (/\bdouble\b/i.test(message)) return 'double';
  if (/\bhalve\b|\bhalf\b|\bcut.*half\b/i.test(message)) return 'half';
  return null;
}

function detectProtocolAction(message: string, ctx: GabrielContext): PendingProtocolAction | null {
  const protocol = ctx.protocol ?? [];
  if (protocol.length === 0 && !PROTOCOL_ADD_PATTERNS.some(p => p.test(message)) && !PROTOCOL_CLEAR_ALL_PATTERNS.some(p => p.test(message))) {
    return null;
  }

  const lower = message.toLowerCase();
  const opener = getPersonalizedOpener(ctx);

  if (PROTOCOL_CLEAR_ALL_PATTERNS.some(p => p.test(lower))) {
    if (protocol.length === 0) {
      return null; // Will fall through to general response — no protocol to clear
    }
    return {
      type: 'clear_all',
      targetIds: protocol.map(p => p.id),
      targetNames: protocol.map(p => p.name),
      warningMessage: protocol.length > 5 ? `That's ${protocol.length} supplements. Are you sure you want to start completely fresh?` : undefined,
    };
  }

  if (PROTOCOL_PAUSE_PATTERNS.some(p => p.test(lower))) {
    const timeBlock = detectTimeBlock(message);
    if (timeBlock) {
      const blockItems = protocol.filter(p => p.timeOfDay === timeBlock);
      if (blockItems.length > 0) {
        return {
          type: 'remove',
          targetIds: blockItems.map(p => p.id),
          targetNames: blockItems.map(p => p.name),
        };
      }
    }
    return {
      type: 'clear_all',
      targetIds: protocol.map(p => p.id),
      targetNames: protocol.map(p => p.name),
    };
  }

  if (PROTOCOL_REMOVE_PATTERNS.some(p => p.test(lower))) {
    const timeBlock = detectTimeBlock(message);
    const hasAllKeyword = /\b(all|every|everything)\b/i.test(lower);

    if (timeBlock && hasAllKeyword) {
      const blockItems = protocol.filter(p => p.timeOfDay === timeBlock);
      if (blockItems.length > 0) {
        return {
          type: 'remove',
          targetIds: blockItems.map(p => p.id),
          targetNames: blockItems.map(p => p.name),
        };
      }
    }

    const matched = matchSupplementInProtocol(message, protocol);
    if (matched.length > 0) {
      const labWarning = buildRemovalLabWarning(matched, ctx);
      return {
        type: 'remove',
        targetIds: matched.map(p => p.id),
        targetNames: matched.map(p => p.name),
        warningMessage: labWarning || undefined,
      };
    }
  }

  if (PROTOCOL_MOVE_PATTERNS.some(p => p.test(lower))) {
    const matched = matchSupplementInProtocol(message, protocol);
    const newTimeBlock = detectTargetTimeBlock(message);
    if (matched.length > 0 && newTimeBlock) {
      return {
        type: 'move',
        targetIds: matched.map(p => p.id),
        targetNames: matched.map(p => p.name),
        newTimeOfDay: newTimeBlock,
      };
    }
  }

  if (PROTOCOL_DOSAGE_PATTERNS.some(p => p.test(lower))) {
    const matched = matchSupplementInProtocol(message, protocol);
    const dosage = extractDosageFromMessage(message);
    if (matched.length > 0 && dosage) {
      let resolvedDosage = dosage;
      if (dosage === 'double') {
        const numMatch = matched[0].dosage.match(/(\d+[,.]?\d*)/);
        if (numMatch) {
          const doubled = parseFloat(numMatch[1].replace(',', '')) * 2;
          resolvedDosage = matched[0].dosage.replace(numMatch[1], doubled.toLocaleString());
        }
      } else if (dosage === 'half') {
        const numMatch = matched[0].dosage.match(/(\d+[,.]?\d*)/);
        if (numMatch) {
          const halved = parseFloat(numMatch[1].replace(',', '')) / 2;
          resolvedDosage = matched[0].dosage.replace(numMatch[1], halved.toLocaleString());
        }
      }
      return {
        type: 'adjust_dosage',
        targetIds: matched.map(p => p.id),
        targetNames: matched.map(p => p.name),
        newDosage: resolvedDosage,
      };
    }
  }

  if (PROTOCOL_ADD_PATTERNS.some(p => p.test(lower))) {
    const timeBlock = detectTimeBlock(message) ?? 'morning';
    const dosage = extractDosageFromMessage(message);
    const suppName = extractSupplementNameFromMessage(message);
    if (suppName) {
      const existing = matchSupplementInProtocol(suppName, protocol);
      if (existing.length > 0) {
        return null;
      }
      const dbInfo = findInSupplementDB(suppName);
      return {
        type: 'add',
        targetIds: [],
        targetNames: [suppName],
        newItems: [{
          name: suppName.charAt(0).toUpperCase() + suppName.slice(1),
          dosage: dosage ?? (dbInfo?.dosage ?? 'as directed'),
          timeOfDay: timeBlock,
          reason: dbInfo?.benefit ?? 'Added via Gabriel chat',
        }],
      };
    }
  }

  return null;
}

function detectTargetTimeBlock(message: string): 'morning' | 'afternoon' | 'evening' | null {
  const lower = message.toLowerCase();
  const toMatch = lower.match(/\bto\s+(morning|afternoon|evening|night|bedtime|lunch)\b/i);
  if (toMatch) {
    const block = toMatch[1].toLowerCase();
    if (block === 'morning') return 'morning';
    if (block === 'afternoon' || block === 'lunch') return 'afternoon';
    if (block === 'evening' || block === 'night' || block === 'bedtime') return 'evening';
  }
  const insteadMatch = lower.match(/\b(morning|afternoon|evening|night|bedtime)\s+instead\b/i);
  if (insteadMatch) {
    const block = insteadMatch[1].toLowerCase();
    if (block === 'morning') return 'morning';
    if (block === 'afternoon' || block === 'lunch') return 'afternoon';
    if (block === 'evening' || block === 'night' || block === 'bedtime') return 'evening';
  }
  return null;
}

function extractSupplementNameFromMessage(message: string): string | null {
  const lower = message.toLowerCase();
  const knownSupps = [
    'omega-3', 'omega 3', 'fish oil', 'curcumin', 'turmeric', 'berberine', 'magnesium',
    'ashwagandha', 'vitamin d', 'd3', 'probiotics', 'l-theanine', 'theanine', 'reishi',
    'boswellia', 'chromium', 'alpha-lipoic acid', 'b12', 'iron', 'zinc', 'selenium',
    'melatonin', 'valerian', 'nac', 'coq10', 'co-q10', 'lion\'s mane', 'lions mane',
    'rhodiola', 'quercetin', 'glutathione', 'vitamin c',
  ];
  for (const supp of knownSupps) {
    if (lower.includes(supp)) return supp;
  }
  return null;
}

function findInSupplementDB(name: string): { dosage: string; benefit: string } | null {
  const lower = name.toLowerCase();
  for (const [key, info] of Object.entries(SUPPLEMENT_DB)) {
    if (lower.includes(key) || key.includes(lower)) {
      return { dosage: info.dosage, benefit: info.benefit };
    }
  }
  return null;
}

function buildRemovalLabWarning(items: ProtocolItem[], ctx: GabrielContext): string | null {
  const warnings: string[] = [];
  for (const item of items) {
    const itemLower = item.name.toLowerCase();
    if (itemLower.includes('vitamin d') || itemLower.includes('d3')) {
      const vitD = ctx.labResults.find(m => m.name.toLowerCase().includes('vitamin d'));
      if (vitD && vitD.value < vitD.gabrielLow) {
        warnings.push(`Your Vitamin D was at ${vitD.value} ${vitD.unit} — below the optimal range of ${vitD.gabrielLow}-${vitD.gabrielHigh}. Stopping supplementation may cause it to drop further.`);
      }
    }
    if (itemLower.includes('iron') || itemLower.includes('ferritin')) {
      const ferritin = ctx.labResults.find(m => m.name.toLowerCase().includes('ferritin'));
      if (ferritin && ferritin.value < 50) {
        warnings.push(`Your ferritin is at ${ferritin.value} ${ferritin.unit} — below the functional threshold of 50. Removing iron supplementation could worsen fatigue and thyroid function.`);
      }
    }
    if (itemLower.includes('magnesium')) {
      const mag = ctx.labResults.find(m => m.name.toLowerCase().includes('magnesium'));
      if (mag && mag.value < mag.gabrielLow) {
        warnings.push(`Your Magnesium RBC is ${mag.value} ${mag.unit} — below optimal. Stopping magnesium may impact your sleep and recovery.`);
      }
    }
    if (itemLower.includes('omega') || itemLower.includes('fish oil') || itemLower.includes('epa')) {
      const crp = ctx.labResults.find(m => m.name.toLowerCase().includes('crp'));
      if (crp && crp.value > crp.gabrielHigh) {
        warnings.push(`Your hs-CRP is ${crp.value} ${crp.unit} — above optimal. Omega-3 is one of your key anti-inflammatory tools.`);
      }
    }
  }
  return warnings.length > 0 ? warnings[0] : null;
}

function buildProtocolActionConfirmation(action: PendingProtocolAction, ctx: GabrielContext): string {
  const opener = getPersonalizedOpener(ctx);
  const protocol = ctx.protocol ?? [];

  switch (action.type) {
    case 'clear_all': {
      let msg = `${opener}I'll clear your entire protocol — that's ${action.targetNames.length} supplement${action.targetNames.length !== 1 ? 's' : ''}: ${action.targetNames.join(', ')}.`;
      if (action.warningMessage) {
        msg += `\n\n⚠️ ${action.warningMessage}`;
      }
      msg += '\n\nWant me to go ahead?';
      return msg;
    }
    case 'remove': {
      let msg: string;
      if (action.targetNames.length === 1) {
        msg = `${opener}got it, I'll remove ${action.targetNames[0]} from your protocol.`;
      } else {
        msg = `${opener}got it, I'll remove ${action.targetNames.length} supplements: ${action.targetNames.join(', ')}.`;
      }
      if (action.warningMessage) {
        msg += `\n\n⚠️ Heads up — ${action.warningMessage}`;
      }
      msg += '\n\nWant me to go ahead?';
      return msg;
    }
    case 'add': {
      const item = action.newItems?.[0];
      if (item) {
        let msg = `${opener}I'll add ${item.name} (${item.dosage}) to your ${item.timeOfDay} routine.`;
        msg += '\n\nShall I go ahead?';
        return msg;
      }
      return `${opener}I'll add that to your protocol. Want me to go ahead?`;
    }
    case 'move': {
      const currentTimeBlocks = action.targetIds.map(id => {
        const item = protocol.find(p => p.id === id);
        return item?.timeOfDay ?? 'unknown';
      });
      const fromBlock = currentTimeBlocks[0] ?? 'current';
      let msg = `${opener}I'll move ${action.targetNames.join(', ')} from ${fromBlock} to ${action.newTimeOfDay}.`;
      msg += '\n\nWant me to go ahead?';
      return msg;
    }
    case 'adjust_dosage': {
      const currentDosages = action.targetIds.map(id => {
        const item = protocol.find(p => p.id === id);
        return item?.dosage ?? 'unknown';
      });
      let msg = `${opener}I'll change ${action.targetNames[0]} from ${currentDosages[0]} to ${action.newDosage}.`;
      msg += '\n\nWant me to go ahead?';
      return msg;
    }
    case 'pause': {
      let msg = `${opener}I'll pause ${action.targetNames.length > 3 ? `all ${action.targetNames.length} supplements` : action.targetNames.join(', ')} by removing them from your active protocol.`;
      msg += ' You can always add them back later.';
      msg += '\n\nWant me to go ahead?';
      return msg;
    }
    default:
      return `${opener}I'll make that change. Want me to go ahead?`;
  }
}

function buildProtocolActionExecution(action: PendingProtocolAction, ctx: GabrielContext): { response: string; actions: ExecutableProtocolAction[] } {
  const opener = getPersonalizedOpener(ctx);
  const protocol = ctx.protocol ?? [];
  const actions: ExecutableProtocolAction[] = [];

  switch (action.type) {
    case 'clear_all': {
      actions.push({ type: 'clear_all', clearAll: true });
      return {
        response: `${opener}done! Your protocol has been cleared. You're starting with a clean slate. When you're ready to rebuild, just tell me your goals and I'll create a new personalized protocol for you.`,
        actions,
      };
    }
    case 'remove': {
      actions.push({ type: 'remove', removeIds: action.targetIds });
      const remaining = protocol.filter(p => !action.targetIds.includes(p.id));
      const morningCount = remaining.filter(p => p.timeOfDay === 'morning').length;
      const afternoonCount = remaining.filter(p => p.timeOfDay === 'afternoon').length;
      const eveningCount = remaining.filter(p => p.timeOfDay === 'evening').length;
      let msg = `${opener}done! `;
      if (action.targetNames.length === 1) {
        msg += `${action.targetNames[0]} has been removed from your protocol.`;
      } else {
        msg += `Removed ${action.targetNames.length} supplements: ${action.targetNames.join(', ')}.`;
      }
      if (remaining.length > 0) {
        const parts: string[] = [];
        if (morningCount > 0) parts.push(`${morningCount} morning`);
        if (afternoonCount > 0) parts.push(`${afternoonCount} afternoon`);
        if (eveningCount > 0) parts.push(`${eveningCount} evening`);
        msg += ` You still have ${remaining.length} supplement${remaining.length !== 1 ? 's' : ''} (${parts.join(', ')}).`;
      } else {
        msg += ' Your protocol is now empty.';
      }
      return { response: msg, actions };
    }
    case 'add': {
      if (action.newItems && action.newItems.length > 0) {
        const newProtocolItems: ProtocolItem[] = action.newItems.map(item => ({
          id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name: item.name,
          dosage: item.dosage,
          timeOfDay: item.timeOfDay,
          evidenceTier: 2 as const,
          reason: item.reason,
          research: '',
          contraindications: '',
        }));
        actions.push({ type: 'add', addItems: newProtocolItems });
        const item = action.newItems[0];
        return {
          response: `${opener}done! ${item.name} (${item.dosage}) has been added to your ${item.timeOfDay} routine. Check the Protocol tab to see it in your schedule.`,
          actions,
        };
      }
      return { response: `${opener}something went wrong adding that. Try again?`, actions: [] };
    }
    case 'move': {
      for (const id of action.targetIds) {
        if (action.newTimeOfDay) {
          actions.push({ type: 'move', updateId: id, updateFields: { timeOfDay: action.newTimeOfDay } });
        }
      }
      return {
        response: `${opener}done! ${action.targetNames.join(', ')} ${action.targetNames.length === 1 ? 'has' : 'have'} been moved to your ${action.newTimeOfDay} routine.`,
        actions,
      };
    }
    case 'adjust_dosage': {
      for (const id of action.targetIds) {
        if (action.newDosage) {
          actions.push({ type: 'adjust_dosage', updateId: id, updateFields: { dosage: action.newDosage } });
        }
      }
      return {
        response: `${opener}done! ${action.targetNames[0]} dosage has been updated to ${action.newDosage}. I'll track your compliance with the new dose.`,
        actions,
      };
    }
    default:
      return { response: `${opener}that change has been applied.`, actions: [] };
  }
}

export function askGabriel(
  message: string,
  context: AskGabrielContext
): Promise<{ response: string; conversationState: ConversationState; protocolActions?: ExecutableProtocolAction[] }> {
  return new Promise((resolve) => {
    const ctx: GabrielContext = {
      healthGoals: context.healthGoals,
      conditions: context.conditions,
      medications: context.medications,
      labResults: context.labResults,
      userName: context.userName ?? '',
      recentCheckIns: context.recentCheckIns,
      wearableInsight: context.wearableInsight,
      protocolInsightSummary: context.protocolInsightSummary,
      protocol: context.protocol,
      complianceLog: context.complianceLog,
      protocolStreak: context.protocolStreak,
      symptoms: context.symptoms,
      healthKitData: context.healthKitData,
      healthKitConnected: context.healthKitConnected,
      linkedPractitioners: context.linkedPractitioners,
      protocolInsights: context.protocolInsights,
    };

    const convState = context.conversationState ?? createInitialConversationState();
    const opener = getPersonalizedOpener(ctx);

    console.log('[Gabriel AI] Conversation state:', convState);
    console.log('[Gabriel AI] Full context — protocol:', ctx.protocol?.length ?? 0, 'supplements, compliance:', ctx.complianceLog?.length ?? 0, 'entries, symptoms:', ctx.symptoms?.length ?? 0, 'logs, healthkit:', ctx.healthKitConnected ? 'connected' : 'not connected');

    const dataFreshness = assessDataFreshness(ctx);
    console.log('[Gabriel AI] Data freshness — labs stale:', dataFreshness.labsStale, 'checkins stale:', dataFreshness.checkInsStale);

    const userDataResponse = checkUserDataTriggers(message, ctx);
    if (userDataResponse) {
      resolve({
        response: userDataResponse,
        conversationState: createInitialConversationState(),
      });
      return;
    }

    // Check for feature explanation requests (from Ask Gabriel pill)
    const featureExplanation = checkFeatureExplanation(message);
    if (featureExplanation) {
      console.log('[Gabriel AI] Feature explanation matched');
      resolve({
        response: `${opener}${featureExplanation}`,
        conversationState: createInitialConversationState(),
      });
      return;
    }

    if (convState.pendingProtocolAction) {
      console.log('[Gabriel AI] Pending protocol action detected, checking for confirmation/rejection');
      const isConfirm = CONFIRMATION_PATTERNS.test(message.trim());
      const isReject = REJECTION_PATTERNS.test(message.trim());

      if (isConfirm) {
        console.log('[Gabriel AI] User confirmed protocol action:', convState.pendingProtocolAction.type);
        const result = buildProtocolActionExecution(convState.pendingProtocolAction, ctx);
        resolve({
          response: result.response,
          conversationState: createInitialConversationState(),
          protocolActions: result.actions.length > 0 ? result.actions : undefined,
        });
        return;
      }

      if (isReject) {
        console.log('[Gabriel AI] User rejected protocol action');
        resolve({
          response: `${opener}no problem — I won't make any changes. Your protocol stays as is. Let me know if there's anything else you'd like to adjust.`,
          conversationState: createInitialConversationState(),
        });
        return;
      }

      console.log('[Gabriel AI] Ambiguous response to pending action, re-asking');
      resolve({
        response: `${opener}just to confirm — would you like me to go ahead with ${convState.pendingProtocolAction.type === 'clear_all' ? 'clearing your entire protocol' : convState.pendingProtocolAction.type === 'remove' ? `removing ${convState.pendingProtocolAction.targetNames.join(', ')}` : convState.pendingProtocolAction.type === 'add' ? `adding ${convState.pendingProtocolAction.targetNames.join(', ')}` : convState.pendingProtocolAction.type === 'move' ? `moving ${convState.pendingProtocolAction.targetNames.join(', ')} to ${convState.pendingProtocolAction.newTimeOfDay}` : `adjusting ${convState.pendingProtocolAction.targetNames.join(', ')}`}? Say "yes" to confirm or "no" to cancel.`,
        conversationState: convState,
      });
      return;
    }

    const detectedAction = detectProtocolAction(message, ctx);
    if (detectedAction) {
      console.log('[Gabriel AI] Protocol action detected:', detectedAction.type, 'targets:', detectedAction.targetNames);
      const confirmationMsg = buildProtocolActionConfirmation(detectedAction, ctx);
      resolve({
        response: confirmationMsg,
        conversationState: {
          ...createInitialConversationState(),
          pendingProtocolAction: detectedAction,
        },
      });
      return;
    }

    const actionCardResponse = detectActionCardTriggers(message, ctx);
    if (actionCardResponse) {
      console.log('[Gabriel AI] Action card trigger detected');
      resolve({
        response: actionCardResponse,
        conversationState: createInitialConversationState(),
      });
      return;
    }

    if (convState.followUpAsked && convState.pendingFollowUp && convState.topic) {
      console.log('[Gabriel AI] Processing follow-up answers for topic:', convState.topic);

      const isSkip = SKIP_FOLLOW_UP_PATTERNS.test(message);

      const conditionResponse = CONDITION_RESPONSES[convState.topic];
      if (conditionResponse) {
        const fullResponse = conditionResponse(ctx);
        const openerText = getPersonalizedOpener(ctx);
        const responseWithoutOpener = fullResponse.startsWith(openerText) ? fullResponse.slice(openerText.length) : fullResponse;

        let finalResponse: string;
        if (isSkip) {
          finalResponse = `${opener}no problem — here's the full breakdown:\n\n${responseWithoutOpener}`;
        } else {
          finalResponse = personalizeConditionResponse(convState.topic, message, responseWithoutOpener, ctx);
        }

        resolve({
          response: finalResponse,
          conversationState: createInitialConversationState(),
        });
        return;
      }
    }

    const isProtocolCardRequest = /build.*protocol.*from|create.*protocol.*from|make.*protocol.*from|build me a protocol|create a protocol|make a protocol/i.test(message);
    if (isProtocolCardRequest && context.chatHistory && context.chatHistory.length > 0) {
      const recentText = context.chatHistory.slice(-6).join(' ');
      const foundSupplements = extractSupplementsFromText(recentText);
      console.log('[Gabriel AI] Protocol card request. Found supplements:', foundSupplements);
      if (foundSupplements.length > 0) {
        resolve({
          response: buildProtocolCardResponse(foundSupplements, ctx),
          conversationState: createInitialConversationState(),
        });
        return;
      }
    }

    if (isLabRecommendationQuery(message)) {
      console.log('[Gabriel AI] Matched lab recommendation query');
      let labRecResponse = buildLabRecommendationResponse(ctx);
      const checkInInsightsLab = buildCheckInInsights(ctx.recentCheckIns ?? []);
      if (checkInInsightsLab) {
        labRecResponse += checkInInsightsLab;
      }
      labRecResponse = buildInteractionWarnings(ctx.medications, labRecResponse);
      resolve({
        response: labRecResponse,
        conversationState: createInitialConversationState(),
      });
      return;
    }

    const metaResponse = buildMetaResponse(message, ctx);
    if (metaResponse) {
      console.log('[Gabriel AI] Matched meta-response pattern');
      resolve({
        response: metaResponse,
        conversationState: createInitialConversationState(),
      });
      return;
    }

    const categories = detectCategories(message);
    const primary = categories[0]?.category ?? 'general';

    console.log('[Gabriel AI] Detected categories:', categories);
    console.log('[Gabriel AI] Primary category:', primary);

    if (isFoodQuery(message)) {
      console.log('[Gabriel AI] Food query detected');
      let foodResponse = buildFoodQueryResponse(message, ctx);
      const checkInInsightsFood = buildCheckInInsights(ctx.recentCheckIns ?? []);
      if (checkInInsightsFood) {
        foodResponse += checkInInsightsFood;
      }
      foodResponse = buildInteractionWarnings(ctx.medications, foodResponse);
      resolve({
        response: foodResponse,
        conversationState: createInitialConversationState(),
      });
      return;
    }

    const symptomAnalysis = isSymptomAnalysisTriggered(message);
    if (symptomAnalysis.triggered) {
      console.log('[Gabriel AI] Symptom analysis triggered. Detected symptoms:', symptomAnalysis.symptoms);
      let symptomResponse = buildSymptomAnalysisResponse(message, symptomAnalysis.symptoms, ctx);
      if (symptomResponse) {
        symptomResponse = buildInteractionWarnings(ctx.medications, symptomResponse);
        resolve({
          response: symptomResponse,
          conversationState: createInitialConversationState(),
        });
        return;
      }
    }

    if (primary === 'condition' || primary === 'symptoms') {
      const followUpCondition = detectFollowUpCondition(message);
      if (followUpCondition && CONDITION_FOLLOW_UPS[followUpCondition]) {
        console.log('[Gabriel AI] Triggering follow-up questions for:', followUpCondition);
        const followUpText = `${opener}${CONDITION_FOLLOW_UPS[followUpCondition]}`;
        resolve({
          response: followUpText,
          conversationState: {
            pendingFollowUp: followUpCondition,
            followUpAsked: true,
            topic: followUpCondition,
            userAnswers: null,
          },
        });
        return;
      }
    }

    let response: string;

    switch (primary) {
      case 'supplements':
        response = buildSupplementResponse(message, ctx);
        break;
      case 'lab_interpretation':
        response = buildLabResponse(ctx);
        break;
      case 'drug_alternatives':
        response = buildDrugAlternativeResponse(message, ctx);
        break;
      case 'condition':
        response = buildConditionResponse(message, ctx);
        break;
      case 'symptoms':
        response = buildConditionResponse(message, ctx);
        break;
      case 'diet':
        response = buildDietResponse(message, ctx);
        break;
      case 'lifestyle':
        response = buildLifestyleResponse(ctx);
        break;
      case 'practitioner':
        response = buildPractitionerResponse(ctx);
        break;
      case 'protocol_build':
        response = buildProtocolResponse(ctx);
        break;
      default:
        response = buildGeneralResponse(ctx);
        break;
    }

    const responseTopics = detectFoodTopics(message, ctx.conditions);
    if (responseTopics.length > 0) {
      const foodSection = buildFoodMedicineSection(responseTopics);
      if (foodSection) {
        response += foodSection;
      }
    }

    const checkInInsights = buildCheckInInsights(ctx.recentCheckIns ?? []);
    if (checkInInsights) {
      response += checkInInsights;
    }

    if (ctx.wearableInsight) {
      response += ctx.wearableInsight;
    }

    if (ctx.protocolInsightSummary) {
      response += ctx.protocolInsightSummary;
    }

    const correlationInsight = getCorrelatedSkipInsight(ctx);
    if (correlationInsight) {
      response += correlationInsight;
    }

    const wovenInsight = buildWovenMultiStreamInsight(ctx);
    if (wovenInsight) {
      response += wovenInsight;
    }

    const freshness = assessDataFreshness(ctx);
    const freshnessNote = buildFreshnessNote(freshness);
    if (freshnessNote) {
      response += freshnessNote;
    }

    response = buildInteractionWarnings(ctx.medications, response);

    resolve({
      response,
      conversationState: createInitialConversationState(),
    });
  });
}

export function generateSuggestions(context: {
  healthGoals: string[];
  conditions: string[];
  medications: string[];
  labResults: LabMarker[];
  lastMessage?: string;
  recentCheckIns?: CheckInData[];
}): string[] {
  const suggestions: string[] = [];
  const added = new Set<string>();

  const addSuggestion = (s: string) => {
    if (!added.has(s) && suggestions.length < 6) {
      added.add(s);
      suggestions.push(s);
    }
  };

  const conditionSuggestions: Record<string, string[]> = {
    'thyroid': ['My thyroid protocol', 'Best labs for thyroid', 'Natural T4 to T3 support'],
    'thyroid issues': ['My thyroid protocol', 'Best labs for thyroid', 'Natural T4 to T3 support'],
    'hashimoto': ['Reduce my thyroid antibodies', 'Hashimoto\'s diet plan', 'Selenium for Hashimoto\'s'],
    'hashimotos': ['Reduce my thyroid antibodies', 'Hashimoto\'s diet plan', 'Selenium for Hashimoto\'s'],
    'gut health': ['Heal my gut lining', 'Best probiotics for me', 'Food sensitivity guide'],
    'gut issues': ['Heal my gut lining', 'Best probiotics for me', 'Food sensitivity guide'],
    'ibs': ['Heal my gut lining', 'SIBO vs IBS differences', 'Low FODMAP guide'],
    'sibo': ['SIBO treatment protocol', 'Best probiotics for SIBO', 'Heal my gut lining'],
    'leaky gut': ['Heal my gut lining', 'L-glutamine for gut repair', 'Food sensitivity guide'],
    'inflammation': ['My anti-inflammatory protocol', 'Track my CRP levels', 'Anti-inflammatory foods'],
    'anxiety': ['Natural anxiety support', 'GABA vs L-theanine', 'Calm my nervous system'],
    'sleep': ['Fix my sleep cycle', 'Best magnesium for sleep', 'Sleep hygiene protocol'],
    'insomnia': ['Fix my sleep cycle', 'Best magnesium for sleep', 'Why do I wake at 3 AM?'],
    'hormones': ['Balance my hormones', 'DUTCH test explained', 'Seed cycling protocol'],
    'hormone imbalance': ['Balance my hormones', 'DUTCH test explained', 'Seed cycling protocol'],
    'pcos': ['PCOS natural protocol', 'Balance my hormones', 'Berberine for PCOS'],
    'autoimmune': ['Autoimmune protocol diet', 'Reduce my inflammation', 'Best labs for autoimmune'],
    'fatigue': ['Why am I so tired?', 'Check my ferritin levels', 'Energy protocol for me'],
    'brain fog': ['Clear my brain fog', 'Lion\'s mane for cognition', 'Root causes of brain fog'],
    'depression': ['Natural mood support', 'Best supplements for mood', 'Gut-brain connection'],
    'acne': ['Clear my skin naturally', 'Gut-skin connection', 'Zinc for acne'],
    'eczema': ['Heal my eczema naturally', 'Gut-skin connection', 'Best supplements for skin'],
    'diabetes': ['Blood sugar optimization', 'Berberine vs metformin', 'Best labs for metabolic health'],
    'weight': ['Metabolic reset protocol', 'Insulin resistance guide', 'Why can\'t I lose weight?'],
    'mold': ['Mold detox protocol', 'Binders for mold toxins', 'Test for mold exposure'],
  };

  const conditionsLower = context.conditions.map(c => c.toLowerCase());
  for (const condition of conditionsLower) {
    const matched = Object.entries(conditionSuggestions).find(([key]) =>
      condition.includes(key) || key.includes(condition)
    );
    if (matched) {
      const picks = matched[1];
      for (const pick of picks) {
        addSuggestion(pick);
      }
    }
  }

  const goalSuggestions: Record<string, string[]> = {
    'Optimize Energy': ['Build me a morning energy protocol', 'Why am I always tired?'],
    'Balance Hormones': ['Balance my hormones naturally', 'Best adaptogens for hormones'],
    'Gut Health': ['Heal my gut lining', 'Best probiotics for me'],
    'Reduce Inflammation': ['My anti-inflammatory protocol', 'Anti-inflammatory foods'],
    'Mental Clarity': ['Clear my brain fog', 'Best nootropic stack for focus'],
    'Sleep': ['Fix my sleep cycle', 'Best magnesium for sleep'],
    'Longevity': ['Top longevity supplements', 'Anti-aging protocol'],
    'Drug-to-Natural Transition': ['Natural alternatives to my meds', 'Transition off prescriptions safely'],
  };

  for (const goal of context.healthGoals) {
    const goalSuggs = goalSuggestions[goal];
    if (goalSuggs) {
      addSuggestion(goalSuggs[0]);
    }
  }

  if (context.conditions.length > 0 || context.healthGoals.length > 0) {
    const conditionsLowerForLabs = context.conditions.map(c => c.toLowerCase());
    const goalsLowerForLabs = context.healthGoals.map(g => g.toLowerCase());
    const hasLabGap = (() => {
      const condToKey: [RegExp, string][] = [
        [/thyroid|hashimoto/i, 'thyroid'],
        [/inflammat/i, 'inflammation'],
        [/gut|ibs|sibo|digest/i, 'gut health'],
        [/hormone|pcos/i, 'hormones'],
        [/blood sugar|diabetes/i, 'blood sugar'],
        [/autoimmune/i, 'autoimmune'],
        [/fatigue|tired|energy/i, 'fatigue'],
        [/anxiety/i, 'anxiety'],
        [/sleep|insomnia/i, 'sleep'],
      ];
      for (const cond of conditionsLowerForLabs) {
        for (const [regex, key] of condToKey) {
          if (regex.test(cond) && LAB_RECOMMENDATION_MAP[key]) {
            return true;
          }
        }
      }
      const goalMap: Record<string, string> = { 'optimize energy': 'fatigue', 'balance hormones': 'hormones', 'gut health': 'gut health', 'reduce inflammation': 'inflammation', 'sleep': 'sleep' };
      for (const g of goalsLowerForLabs) {
        const matched = Object.entries(goalMap).find(([k]) => g.includes(k));
        if (matched && LAB_RECOMMENDATION_MAP[matched[1]]) return true;
      }
      return false;
    })();
    if (hasLabGap) {
      addSuggestion('What labs should I get?');
    }
  }

  if (context.labResults.length > 0) {
    addSuggestion('Interpret my latest labs');
    const outOfRange = context.labResults.filter(m => m.status === 'attention' || m.status === 'suboptimal');
    if (outOfRange.length > 0) {
      const marker = outOfRange[0];
      const direction = marker.value > marker.gabrielHigh ? 'high' : 'low';
      addSuggestion(`Why is my ${marker.name} ${direction}?`);
    }
  }

  if (context.recentCheckIns && context.recentCheckIns.length > 0) {
    const recentEnergy = context.recentCheckIns.slice(0, 3);
    const avgEnergy = recentEnergy.reduce((sum, c) => sum + c.energy, 0) / recentEnergy.length;
    const avgMood = recentEnergy.reduce((sum, c) => sum + c.mood, 0) / recentEnergy.length;
    if (avgEnergy <= 2.5) {
      addSuggestion('Why am I so tired lately?');
    } else if (avgMood <= 2.5) {
      addSuggestion('Help with my low mood');
    }
    const avgSleep = recentEnergy.reduce((sum, c) => sum + c.sleep, 0) / recentEnergy.length;
    if (avgSleep <= 2.5) {
      addSuggestion('Fix my poor sleep quality');
    }
  }

  if (context.medications.length > 0) {
    addSuggestion(`Natural alternatives to ${context.medications[0]}`);
  }

  if (context.lastMessage) {
    const supplementsInLast = extractSupplementsFromText(context.lastMessage);
    if (supplementsInLast.length >= 3) {
      addSuggestion('Build me a protocol from these');
    }
  }

  addSuggestion('What supplements should I take?');
  addSuggestion('Find a practitioner near me');

  return suggestions.slice(0, 6);
}
