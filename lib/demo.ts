/**
 * lib/demo.ts
 *
 * Demo-mode triage results. Used when no OPENAI_API_KEY is configured so the
 * full UI can be explored without a paid API account.
 *
 * Each of the five sample emails has a hand-written result that mirrors what a
 * real model would return. Any other text falls back to a generic result that
 * echoes a few details pulled from the email so the flow still feels live.
 *
 * This module is server-only (imported by the API route) but contains no
 * secrets — it's pure static data.
 */

import type { TriageResult } from "./types";
import { extractSubject } from "./utils";

/**
 * Keyed by the sample email `id` from lib/samples.ts. The route matches on
 * sender name since the request only carries the assembled email text.
 */
const DEMO_RESULTS: Record<string, TriageResult> = {
  barbara: {
    category: "deadline_sensitive",
    urgency: "high",
    confidence: 88,
    entities: {
      client_name: "Barbara Kowalski",
      tax_year: null,
      documents_needed: ["Q3 bank statements (already in Dropbox)"],
      dollar_amount: null,
      deadline: "Board meeting on the 18th",
      action_required:
        "Confirm receipt of the Q3 statements and give Barbara a firm completion date before her board meeting.",
    },
    flags: [
      "Client has followed up three times with no response — relationship risk, prioritise a reply",
      "Vehicle deduction with mixed business/personal use — CPA must advise before committing to anything",
    ],
    draft_reply:
      "Hi Barbara,\n\nFirst, I'm sorry for the delay in getting back to you — that's on us, and I understand the frustration given your board meeting on the 18th. Your Q3 statements did arrive safely in the Dropbox on October 2nd, and I'm making the reconciliation a priority so you'll have the financials well ahead of the meeting.\n\nOn the truck: a vehicle used partly for business can often be partially deductible, but the exact treatment depends on the business-use percentage and how it was purchased. I'd like one of our CPAs to look at the specifics before we give you a number, so nothing is misstated. Could you send the purchase documents when you have a moment?\n\nI'll follow up shortly with the completion date for your financials.\n\nBest,\nThe Team",
  },

  mike: {
    category: "document_request",
    urgency: "medium",
    confidence: 82,
    entities: {
      client_name: "Mike Day",
      tax_year: "last year",
      documents_needed: ["W-2 for Mike Day", "W-2 for Christine Day"],
      dollar_amount: null,
      deadline: null,
      action_required:
        "Check whether both W-2s are ready, review the Q estimated-tax overpayment, and schedule a call about the S-corp to C-corp conversion.",
    },
    flags: [
      "Entity conversion (S-corp to C-corp) — significant tax implications, CPA must advise before any action",
    ],
    draft_reply:
      "Hi Mike,\n\nHappy to help with all of this. Let me take your questions in order:\n\nW-2s — I'll check on the status of yours and Christine's today and get them over to you as soon as they're ready. Since Christine worked Jan-March, hers should be straightforward.\n\nEstimated taxes — I'll pull last quarter's payments and confirm whether there was an overpayment. If so, we'll factor it into your next filing.\n\nS-corp to C-corp — this is worth a proper conversation, since the conversion has real tax consequences and isn't something to decide by email. Let's set up a short call. What does your week look like?\n\nI'll be back to you on the W-2s shortly.\n\nBest,\nThe Team",
  },

  priya: {
    category: "irs_notice",
    urgency: "high",
    confidence: 94,
    entities: {
      client_name: "Priya Mehta",
      tax_year: "2021",
      documents_needed: ["IRS notice letter"],
      dollar_amount: "$14,200",
      deadline: "November 30",
      action_required:
        "Have Priya send the IRS notice immediately, confirm the firm will handle the response, and verify the invoice rate against the engagement agreement.",
    },
    flags: [
      "IRS notice with a legal response deadline — CPA must review before replying to the IRS",
      "Billing dispute ($2,340 vs expected $1,950) — verify the engagement rate before acknowledging the charge",
    ],
    draft_reply:
      "Hi Priya,\n\nThank you for reaching out — I can hear the stress in your message and want to reassure you that this is very much something we handle.\n\nOn the IRS notice: please scan and send the letter over as soon as you can. Given the November 30 deadline we'll review it right away and map out the response. Try not to panic — notices like this are often resolved with the right documentation.\n\nOn the invoice: I'll pull up your engagement agreement today and check the $2,340 charge against the $1,950 quarterly rate we discussed. If there's a discrepancy we'll correct it before you pay anything.\n\nI'll follow up as soon as I've reviewed the notice.\n\nBest,\nThe Team",
  },

  tom: {
    category: "new_client_inquiry",
    urgency: "medium",
    confidence: 90,
    entities: {
      client_name: "Tom Ferreira",
      tax_year: null,
      documents_needed: [
        "Two years of bank statements",
        "Current bookkeeping spreadsheet",
      ],
      dollar_amount: "$380k revenue",
      deadline: null,
      action_required:
        "Send Tom the pricing for monthly bookkeeping plus annual tax filing and the onboarding checklist, and note the Sandra Whitmore referral.",
    },
    flags: [
      "Referred by an existing client (Sandra Whitmore) — acknowledge the referral warmly",
    ],
    draft_reply:
      "Hi Tom,\n\nThanks so much for reaching out, and a big thank-you to Sandra for the referral — we think highly of her.\n\nYour setup is right in our wheelhouse. For a landscaping business around $380k in revenue with four employees, monthly bookkeeping plus annual tax filing is a common package for us, and moving off an Excel-based system is usually a quick win.\n\nTo get you an accurate quote, I'll send over our standard pricing along with a short onboarding checklist. The two years of bank statements and your current spreadsheet are exactly what we'd need to get started — no need to tidy them up first, messy is fine.\n\nWould a brief intro call this week work? I'll include a couple of times in my next note.\n\nBest,\nThe Team",
  },

  carlos: {
    category: "tax_question",
    urgency: "low",
    confidence: 79,
    entities: {
      client_name: "Carlos & Denise Ortega",
      tax_year: "current year",
      documents_needed: ["Inherited property details", "Rental income records"],
      dollar_amount: "$8,400 rental income",
      deadline: "Year end",
      action_required:
        "Schedule a year-end planning call to cover the backdoor Roth, the inherited rental property basis step-up, and Carlos's post-retirement estimated taxes.",
    },
    flags: [
      "Backdoor Roth strategy for clients over 60 — CPA should confirm suitability",
      "Inherited property with basis step-up and estate-period rental income — CPA must review",
      "Change in withholding after retirement affects estimated taxes — needs recalculation",
    ],
    draft_reply:
      "Hi Carlos and Denise,\n\nNo need to apologise — putting it all in one email is genuinely helpful. These are all good year-end questions, and a couple of them deserve a real conversation rather than a quick email answer. Here's the short version:\n\nBackdoor Roth — still potentially worthwhile at your ages, but it depends on your full income picture, so let's confirm the details together.\n\nInherited rental — in most cases an inherited property gets a stepped-up basis, and the rent collected during estate settlement has its own treatment. We'll want to review the specifics.\n\nCarlos's retirement — yes, losing withholding usually means adjusting estimated payments, and we can set that up.\n\nI'd suggest a short year-end planning call to cover all three properly. I'll send a couple of times shortly.\n\nBest,\nThe Team",
  },
};

