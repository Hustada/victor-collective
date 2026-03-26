export type EntryCategory = 'proposal' | 'idea' | 'plan';

export interface PortalEntry {
  id: string;
  category: EntryCategory;
  title: string;
  date: string;
  body: string;
  modules?: ProposalModule[];
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

const STORAGE_KEY = 'portal_entries';

export const seedEntries: PortalEntry[] = [
  {
    id: 'chris-johnson-2026',
    category: 'proposal',
    title: 'AI Tools for Sales & Marketing Automation',
    status: 'draft',
    client: 'Chris Johnson — Image Inflators / Strategic Edge Imports',
    date: '2026-03-26',
    body: 'AI tools that support the way Chris already works — handling repetitive and time-consuming parts of the workflow while keeping him in control of the customer relationship.\n\nRecommend starting with Lead Intake — fastest to ship, most directly tied to speeding up the sales process. Mockup Generator is the big technical project and the strongest portfolio piece. All modules reinforce each other over time.',
    modules: [
      {
        name: 'Lead Intake & Quote Prep Tool',
        description:
          'Collects product type, sizing, quantities, artwork files up front. LLM organizes submissions into a structured format that gets Chris most of the way to a quote before he touches it. Cuts down back-and-forth.',
        price: 2500,
        hours: '~25-30 hrs',
        priority: 'start here',
      },
      {
        name: 'Mockup Generator',
        description:
          'Customer uploads a logo or describes what they want, gets a quick visual concept on actual products — banners, feather flags, table covers, tent kits. Gives people something concrete to react to instead of email back-and-forth.',
        price: 4500,
        hours: '~40-50 hrs',
        priority: 'next',
      },
      {
        name: 'Marketing & Content System',
        description:
          'Generates and schedules social posts, email campaigns, and promotions for both brands. Image Inflators: trade show and signage content. Strategic Edge: bulk deal promotions and product highlights.',
        price: 3500,
        hours: '~35-40 hrs',
        priority: 'later',
      },
      {
        name: 'Follow-up & Customer Communication',
        description:
          'Automated responses, reminders, and post-purchase follow-up. Keeps leads and customers from falling through the cracks.',
        price: 2000,
        hours: '~20-25 hrs',
        priority: 'later',
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
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // fall through to seed
  }
  const initial = [...seedEntries];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

export function saveEntries(entries: PortalEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}
