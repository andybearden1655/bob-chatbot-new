// lib/load-documents.js

import fs from "fs/promises";
import path from "path";
import pdf from "pdf-parse";
import mammoth from "mammoth";
import pLimit from "p-limit";

const limit = pLimit(3);

// Cache loaded documents
let cachedDocuments = null;

function cleanText(text = "") {

  return text
    .replace(/\s+/g, " ")
    .replace(/\u0000/g, "")
    .replace(/[^\x20-\x7E\n\r\t]/g, " ")
    .trim();

}

const pdfFiles = [
  "course_outline_2026.pdf",
  "buyer_system_presentation.pdf",
  "residential_condominium_contract.pdf",
  "seller_system_presentation.pdf",
  "shanae_job_description_2025.pdf",
  "unrepresented_party_checklist.pdf",
  "Test.pdf",
  "under_cont.pdf",
  "Transaction_Coordinators _ United_RE_Portal.pdf",
  "Legal_Update_II_2026-2027.pdf",
  "Legal_Update_I_2026-2027.pdf",
  "insurance.pdf",
  "Home _ United_RE_Portal.pdf",
  "CDA_Request-Blue_Sheet.pdf",
  "2025-2026_Broker_Responsibility_Course_Manual.pdf",
  "7.pdf",
  "6.pdf",
  "5.pdf",
  "4.pdf",
  "3.pdf",
  "2.pdf",
  "1.pdf",
  "The_Value_I_Bring.pdf",
  "The_Transaction.pdf",
  "R3-Seller_System_Presentation_update-2-18.pdf",
  "The_lifecycle.pdf",
  "R2-Buyers_System_Presentation.pdf",
  "Programs_Tools_Services_Flyer_United.pdf",
  "ICA_Risk_Mitigation_Best_Practices.pdf",
  "ICA_Example.pdf",
  "AI_Policy.pdf",
  "AI_Policy-Agent_Quick_Card.pdf",
  "Agent_Checklist_for_Deductible_Indemnification_Qualification.pdf",
  "3-Hour_Risk_Reduction_Training_for_E&O_Compliance.pdf",
  "2026_United_Real_Estate_Risk_Reduction.pdf",
  "whats_included_sale.pdf",
  "vacation_home.pdf",
  "this_inspection.pdf",
  "this_fair_housing.pdf",
  "surveillance.pdf",
  "staging.pdf",
  "share_this_whats_included_sale.pdf",
  "sellers_disclosure.pdf",
  "schools.pdf",
  "pricing_mistakes.pdf",
  "preapprove_prequalify.pdf",
  "mortgage_points.pdf",
  "instant_offers.pdf",
  "home_selling_goals.pdf",
  "homeownership_benefits.pdf",
  "home_inspections.pdf",
  "hire_realtor.pdf",
  "extra_home_costs.pdf",
  "earnest_money.pdf",
  "credit_score.pdf",
  "common_seller_mistakes.pdf",
  "appraising_properties_with_solar_panels_overview_08_05_20.pdf",
  "2020_texas_luxury_home_sales_report.pdf",
  "texas_property_code_landlordtenant.pdf",
  "lease_informational_links.pdf",
  "landlord_tenant_guid_etamu_research_center.pdf",
  "locating_social_media_posts_on_bullseyeplus.pdf",
  "texas_state_statute_sellers_disclosure_exemptions.pdf",
  "dfw_properties_referral_agreement_2025_fillable.pdf",
  "muds_pids_puds_tifs.pdf",
  "legalmemo2021pidnotice.pdf",
  "draft_contract.pdf",
  "1955_addendum_for_notice_of_pid.pdf",
  "BOB1.pdf",
  "Bob2.pdf",
  "b3.pdf",
  "b7.pdf",
  "b4.pdf",
  "b5.pdf",
  "b6.pdf",
  "b8.pdf",
  "b9.pdf",
  "United_Team_Toolkit_ 3_2.pdf",
  "United_Ambass_Guidleines.pdf",
  "Home_buyer_seller_guide.pdf",
  "Under_Contract - Things_You_Need_To_Know.pdf",
  "Design_Guide_2024.pdf",
  "Instruction_for_staff_roster.pdf",
  "RolePlay_Instructions.pdf",
  "Untitled_document1.pdf",
  "bobtraining1.pdf"
];

const docxFiles = [
  "first_draft_emails.docx",
  "4-24-25_United_Listing_Checklist.docx",
  "1-20-24_Checklist_Contract_to_Close_Buyer_Seller.docx"
];

async function loadPdf(filePath, file) {

  try {

    await fs.access(filePath);

    const buffer = await fs.readFile(filePath);

    const data = await pdf(buffer);

    return {
      file,
      type: "pdf",
      content: cleanText(data.text)
    };

  } catch (error) {

    console.error(`❌ PDF Error (${file}):`, error.message);

    return null;

  }

}

async function loadDocx(filePath, file) {

  try {

    await fs.access(filePath);

    const result = await mammoth.extractRawText({
      path: filePath
    });

    return {
      file,
      type: "docx",
      content: cleanText(result.value)
    };

  } catch (error) {

    console.error(`❌ DOCX Error (${file}):`, error.message);

    return null;

  }

}

export async function loadDocuments() {

  // Return cache
  if (cachedDocuments) {

    console.log("⚡ Using cached documents");

    return cachedDocuments;

  }

  console.log("📚 Loading documents...");

  const basePath = path.join(process.cwd(), "documents");

  // PDF Loading
  const pdfPromises = pdfFiles.map((file) =>
    limit(async () => {

      const filePath = path.join(basePath, file);

      console.log(`📄 Loading PDF: ${file}`);

      return await loadPdf(filePath, file);

    })
  );

  // DOCX Loading
  const docxPromises = docxFiles.map((file) =>
    limit(async () => {

      const filePath = path.join(basePath, file);

      console.log(`📝 Loading DOCX: ${file}`);

      return await loadDocx(filePath, file);

    })
  );

  const pdfResults = await Promise.all(pdfPromises);

  const docxResults = await Promise.all(docxPromises);

  const documents = [
    ...pdfResults,
    ...docxResults
  ].filter(Boolean);

  cachedDocuments = documents;

  console.log(`✅ Loaded ${documents.length} documents`);

  return documents;

}
