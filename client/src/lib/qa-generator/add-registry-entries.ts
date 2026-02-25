/**
 * Add new registry entries for claims_denial, hull_damage, total_loss, deductible, salvage, towing
 */
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://gelaikvydtlktpsryucc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlbGFpa3Z5ZHRsa3Rwc3J5dWNjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjk5MDk3NCwiZXhwIjoyMDc4NTY2OTc0fQ.Yni4c8vfWMaGTgDJ6WU9RELyo-SceREahZUFg8OLr8w'
);

const entries = [
  // CLAIMS DENIAL
  {
    ref_id: 'ICA-2015',
    title: 'Insurance Act 2015',
    publisher: 'UK Parliament',
    short_title: 'Insurance Act 2015',
    source_url: 'https://www.legislation.gov.uk/ukpga/2015/4',
    citation_category: 'legal',
    cluster_tags: ['claims', 'claims-denial', 'non-disclosure', 'policy'],
    jurisdiction: 'uk',
    quality_tier: 'primary',
    is_active: true,
    description: 'Duty of fair presentation, s.3-8'
  },
  {
    ref_id: 'MIA-1906',
    title: 'Marine Insurance Act 1906',
    publisher: 'UK Parliament',
    short_title: 'Marine Insurance Act 1906',
    source_url: 'https://www.legislation.gov.uk/ukpga/Edw7/6/41',
    citation_category: 'legal',
    cluster_tags: ['claims', 'claims-denial', 'policy', 'total-loss', 'hull'],
    jurisdiction: 'global',
    quality_tier: 'primary',
    is_active: true,
    description: 'Utmost good faith s.17, warranty breach s.33-34'
  },
  {
    ref_id: 'ITC-H-1983',
    title: 'Institute Time Clauses Hulls 1983',
    publisher: 'IUA/LMA',
    short_title: 'Institute Time Clauses Hulls (1.10.83)',
    source_url: 'https://www.lmalloyds.com',
    citation_category: 'framework',
    cluster_tags: ['claims', 'hull', 'hull-damage', 'total-loss', 'deductible'],
    jurisdiction: 'global',
    quality_tier: 'primary',
    is_active: true,
    description: 'Standard hull time clauses, claims procedure'
  },
  {
    ref_id: 'IYIC-1985',
    title: 'Institute Yacht Clauses 1985',
    publisher: 'IUA/LMA',
    short_title: 'Institute Yacht Clauses (1.11.85)',
    source_url: 'https://www.lmalloyds.com',
    citation_category: 'framework',
    cluster_tags: ['claims', 'claims-denial', 'hull', 'deductible', 'racing', 'policy'],
    jurisdiction: 'global',
    quality_tier: 'primary',
    is_active: true,
    description: 'Standard yacht clauses, racing exclusion clause 12'
  },
  // HULL DAMAGE
  {
    ref_id: 'IACS-UR-W',
    title: 'IACS Unified Requirements W',
    publisher: 'IACS',
    short_title: 'IACS Unified Requirements W (Welding)',
    source_url: 'https://iacs.org.uk/resolutions/unified-requirements/',
    citation_category: 'class',
    cluster_tags: ['hull', 'hull-damage', 'hull-repair', 'construction'],
    jurisdiction: 'global',
    quality_tier: 'primary',
    is_active: true,
    description: 'Hull construction and repair standards'
  },
  {
    ref_id: 'IHC-2003',
    title: 'International Hull Clauses 2003',
    publisher: 'IUA/LMA',
    short_title: 'International Hull Clauses (01.11.03)',
    source_url: 'https://www.lmalloyds.com',
    citation_category: 'framework',
    cluster_tags: ['hull', 'hull-damage', 'total-loss', 'deductible', 'claims'],
    jurisdiction: 'global',
    quality_tier: 'primary',
    is_active: true,
    description: 'Modern hull clauses replacing ITC-H for larger vessels'
  },
  // TOTAL LOSS
  {
    ref_id: 'CTL-CLAUSE',
    title: 'Constructive Total Loss',
    publisher: 'Marine Insurance Act 1906',
    short_title: 'Marine Insurance Act 1906 s.60 (Constructive Total Loss)',
    source_url: 'https://www.legislation.gov.uk/ukpga/Edw7/6/41/section/60',
    citation_category: 'legal',
    cluster_tags: ['total-loss', 'hull', 'claims', 'valuation'],
    jurisdiction: 'global',
    quality_tier: 'primary',
    is_active: true,
    description: 'CTL threshold: repair cost exceeds repaired value'
  },
  // DEDUCTIBLE
  {
    ref_id: 'LSW-3000',
    title: 'LSW 3000 Named Storm Deductible',
    publisher: "Lloyd's Market Association",
    short_title: 'LMA/IUA Named Storm Deductible Clause (LSW 3000)',
    source_url: 'https://www.lmalloyds.com',
    citation_category: 'framework',
    cluster_tags: ['deductible', 'hurricane', 'storm', 'claims'],
    jurisdiction: 'us',
    quality_tier: 'primary',
    is_active: true,
    description: 'Named storm deductible structure, US waters'
  },
  // SALVAGE
  {
    ref_id: 'LLOYDS-OPEN-FORM',
    title: "Lloyd's Standard Form of Salvage Agreement",
    publisher: "Lloyd's",
    short_title: "Lloyd's Standard Form of Salvage Agreement (LOF 2020)",
    source_url: 'https://www.lloyds.com/salvage',
    citation_category: 'framework',
    cluster_tags: ['salvage', 'towing', 'operations', 'claims'],
    jurisdiction: 'global',
    quality_tier: 'primary',
    is_active: true,
    description: 'No cure no pay salvage, SCOPIC rider'
  },
  {
    ref_id: 'SALVAGE-CONV-1989',
    title: 'International Salvage Convention 1989',
    publisher: 'IMO',
    short_title: 'International Convention on Salvage 1989',
    source_url: 'https://www.imo.org',
    citation_category: 'legal',
    cluster_tags: ['salvage', 'operations', 'liability'],
    jurisdiction: 'global',
    quality_tier: 'primary',
    is_active: true,
    description: 'Salvage reward, special compensation'
  },
  // NON-DISCLOSURE / CLAIMS DENIAL
  {
    ref_id: 'IYIC-CLAUSE-10',
    title: 'IYIC Clause 10 - Change of Risk',
    publisher: 'IUA/LMA',
    short_title: 'Institute Yacht Clauses (1.11.85) Clause 10',
    source_url: 'https://www.lmalloyds.com',
    citation_category: 'framework',
    cluster_tags: ['claims-denial', 'non-disclosure', 'policy-void', 'policy'],
    jurisdiction: 'global',
    quality_tier: 'primary',
    is_active: true,
    description: 'Held covered provisions, change of risk'
  },
  // TOWING
  {
    ref_id: '46-CFR-10',
    title: '46 CFR Part 10 - Merchant Mariner Credentials',
    publisher: 'USCG',
    short_title: '46 CFR Part 10',
    source_url: 'https://www.ecfr.gov/current/title-46/chapter-I/subchapter-B/part-10',
    citation_category: 'legal',
    cluster_tags: ['towing', 'operations', 'crew'],
    jurisdiction: 'us',
    quality_tier: 'primary',
    is_active: true,
    description: 'Credentialing for towing vessel operators'
  },
  {
    ref_id: 'TOWCON-2008',
    title: 'TOWCON 2008 International Towage Agreement',
    publisher: 'BIMCO',
    short_title: 'BIMCO TOWCON 2008',
    source_url: 'https://www.bimco.org',
    citation_category: 'framework',
    cluster_tags: ['towing', 'salvage', 'operations', 'liability'],
    jurisdiction: 'global',
    quality_tier: 'primary',
    is_active: true,
    description: 'Standard towage contract, liability allocation'
  }
];

async function addEntries() {
  console.log(`Adding ${entries.length} registry entries...`);

  for (const entry of entries) {
    const { error } = await supabase
      .from('reference_registry')
      .upsert(entry, { onConflict: 'ref_id' });

    if (error) {
      console.error(`Failed to add ${entry.ref_id}:`, error.message);
    } else {
      console.log(`Added: ${entry.ref_id}`);
    }
  }

  // Verify count
  const { count } = await supabase
    .from('reference_registry')
    .select('*', { count: 'exact', head: true });

  console.log(`\nTotal registry entries: ${count}`);
}

addEntries();
