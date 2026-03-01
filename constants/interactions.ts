export type InteractionSeverity = 'safe' | 'caution' | 'critical';

export interface SupplementInteraction {
  supplements: [string, string];
  severity: InteractionSeverity;
  summary: string;
  detail: string;
  timing?: string;
}

export const SUPPLEMENT_INTERACTIONS: SupplementInteraction[] = [
  {
    supplements: ['Iron', 'Calcium'],
    severity: 'caution',
    summary: 'Calcium inhibits iron absorption by up to 60%',
    detail: 'Calcium and iron compete for the same absorption pathways in the intestine. Taking them together significantly reduces iron bioavailability. This is especially important for those treating iron deficiency anemia.',
    timing: 'Space at least 2 hours apart. Take iron in the morning on an empty stomach and calcium with dinner.',
  },
  {
    supplements: ['Zinc', 'Copper'],
    severity: 'caution',
    summary: 'High-dose zinc depletes copper over time',
    detail: 'Zinc and copper compete for absorption via the same metallothionein pathway. Long-term zinc supplementation above 40mg/day can cause copper deficiency, leading to anemia and neurological issues.',
    timing: 'If taking zinc long-term, add 1-2mg copper daily. Space them 2+ hours apart.',
  },
  {
    supplements: ['Vitamin C', 'B12'],
    severity: 'caution',
    summary: 'High-dose Vitamin C may reduce B12 absorption',
    detail: 'Vitamin C in doses above 500mg can convert some B12 into inactive analogs in the digestive tract, potentially reducing B12 effectiveness. The clinical significance is debated but worth noting for those with B12 deficiency.',
    timing: 'Take B12 in the morning and Vitamin C with lunch or later in the day.',
  },
  {
    supplements: ['Magnesium', 'Antibiotics'],
    severity: 'critical',
    summary: 'Magnesium binds to antibiotics, reducing their effectiveness',
    detail: 'Magnesium chelates with fluoroquinolone and tetracycline antibiotics, forming insoluble complexes that dramatically reduce antibiotic absorption. This can lead to treatment failure.',
    timing: 'Take antibiotics 2 hours before or 6 hours after magnesium supplements.',
  },
  {
    supplements: ['Fish Oil', 'Blood Thinners'],
    severity: 'critical',
    summary: 'Combined anticoagulant effect increases bleeding risk',
    detail: 'Omega-3 fatty acids have natural anti-platelet properties. Combined with blood thinners (warfarin, aspirin, clopidogrel), they can significantly increase bleeding risk, including internal bleeding.',
    timing: 'Consult your doctor before combining. If approved, monitor INR closely and watch for unusual bruising or bleeding.',
  },
  {
    supplements: ['Iron', 'Vitamin C'],
    severity: 'safe',
    summary: 'Vitamin C enhances iron absorption — excellent pairing',
    detail: 'Ascorbic acid converts ferric iron (Fe3+) to ferrous iron (Fe2+), which is much more easily absorbed. This can increase iron absorption by 2-3x, making it the ideal companion for iron supplements.',
    timing: 'Take together for maximum benefit. 200mg Vitamin C is sufficient to enhance absorption.',
  },
  {
    supplements: ['Vitamin D', 'Vitamin K2'],
    severity: 'safe',
    summary: 'Synergistic pairing — K2 directs D3-absorbed calcium to bones',
    detail: 'Vitamin D increases calcium absorption from the gut, while K2 activates osteocalcin (directing calcium to bones) and matrix GLA protein (preventing calcium from depositing in arteries). Together they optimize calcium metabolism.',
    timing: 'Take together with a fat-containing meal for best absorption of both fat-soluble vitamins.',
  },
  {
    supplements: ['Calcium', 'Vitamin D'],
    severity: 'safe',
    summary: 'Vitamin D is essential for calcium absorption',
    detail: 'Vitamin D stimulates the production of calcium-binding proteins in the intestine, dramatically improving calcium absorption. Without adequate D, only 10-15% of dietary calcium is absorbed vs 30-40% with sufficient D.',
    timing: 'Take together with food for optimal absorption.',
  },
  {
    supplements: ['Magnesium', 'Vitamin D'],
    severity: 'safe',
    summary: 'Magnesium is required to activate Vitamin D',
    detail: 'Magnesium is a cofactor for the enzymes that convert Vitamin D to its active form (calcitriol). Without adequate magnesium, Vitamin D remains stored and inactive. This is why some people see no improvement despite D supplementation.',
    timing: 'Can be taken together or at different times of day — both approaches work.',
  },
  {
    supplements: ['Iron', 'Zinc'],
    severity: 'caution',
    summary: 'Iron and zinc compete for absorption',
    detail: 'Both minerals use the DMT1 transporter for absorption. When taken together at high doses, they compete and reduce each other\'s bioavailability by 30-50%.',
    timing: 'Space at least 2 hours apart. Take iron in the morning, zinc with dinner.',
  },
  {
    supplements: ['Curcumin', 'Blood Thinners'],
    severity: 'critical',
    summary: 'Curcumin has anticoagulant properties that compound with blood thinners',
    detail: 'Curcumin inhibits platelet aggregation and has anti-thrombotic effects. Combined with warfarin, aspirin, or other anticoagulants, it increases the risk of bleeding events.',
    timing: 'Avoid combining or consult your prescribing physician. Monitor INR if using both.',
  },
  {
    supplements: ['St. John\'s Wort', 'SSRIs'],
    severity: 'critical',
    summary: 'Risk of serotonin syndrome — a potentially life-threatening condition',
    detail: 'St. John\'s Wort increases serotonin levels through MAO inhibition and serotonin reuptake inhibition. Combined with SSRI antidepressants, this can cause dangerous serotonin excess: agitation, hyperthermia, rapid heart rate, and in severe cases, death.',
    timing: 'Never combine. Wait at least 2 weeks after stopping either before starting the other.',
  },
  {
    supplements: ['Ashwagandha', 'Thyroid Medications'],
    severity: 'caution',
    summary: 'Ashwagandha may increase thyroid hormone levels',
    detail: 'Ashwagandha has been shown to increase T3 and T4 thyroid hormones. For those on levothyroxine or other thyroid medications, this can lead to hyperthyroid symptoms: anxiety, rapid heartbeat, weight loss, and insomnia.',
    timing: 'Take thyroid medication first thing in the morning on an empty stomach. Space ashwagandha by 4+ hours. Monitor thyroid levels regularly.',
  },
  {
    supplements: ['Berberine', 'Metformin'],
    severity: 'critical',
    summary: 'Both lower blood sugar — risk of hypoglycemia',
    detail: 'Berberine activates AMPK similarly to metformin and has comparable blood sugar-lowering effects. Combining them can cause dangerously low blood sugar (hypoglycemia), with symptoms including dizziness, confusion, and loss of consciousness.',
    timing: 'Do not combine without medical supervision. If approved, start with low doses and monitor blood glucose frequently.',
  },
  {
    supplements: ['Melatonin', 'Blood Thinners'],
    severity: 'caution',
    summary: 'Melatonin may enhance anticoagulant effects',
    detail: 'Melatonin has mild anticoagulant properties and may increase the effects of blood thinners. While the interaction is generally mild, it can be significant at higher melatonin doses (5mg+).',
    timing: 'Use the lowest effective melatonin dose (0.5-1mg). Inform your doctor about the combination.',
  },
  {
    supplements: ['NAC', 'Nitroglycerin'],
    severity: 'critical',
    summary: 'NAC potentiates nitroglycerin — risk of severe hypotension',
    detail: 'N-Acetyl Cysteine enhances the vasodilatory effects of nitroglycerin, potentially causing dangerous drops in blood pressure, severe headaches, and dizziness.',
    timing: 'Avoid combining. If you take nitroglycerin, discuss NAC use with your cardiologist.',
  },
  {
    supplements: ['Probiotics', 'Antibiotics'],
    severity: 'caution',
    summary: 'Antibiotics kill probiotic bacteria — timing is crucial',
    detail: 'Antibiotics are designed to kill bacteria and will destroy most probiotic organisms taken simultaneously. However, probiotics during antibiotic courses can reduce antibiotic-associated diarrhea and C. difficile risk.',
    timing: 'Take probiotics 2-3 hours after your antibiotic dose. Continue probiotics for 2 weeks after finishing antibiotics.',
  },
  {
    supplements: ['Vitamin E', 'Blood Thinners'],
    severity: 'critical',
    summary: 'Vitamin E has anticoagulant effects that increase bleeding risk',
    detail: 'Vitamin E (especially above 400 IU) inhibits platelet aggregation and vitamin K-dependent clotting. Combined with warfarin or other blood thinners, it significantly increases bleeding risk.',
    timing: 'Avoid high-dose Vitamin E with blood thinners. If using both, stay under 200 IU and monitor INR regularly.',
  },
  {
    supplements: ['CoQ10', 'Blood Thinners'],
    severity: 'caution',
    summary: 'CoQ10 may reduce warfarin effectiveness',
    detail: 'CoQ10 is structurally similar to vitamin K2 and may counteract warfarin\'s anticoagulant effects, potentially increasing clotting risk. The effect is dose-dependent.',
    timing: 'If on warfarin, maintain a consistent CoQ10 dose and have INR checked more frequently when starting or changing doses.',
  },
  {
    supplements: ['L-Theanine', 'Magnesium'],
    severity: 'safe',
    summary: 'Complementary calming effects — great combination',
    detail: 'L-Theanine promotes alpha brain waves and GABA production while magnesium supports nervous system relaxation through NMDA receptor regulation. Together they provide enhanced calm without drowsiness.',
    timing: 'Take together in the evening for sleep support, or together in the morning for calm focus.',
  },
  {
    supplements: ['Ashwagandha', 'Magnesium'],
    severity: 'safe',
    summary: 'Complementary stress and sleep support',
    detail: 'Ashwagandha modulates the HPA axis and cortisol response while magnesium supports GABA activity and nervous system relaxation. Together they address stress from multiple pathways.',
    timing: 'Take both in the evening for optimal sleep and recovery support.',
  },
  {
    supplements: ['Zinc', 'Probiotics'],
    severity: 'safe',
    summary: 'Zinc supports gut barrier integrity alongside probiotics',
    detail: 'Zinc is essential for maintaining tight junctions in the gut lining while probiotics support the microbiome. Together they provide comprehensive gut support.',
    timing: 'Take zinc with food and probiotics on an empty stomach, spaced apart for best results.',
  },
  {
    supplements: ['B12', 'Folate'],
    severity: 'safe',
    summary: 'Essential pairing for methylation and red blood cell formation',
    detail: 'B12 and folate work together in the methylation cycle and are both required for DNA synthesis and red blood cell production. Supplementing one without the other can mask deficiency of the other.',
    timing: 'Take together in the morning. Use methylated forms (methylcobalamin + methylfolate) for best bioavailability.',
  },
  {
    supplements: ['Iron', 'Coffee'],
    severity: 'caution',
    summary: 'Coffee tannins and polyphenols inhibit iron absorption by up to 80%',
    detail: 'The polyphenolic compounds in coffee bind to non-heme iron and form insoluble complexes, dramatically reducing absorption. Even decaf coffee has this effect.',
    timing: 'Take iron supplements at least 1 hour before or 2 hours after coffee.',
  },
  {
    supplements: ['Selenium', 'Vitamin E'],
    severity: 'safe',
    summary: 'Synergistic antioxidant protection',
    detail: 'Selenium is a cofactor for glutathione peroxidase while Vitamin E is a lipid-soluble antioxidant. Together they provide complementary antioxidant protection — selenium handles water-soluble free radicals while E protects cell membranes.',
    timing: 'Take together with a fat-containing meal.',
  },
  {
    supplements: ['Calcium', 'Magnesium'],
    severity: 'caution',
    summary: 'High calcium can inhibit magnesium absorption',
    detail: 'Calcium and magnesium compete for absorption. A calcium-to-magnesium ratio above 2:1 can impair magnesium absorption and contribute to magnesium deficiency symptoms.',
    timing: 'Take calcium in the morning with breakfast and magnesium in the evening. Maintain a 2:1 or lower Ca:Mg ratio.',
  },
  {
    supplements: ['Vitamin C', 'Iron'],
    severity: 'safe',
    summary: 'Vitamin C dramatically enhances iron absorption',
    detail: 'Ascorbic acid reduces ferric iron to the more bioavailable ferrous form and forms a chelate with iron that remains soluble at intestinal pH, increasing absorption 2-3 fold.',
    timing: 'Take 200-500mg Vitamin C with your iron supplement for maximum absorption.',
  },
  {
    supplements: ['Fish Oil', 'Vitamin D'],
    severity: 'safe',
    summary: 'The fat in fish oil enhances Vitamin D absorption',
    detail: 'Vitamin D is fat-soluble and requires dietary fat for optimal absorption. The omega-3 fatty acids in fish oil serve as an excellent vehicle for D absorption while providing complementary anti-inflammatory benefits.',
    timing: 'Take together with breakfast for convenient, synergistic benefits.',
  },
  {
    supplements: ['Ginkgo Biloba', 'Blood Thinners'],
    severity: 'critical',
    summary: 'Ginkgo has anti-platelet effects that increase bleeding risk',
    detail: 'Ginkgo biloba inhibits platelet-activating factor (PAF) and has demonstrated anticoagulant properties. Combined with blood thinners, it increases the risk of bleeding, including intracranial hemorrhage.',
    timing: 'Avoid this combination. Discontinue ginkgo at least 2 weeks before any surgery.',
  },
  {
    supplements: ['Turmeric', 'Iron'],
    severity: 'caution',
    summary: 'Turmeric may reduce iron absorption',
    detail: 'Curcumin in turmeric acts as an iron chelator and can reduce iron absorption when taken together. This is beneficial in iron overload but counterproductive when treating iron deficiency.',
    timing: 'Space turmeric/curcumin and iron supplements at least 3 hours apart.',
  },
  {
    supplements: ['Lions Mane', 'Blood Thinners'],
    severity: 'caution',
    summary: 'Lions Mane may have mild antiplatelet effects',
    detail: 'Lions Mane mushroom contains hericenone B which has shown anti-platelet aggregation activity in vitro. While the clinical significance is uncertain, caution is warranted with anticoagulants.',
    timing: 'Inform your doctor if combining. Monitor for unusual bruising or bleeding.',
  },
];

