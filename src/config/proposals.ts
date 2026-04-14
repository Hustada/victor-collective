export type EntryCategory = 'proposal' | 'idea' | 'plan';

export interface PortalEntry {
  id: string;
  category: EntryCategory;
  title: string;
  date: string;
  body: string;
  modules?: ProposalModule[];
  requirements?: RequirementCategory[];
  status?: 'draft' | 'sent' | 'accepted' | 'declined';
  client?: string;
}

export interface TechnicalFlow {
  stack: string[];
  steps: string[];
  risks?: string[];
  leverages?: string[];
}

export interface ProposalModule {
  name: string;
  description: string;
  price: number;
  hours?: string;
  priority: 'start here' | 'next' | 'later';
  technicalFlow?: TechnicalFlow;
}

export type RequirementStatus = 'needed' | 'requested' | 'received';

export interface Requirement {
  item: string;
  status: RequirementStatus;
  notes?: string;
}

export interface RequirementCategory {
  name: string;
  priority: 'urgent' | 'soon' | 'later';
  items: Requirement[];
}

const STORAGE_KEY = 'portal_entries';
const SEED_VERSION_KEY = 'portal_seed_version';
const SEED_VERSION = 3;

export const seedEntries: PortalEntry[] = [
  {
    id: 'chris-johnson-2026',
    category: 'proposal',
    title: 'AI-Powered Sales & Outreach System',
    status: 'draft',
    client: 'Chris Johnson — Strategic Edge Promotions / Image Inflators',
    date: '2026-04-14',
    body: "Revised based on Chris's April email. His immediate need is outbound — trade show coming up, 5,000-email list ready to blast, and he wants AI finding and reaching new prospects at scale. Strategic Edge Promotions is the priority (flagpole hardware, banner frames, sherpa blankets). Image Inflators content merges in later.\n\nTarget verticals: sign shops, print brokers, dye sublimation businesses, screen printers, brick & mortar, end users (fast food, car washes, event planners, sporting events, nail salons, storage units, gas stations, car lots, universities).\n\nStart with Trade Show Launch — it's urgent and builds trust. AI Prospecting is the real project. Inbound tools (Lead Intake, Mockup Generator) layer on once outbound is generating volume.",
    modules: [
      {
        name: 'Trade Show Launch & Email Campaign',
        description:
          'Get the 5,000-email trade show blast out the door. Landing page polish, QR code setup, email template buildout, send infrastructure (SendGrid or similar). Includes A/B subject line testing and basic analytics. Fast, focused, ships this week.',
        price: 1500,
        hours: '~10-15 hrs',
        priority: 'start here',
        technicalFlow: {
          stack: ['SendGrid API', 'React', 'qrcode (npm)', 'DNS (SPF/DKIM/DMARC)'],
          steps: [
            'Verify domain ownership and configure DNS records — SPF, DKIM, DMARC. Non-negotiable for deliverability. Without this, bulk email goes to spam.',
            'Set up SendGrid account, verify sender identity, create API key. Free tier handles 100/day — need paid tier for 5K blast.',
            "Build email template from Chris's creative. SendGrid dynamic templates with Handlebars for personalization (company name, vertical).",
            'Import 5K contact list — validate format, dedupe, check for obvious bounces. CAN-SPAM compliance: must include unsubscribe link and physical address.',
            'Build/polish landing page on Strategic Edge site. Product-focused hero, clear CTA, QR code destination. React component if site is React, standalone HTML if not.',
            'Generate QR code pointing to landing page using qrcode npm package. Static asset, print-ready resolution for trade show materials.',
            'Set up A/B test — two subject line variants, 10% sample each, winner sends to remaining 80%. SendGrid handles this natively.',
            'Schedule send. Monitor delivery rate, open rate, click rate. SendGrid dashboard covers this.',
          ],
          risks: [
            'Deliverability — new domain + bulk send is a spam red flag. May need to warm the domain first (send smaller batches over a few days).',
            "CAN-SPAM compliance — the 5K list needs to be opt-in or have a prior business relationship. If it's a purchased list, deliverability tanks.",
            'Timeline — DNS propagation takes 24-48 hrs. Domain warming takes days. Trade show date is the hard constraint.',
          ],
          leverages: [
            'Zero custom backend needed. SendGrid handles send infrastructure, templates, analytics.',
            'This is configuration and setup, not engineering. Ships fast.',
          ],
        },
      },
      {
        name: 'AI Prospecting & Outreach Pipeline',
        description:
          'AI-powered system that identifies businesses in Chris\'s target verticals — scrapes directories, Google Maps, industry listings. Enriches with contact info (email, phone, role). Feeds into automated email sequences with personalized messaging per vertical. The "AI bots finding thousands of companies" Chris described.',
        price: 3500,
        hours: '~30-40 hrs',
        priority: 'next',
        technicalFlow: {
          stack: [
            'TypeScript',
            'Node.js',
            'Google Places API',
            'Hunter.io API (email enrichment)',
            'Claude API (classification + personalization)',
            'SendGrid (sequences)',
            'SQLite (prospect storage)',
          ],
          steps: [
            'DISCOVERY — Query Google Places API by vertical + geography. Start with 3-5 priority verticals in a defined region. Store raw results in SQLite: business name, address, phone, website, category, rating.',
            'ENRICHMENT — For each business with a website, call Hunter.io domain search to find email addresses + roles. Validate emails via Hunter verification endpoint. Store enriched contacts linked to businesses.',
            'CLASSIFICATION — Claude API call per prospect. Input: business name, category, website snippet. Output: vertical classification, estimated relevance score (1-5), suggested angle for outreach. Batch process, cache results.',
            'TEMPLATE ENGINE — Build email templates per vertical. Handlebars-style with dynamic fields: company name, vertical-specific value prop, product recommendation. Claude generates initial template drafts, you refine.',
            'SEQUENCE BUILDER — Define 3-email sequence per vertical: intro → value follow-up → last chance. Spacing: day 1, day 4, day 10. SendGrid automation handles send timing.',
            'PIPELINE CLI — Node.js CLI tool that runs the full pipeline: discover → enrich → classify → queue. Cron-schedulable. Outputs report: X businesses found, Y emails enriched, Z queued for outreach.',
            'DASHBOARD (optional) — Simple React page showing pipeline stats: prospects by vertical, enrichment rate, email open/reply rates. Read-only view of SQLite data.',
          ],
          risks: [
            'Google Places API costs — $17 per 1K requests (Nearby Search). Budget for discovery phase. Cache aggressively.',
            "Hunter.io costs — free tier is 25 searches/mo. Paid starts at $49/mo for 500 searches. Per-prospect cost needs to fit Chris's budget.",
            'Email deliverability at scale — cold email to unknown contacts. Separate sending domain from main business domain. Warm gradually.',
            'Scope creep — "find thousands of companies" is unbounded. Scope to specific verticals + geographies per run. Expand after proving the pipeline works.',
            'Legal — CAN-SPAM allows cold B2B email but requires opt-out. No purchased consumer lists.',
          ],
          leverages: [
            'CompanyCam pipeline pattern — same architecture: ingest raw data → enrich with AI → structured output → action. Different data source, same bones.',
            'Claude API for classification is the same pattern as photo analysis in CompanyCam. Structured output, batch processing, caching.',
            'SQLite keeps it simple — no database server, file-based, ships with the tool. Upgrade to Postgres only if needed.',
          ],
        },
      },
      {
        name: 'Lead Intake & Quote Prep Tool',
        description:
          'Once outbound generates inbound interest — a structured intake form that collects product type, sizing, quantities, artwork files up front. LLM organizes submissions into a format that gets Chris most of the way to a quote before he touches it. Cuts down the back-and-forth on custom orders.',
        price: 2500,
        hours: '~25-30 hrs',
        priority: 'next',
        technicalFlow: {
          stack: [
            'React',
            'TypeScript',
            'Node.js / Express',
            'Claude API',
            'S3 (file uploads)',
            'SendGrid (notifications)',
          ],
          steps: [
            'INTAKE FORM — React multi-step form. Step 1: product type (banner, flag, table cover, tent, custom). Step 2: dimensions, quantity, material. Step 3: artwork upload (drag-drop, accepts PNG/SVG/AI/PDF). Step 4: contact info + notes.',
            'FILE HANDLING — Upload artwork to S3 via presigned URLs. Generate thumbnails for preview. Store metadata (filename, size, type) in submission record.',
            'LLM STRUCTURING — On submit, send form data + artwork metadata to Claude API. Prompt: "Structure this into a quote-ready format for a custom signage business. Flag missing info. Suggest relevant upsells based on product type." Returns structured JSON.',
            "QUOTE DRAFT — Transform Claude output into a formatted quote draft: line items, pricing (based on Chris's pricing rules), estimated production time. Present in a clean review interface.",
            'NOTIFICATION — Email Chris when a new submission arrives. Include structured summary + link to full quote draft. SendGrid transactional email.',
            'ADMIN VIEW — Simple dashboard for Chris to see all submissions, filter by status (new / quoted / won / lost), edit quotes, send to customer.',
          ],
          risks: [
            'Pricing logic — need Chris\'s actual pricing rules. If it\'s "from memory," we need to extract and codify that. Could be the hardest part.',
            'Artwork file handling — customers send all kinds of garbage. Need clear format requirements and error messaging.',
          ],
          leverages: [
            'Standard React form + API pattern. Built dozens of these.',
            'Claude structured output for quote prep is low-risk — clear input, clear expected output, easy to test and iterate on prompt.',
            'S3 presigned uploads are a solved pattern. No custom file server needed.',
          ],
        },
      },
      {
        name: 'Mockup Generator',
        description:
          'Customer uploads a logo or describes what they want, gets a quick visual concept on actual products — banners, feather flags, table covers, tent kits. Gives people something concrete to react to instead of email back-and-forth. Strongest portfolio piece.',
        price: 4500,
        hours: '~40-50 hrs',
        priority: 'later',
        technicalFlow: {
          stack: [
            'React',
            'TypeScript',
            'Creatomate SDK (browser + server)',
            'Node.js / Express',
            'S3 (asset storage)',
          ],
          steps: [
            'TEMPLATE CREATION — Build Creatomate templates for each product type: feather flag, banner, table cover, tent canopy. Each template has dynamic layers: artwork placement zone, product base image, optional text overlay. This is the most labor-intensive step.',
            'UPLOAD FLOW — Customer selects product type → uploads logo/artwork → system validates dimensions and format. Preview shows artwork on a neutral background while Creatomate processes.',
            'BROWSER PREVIEW — Creatomate browser SDK renders live preview in iframe. Customer sees their artwork on the actual product. Can adjust: position, scale, rotation within the artwork zone. Instant feedback, no server round-trip.',
            'PLACEMENT LOGIC — Define safe zones per product template: print area, bleed, fold lines. Constrain artwork placement to safe zones. Snap-to-center, aspect ratio lock. Keep it simple — not a design tool, just placement.',
            'SERVER RENDER — On "Generate Mockup" click, send modifications to Creatomate server API for high-res render. Returns downloadable PNG/PDF. Store rendered mockups in S3 linked to customer session.',
            'GALLERY — Customer gets a shareable link with all their mockups. Multiple product variants from one artwork upload. Each mockup is downloadable.',
          ],
          risks: [
            'Creatomate template creation takes real time — each product type needs a custom template with correct dimensions, layer structure, and dynamic zones. Budget 2-3 hours per product type.',
            'Browser SDK vs. server API differences — learned this from CompanyCam. Browser SDK runs in Creatomate iframe (supports data URIs, no localhost). Server API runs on their servers (needs public URLs, no data URIs). Must handle both paths.',
            'Product photography dependency — need clean, high-res product shots for each template base. Chris has to provide these.',
          ],
          leverages: [
            'DIRECT TRANSFER from CompanyCam Creatomate work. Same SDK, same browser/server split, same modification system. Already fought through the edge cases.',
            'Template-based approach means no AI image generation needed. Compositing is deterministic — customer uploads artwork, system places it. Predictable output, no hallucination risk.',
            'Background music pattern from CompanyCam — "background-music" is a Creatomate convention. Product template conventions will work the same way.',
          ],
        },
      },
      {
        name: 'Marketing & Content Automation',
        description:
          'Ongoing content generation — social posts, email campaigns, promotions for both brands. Builds on the prospecting pipeline. Strategic Edge: bulk deal promotions, product highlights. Image Inflators: trade show and signage content.',
        price: 2500,
        hours: '~25-30 hrs',
        priority: 'later',
        technicalFlow: {
          stack: [
            'TypeScript',
            'Node.js',
            'Claude API',
            'Meta Business API (Facebook/Instagram)',
            'SendGrid',
          ],
          steps: [
            'CONTENT GENERATION — Claude API generates content from product catalog + brand voice doc. Input: product, target audience, content type (social post, email, promo). Output: copy + suggested image/asset reference.',
            'REVIEW QUEUE — Generated content lands in a review interface. Chris approves, edits, or rejects. Nothing posts automatically without human approval. Simple status flow: draft → approved → scheduled → posted.',
            'SOCIAL SCHEDULING — Approved posts queue to Meta Business API for Facebook/Instagram. Define posting cadence per brand. Store scheduled posts with timestamps.',
            'EMAIL CAMPAIGNS — Approved email content feeds into SendGrid campaigns. Segment by customer list (existing customers vs. prospects). Track opens, clicks, conversions.',
            'BRAND VOICE — Maintain a brand voice document per brand. Feed to Claude as system context. Strategic Edge = professional B2B, bulk/value messaging. Image Inflators = creative, event-focused, visual.',
          ],
          risks: [
            'Meta Business API access requires a verified business account and app review. Can take days-weeks for approval.',
            'Content quality — LLM-generated marketing copy needs human review. Chris has to stay in the loop.',
          ],
          leverages: [
            'Builds on prospecting pipeline infrastructure — SendGrid already set up, contact lists already segmented.',
            'Claude content generation is straightforward — well-defined prompts, clear brand voice, testable output quality.',
          ],
        },
      },
      {
        name: 'Follow-up & Customer Communication',
        description:
          'Automated responses, reminders, and post-purchase follow-up. Keeps leads and customers from falling through the cracks once volume increases.',
        price: 2000,
        hours: '~20-25 hrs',
        priority: 'later',
        technicalFlow: {
          stack: ['TypeScript', 'Node.js', 'SendGrid', 'Cron (node-cron)'],
          steps: [
            'TRIGGER DEFINITIONS — Define event-based triggers: quote sent (follow up in 3 days), quote viewed (follow up in 1 day), order placed (confirmation + timeline), order delivered (satisfaction check + review request), no activity 30 days (re-engagement).',
            'TEMPLATE LIBRARY — Email templates per trigger type. Personalized with customer name, order details, product info. Claude generates initial drafts, Chris refines to his voice.',
            'SCHEDULER — Node.js cron job checks for pending follow-ups. Queries SQLite for events past their trigger threshold. Queues emails via SendGrid.',
            'OPT-OUT HANDLING — Respect unsubscribes at the individual level. Track communication preferences per contact. CAN-SPAM compliance.',
            'ACTIVITY LOG — Simple log of all automated communications per customer. Chris can see the full timeline: when they were contacted, what was sent, did they open/click.',
          ],
          risks: [
            'Depends on having a unified customer record — needs Lead Intake and/or Prospecting Pipeline data to trigger against.',
            'Over-communication risk. Need sensible rate limits (max 1 automated email per customer per week).',
          ],
          leverages: [
            'SendGrid already configured from earlier modules. Transactional email is a solved pattern.',
            "Cron + SQLite is dead simple. No message queue, no event bus. Check every hour, send what's due.",
          ],
        },
      },
    ],
    requirements: [
      {
        name: 'Access & Infrastructure',
        priority: 'urgent',
        items: [
          {
            item: 'Website hosting credentials (Strategic Edge Promotions)',
            status: 'needed',
            notes:
              'Platform, login, or admin invite. strategicedgepromotions.com — need to know if Shopify, WordPress, or custom',
          },
          {
            item: 'Website hosting credentials (Image Inflators)',
            status: 'needed',
            notes: 'imageinflators.com — same as above',
          },
          {
            item: 'Domain registrar access — both domains',
            status: 'needed',
            notes:
              'Required for email authentication (SPF, DKIM, DMARC). Without this, trade show emails land in spam',
          },
          {
            item: 'Google Analytics access',
            status: 'needed',
            notes:
              'Read-only is fine. Both sites. Need to understand current traffic/conversion baseline',
          },
        ],
      },
      {
        name: 'Trade Show Email Campaign',
        priority: 'urgent',
        items: [
          {
            item: 'Email contact list (5,000 contacts)',
            status: 'needed',
            notes:
              'CSV preferred. Chris mentioned this in his April email — needs to be CAN-SPAM compliant',
          },
          {
            item: 'Landing page mockup',
            status: 'needed',
            notes: 'Chris said he attached it to the email. Need the actual file',
          },
          {
            item: 'Email ad creative',
            status: 'needed',
            notes: 'Chris said he has this ready. Need the file/design',
          },
          {
            item: 'QR code destination URL',
            status: 'needed',
            notes: 'Where should the trade show QR code point? Landing page? Product page?',
          },
          {
            item: 'Trade show date and name',
            status: 'needed',
            notes: 'Drives the timeline for everything. Need this to plan the send schedule',
          },
        ],
      },
      {
        name: 'Brand & Product Info',
        priority: 'soon',
        items: [
          {
            item: 'Brand assets — logos, colors, fonts',
            status: 'needed',
            notes: 'Both brands. Shared drive or zip file. Can pull from sites as fallback',
          },
          {
            item: 'Product catalog and pricing — Strategic Edge',
            status: 'needed',
            notes:
              'Flagpole hardware, banner frames, sherpa blankets. What SKUs, what prices, what margins',
          },
          {
            item: 'Product catalog and pricing — Image Inflators',
            status: 'needed',
            notes: 'Custom banners, signage. How does pricing work for custom orders?',
          },
          {
            item: 'Current quoting process',
            status: 'needed',
            notes:
              'How does Chris build a quote today? Spreadsheet? From memory? What info does he need from a customer?',
          },
        ],
      },
      {
        name: 'Prospecting & Sales Context',
        priority: 'soon',
        items: [
          {
            item: 'Existing customer list or CRM export',
            status: 'needed',
            notes: 'Even a spreadsheet. Helps model ideal customer profile for AI prospecting',
          },
          {
            item: 'Geographic focus for prospecting',
            status: 'needed',
            notes:
              'National? Regional? Specific states or metros? Affects how we scope the scraping pipeline',
          },
          {
            item: 'Priority verticals (ranked)',
            status: 'needed',
            notes:
              'Chris listed many targets. Need to know which 3-5 to hit first: sign shops, print brokers, event planners, etc.',
          },
          {
            item: 'Current outreach process',
            status: 'needed',
            notes:
              'Cold email? Phone? Trade shows only? Helps design the automation around his actual workflow',
          },
        ],
      },
      {
        name: 'Mockup Generator Assets',
        priority: 'later',
        items: [
          {
            item: 'Product photography — blank products',
            status: 'needed',
            notes:
              'Banners, feather flags, table covers, tent kits. Clean shots from multiple angles for compositing',
          },
          {
            item: 'Product dimensions and specifications',
            status: 'needed',
            notes:
              'Print areas, bleed zones, material types. Needed to build accurate mockup templates',
          },
          {
            item: 'Example completed orders',
            status: 'needed',
            notes:
              '5-10 finished products with customer artwork applied. Reference for what good output looks like',
          },
        ],
      },
    ],
  },
  {
    id: 'victor-collective-vision',
    category: 'plan',
    title: 'Victor Collective — Operating System for One',
    date: '2026-03-26',
    body: 'The Victor Collective isn\'t a consulting company. It\'s an operating system for one person running multiple AI-native products.\n\nPieces:\n- Alvis: autonomous agent with memory, sub-agents, scheduled behavior (operations layer)\n- Character API: persona definition as a service (Viktor Ash as consumable API)\n- Intent Engineering: original research — making agents do hard work, not just perform it (the real IP)\n- Kodeskald: LLM cost management across providers (infrastructure)\n- Portfolio site: front door\n\nThe "billion dollar company of one" thesis: stay solvent with client work (CompanyCam, Chris), build IP in the margins (Alvis, intent engineering, character system). Revenue comes when one of these turns into something someone pays for. Consulting is the bridge, not the destination.',
  },
  {
    id: 'intent-engineering-next',
    category: 'idea',
    title: 'Intent Engineering — Next Steps',
    date: '2026-03-26',
    body: '- Test on open-source models (Llama, Mistral) — different RLHF tuning may respond differently\n- Apply tailored intent to other Alvis sub-agents (Brokkr might need "thoroughness over speed")\n- Automate psychometric eval as CI check when system prompts change\n- Test interaction effects with chain-of-thought, few-shot, tool-use\n- Test at what prompt length intent stops working\n- Run the Claude Opus 4 tests that were skipped when credits ran out',
  },
];

export function loadEntries(): PortalEntry[] {
  const storedVersion = Number(localStorage.getItem(SEED_VERSION_KEY) || 0);

  if (storedVersion < SEED_VERSION) {
    const initial = [...seedEntries];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    localStorage.setItem(SEED_VERSION_KEY, String(SEED_VERSION));
    return initial;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // fall through to seed
  }

  const initial = [...seedEntries];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  localStorage.setItem(SEED_VERSION_KEY, String(SEED_VERSION));
  return initial;
}

export function saveEntries(entries: PortalEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}
