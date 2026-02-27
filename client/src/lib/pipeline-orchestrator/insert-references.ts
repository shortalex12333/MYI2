/**
 * Insert Reference Registry Entries
 * Compiled from 18 parallel research agents
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Missing Supabase credentials');
}

const db = createClient(SUPABASE_URL, SUPABASE_KEY);

interface Reference {
  title: string;
  url: string;
  org: string;
  doc_type: string;
  cluster_tags: string[];
  quality_tier: string;
}

const references: Reference[] = [
  // === HURRICANE-STORM: NOAA/NHC ===
  {"title": "NHC Tropical Cyclone Text Product Descriptions", "url": "https://www.nhc.noaa.gov/aboutnhcprod.shtml", "org": "National Hurricane Center", "doc_type": "guidance", "cluster_tags": ["hurricane-storm"], "quality_tier": "primary"},
  {"title": "Storm Surge Products", "url": "https://www.nhc.noaa.gov/surge/products.php", "org": "National Hurricane Center", "doc_type": "guidance", "cluster_tags": ["hurricane-storm"], "quality_tier": "primary"},
  {"title": "NHC Marine Forecasts & Analyses", "url": "https://www.nhc.noaa.gov/marine/", "org": "National Hurricane Center", "doc_type": "guidance", "cluster_tags": ["hurricane-storm"], "quality_tier": "primary"},

  // === HURRICANE-STORM: BIMCO ===
  {"title": "Weather Routeing Clause for Time Charter Parties 2006", "url": "https://www.bimco.org/contracts-and-clauses/bimco-clauses/current/weather_routeing_clause_for_time_charter_parties_2006", "org": "BIMCO", "doc_type": "standard", "cluster_tags": ["hurricane-storm"], "quality_tier": "primary"},
  {"title": "Lay-Up Clause", "url": "https://www.bimco.org/contracts-and-clauses/bimco-clauses/current/lay_up_clause", "org": "BIMCO", "doc_type": "standard", "cluster_tags": ["hurricane-storm"], "quality_tier": "primary"},
  {"title": "Ice Clause for Voyage Charter Parties 2005", "url": "https://www.bimco.org/contractual-affairs/bimco-clauses/current-clauses/ice_clause_general_for_voyage_charter_parties_2005/", "org": "BIMCO", "doc_type": "standard", "cluster_tags": ["hurricane-storm"], "quality_tier": "primary"},

  // === CLAIMS-DISPUTES: Lloyd's ===
  {"title": "Lloyd's Claims Lead Arrangements", "url": "https://assets.lloyds.com/media/fb046027-6fe3-4410-ada9-e5ff9e6039b0/Lloyds-Claims-Lead-Arrangements-0523.pdf", "org": "Lloyd's of London", "doc_type": "standard", "cluster_tags": ["claims-disputes"], "quality_tier": "primary"},
  {"title": "Guidance on the Lloyd's Claims Lead Arrangements", "url": "https://assets.lloyds.com/media/722c1caa-960f-43c9-a210-3635038f25d7/Guidance-on-the-Lloyds-Claims-Lead-Arrangements-0523.pdf", "org": "Lloyd's of London", "doc_type": "guidance", "cluster_tags": ["claims-disputes"], "quality_tier": "primary"},
  {"title": "CLA Summary December 2024", "url": "https://assets.lloyds.com/media/df8d4986-2246-4a88-b7fa-f5ed75232a2d/CLA%20summary%20December%202024.pdf", "org": "Lloyd's of London", "doc_type": "guidance", "cluster_tags": ["claims-disputes"], "quality_tier": "primary"},

  // === CLAIMS-DISPUTES: P&I Clubs ===
  {"title": "Gard Guidance on Maritime Claims and Insurance", "url": "https://assets.ctfassets.net/dm3vx1xfnqvh/2Ds7mlTgVDqo5zkGaT2VLb/d6a32e76a2327c10797c2ef59e211b01/Handbooks_Gard_Guidance_on_Maritime_Claims_final.pdf", "org": "Gard P&I Club", "doc_type": "guidance", "cluster_tags": ["claims-disputes"], "quality_tier": "primary"},
  {"title": "UK P&I Club Rules 2025", "url": "https://www.ukpandi.com/fileadmin/uploads/ukpandi/Documents/uk-p-i-club/rules/2025/Main_Rules_2025.pdf", "org": "UK P&I Club", "doc_type": "regulation", "cluster_tags": ["claims-disputes"], "quality_tier": "primary"},
  {"title": "West of England P&I Club Claims Guide: Bills of Lading - Cargo Shortage Claims", "url": "https://www.westpandi.com/getattachment/2a5020b5-97b5-4dcb-9068-b44cf5606c2d/p-i_guide_bills_of_lading_4_4pp_v2_lr.pdf", "org": "West of England P&I Club", "doc_type": "guidance", "cluster_tags": ["claims-disputes"], "quality_tier": "primary"},

  // === CLAIMS-DISPUTES: Legal/Arbitration ===
  {"title": "LMAA Terms 2021", "url": "https://lmaa.london/wp-content/uploads/2021/04/LMAA-Terms-2021.pdf", "org": "London Maritime Arbitrators Association", "doc_type": "standard", "cluster_tags": ["claims-disputes"], "quality_tier": "primary"},
  {"title": "Marine Insurance Act 1906", "url": "https://www.legislation.gov.uk/ukpga/Edw7/6/41", "org": "UK Government (The National Archives)", "doc_type": "regulation", "cluster_tags": ["claims-disputes"], "quality_tier": "primary"},
  {"title": "Lloyd's Arbitration Scheme Guidance Notes", "url": "https://www.lloyds.com/market-resources/complaints/las-guidance-notes", "org": "Lloyd's of London", "doc_type": "guidance", "cluster_tags": ["claims-disputes"], "quality_tier": "primary"},

  // === SHIPYARD-REFIT: IACS ===
  {"title": "IACS Recommendation 47 - Shipbuilding and Repair Quality Standard", "url": "https://iacs.s3.af-south-1.amazonaws.com/wp-content/uploads/2025/10/20150153/Rec-47-Rev.10-Corr.1-Oct-2025-CLN.pdf", "org": "International Association of Classification Societies (IACS)", "doc_type": "standard", "cluster_tags": ["shipyard-refit"], "quality_tier": "primary"},
  {"title": "IACS UR Z10.2 - Hull Surveys of Bulk Carriers", "url": "https://www.classnk.or.jp/hp/pdf/info_service/iacs_ur_and_ui/ur_z10.2_rev.37_feb_2023ul.pdf", "org": "International Association of Classification Societies (IACS)", "doc_type": "regulation", "cluster_tags": ["shipyard-refit"], "quality_tier": "primary"},
  {"title": "IACS UR Z10.1 - Hull Surveys of Oil Tankers", "url": "https://www.classnk.or.jp/hp/pdf/info_service/iacs_ur_and_ui/ur_z10.1_rev.25_feb_2023ul.pdf", "org": "International Association of Classification Societies (IACS)", "doc_type": "regulation", "cluster_tags": ["shipyard-refit"], "quality_tier": "primary"},

  // === SHIPYARD-REFIT: Classification Societies ===
  {"title": "NR500 Rules for the Classification and the Certification of Yachts", "url": "https://marine-offshore.bureauveritas.com/nr500-rules-classification-and-certification-yachts", "org": "Bureau Veritas", "doc_type": "standard", "cluster_tags": ["shipyard-refit"], "quality_tier": "primary"},
  {"title": "Rules and Regulations for the Classification of Special Service Craft", "url": "https://www.lr.org/en/knowledge/lloyds-register-rules/rules-and-regulations-for-the-classification-of-special-service-craft/", "org": "Lloyd's Register", "doc_type": "standard", "cluster_tags": ["shipyard-refit"], "quality_tier": "primary"},
  {"title": "DNV Rules for Classification: Yachts", "url": "https://www.dnv.com/rules-standards/", "org": "DNV", "doc_type": "standard", "cluster_tags": ["shipyard-refit"], "quality_tier": "primary"},

  // === SHIPYARD-REFIT: Hot Work/Safety ===
  {"title": "29 CFR 1915.504 - Fire Watches", "url": "https://www.osha.gov/laws-regs/regulations/standardnumber/1915/1915.504", "org": "Occupational Safety and Health Administration (OSHA)", "doc_type": "regulation", "cluster_tags": ["shipyard-refit"], "quality_tier": "primary"},
  {"title": "NFPA 312: Standard for Fire Protection of Vessels During Construction, Conversion, Repair, and Lay-Up", "url": "https://www.nfpa.org/product/nfpa-312-standard/p0312code", "org": "National Fire Protection Association (NFPA)", "doc_type": "standard", "cluster_tags": ["shipyard-refit"], "quality_tier": "primary"},
  {"title": "SOLAS Chapter II-2: Construction - Fire Protection, Fire Detection and Fire Extinction", "url": "https://www.imo.org/en/ourwork/safety/pages/summaryofsolaschapterii-2-default.aspx", "org": "International Maritime Organization (IMO)", "doc_type": "regulation", "cluster_tags": ["shipyard-refit"], "quality_tier": "primary"},

  // === CHARTER-COMMERCIAL: BIMCO Forms ===
  {"title": "BARECON 2017 - Standard Bareboat Charter", "url": "https://www.bimco.org/contractual-affairs/bimco-contracts/contracts/barecon-2017/", "org": "BIMCO", "doc_type": "form", "cluster_tags": ["charter-commercial"], "quality_tier": "primary"},
  {"title": "SUPPLYTIME 2017 - Time Charter Party for Offshore Support Vessels", "url": "https://www.bimco.org/contractual-affairs/bimco-contracts/contracts/supplytime-2017/", "org": "BIMCO", "doc_type": "form", "cluster_tags": ["charter-commercial"], "quality_tier": "primary"},
  {"title": "BALTIME 1939 (as revised 2001) - Standard Time Charter Party", "url": "https://www.bimco.org/contracts-and-clauses/bimco-contracts/baltime-1939-as-revised-2001", "org": "BIMCO", "doc_type": "form", "cluster_tags": ["charter-commercial"], "quality_tier": "primary"},

  // === CHARTER-COMMERCIAL: MCA ===
  {"title": "Red Ensign Group yacht code", "url": "https://www.gov.uk/government/publications/red-ensign-group-yacht-code", "org": "Maritime and Coastguard Agency", "doc_type": "regulation", "cluster_tags": ["charter-commercial"], "quality_tier": "primary"},
  {"title": "MSN 1895 (M) The Red Ensign Group (REG) Yacht Code Part A", "url": "https://www.gov.uk/government/publications/msn-1895-m-the-red-ensign-group-reg-yacht-code-part-a", "org": "Maritime and Coastguard Agency", "doc_type": "guidance", "cluster_tags": ["charter-commercial"], "quality_tier": "primary"},
  {"title": "LY3: the large commercial yacht code", "url": "https://www.gov.uk/government/publications/ly3-the-large-commercial-yacht-code", "org": "Maritime and Coastguard Agency", "doc_type": "regulation", "cluster_tags": ["charter-commercial"], "quality_tier": "primary"},

  // === CHARTER-COMMERCIAL: Flag State ===
  {"title": "Red Ensign Group Yacht Code Part A (July 2024 Edition)", "url": "https://www.redensigngroup.org/media/yzlbtkyi/reg-yc-july-2024-edition-part-a.pdf", "org": "Red Ensign Group", "doc_type": "regulation", "cluster_tags": ["charter-commercial"], "quality_tier": "primary"},
  {"title": "Marshall Islands Yacht Code 2021", "url": "https://www.register-iri.com/wp-content/uploads/MI-103-2021.pdf", "org": "Republic of the Marshall Islands Maritime Administrator", "doc_type": "regulation", "cluster_tags": ["charter-commercial"], "quality_tier": "primary"},
  {"title": "Malta Commercial Yacht Code (CYC) 2025", "url": "https://www.transport.gov.mt/maritime/ship-and-yacht-registry/superyacht-registration/commercial-yacht-code-2325", "org": "Transport Malta Merchant Shipping Directorate", "doc_type": "regulation", "cluster_tags": ["charter-commercial"], "quality_tier": "primary"},

  // === CREW-LIABILITY: MLC/ILO ===
  {"title": "Maritime Labour Convention, 2006, as amended (MLC, 2006) - Full Text", "url": "https://www.ilo.org/media/269841/download", "org": "International Labour Organization (ILO)", "doc_type": "regulation", "cluster_tags": ["crew-liability"], "quality_tier": "primary"},
  {"title": "Maritime Labour Convention, 2006 - ILO Official Portal", "url": "https://www.ilo.org/international-labour-standards/maritime-labour-convention-2006", "org": "International Labour Organization (ILO)", "doc_type": "guidance", "cluster_tags": ["crew-liability"], "quality_tier": "primary"},
  {"title": "Text and Preparatory Reports of the Maritime Labour Convention, 2006", "url": "https://www.ilo.org/international-labour-standards/maritime-labour-convention-2006-0/text-and-preparatory-reports-maritime-labour-convention-2006", "org": "International Labour Organization (ILO)", "doc_type": "standard", "cluster_tags": ["crew-liability"], "quality_tier": "primary"},

  // === CREW-LIABILITY: P&I/STCW ===
  {"title": "International Convention on Standards of Training, Certification and Watchkeeping for Seafarers (STCW), 1978", "url": "https://www.imo.org/en/ourwork/humanelement/pages/stcw-convention.aspx", "org": "International Maritime Organization (IMO)", "doc_type": "regulation", "cluster_tags": ["crew-liability"], "quality_tier": "primary"},
  {"title": "Gard Guidance to Rule 27: Liabilities in Respect of Crew", "url": "https://gard.no/rules-statutes-and-guidances/document/risks-covered-rule-27-liabilities-in-respect-of-crew/", "org": "Gard P&I Club", "doc_type": "guidance", "cluster_tags": ["crew-liability"], "quality_tier": "primary"},
  {"title": "UK P&I Club Guide to People Claims", "url": "https://www.ukpandi.com/fileadmin/uploads/ukpandi/Documents/uk-p-i-club/brochures/uk-guide-to-people-claims-feb-22-web.pdf", "org": "UK P&I Club", "doc_type": "guidance", "cluster_tags": ["crew-liability"], "quality_tier": "primary"},

  // === CREW-LIABILITY: USCG CFR ===
  {"title": "46 CFR Part 15 - Manning Requirements", "url": "https://www.ecfr.gov/current/title-46/chapter-I/subchapter-B/part-15", "org": "U.S. Coast Guard / Code of Federal Regulations", "doc_type": "regulation", "cluster_tags": ["crew-liability"], "quality_tier": "primary"},
  {"title": "46 CFR Part 10 - Merchant Mariner Credential", "url": "https://www.ecfr.gov/current/title-46/chapter-I/subchapter-B/part-10", "org": "U.S. Coast Guard / Code of Federal Regulations", "doc_type": "regulation", "cluster_tags": ["crew-liability"], "quality_tier": "primary"},
  {"title": "46 CFR Part 11 - Requirements for Officer Endorsements", "url": "https://www.ecfr.gov/current/title-46/chapter-I/subchapter-B/part-11", "org": "U.S. Coast Guard / Code of Federal Regulations", "doc_type": "regulation", "cluster_tags": ["crew-liability"], "quality_tier": "primary"},

  // === SALVAGE-NAVIGATION: LOF/SCOPIC ===
  {"title": "Lloyd's Open Form 2024 (LOF 2024)", "url": "https://www.lloyds.com/market-resources/salvage-arbitration-branch/lloyds-open-form", "org": "Lloyd's of London", "doc_type": "form", "cluster_tags": ["salvage-navigation"], "quality_tier": "primary"},
  {"title": "SCOPIC Clause 2020", "url": "https://www.lloyds.com/market-resources/salvage-arbitration-branch/scopic", "org": "Lloyd's of London", "doc_type": "standard", "cluster_tags": ["salvage-navigation"], "quality_tier": "primary"},
  {"title": "Lloyd's Salvage Arbitration Clauses 2024 (LSAC 2024)", "url": "https://assets.lloyds.com/media/e453d807-f2e3-4b2f-9b22-3dbc2b3b2c9c/LSAC%202024%20-%20For%20website%20-%2022.05.2024.pdf", "org": "Lloyd's of London", "doc_type": "regulation", "cluster_tags": ["salvage-navigation"], "quality_tier": "primary"},

  // === SALVAGE-NAVIGATION: ISM/SOLAS ===
  {"title": "The International Safety Management (ISM) Code", "url": "https://www.imo.org/en/ourwork/humanelement/pages/ismcode.aspx", "org": "International Maritime Organization (IMO)", "doc_type": "regulation", "cluster_tags": ["salvage-navigation"], "quality_tier": "primary"},
  {"title": "International Convention for the Safety of Life at Sea (SOLAS), 1974", "url": "https://www.imo.org/en/about/conventions/pages/international-convention-for-the-safety-of-life-at-sea-(solas),-1974.aspx", "org": "International Maritime Organization (IMO)", "doc_type": "regulation", "cluster_tags": ["salvage-navigation"], "quality_tier": "primary"},
  {"title": "Safety of Navigation", "url": "https://www.imo.org/en/ourwork/safety/pages/navigationdefault.aspx", "org": "International Maritime Organization (IMO)", "doc_type": "guidance", "cluster_tags": ["salvage-navigation"], "quality_tier": "primary"},

  // === SALVAGE-NAVIGATION: IMO ===
  {"title": "Convention on the International Regulations for Preventing Collisions at Sea, 1972 (COLREGs)", "url": "https://www.imo.org/en/about/conventions/pages/colreg.aspx", "org": "International Maritime Organization (IMO)", "doc_type": "regulation", "cluster_tags": ["salvage-navigation"], "quality_tier": "primary"},
  {"title": "Procedures for Port State Control, 2023 (Resolution A.1185(33))", "url": "https://www.imo.org/en/OurWork/IIIS/Pages/Port%20State%20Control.aspx", "org": "International Maritime Organization (IMO)", "doc_type": "guidance", "cluster_tags": ["salvage-navigation"], "quality_tier": "primary"},
  {"title": "Safety of Navigation - SOLAS Chapter V", "url": "https://www.imo.org/en/ourwork/safety/pages/navigationdefault.aspx", "org": "International Maritime Organization (IMO)", "doc_type": "regulation", "cluster_tags": ["salvage-navigation"], "quality_tier": "primary"},
];

async function insertReferences() {
  console.log(`\n=== INSERTING ${references.length} REFERENCES ===\n`);

  // Dedupe by URL
  const seen = new Set<string>();
  const unique = references.filter(r => {
    if (seen.has(r.url)) {
      console.log(`  Skipping duplicate: ${r.title.slice(0, 50)}...`);
      return false;
    }
    seen.add(r.url);
    return true;
  });

  console.log(`Unique references: ${unique.length}\n`);

  // Check existing
  const { data: existing } = await db
    .from('reference_registry')
    .select('url')
    .eq('is_active', true);

  const existingUrls = new Set((existing || []).map((e: any) => e.url));
  console.log(`Existing active refs: ${existingUrls.size}\n`);

  // Map doc_type to valid citation_category enum values
  const categoryMap: Record<string, string> = {
    'guidance': 'framework',
    'standard': 'framework',
    'regulation': 'legal',
    'form': 'legal',
  };

  // Generate ref_id from org and title
  function generateRefId(org: string, title: string): string {
    const orgPart = org
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .split(' ')
      .slice(0, 2)
      .map(w => w.slice(0, 4).toUpperCase())
      .join('-');
    const titlePart = title
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .split(' ')
      .slice(0, 3)
      .map(w => w.slice(0, 4).toUpperCase())
      .join('-');
    return `${orgPart}-${titlePart}`.slice(0, 30);
  }

  let inserted = 0;
  let skipped = 0;

  for (const ref of unique) {
    if (existingUrls.has(ref.url)) {
      console.log(`  Already exists: ${ref.title.slice(0, 40)}...`);
      skipped++;
      continue;
    }

    const refId = generateRefId(ref.org, ref.title);
    const { error } = await db.from('reference_registry').insert({
      ref_id: refId,
      title: ref.title,
      short_title: ref.title.slice(0, 50),
      url: ref.url,
      source_url: ref.url,
      publisher: ref.org,
      citation_category: categoryMap[ref.doc_type] || 'framework',
      cluster_tags: ref.cluster_tags,
      quality_tier: ref.quality_tier,
      is_active: true,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.log(`  Error: ${ref.title.slice(0, 40)}... - ${error.message}`);
    } else {
      inserted++;
    }
  }

  console.log(`\n✓ Inserted: ${inserted}`);
  console.log(`  Skipped (existing): ${skipped}`);

  // Verify final count
  const { data: final } = await db
    .from('reference_registry')
    .select('id')
    .eq('is_active', true);

  console.log(`\nTotal active references: ${(final || []).length}`);

  // Show by cluster
  const { data: byCluster } = await db
    .from('reference_registry')
    .select('cluster_tags')
    .eq('is_active', true);

  const clusterCounts: Record<string, number> = {};
  (byCluster || []).forEach((r: any) => {
    const tags = r.cluster_tags || [];
    tags.forEach((t: string) => {
      clusterCounts[t] = (clusterCounts[t] || 0) + 1;
    });
  });

  console.log('\nBy cluster:');
  Object.entries(clusterCounts).sort().forEach(([c, n]) => {
    console.log(`  ${c}: ${n}`);
  });
}

insertReferences().catch((e: Error) => {
  console.error('Error:', e.message);
  process.exit(1);
});
