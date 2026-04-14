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

export interface ProposalModule {
  name: string;
  description: string;
  price: number;
  hours?: string;
  priority: 'start here' | 'next' | 'later';
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
const SEED_VERSION = 2;

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
      },
      {
        name: 'AI Prospecting & Outreach Pipeline',
        description:
          'AI-powered system that identifies businesses in Chris\'s target verticals — scrapes directories, Google Maps, industry listings. Enriches with contact info (email, phone, role). Feeds into automated email sequences with personalized messaging per vertical. The "AI bots finding thousands of companies" Chris described.',
        price: 3500,
        hours: '~30-40 hrs',
        priority: 'next',
      },
      {
        name: 'Lead Intake & Quote Prep Tool',
        description:
          'Once outbound generates inbound interest — a structured intake form that collects product type, sizing, quantities, artwork files up front. LLM organizes submissions into a format that gets Chris most of the way to a quote before he touches it. Cuts down the back-and-forth on custom orders.',
        price: 2500,
        hours: '~25-30 hrs',
        priority: 'next',
      },
      {
        name: 'Mockup Generator',
        description:
          'Customer uploads a logo or describes what they want, gets a quick visual concept on actual products — banners, feather flags, table covers, tent kits. Gives people something concrete to react to instead of email back-and-forth. Strongest portfolio piece.',
        price: 4500,
        hours: '~40-50 hrs',
        priority: 'later',
      },
      {
        name: 'Marketing & Content Automation',
        description:
          'Ongoing content generation — social posts, email campaigns, promotions for both brands. Builds on the prospecting pipeline. Strategic Edge: bulk deal promotions, product highlights. Image Inflators: trade show and signage content.',
        price: 2500,
        hours: '~25-30 hrs',
        priority: 'later',
      },
      {
        name: 'Follow-up & Customer Communication',
        description:
          'Automated responses, reminders, and post-purchase follow-up. Keeps leads and customers from falling through the cracks once volume increases.',
        price: 2000,
        hours: '~20-25 hrs',
        priority: 'later',
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