export const ALL_SUPPLEMENT_NAMES: string[] = [
  'Iron', 'Calcium', 'Zinc', 'Copper', 'Magnesium', 'Selenium',
  'Vitamin C', 'Vitamin D', 'Vitamin D3', 'Vitamin E', 'Vitamin K2',
  'B12', 'Folate', 'Vitamin B Complex',
  'Fish Oil', 'Omega-3', 'CoQ10', 'NAC',
  'Curcumin', 'Turmeric', 'Berberine', 'Ashwagandha',
  'Probiotics', 'L-Theanine', 'Melatonin',
  'Lions Mane', 'Rhodiola', 'Ginkgo Biloba',
  'St. John\'s Wort', 'Valerian',
  'Blood Thinners', 'SSRIs', 'Thyroid Medications',
  'Metformin', 'Nitroglycerin', 'Antibiotics', 'Coffee',
];

export function findInteractions(selectedSupplements: string[]): SupplementInteraction[] {
  if (selectedSupplements.length < 2) return [];

  const lowerSelected = selectedSupplements.map(s => s.toLowerCase());
  const results: SupplementInteraction[] = [];

  for (const interaction of SUPPLEMENT_INTERACTIONS) {
    const [a, b] = interaction.supplements.map(s => s.toLowerCase());
    const hasA = lowerSelected.some(s => s.includes(a) || a.includes(s));
    const hasB = lowerSelected.some(s => s.includes(b) || b.includes(s));
    if (hasA && hasB) {
      results.push(interaction);
    }
  }

  return results;
}

export function getInteractionSummary(interactions: SupplementInteraction[]): {
  safe: number;
  caution: number;
  critical: number;
} {
  return {
    safe: interactions.filter(i => i.severity === 'safe').length,
    caution: interactions.filter(i => i.severity === 'caution').length,
    critical: interactions.filter(i => i.severity === 'critical').length,
  };
}
