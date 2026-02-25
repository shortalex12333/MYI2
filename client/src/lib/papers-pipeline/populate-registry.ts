/**
 * Populate reference_registry null values
 *
 * Run: cd client && npx tsx src/lib/papers-pipeline/populate-registry.ts
 */

import { db } from './db';

interface RegistryUpdate {
  ref_id: string;
  short_title: string;
  url: string;
}

// All 35 rows that need population
const UPDATES: RegistryUpdate[] = [
  // ═══════════════════════════════════════════════════════════════════
  // 10 SKELETON ROWS (both short_title and url were null)
  // ═══════════════════════════════════════════════════════════════════
  {
    ref_id: 'SOLAS-CH2-REG19',
    short_title: 'SOLAS Chapter II-1 Regulation 19',
    url: 'https://imorules.com/SOLAS_REGII-1.html',
  },
  {
    ref_id: 'IMO-MSC-CIRC-1321',
    short_title: 'IMO MSC.1/Circ.1321 (ECDIS Guidance)',
    url: 'https://wwwcdn.imo.org/localresources/en/OurWork/Safety/Documents/ECDIS/MSC.1-Circ.1503-Rev.1.pdf',
  },
  {
    ref_id: 'ISM-CODE-SEC9',
    short_title: 'ISM Code Section 9 (Reports and Analysis)',
    url: 'https://www.classnk.or.jp/hp/pdf/activities/statutory/ism/ism_cd/ism-code-e.pdf',
  },
  {
    ref_id: 'IACS-UR-A2',
    short_title: 'IACS Unified Requirement A2 (Shipboard Fittings)',
    url: 'https://ww2.eagle.org/content/dam/eagle/regulatory-news/2022/IACS-UR-A2.pdf',
  },
  {
    ref_id: 'ABS-GUIDE-HOTWORK-2023',
    short_title: 'ABS Guidance Notes on Fire-Fighting Systems',
    url: 'https://ww2.eagle.org/en/rules-and-resources/rules-and-guides.html',
  },
  {
    ref_id: 'DNV-RU-SHIP-PT1-CH3',
    short_title: 'DNV Rules for Ships Part 1 Chapter 3',
    url: 'https://www.dnv.com/rules-standards/index.html',
  },
  {
    ref_id: 'LR-RULES-2024-PT1-CH2',
    short_title: 'Lloyd\'s Register Rules Part 1 Chapter 2',
    url: 'https://www.lr.org/en/knowledge/lloyds-register-rules/rules-and-regulations-for-the-classification-of-ships/',
  },
  {
    ref_id: 'NFPA-51B-2024',
    short_title: 'NFPA 51B: Fire Prevention During Welding, Cutting, and Hot Work',
    url: 'https://www.nfpa.org/codes-and-standards/nfpa-51b-standard-development/51b',
  },
  {
    ref_id: 'OSHA-1915-SUBPART-D',
    short_title: 'OSHA 29 CFR 1915 Subpart D (Welding, Cutting, Heating)',
    url: 'https://www.osha.gov/laws-regs/regulations/standardnumber/1915/1915SubpartD',
  },
  {
    ref_id: 'IMO-FSS-CODE-CH7',
    short_title: 'IMO FSS Code Chapter 7 (Water-Spraying Systems)',
    url: 'https://wwwcdn.imo.org/localresources/en/KnowledgeCentre/IndexofIMOResolutions/MSCResolutions/MSC.98(73).pdf',
  },

  // ═══════════════════════════════════════════════════════════════════
  // 5 ROWS MISSING short_title (had url only)
  // ═══════════════════════════════════════════════════════════════════
  {
    ref_id: 'AWS-D36M-2017',
    short_title: 'AWS D3.6M:2017 Underwater Welding Code',
    url: 'https://pubs.aws.org/Download_PDFS/D3.6M-2017PV.pdf',
  },
  {
    ref_id: 'MCA-MGN-280',
    short_title: 'MCA Marine Guidance Note 280',
    url: 'https://assets.publishing.service.gov.uk/media/5f23e4bbd3bf7f1b0a3a7f1e/MGN_280.pdf',
  },
  {
    ref_id: 'HSE-HSG-168',
    short_title: 'HSE HSG168: Fire Safety in Construction',
    url: 'https://www.hse.gov.uk/pubns/priced/hsg168.pdf',
  },
  {
    ref_id: 'BV-NR500-2024-PT2-CH6',
    short_title: 'Bureau Veritas NR 500 Part 2 Chapter 6',
    url: 'https://erules.veristar.com/dy/data/bv/pdf/500-NR_2024-10.pdf',
  },
  {
    ref_id: 'ICOMIA-REFIT-STD-2021',
    short_title: 'ICOMIA Superyacht Refit Standard 2021',
    url: 'https://www.icomia.org/icomia-superyacht-refit-group-2025/',
  },

  // ═══════════════════════════════════════════════════════════════════
  // 20 ROWS MISSING url (had short_title only)
  // ═══════════════════════════════════════════════════════════════════
  {
    ref_id: 'NFPA-303',
    short_title: 'NFPA 303: Fire Protection for Marinas and Boatyards',
    url: 'https://www.nfpa.org/codes-and-standards/nfpa-303-standard-development/303',
  },
  {
    ref_id: 'USCG-CFR46-PT26',
    short_title: '46 CFR Part 26: Operations (Uninspected Vessels)',
    url: 'https://www.ecfr.gov/current/title-46/chapter-I/subchapter-C/part-26',
  },
  {
    ref_id: 'OPA-90',
    short_title: 'Oil Pollution Act of 1990',
    url: 'https://www.govinfo.gov/content/pkg/COMPS-2991/pdf/COMPS-2991.pdf',
  },
  {
    ref_id: 'YORK-ANTWERP-2016',
    short_title: 'York-Antwerp Rules 2016 (General Average)',
    url: 'https://comitemaritime.org/wp-content/uploads/2018/06/2016-York-Antwerp-Rules-with-Rule-XVII-correction.pdf',
  },
  {
    ref_id: 'MLC-2006',
    short_title: 'Maritime Labour Convention, 2006',
    url: 'https://www.ilo.org/international-labour-standards/maritime-labour-convention-2006',
  },
  {
    ref_id: 'FL-STAT-327-53',
    short_title: 'Florida Statute 327.53 (Marine Sanitation)',
    url: 'https://www.leg.state.fl.us/Statutes/index.cfm?App_mode=Display_Statute&URL=0300-0399/0327/0327.html',
  },
  {
    ref_id: 'ABYC-H2',
    short_title: 'ABYC H-2: Ventilation of Boats Using Gasoline',
    url: 'https://law.resource.org/pub/us/cfr/ibr/001/abyc.H-02.1989.pdf',
  },
  {
    ref_id: 'ICA-2015',
    short_title: 'Insurance Act 2015 (UK)',
    url: 'https://www.legislation.gov.uk/ukpga/2015/4/pdfs/ukpga_20150004_en.pdf',
  },
  {
    ref_id: 'MIA-1906',
    short_title: 'Marine Insurance Act 1906 (UK)',
    url: 'https://www.legislation.gov.uk/ukpga/1906/41/pdfs/ukpga_19060041_en.pdf',
  },
  {
    ref_id: 'ITC-H-1983',
    short_title: 'Institute Time Clauses Hulls (1.10.83)',
    url: 'https://www.fortunes-de-mer.com/documents%20pdf/polices%20corps/Etrangeres/Royaume%20Uni/Institute%20Time%20Clauses%20Hulls%201.10.83.pdf',
  },
  {
    ref_id: 'IYIC-1985',
    short_title: 'Institute Yacht Clauses (1.11.85)',
    url: 'https://www.fortunes-de-mer.com/documents%20pdf/polices%20corps/Etrangeres/Royaume%20Uni/Institute%20Yacht%20Clauses%201.11.85.pdf',
  },
  {
    ref_id: 'IACS-UR-W',
    short_title: 'IACS Unified Requirements W (Welding)',
    url: 'https://iacs.org.uk/resolutions/unified-requirements/ur-w/',
  },
  {
    ref_id: 'IHC-2003',
    short_title: 'International Hull Clauses (01.11.03)',
    url: 'http://www.fortunes-de-mer.com/documents%20pdf/polices%20corps/Etrangeres/Royaume%20Uni/International%20Hull%20Clauses%202003.pdf',
  },
  {
    ref_id: 'CTL-CLAUSE',
    short_title: 'Constructive Total Loss (MIA 1906 s.60)',
    url: 'https://www.legislation.gov.uk/ukpga/1906/41/section/60',
  },
  {
    ref_id: 'LSW-3000',
    short_title: 'LMA/IUA Named Storm Deductible Clause (LSW 3000)',
    url: 'https://www.lmalloyds.com/LMA/Wordings/Marine/Marine_Cargo/LMA_Marine_Cargo_Clauses.aspx',
  },
  {
    ref_id: 'LLOYDS-OPEN-FORM',
    short_title: 'Lloyd\'s Standard Form of Salvage Agreement (LOF 2020)',
    url: 'https://www.lloyds.com/market-resources/salvage-arbitration-branch/lloyds-open-form-lof',
  },
  {
    ref_id: 'SALVAGE-CONV-1989',
    short_title: 'International Convention on Salvage 1989',
    url: 'https://www.dco.uscg.mil/Portals/9/CG-5R/nsarc/Convention%20-%20Salvage%20(1989).pdf',
  },
  {
    ref_id: 'IYIC-CLAUSE-10',
    short_title: 'Institute Yacht Clauses (1.11.85) Clause 10',
    url: 'https://www.fortunes-de-mer.com/documents%20pdf/polices%20corps/Etrangeres/Royaume%20Uni/Institute%20Yacht%20Clauses%201.11.85.pdf',
  },
  {
    ref_id: '46-CFR-10',
    short_title: '46 CFR Part 10: Merchant Mariner Credential',
    url: 'https://www.ecfr.gov/current/title-46/chapter-I/subchapter-B/part-10',
  },
  {
    ref_id: 'TOWCON-2008',
    short_title: 'BIMCO TOWCON 2008',
    url: 'https://www.bimco.org/contracts-and-clauses/bimco-contracts/towcon',
  },
];

async function populateRegistry() {
  console.log('Populating reference_registry with 35 missing values...\n');

  let updated = 0;
  let failed = 0;

  for (const update of UPDATES) {
    const { error } = await db
      .from('reference_registry')
      .update({
        short_title: update.short_title,
        url: update.url,
      })
      .eq('ref_id', update.ref_id);

    if (error) {
      console.log(`✗ ${update.ref_id}: ${error.message}`);
      failed++;
    } else {
      console.log(`✓ ${update.ref_id}`);
      updated++;
    }
  }

  console.log('\n' + '─'.repeat(50));
  console.log(`Updated: ${updated}`);
  console.log(`Failed:  ${failed}`);

  // Verify no more nulls
  const { data: remaining } = await db
    .from('reference_registry')
    .select('ref_id')
    .or('short_title.is.null,url.is.null');

  console.log(`\nRemaining null rows: ${remaining?.length ?? 0}`);

  process.exit(0);
}

populateRegistry();
