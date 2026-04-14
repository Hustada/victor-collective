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
const SEED_VERSION = 4;

export const seedEntries: PortalEntry[] = [
  {
    id: 'chris-johnson-2026',
    category: 'proposal',
    title: 'AI-Powered Sales & Outreach System',
    status: 'draft',
    client: 'Chris Johnson — Strategic Edge Promotions / Image Inflators',
    date: '2026-04-14',
    body: "AI-first system for Chris's sales pipeline. Every module is built around intelligence — AI finds the prospects, AI qualifies the leads, AI generates the quotes, AI creates the content, AI manages the follow-up. Chris stays in control of the relationships. The system handles everything that doesn't require a human.\n\nStrategic Edge Promotions is priority (flagpole hardware, banner frames, sherpa blankets). Image Inflators merges in later. Trade show is the immediate trigger — use it to prove the pipeline, not as a standalone email blast.\n\nTarget verticals: sign shops, print brokers, dye sublimation businesses, screen printers, brick & mortar, end users (fast food, car washes, event planners, sporting events, nail salons, storage units, gas stations, car lots, universities).",
    modules: [
      {
        name: 'AI Prospecting & Outreach Agent',
        description:
          'The core system Chris asked for. An AI agent that discovers businesses in target verticals, researches them, scores their fit, writes personalized outreach, and manages email sequences. Not a mail merge — each prospect gets messaging shaped by what the AI learns about their business. The trade show email blast is the first output of this pipeline, not a separate project.',
        price: 4000,
        hours: '~35-45 hrs',
        priority: 'start here',
        technicalFlow: {
          stack: [
            'TypeScript',
            'Node.js',
            'Google Places API',
            'Hunter.io API (email enrichment)',
            'Claude API (research + classification + copywriting)',
            'SendGrid (sequences)',
            'SQLite (prospect storage)',
          ],
          steps: [
            'DISCOVERY — Google Places API queries by vertical + geography. AI parses and dedupes results. Store in SQLite: business name, address, phone, website, category, rating. Start with 3-5 priority verticals in a defined region.',
            'RESEARCH — For each prospect, AI scrapes their website (lightweight fetch + extract). Claude analyzes: what they sell, who their customers are, what signage/promotional products they likely need. Builds a prospect profile.',
            'SCORING — Claude scores each prospect 1-5 on fit. Inputs: vertical match, business size signals, website quality, geographic relevance. High scores get personalized outreach. Low scores get batch sequences. This is the intelligence layer — not everyone gets the same email.',
            'ENRICHMENT — Hunter.io domain search for email addresses + roles. Validate deliverability. Store enriched contacts linked to prospect profiles.',
            "AI COPYWRITING — Claude writes outreach emails per prospect. Not templates with mail-merge fields — actual personalized copy referencing the prospect's business, their likely needs, and the specific Strategic Edge product that fits. 3-email sequence: insight → value → direct ask.",
            'SEQUENCE ENGINE — SendGrid handles send timing and tracking. Separate sending domain from main business. Domain warming built into the launch schedule. A/B test subject lines across verticals.',
            "TRADE SHOW MODE — First deployment: AI segments Chris's 5K list by vertical, writes segment-specific email variants, scores the list for priority follow-up. The trade show blast becomes the proof-of-concept for the full pipeline.",
            "PIPELINE DASHBOARD — React view of the full funnel: prospects discovered → researched → scored → contacted → opened → replied. Per-vertical breakdowns. Chris sees what's working.",
          ],
          risks: [
            'Google Places API costs — $17 per 1K requests. Budget and cache aggressively.',
            'Hunter.io costs — paid tier starts at $49/mo for 500 searches. Per-prospect enrichment cost needs to fit the model.',
            'Email deliverability — cold outreach to unknown contacts requires careful domain warming, reputation management, and CAN-SPAM compliance. Separate sending domain from main business.',
            'Scope — "find thousands of companies" is unbounded. Constrain to specific verticals + geographies per run. Prove it works narrow before going wide.',
          ],
          leverages: [
            'CompanyCam pipeline architecture — same pattern: ingest raw data → AI enrichment → structured output → action. Different domain, same bones.',
            'Claude structured output for scoring/classification is the same pattern as photo analysis. Batch processing, caching, all solved.',
            'SQLite keeps infrastructure simple. No database server. Upgrade path to Postgres if needed.',
          ],
        },
      },
      {
        name: 'AI Sales Assistant (Lead Intake + Quoting)',
        description:
          'Not a form — a conversational AI that handles inbound leads. Customer describes what they need in plain language, the AI asks smart follow-up questions, analyzes uploaded artwork for issues (resolution, color space, format), qualifies the lead, and generates a complete quote draft. Chris reviews and sends. The AI is the first point of contact, not a data entry layer.',
        price: 3000,
        hours: '~25-35 hrs',
        priority: 'next',
        technicalFlow: {
          stack: [
            'React',
            'TypeScript',
            'Node.js / Express',
            'Claude API (conversation + analysis + quoting)',
            'Claude Vision (artwork analysis)',
            'S3 (file uploads)',
            'SendGrid (notifications)',
          ],
          steps: [
            'CONVERSATIONAL INTAKE — Chat-style interface on the website. Customer describes their need in natural language. Claude drives the conversation: identifies product type, asks for missing details (dimensions, quantity, material, deadline), adapts questions based on what the customer has already said. No rigid form steps.',
            'ARTWORK ANALYSIS — Customer uploads logo/artwork. Claude Vision analyzes: resolution sufficient for print size? Color space appropriate? Format usable? Transparent background? AI flags issues and suggests fixes before Chris ever sees it. "Your logo is 72dpi — we\'ll need a higher resolution file for a 10ft banner."',
            'LEAD QUALIFICATION — AI scores the lead based on conversation signals: order size, timeline urgency, specificity of request, repeat customer indicators. High-value leads get flagged for immediate attention. Tire-kickers get standard follow-up.',
            "AI QUOTE GENERATION — Claude builds the quote from conversation data + Chris's pricing rules + artwork analysis. Line items, pricing, estimated production time, material recommendations. Not just structured data — the AI makes pricing and product suggestions based on what it learned about the customer's needs.",
            'CHRIS REVIEW — Quote draft lands in an admin interface. Chris sees: conversation transcript, artwork analysis, qualification score, draft quote. Adjust anything, then send directly to customer. One-click approve for straightforward quotes.',
            "SMART NOTIFICATIONS — AI decides notification urgency. Large order from a qualified lead = immediate alert. Small reorder from existing customer = daily digest. Chris's phone only buzzes when it matters.",
          ],
          risks: [
            "Pricing logic — need to extract Chris's pricing rules. If he prices from memory, the hardest part is codifying tacit knowledge into rules the AI can apply. May need multiple sessions with Chris to get this right.",
            'Conversational UX — chat interfaces need to feel natural, not like talking to a bot. Prompt engineering matters here. Test with real customer scenarios.',
            "Artwork edge cases — customers send everything from napkin sketches to raw Illustrator files. Need graceful handling of formats the AI can't analyze.",
          ],
          leverages: [
            'Claude Vision for artwork analysis — same multimodal pattern as CompanyCam photo analysis. Image in, structured assessment out.',
            "Conversational AI is a natural extension of intent engineering research. The system prompt that shapes this assistant's behavior is the same pattern.",
            'S3 presigned uploads are solved. No custom file infrastructure needed.',
          ],
        },
      },
      {
        name: 'AI Mockup Generator',
        description:
          "Customer describes what they want or uploads a logo, and the AI generates visual concepts on actual products. Not just compositing — the AI suggests layouts, enhances low-res artwork, generates design variations, and recommends products based on the customer's use case. The customer reacts to visuals instead of imagining from a text quote.",
        price: 5000,
        hours: '~40-50 hrs',
        priority: 'next',
        technicalFlow: {
          stack: [
            'React',
            'TypeScript',
            'Claude API (design intelligence)',
            'Claude Vision (artwork assessment)',
            'Creatomate SDK (browser + server rendering)',
            'Node.js / Express',
            'S3 (asset storage)',
          ],
          steps: [
            'AI DESIGN BRIEF — Customer describes their need in text: "I need banners for my car wash grand opening, red and blue theme, want it to look professional." Claude interprets the brief: suggests product types (feather flags for the entrance, a banner for the storefront, a table cover for the checkout area), recommends layout approaches, proposes color treatments.',
            'ARTWORK INTELLIGENCE — Customer uploads logo. Claude Vision analyzes quality, suggests improvements. AI auto-enhances: upscale low-res logos via image processing, extract clean vectors from raster images, suggest background removal. The artwork that goes into the mockup is better than what was uploaded.',
            'TEMPLATE SYSTEM — Creatomate templates for each product type: feather flag, banner, table cover, tent canopy. Dynamic layers for artwork placement, text overlays, color variations. Build once, reuse across all customers.',
            'AI PLACEMENT — Instead of manual drag-and-drop, the AI determines optimal artwork placement based on product type and design principles. Center-weighted for logos, edge-to-edge for patterns, safe zone awareness for fold lines and bleed. Customer can override, but the default is already good.',
            'VARIATION ENGINE — AI generates multiple variations from one input: different color treatments, layout options, product combinations. Customer picks their favorite instead of directing revisions. "Here are 4 options for your car wash banners" instead of "where do you want the logo?"',
            'BROWSER PREVIEW — Creatomate browser SDK renders live preview. Customer sees their artwork on the actual product in real-time. Instant iteration.',
            'SERVER RENDER — High-res output via Creatomate server API. Downloadable PNG/PDF. Shareable gallery link with all mockup variations.',
          ],
          risks: [
            'Creatomate template creation — 2-3 hours per product type. Need product photography from Chris.',
            'Browser SDK vs. server API split — known territory from CompanyCam but still requires careful handling of the two render paths.',
            'AI design suggestions need to be good defaults, not random. Prompt engineering for the design brief interpretation is critical.',
            "Image enhancement has limits — AI can't create detail that isn't there. Need clear customer expectations on artwork quality requirements.",
          ],
          leverages: [
            'DIRECT TRANSFER from CompanyCam Creatomate work. Same SDK, same browser/server split, same modification patterns. The edge cases are already mapped.',
            'Claude Vision for artwork analysis is the CompanyCam photo pipeline repurposed. Image in, structured assessment out.',
            'The AI layer on top of deterministic compositing is the differentiator. Competitors offer drag-and-drop mockup tools. This one thinks.',
          ],
        },
      },
      {
        name: 'AI Content Engine',
        description:
          "AI generates marketing content for both brands — social posts, email campaigns, promotions, product descriptions. Not a content calendar with blanks to fill in. The AI understands each brand's voice, knows the product catalog, tracks what's been posted before, and generates ready-to-approve content. Chris reviews and approves. The AI writes.",
        price: 2500,
        hours: '~20-25 hrs',
        priority: 'later',
        technicalFlow: {
          stack: [
            'TypeScript',
            'Node.js',
            'Claude API (content generation + brand voice)',
            'Meta Business API (Facebook/Instagram)',
            'SendGrid (email campaigns)',
            'SQLite (content history)',
          ],
          steps: [
            'BRAND INTELLIGENCE — AI ingests brand voice docs, product catalog, past content, customer testimonials, competitor positioning. Builds a brand context that shapes every piece of content. Strategic Edge = professional B2B authority. Image Inflators = creative, event-focused, visual energy.',
            "CONTENT GENERATION — Claude generates content batches: weekly social posts, monthly email campaigns, seasonal promotions, product highlights. Each piece is brand-aware, product-specific, and audience-targeted. AI tracks what's been posted to avoid repetition.",
            'PERFORMANCE LEARNING — AI analyzes which content gets engagement (opens, clicks, shares). Over time, the generation shifts toward what works. Not A/B testing individual posts — learning patterns about what resonates per audience segment.',
            'REVIEW + APPROVE — Generated content lands in a queue. Chris approves, edits, or rejects. Nothing goes live without human sign-off. Approved content auto-schedules to platforms.',
            'MULTI-CHANNEL DISPATCH — Meta Business API for social, SendGrid for email. AI determines optimal posting times per platform based on audience data.',
          ],
          risks: [
            'Meta Business API requires verified business account and app review. Bureaucratic delay.',
            'Brand voice consistency — the AI needs enough examples to nail the tone. Expect iteration in the first few weeks.',
          ],
          leverages: [
            'Claude content generation with brand context is straightforward prompt engineering.',
            'SendGrid infrastructure already configured from prospecting module.',
            'Intent engineering research directly applies — the brand voice doc is an intent prompt for content generation.',
          ],
        },
      },
      {
        name: 'AI Customer Agent (Follow-up + Communication)',
        description:
          'An AI agent that manages ongoing customer relationships. Not template emails on a timer — the agent reads conversation history, understands where each customer is in their journey, and writes contextually appropriate follow-ups. It knows when to push, when to back off, and when to escalate to Chris.',
        price: 2500,
        hours: '~20-25 hrs',
        priority: 'later',
        technicalFlow: {
          stack: [
            'TypeScript',
            'Node.js',
            'Claude API (context-aware communication)',
            'SendGrid (delivery)',
            'SQLite (customer timeline)',
          ],
          steps: [
            'CUSTOMER TIMELINE — Unified record per customer: every interaction, quote, order, email, response. The AI has full context when deciding what to say next. Pulls from Lead Intake submissions, Prospecting pipeline contacts, and order history.',
            "AI DECISION ENGINE — Claude evaluates each customer's state and decides: what to send, when to send it, what tone to use. Quote sent 3 days ago, no response, large order? Gentle follow-up emphasizing timeline. Small order, customer seemed decisive? Skip the follow-up, they'll respond when ready. The AI applies judgment, not rules.",
            'CONTEXTUAL WRITING — Each follow-up is written by Claude with full conversation context. Not "Hi {name}, just following up on your quote" — actual references to what the customer asked for, what was discussed, what might have changed since last contact.',
            'ESCALATION INTELLIGENCE — AI detects signals that require Chris: customer frustration, unusual requests, high-value opportunities, competitive mentions. These get flagged for human attention. Everything else the agent handles.',
            'RATE LIMITING + RESPECT — AI enforces communication boundaries: max frequency per customer, opt-out compliance, quiet hours. Tracks customer engagement signals to avoid over-contacting disengaged prospects.',
            'ACTIVITY DASHBOARD — Chris sees the full timeline per customer: what the agent sent, when, customer response, engagement metrics. Override any automated action.',
          ],
          risks: [
            'Depends on unified customer records from other modules. Needs Prospecting and/or Lead Intake data.',
            'AI tone in follow-ups must feel human, not corporate. Heavy prompt engineering.',
            "Customers who realize they're talking to AI may disengage. The communication should be helpful enough that they don't care.",
          ],
          leverages: [
            "Intent engineering directly applies — the agent's system prompt shapes its communication style.",
            'Alvis sub-agent architecture is the same pattern: autonomous agent with context, memory, and judgment. Different domain.',
            'SendGrid delivery layer already configured from earlier modules.',
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
