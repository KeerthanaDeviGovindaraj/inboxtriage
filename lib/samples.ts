/**
 * lib/samples.ts
 *
 * Realistic messy sample emails covering the 5 most common triage categories.
 * Designed to be messy: informal tone, typos, multi-part questions, urgency buried
 * in the middle — all the things that make real inboxes hard to manage.
 */

import type { SampleEmail } from "./types";

export const SAMPLE_EMAILS: SampleEmail[] = [
  {
    id: "barbara",
    sender: "Barbara Kowalski",
    subject: "Re: Q3 books - still waiting",
    body: `Hi,

I've emailed THREE times now about the Q3 reconciliation and nobody has gotten back to me. My bank statements have been in your dropbox since October 2nd. I have a board meeting on the 18th and I need those financials. Is there a problem with my account? Should I be worried??

Also my nephew said I might be able to deduct the truck I bought for the business but it was partly personal use too - is that something we can do? I have no idea how any of this works.

Barbara
Kowalski Tile & Grout LLC`,
  },
  {
    id: "mike",
    sender: "Mike Day",
    subject: "W-2s??",
    body: `hey quick question do u guys have my w2 yet? need it for my taxes. also my wife needs hers too - she worked for us jan-march last year. her name is Christine Day same address as me. also i think we overpaid estimated taxes last quarter can someone check that

also forgot to mention - we're thinking about converting the S-corp to a C-corp this year should we talk about that

thx
Mike`,
  },
  {
    id: "priya",
    sender: "Priya Mehta",
    subject: "invoice question + urgent thing",
    body: `Hello,

Two things. First, I got an invoice for $2,340 for "Q3 advisory services" but I thought we agreed on $1,950 per quarter - can you check that? I'm happy to pay but want to make sure it's right before I send the check.

Second and more urgent - I got a letter from the IRS this morning saying I owe $14,200 in back taxes for 2021. I am kind of panicking. Is this something you handle? The letter says I need to respond by November 30. I can scan and send it.

Thanks
Priya`,
  },
  {
    id: "tom",
    sender: "Tom Ferreira",
    subject: "new client inquiry - referred by Sandra",
    body: `Hi there,

I was referred by Sandra Whitmore. I run a small landscaping business, about $380k revenue last year, 4 employees. Currently doing my own books in Excel which is getting out of hand. Looking for monthly bookkeeping + annual tax filing.

Can you let me know your rates and what you'd need from me to get started? I have bank statements going back 2 years and a pretty messy spreadsheet if that helps.

Tom Ferreira
Ferreira Grounds`,
  },
  {
    id: "carlos",
    sender: "Carlos & Denise Ortega",
    subject: "few questions before year end",
    body: `Hi,

We have a few questions we've been meaning to ask:

1. We're thinking of doing a backdoor Roth IRA this year - is that still a good idea for our situation? We're both over 60.
2. We just inherited a rental property from Denise's mother. Do we step up the basis? What do we owe this year on the rent it collected while estate was being settled (about $8,400)?
3. Carlos just retired in September - is there anything we need to do differently for estimated taxes now that he doesn't have withholding?

Sorry for all the questions, just easier to put in one email!

Carlos & Denise`,
  },
];