/**
 * Generic fallback for any email that isn't one of the known samples.
 * Echoes the subject and a rough length signal so the result feels responsive
 * to the actual input rather than fully static.
 */
function genericResult(emailText: string): TriageResult {
  const subject = extractSubject(emailText);
  return {
    category: "general_question",
    urgency: "medium",
    confidence: 70,
    entities: {
      client_name: null,
      tax_year: null,
      documents_needed: [],
      dollar_amount: null,
      deadline: null,
      action_required: `Review this email ("${subject}") and route it to the appropriate staff member.`,
    },
    flags: ["Demo mode — this is a sample result, not a live model response"],
    draft_reply:
      "Hello,\n\nThank you for your email — we've received it and it's in good hands. A member of our team will review the details and get back to you shortly with a complete response. If anything is time-sensitive, just let us know and we'll prioritise it.\n\n(Note: this reply was generated in demo mode. Add an API key to enable live, email-specific responses.)\n\nBest,\nThe Team",
  };
}

/**
 * Return a demo triage result for the given email text. Matches on the sample
 * sender name embedded in the assembled "From: ..." line; falls back to a
 * generic result for anything else.
 */
export function demoTriage(emailText: string): TriageResult {
  const lower = emailText.toLowerCase();

  if (lower.includes("barbara kowalski")) return DEMO_RESULTS.barbara;
  if (lower.includes("mike day")) return DEMO_RESULTS.mike;
  if (lower.includes("priya mehta")) return DEMO_RESULTS.priya;
  if (lower.includes("tom ferreira")) return DEMO_RESULTS.tom;
  if (lower.includes("carlos") && lower.includes("denise"))
    return DEMO_RESULTS.carlos;

  return genericResult(emailText);
}

export { DEMO_RESULTS };
