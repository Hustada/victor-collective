export interface CaseStudy {
  id: string;
  title: string;
  context: string;
  challenge: string;
  approach: string;
  techStack: string[];
  outcome: string;
  category: string;
}

export const caseStudies: CaseStudy[] = [
  {
    id: 'photo-intelligence',
    title: 'AI Photo Intelligence Pipeline',
    context:
      'CompanyCam needed automated analysis of construction site photos — detecting materials, safety issues, and project progress across millions of images.',
    challenge:
      'Single-model approaches failed on domain-specific construction imagery. Accuracy varied wildly across photo types, and costs scaled linearly with volume.',
    approach:
      'Built a multi-stage vision pipeline: GPT-4V for high-level scene understanding, Google Cloud Vision for object detection, and Claude for structured reasoning over combined outputs. Each stage feeds the next with confidence scoring.',
    techStack: ['GPT-4V', 'Cloud Vision API', 'Claude', 'Python', 'FastAPI', 'PostgreSQL'],
    outcome:
      'Production system processing thousands of photos daily with 90%+ accuracy on domain-specific classification tasks. Cost per image dropped 60% vs single-model baseline.',
    category: 'Computer Vision',
  },
  {
    id: 'alvis-agent',
    title: 'Alvis — Autonomous Agent System',
    context:
      'Personal AI assistant with sub-agent orchestration, semantic memory, habit coaching, and scheduled autonomy — running 24/7 on AWS.',
    challenge:
      'Building an agent that operates independently on a schedule, maintains long-term memory, and coordinates multiple specialized sub-agents without human intervention.',
    approach:
      'Designed a heartbeat-driven architecture with specialized sub-agents for research, memory review, and habit coaching. Semantic memory uses SQLite with embeddings for vector search. Conversations stored as append-only JSONL for crash safety.',
    techStack: [
      'Python',
      'Claude',
      'OpenAI',
      'SQLite',
      'Docker',
      'AWS',
      'Telegram API',
      'structlog',
    ],
    outcome:
      'Fully autonomous agent running in production. Conducts independent research, reviews and consolidates memories, and coaches habits — all without prompting.',
    category: 'Agent Systems',
  },
  {
    id: 'kodeskald',
    title: 'Kodeskald — LLM Cost Optimization Engine',
    context:
      'Internal tool for managing LLM costs across multiple providers and models, with intelligent routing based on task complexity.',
    challenge:
      'LLM costs grow fast when every request hits the most expensive model. Needed smart routing that matches task complexity to the cheapest capable model without sacrificing quality.',
    approach:
      'Built a routing layer that classifies incoming requests by complexity and routes to the appropriate model tier. Budget management tracks spend per project with configurable limits. Multi-provider support (OpenAI, Anthropic, local models) with automatic fallback.',
    techStack: ['TypeScript', 'React', 'Node.js', 'OpenAI', 'Anthropic API', 'PostgreSQL'],
    outcome:
      'Reduced LLM spend by 40-60% across projects while maintaining output quality on benchmarked tasks. Budget alerts prevent runaway costs.',
    category: 'LLM Infrastructure',
  },
];
