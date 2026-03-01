export interface ConditionData {
  id: string;
  name: string;
  description: string;
  severity: 'mild' | 'moderate' | 'severe';
  rootCauses: string[];
  protocol: {
    essential: { name: string; dosage: string; purpose: string }[];
    supportive: { name: string; dosage: string; purpose: string }[];
  };
  labMarkers: { name: string; optimalRange: string; standardRange: string; why: string }[];
  foodsHelp: { name: string; icon: string }[];
  foodsAvoid: { name: string; icon: string }[];
  lifestyle: string[];
  specialistTypes: string[];
  keywords: string[];
}

export const CONDITIONS: ConditionData[] = [
  {
    id: 'hypothyroidism',
    name: 'Hypothyroidism',
    description: 'Underactive thyroid gland leading to slowed metabolism, fatigue, and widespread hormonal disruption.',
    severity: 'moderate',
    rootCauses: [
      'Hashimoto\'s autoimmune thyroiditis — immune system attacks thyroid tissue, causing gradual destruction',
      'Nutrient deficiencies in iodine, selenium, zinc, and iron impair thyroid hormone production and conversion',
      'Chronic stress elevates cortisol, which inhibits TSH secretion and T4-to-T3 conversion',
      'Gut dysbiosis reduces the 20% of T4-to-T3 conversion that occurs in the intestines',
      'Environmental toxins (fluoride, bromide, perchlorate) compete with iodine at thyroid receptor sites',
    ],
    protocol: {
      essential: [
        { name: 'Selenium', dosage: '200mcg daily', purpose: 'Supports T4-to-T3 conversion and reduces thyroid antibodies' },
        { name: 'Zinc', dosage: '30mg daily', purpose: 'Required for thyroid hormone synthesis and receptor sensitivity' },
        { name: 'Vitamin D3', dosage: '5000 IU daily', purpose: 'Modulates immune function; deficiency linked to Hashimoto\'s' },
        { name: 'Ashwagandha', dosage: '600mg daily', purpose: 'Adaptogen that supports TSH and T4 levels naturally' },
      ],
      supportive: [
        { name: 'Iron (if deficient)', dosage: '25mg with vitamin C', purpose: 'Iron is a cofactor for thyroid peroxidase enzyme' },
        { name: 'B-Complex', dosage: '1 daily', purpose: 'Supports energy metabolism and methylation pathways' },
        { name: 'Magnesium Glycinate', dosage: '400mg evening', purpose: 'Supports hundreds of enzymatic reactions including thyroid function' },
      ],
    },
    labMarkers: [
      { name: 'TSH', optimalRange: '1.0–2.0 mIU/L', standardRange: '0.4–4.5 mIU/L', why: 'Primary thyroid function indicator' },
      { name: 'Free T4', optimalRange: '1.1–1.5 ng/dL', standardRange: '0.8–1.8 ng/dL', why: 'Measures available thyroid hormone' },
      { name: 'Free T3', optimalRange: '3.0–3.5 pg/mL', standardRange: '2.3–4.2 pg/mL', why: 'Active thyroid hormone — most important' },
      { name: 'TPO Antibodies', optimalRange: '<15 IU/mL', standardRange: '<35 IU/mL', why: 'Detects autoimmune thyroid attack' },
      { name: 'Reverse T3', optimalRange: '<15 ng/dL', standardRange: '8–25 ng/dL', why: 'High levels block T3 receptor sites' },
    ],
    foodsHelp: [
      { name: 'Brazil nuts (selenium)', icon: '🥜' },
      { name: 'Wild-caught salmon', icon: '🐟' },
      { name: 'Seaweed (moderate)', icon: '🌿' },
      { name: 'Pumpkin seeds', icon: '🎃' },
      { name: 'Coconut oil', icon: '🥥' },
      { name: 'Grass-fed liver', icon: '🥩' },
    ],
    foodsAvoid: [
      { name: 'Raw cruciferous (excess)', icon: '🥦' },
      { name: 'Soy products', icon: '🫘' },
      { name: 'Gluten', icon: '🌾' },
      { name: 'Processed sugar', icon: '🍬' },
      { name: 'Fluoridated water', icon: '💧' },
    ],
    lifestyle: [
      'Prioritize 7-9 hours of sleep — thyroid hormones regenerate during deep sleep phases',
      'Moderate exercise only — intense training can further suppress thyroid function',
      'Practice stress reduction (meditation, breathwork) to lower cortisol interference',
      'Filter drinking water to remove fluoride and chlorine that compete with iodine',
      'Avoid plastic containers and BPA — endocrine disruptors that impair thyroid signaling',
    ],
    specialistTypes: ['Thyroid Specialist', 'Naturopathic Doctor', 'Functional Medicine'],
    keywords: ['hypothyroidism', 'hashimoto', 'thyroid', 'underactive thyroid'],
  },
  {
    id: 'gut-dysbiosis',
    name: 'Gut Dysbiosis',
    description: 'Imbalanced intestinal microbiome leading to digestive issues, inflammation, and impaired nutrient absorption.',
    severity: 'moderate',
    rootCauses: [
      'Antibiotic overuse decimates beneficial bacteria populations, allowing opportunistic organisms to flourish',
      'Standard American Diet high in processed foods, sugar, and seed oils starves beneficial microbes',
      'Chronic stress alters gut motility and reduces secretory IgA, weakening mucosal immunity',
      'Low stomach acid (hypochlorhydria) allows pathogens to survive and colonize the small intestine',
      'Environmental toxins (glyphosate, pesticides) act as antibiotics in the gut ecosystem',
    ],
    protocol: {
      essential: [
        { name: 'Spore-Based Probiotics', dosage: '2 caps daily', purpose: 'Survive stomach acid and recolonize the gut effectively' },
        { name: 'L-Glutamine', dosage: '5g twice daily', purpose: 'Primary fuel for intestinal cells; repairs gut lining integrity' },
        { name: 'Digestive Enzymes', dosage: 'With each meal', purpose: 'Supports complete food breakdown and nutrient absorption' },
        { name: 'Berberine', dosage: '500mg twice daily', purpose: 'Natural antimicrobial that targets pathogenic bacteria and yeast' },
      ],
      supportive: [
        { name: 'Collagen Peptides', dosage: '10g daily', purpose: 'Provides glycine and proline for gut lining repair' },
        { name: 'Slippery Elm', dosage: '400mg before meals', purpose: 'Mucilaginous herb that coats and soothes inflamed gut tissue' },
        { name: 'Saccharomyces Boulardii', dosage: '500mg daily', purpose: 'Beneficial yeast that crowds out Candida and C. diff' },
      ],
    },
    labMarkers: [
      { name: 'GI-MAP Stool Test', optimalRange: 'Balanced flora, no pathogens', standardRange: 'N/A (specialty test)', why: 'Comprehensive gut microbiome analysis via PCR' },
      { name: 'Zonulin', optimalRange: '<30 ng/mL', standardRange: '<107 ng/mL', why: 'Marker for intestinal permeability (leaky gut)' },
      { name: 'Secretory IgA', optimalRange: '510–1630 mcg/mL', standardRange: '510–2040 mcg/mL', why: 'Mucosal immune defense indicator' },
      { name: 'Calprotectin', optimalRange: '<50 mcg/g', standardRange: '<120 mcg/g', why: 'Intestinal inflammation marker' },
    ],
    foodsHelp: [
      { name: 'Sauerkraut & kimchi', icon: '🥬' },
      { name: 'Bone broth', icon: '🍲' },
      { name: 'Garlic & onions', icon: '🧄' },
      { name: 'Kefir', icon: '🥛' },
      { name: 'Asparagus', icon: '🌱' },
      { name: 'Aloe vera juice', icon: '🪴' },
    ],
    foodsAvoid: [
      { name: 'Refined sugar', icon: '🍭' },
      { name: 'Alcohol', icon: '🍷' },
      { name: 'Processed foods', icon: '🍟' },
      { name: 'Artificial sweeteners', icon: '🧪' },
      { name: 'Seed oils', icon: '🫗' },
    ],
    lifestyle: [
      'Eat slowly and chew thoroughly — digestion begins in the mouth with salivary enzymes',
      'Implement a 12-14 hour overnight fast to allow the migrating motor complex to clean the gut',
      'Manage stress daily — the gut-brain axis means stress directly impairs gut function',
      'Spend time in nature — soil microbes increase microbial diversity through skin contact',
      'Avoid unnecessary NSAIDs — they damage gut lining and increase intestinal permeability',
    ],
    specialistTypes: ['Naturopathic Doctor', 'Functional Medicine', 'Nutrition'],
    keywords: ['gut dysbiosis', 'dysbiosis', 'leaky gut', 'gut health', 'microbiome', 'sibo', 'ibs'],
  },
  {
    id: 'adrenal-fatigue',
    name: 'Adrenal Fatigue',
    description: 'HPA axis dysregulation from chronic stress, causing cortisol imbalances, exhaustion, and impaired stress resilience.',
    severity: 'moderate',
    rootCauses: [
      'Prolonged psychological or physical stress exhausts the hypothalamic-pituitary-adrenal axis',
      'Poor sleep habits disrupt cortisol\'s natural circadian rhythm (should be high morning, low evening)',
      'Blood sugar instability from refined carbs causes repeated cortisol spikes throughout the day',
      'Hidden infections, chronic inflammation, or autoimmunity create ongoing physiological stress demands',
      'Overtraining or excessive exercise without adequate recovery depletes cortisol reserves',
    ],
    protocol: {
      essential: [
        { name: 'Ashwagandha KSM-66', dosage: '600mg daily', purpose: 'Adaptogen that modulates cortisol and supports HPA axis recovery' },
        { name: 'Vitamin C', dosage: '1000mg twice daily', purpose: 'Adrenals have the highest vitamin C concentration of any organ' },
        { name: 'Magnesium Glycinate', dosage: '400mg evening', purpose: 'Calms the nervous system and supports over 300 enzymatic reactions' },
        { name: 'B5 (Pantothenic Acid)', dosage: '500mg daily', purpose: 'Critical for cortisol and adrenal hormone production' },
      ],
      supportive: [
        { name: 'Rhodiola Rosea', dosage: '200mg morning', purpose: 'Adaptogen that improves energy without overstimulation' },
        { name: 'Phosphatidylserine', dosage: '300mg evening', purpose: 'Blunts excessive cortisol output, especially at night' },
        { name: 'Holy Basil (Tulsi)', dosage: '500mg daily', purpose: 'Adaptogenic herb that modulates the stress response' },
      ],
    },
    labMarkers: [
      { name: 'DUTCH Complete (Cortisol)', optimalRange: 'Healthy diurnal curve', standardRange: 'N/A (specialty test)', why: 'Maps cortisol production throughout the day' },
      { name: 'AM Cortisol (serum)', optimalRange: '15–20 mcg/dL', standardRange: '6.2–19.4 mcg/dL', why: 'Morning cortisol should be at peak' },
      { name: 'DHEA-S', optimalRange: 'Age-appropriate mid-range', standardRange: 'Varies by age/sex', why: 'Adrenal reserve marker — drops with chronic stress' },
      { name: 'Fasting Glucose', optimalRange: '75–85 mg/dL', standardRange: '65–99 mg/dL', why: 'Blood sugar dysregulation often accompanies adrenal issues' },
    ],
    foodsHelp: [
      { name: 'Sea salt (mineral-rich)', icon: '🧂' },
      { name: 'Avocados', icon: '🥑' },
      { name: 'Wild salmon', icon: '🐟' },
      { name: 'Sweet potatoes', icon: '🍠' },
      { name: 'Pasture-raised eggs', icon: '🥚' },
      { name: 'Dark leafy greens', icon: '🥬' },
    ],
    foodsAvoid: [
      { name: 'Caffeine (or limit)', icon: '☕' },
      { name: 'Refined sugar', icon: '🍬' },
      { name: 'Alcohol', icon: '🍺' },
      { name: 'High-glycemic carbs', icon: '🍞' },
      { name: 'Energy drinks', icon: '⚡' },
    ],
    lifestyle: [
      'Non-negotiable 8+ hours of sleep — go to bed before 10pm when cortisol naturally rises',
      'Morning sunlight exposure within 30 minutes of waking to reset circadian cortisol rhythm',
      'Replace intense exercise with walking, yoga, and gentle movement during recovery',
      'Eat within 1 hour of waking and include protein + fat to stabilize blood sugar',
      'Practice daily breathwork or meditation — even 10 minutes significantly lowers cortisol',
    ],
    specialistTypes: ['Naturopathic Doctor', 'Functional Medicine', 'Hormone Health'],
    keywords: ['adrenal fatigue', 'adrenal', 'hpa axis', 'burnout', 'cortisol'],
  },
  {
    id: 'anxiety',
    name: 'Anxiety',
    description: 'Chronic nervous system dysregulation involving excessive worry, physical tension, and impaired stress response.',
    severity: 'moderate',
    rootCauses: [
      'GABA/glutamate imbalance — insufficient inhibitory neurotransmitter activity leads to overexcitation',
      'Gut-brain axis dysfunction — 90% of serotonin is produced in the gut; dysbiosis impairs production',
      'Blood sugar instability triggers adrenaline and cortisol surges that mimic anxiety symptoms',
      'Magnesium deficiency — widespread and directly linked to increased nervous system excitability',
      'Methylation issues (MTHFR variants) impair neurotransmitter production and detoxification',
    ],
    protocol: {
      essential: [
        { name: 'Magnesium Glycinate', dosage: '400-600mg daily', purpose: 'Natural NMDA receptor antagonist — calms neural excitability' },
        { name: 'L-Theanine', dosage: '200mg twice daily', purpose: 'Promotes alpha brain waves and boosts GABA without sedation' },
        { name: 'Omega-3 (EPA focus)', dosage: '2g EPA daily', purpose: 'Reduces neuroinflammation that drives anxiety pathways' },
        { name: 'Vitamin B6 (P5P)', dosage: '50mg daily', purpose: 'Direct cofactor for GABA and serotonin synthesis' },
      ],
      supportive: [
        { name: 'Passionflower', dosage: '500mg before bed', purpose: 'Increases GABA levels comparable to benzodiazepines in studies' },
        { name: 'Ashwagandha', dosage: '300mg twice daily', purpose: 'Reduces cortisol by 30% in clinical trials' },
        { name: 'Pharma-GABA', dosage: '200mg as needed', purpose: 'Bioavailable GABA that crosses the blood-brain barrier' },
      ],
    },
    labMarkers: [
      { name: 'Magnesium RBC', optimalRange: '5.5–6.5 mg/dL', standardRange: '4.0–6.4 mg/dL', why: 'Intracellular magnesium reflects true status' },
      { name: 'Vitamin B6', optimalRange: '20–50 ng/mL', standardRange: '5–50 ng/mL', why: 'Cofactor for GABA and serotonin production' },
      { name: 'Homocysteine', optimalRange: '<8 μmol/L', standardRange: '5–15 μmol/L', why: 'Elevated levels indicate methylation issues' },
      { name: 'Fasting Glucose', optimalRange: '75–85 mg/dL', standardRange: '65–99 mg/dL', why: 'Blood sugar swings trigger anxiety symptoms' },
    ],
    foodsHelp: [
      { name: 'Chamomile tea', icon: '🍵' },
      { name: 'Dark chocolate 85%+', icon: '🍫' },
      { name: 'Fatty fish', icon: '🐟' },
      { name: 'Turkey', icon: '🦃' },
      { name: 'Avocado', icon: '🥑' },
      { name: 'Pumpkin seeds', icon: '🎃' },
    ],
    foodsAvoid: [
      { name: 'Caffeine', icon: '☕' },
      { name: 'Alcohol', icon: '🍷' },
      { name: 'Refined sugar', icon: '🍬' },
      { name: 'Artificial sweeteners', icon: '🧪' },
      { name: 'Processed foods', icon: '🍟' },
    ],
    lifestyle: [
      'Daily cold exposure (cold showers) — activates the vagus nerve and builds stress resilience',
      'Box breathing: 4 seconds in, 4 hold, 4 out, 4 hold — activates parasympathetic response',
      'Regular exercise (not overtraining) — 30 min moderate activity reduces anxiety by 20%',
      'Limit screen time before bed — blue light suppresses melatonin and increases cortisol',
      'Journaling practice — externalizing worries reduces amygdala activation by up to 40%',
    ],
    specialistTypes: ['Naturopathic Doctor', 'Functional Medicine', 'Neurology'],
    keywords: ['anxiety', 'anxious', 'worry', 'panic', 'nervous', 'gad'],
  },
  {
    id: 'insomnia',
    name: 'Insomnia',
    description: 'Chronic difficulty falling or staying asleep, often rooted in neurotransmitter imbalances and circadian disruption.',
    severity: 'moderate',
    rootCauses: [
      'Cortisol rhythm inversion — elevated evening cortisol prevents the natural melatonin rise',
      'Magnesium deficiency impairs GABA receptor function needed for neural quieting at night',
      'Blue light exposure after sunset suppresses melatonin production by up to 50%',
      'Blood sugar drops overnight (reactive hypoglycemia) trigger cortisol/adrenaline awakenings',
      'Histamine intolerance or mast cell activation keeps the brain in a hypervigilant state',
    ],
    protocol: {
      essential: [
        { name: 'Magnesium Glycinate', dosage: '400mg 1hr before bed', purpose: 'Activates GABA receptors and relaxes muscles for sleep onset' },
        { name: 'L-Theanine', dosage: '200mg evening', purpose: 'Promotes alpha brain waves without sedation — improves sleep quality' },
        { name: 'Melatonin (low dose)', dosage: '0.3–1mg sublingual', purpose: 'Physiological dose resets circadian rhythm without dependency' },
        { name: 'Glycine', dosage: '3g before bed', purpose: 'Lowers core body temperature and improves sleep architecture' },
      ],
      supportive: [
        { name: 'Tart Cherry Extract', dosage: '500mg evening', purpose: 'Natural melatonin source plus anti-inflammatory anthocyanins' },
        { name: 'Phosphatidylserine', dosage: '300mg dinner', purpose: 'Blunts evening cortisol spike that disrupts sleep onset' },
        { name: 'Reishi Mushroom', dosage: '1g evening', purpose: 'Calming adaptogen that promotes deeper NREM sleep stages' },
      ],
    },
    labMarkers: [
      { name: 'Cortisol (PM saliva)', optimalRange: '<0.5 mcg/dL', standardRange: '<1.0 mcg/dL', why: 'Evening cortisol should be low for sleep' },
      { name: 'Magnesium RBC', optimalRange: '5.5–6.5 mg/dL', standardRange: '4.0–6.4 mg/dL', why: 'Critical for GABA function and sleep quality' },
      { name: 'Ferritin', optimalRange: '40–100 ng/mL', standardRange: '12–150 ng/mL', why: 'Low ferritin linked to restless legs and insomnia' },
      { name: 'Fasting Insulin', optimalRange: '3–6 μIU/mL', standardRange: '2.6–24.9 μIU/mL', why: 'Insulin resistance causes overnight blood sugar crashes' },
    ],
    foodsHelp: [
      { name: 'Tart cherry juice', icon: '🍒' },
      { name: 'Kiwi (2 before bed)', icon: '🥝' },
      { name: 'Almonds', icon: '🌰' },
      { name: 'Warm raw milk', icon: '🥛' },
      { name: 'Passionflower tea', icon: '🍵' },
      { name: 'Banana', icon: '🍌' },
    ],
    foodsAvoid: [
      { name: 'Caffeine after noon', icon: '☕' },
      { name: 'Alcohol', icon: '🍷' },
      { name: 'Spicy foods at dinner', icon: '🌶️' },
      { name: 'High-sugar foods PM', icon: '🍰' },
      { name: 'Heavy meals late', icon: '🍽️' },
    ],
    lifestyle: [
      'Morning sunlight within 30 min of waking — sets circadian clock for proper melatonin timing',
      'Blue-light blocking glasses after sunset or use warm lighting only',
      'Keep bedroom at 65-68°F — cooler temperatures improve deep sleep by 25%',
      'Consistent sleep/wake time 7 days a week — even weekends (most impactful change)',
      'No screens 1 hour before bed — replace with reading, journaling, or gentle stretching',
    ],
    specialistTypes: ['Naturopathic Doctor', 'Functional Medicine', 'Neurology'],
    keywords: ['insomnia', 'sleep', 'can\'t sleep', 'trouble sleeping', 'wake up at night'],
  },
  {
    id: 'pcos',
    name: 'PCOS',
    description: 'Polycystic ovary syndrome — a hormonal disorder involving insulin resistance, androgen excess, and ovulatory dysfunction.',
    severity: 'moderate',
    rootCauses: [
      'Insulin resistance drives the ovaries to produce excess testosterone and DHEA-S',
      'Chronic low-grade inflammation elevates CRP and stimulates androgen production',
      'HPA axis dysfunction — elevated cortisol disrupts the HPO axis and ovulation signaling',
      'Gut dysbiosis impairs estrogen metabolism via the estrobolome, worsening hormonal imbalance',
      'Environmental endocrine disruptors (BPA, phthalates) interfere with ovarian hormone production',
    ],
    protocol: {
      essential: [
        { name: 'Inositol (Myo + D-Chiro 40:1)', dosage: '4g myo + 100mg DCI daily', purpose: 'Insulin sensitizer as effective as metformin in studies' },
        { name: 'Berberine', dosage: '500mg twice daily', purpose: 'Reduces insulin resistance and lowers androgen levels' },
        { name: 'Omega-3 (EPA/DHA)', dosage: '2g daily', purpose: 'Reduces inflammation and improves insulin sensitivity' },
        { name: 'Vitamin D3', dosage: '5000 IU daily', purpose: 'Deficiency worsens insulin resistance and androgen excess' },
      ],
      supportive: [
        { name: 'Spearmint Tea', dosage: '2 cups daily', purpose: 'Clinically shown to reduce free testosterone levels' },
        { name: 'NAC', dosage: '600mg twice daily', purpose: 'Improves insulin sensitivity and reduces oxidative stress' },
        { name: 'Saw Palmetto', dosage: '320mg daily', purpose: 'Blocks 5-alpha reductase — reduces DHT conversion' },
      ],
    },
    labMarkers: [
      { name: 'Fasting Insulin', optimalRange: '3–6 μIU/mL', standardRange: '2.6–24.9 μIU/mL', why: 'Insulin resistance is the root driver of most PCOS' },
      { name: 'Free Testosterone', optimalRange: '<2.0 pg/mL', standardRange: '0.1–6.4 pg/mL', why: 'Elevated in PCOS — drives acne, hair loss, hirsutism' },
      { name: 'DHEA-S', optimalRange: 'Age-appropriate mid-range', standardRange: 'Varies by age', why: 'Adrenal androgen marker — elevated in adrenal PCOS' },
      { name: 'hs-CRP', optimalRange: '<0.5 mg/L', standardRange: '<3.0 mg/L', why: 'Chronic inflammation marker — often elevated in PCOS' },
      { name: 'AMH', optimalRange: '1.0–3.5 ng/mL', standardRange: '1.0–10.0 ng/mL', why: 'Very high levels indicate polycystic ovarian morphology' },
    ],
    foodsHelp: [
      { name: 'Broccoli sprouts', icon: '🥦' },
      { name: 'Flax seeds', icon: '🌱' },
      { name: 'Cinnamon', icon: '🫚' },
      { name: 'Spearmint tea', icon: '🍵' },
      { name: 'Wild salmon', icon: '🐟' },
      { name: 'Walnuts', icon: '🥜' },
    ],
    foodsAvoid: [
      { name: 'Refined sugar', icon: '🍬' },
      { name: 'Dairy (conventional)', icon: '🧀' },
      { name: 'White flour', icon: '🌾' },
      { name: 'Soy products', icon: '🫘' },
      { name: 'Seed oils', icon: '🫗' },
    ],
    lifestyle: [
      'Strength training 3-4x/week — builds muscle that improves insulin sensitivity dramatically',
      'Walk after every meal for 15 minutes — reduces post-meal glucose spikes by 30%',
      'Seed cycling: flax + pumpkin seeds days 1-14, sesame + sunflower days 15-28',
      'Reduce endocrine disruptor exposure — switch to glass containers, clean beauty products',
      'Prioritize sleep 7-9 hours — sleep deprivation worsens insulin resistance within days',
    ],
    specialistTypes: ['Hormone Health', 'Naturopathic Doctor', 'Women\'s Health', 'Functional Medicine'],
    keywords: ['pcos', 'polycystic', 'ovarian', 'androgen', 'irregular periods', 'hormone imbalance'],
  },
  {
    id: 'inflammation',
    name: 'Chronic Inflammation',
    description: 'Persistent low-grade systemic inflammation that drives virtually every modern chronic disease.',
    severity: 'severe',
    rootCauses: [
      'Gut permeability (leaky gut) allows endotoxins (LPS) into the bloodstream, triggering immune activation',
      'Omega-6 to omega-3 fatty acid imbalance from seed oils promotes pro-inflammatory eicosanoids',
      'Chronic stress elevates NF-κB activation — the master inflammatory switch in every cell',
      'Hidden infections (dental, sinus, gut) maintain constant immune system activation',
      'Visceral fat acts as an endocrine organ, secreting inflammatory cytokines (IL-6, TNF-alpha)',
    ],
    protocol: {
      essential: [
        { name: 'Omega-3 (EPA/DHA)', dosage: '3g daily', purpose: 'Produces SPMs (specialized pro-resolving mediators) that turn off inflammation' },
        { name: 'Curcumin (w/ piperine)', dosage: '1000mg daily', purpose: 'Inhibits NF-κB, COX-2, and LOX — as effective as some NSAIDs' },
        { name: 'Vitamin D3', dosage: '5000 IU daily', purpose: 'Modulates T-regulatory cells that control inflammatory cascades' },
        { name: 'Quercetin', dosage: '500mg twice daily', purpose: 'Mast cell stabilizer and NF-κB inhibitor — potent natural anti-inflammatory' },
      ],
      supportive: [
        { name: 'Boswellia', dosage: '300mg three times daily', purpose: 'Inhibits 5-LOX enzyme — reduces inflammatory leukotrienes' },
        { name: 'NAC', dosage: '600mg twice daily', purpose: 'Precursor to glutathione — master antioxidant that quenches inflammation' },
        { name: 'SPM Active', dosage: '2 softgels daily', purpose: 'Directly provides resolution-phase mediators to end inflammation' },
      ],
    },
    labMarkers: [
      { name: 'hs-CRP', optimalRange: '<0.5 mg/L', standardRange: '<3.0 mg/L', why: 'Most reliable general inflammation marker' },
      { name: 'ESR', optimalRange: '<10 mm/hr', standardRange: '<20 mm/hr (age-dependent)', why: 'Non-specific but sensitive inflammation indicator' },
      { name: 'Omega-3 Index', optimalRange: '8–12%', standardRange: '>4%', why: 'Measures omega-3 incorporation into cell membranes' },
      { name: 'Homocysteine', optimalRange: '<8 μmol/L', standardRange: '5–15 μmol/L', why: 'Elevated levels cause vascular inflammation' },
      { name: 'Fasting Insulin', optimalRange: '3–6 μIU/mL', standardRange: '2.6–24.9 μIU/mL', why: 'Hyperinsulinemia drives inflammatory pathways' },
    ],
    foodsHelp: [
      { name: 'Wild salmon', icon: '🐟' },
      { name: 'Turmeric / golden milk', icon: '🫚' },
      { name: 'Tart cherry juice', icon: '🍒' },
      { name: 'Extra virgin olive oil', icon: '🫒' },
      { name: 'Wild blueberries', icon: '🫐' },
      { name: 'Ginger root', icon: '🌿' },
    ],
    foodsAvoid: [
      { name: 'Seed oils (canola, soy)', icon: '🫗' },
      { name: 'Refined sugar', icon: '🍬' },
      { name: 'Trans fats', icon: '🍟' },
      { name: 'Processed meats', icon: '🌭' },
      { name: 'Gluten (if sensitive)', icon: '🌾' },
      { name: 'Alcohol', icon: '🍷' },
    ],
    lifestyle: [
      'Anti-inflammatory diet: Mediterranean or ancestral template — whole foods, wild proteins, abundant vegetables',
      'Cold exposure (cold plunges, showers) — activates cold shock proteins that reduce inflammation',
      'Zone 2 cardio 3-5x/week — moderate exercise is anti-inflammatory; overtraining is pro-inflammatory',
      'Optimize sleep — poor sleep increases IL-6 and TNF-alpha by 40% the following day',
      'Grounding/earthing — direct skin contact with earth reduces blood viscosity and inflammation markers',
    ],
    specialistTypes: ['Functional Medicine', 'Naturopathic Doctor', 'Autoimmune Specialist'],
    keywords: ['inflammation', 'chronic inflammation', 'inflamed', 'inflammatory', 'autoimmune'],
  },
  {
    id: 'vitamin-d-deficiency',
    name: 'Vitamin D Deficiency',
    description: 'Critically low levels of the "sunshine hormone" affecting immunity, bones, mood, and virtually every organ system.',
    severity: 'mild',
    rootCauses: [
      'Insufficient sun exposure — modern indoor lifestyles, sunscreen use, and northern latitudes limit UVB synthesis',
      'Dark skin pigmentation requires 3-6x more sun exposure to produce equivalent vitamin D levels',
      'Magnesium deficiency impairs vitamin D activation — Mg is required at 8 enzymatic steps',
      'Obesity sequesters vitamin D in fat tissue, making it unavailable for metabolic functions',
      'Gut malabsorption from celiac, Crohn\'s, or low bile production reduces fat-soluble vitamin uptake',
    ],
    protocol: {
      essential: [
        { name: 'Vitamin D3', dosage: '5000-10000 IU daily', purpose: 'Repletes stores; dose based on current level and body weight' },
        { name: 'Vitamin K2 (MK-7)', dosage: '200mcg daily', purpose: 'Directs calcium to bones, not arteries — essential D3 cofactor' },
        { name: 'Magnesium Glycinate', dosage: '400mg daily', purpose: 'Required for vitamin D activation at multiple enzymatic steps' },
      ],
      supportive: [
        { name: 'Zinc', dosage: '15-30mg daily', purpose: 'Supports vitamin D receptor expression and immune function' },
        { name: 'Boron', dosage: '3mg daily', purpose: 'Extends vitamin D half-life and improves utilization' },
        { name: 'Omega-3', dosage: '2g daily', purpose: 'Fat-soluble — improves vitamin D absorption and reduces inflammation' },
      ],
    },
    labMarkers: [
      { name: '25-OH Vitamin D', optimalRange: '50–80 ng/mL', standardRange: '30–100 ng/mL', why: 'Primary vitamin D status marker — most are sub-optimal' },
      { name: 'Calcium (serum)', optimalRange: '9.4–10.0 mg/dL', standardRange: '8.5–10.5 mg/dL', why: 'Vitamin D regulates calcium absorption' },
      { name: 'PTH (Parathyroid)', optimalRange: '15–30 pg/mL', standardRange: '10–65 pg/mL', why: 'Elevated PTH indicates the body is compensating for low D' },
      { name: 'Magnesium RBC', optimalRange: '5.5–6.5 mg/dL', standardRange: '4.0–6.4 mg/dL', why: 'Must be adequate for vitamin D to be activated' },
    ],
    foodsHelp: [
      { name: 'Wild salmon', icon: '🐟' },
      { name: 'Sardines', icon: '🐠' },
      { name: 'Egg yolks (pastured)', icon: '🥚' },
      { name: 'Cod liver oil', icon: '🫗' },
      { name: 'Mushrooms (UV-exposed)', icon: '🍄' },
      { name: 'Grass-fed butter', icon: '🧈' },
    ],
    foodsAvoid: [
      { name: 'Excessive phytates', icon: '🌾' },
      { name: 'Processed foods', icon: '🍟' },
      { name: 'Excess alcohol', icon: '🍷' },
      { name: 'Soda / phosphoric acid', icon: '🥤' },
    ],
    lifestyle: [
      'Get 15-30 minutes of midday sun (10am-2pm) with arms/legs exposed — no sunscreen during this window',
      'Latitude matters — above 37°N, UVB is insufficient October-March; supplement year-round',
      'Take vitamin D with your largest fat-containing meal for 50% better absorption',
      'Test levels every 3 months while repleting; twice yearly once optimal',
      'Consider a vitamin D lamp in winter months for additional UVB exposure',
    ],
    specialistTypes: ['Naturopathic Doctor', 'Functional Medicine', 'Nutrition'],
    keywords: ['vitamin d', 'vitamin d deficiency', 'low vitamin d', 'sunshine vitamin'],
  },
];

export const CONDITION_NAMES = CONDITIONS.map(c => c.name.toLowerCase());

export function findConditionByKeyword(text: string): ConditionData | null {
  const lower = text.toLowerCase();
  for (const condition of CONDITIONS) {
    for (const keyword of condition.keywords) {
      if (lower.includes(keyword)) {
        return condition;
      }
    }
  }
  return null;
}

export function getConditionById(id: string): ConditionData | null {
  return CONDITIONS.find(c => c.id === id) ?? null;
}
