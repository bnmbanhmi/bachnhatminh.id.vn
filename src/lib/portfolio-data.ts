import type { Listing } from '@/components/ListingCard';

export interface ArticleSourceItem {
  author?: string;
  title?: string;
  url?: string;
}

export interface ArticleMetric {
  label: string;
  value: string;
}

export interface ArticleSection {
  sectionTitle?: string;
  callout?: string;
  paragraphs?: string[];
  listItems?: string[];
  metrics?: ArticleMetric[];
  sources?: ArticleSourceItem[];
}

export interface ArticleContent {
  tagline?: string;
  callout?: string;
  sections?: ArticleSection[];
}

export const PORTFOLIO_LISTINGS: Listing[] = [
  // ==========================================
  // TAB 1: ABOUT ME
  // ==========================================
  {
    id: 'about-me',
    short_id: 'about-me',
    title: 'Bạch Nhật Minh',
    price: 0,
    published_at: 'Ho Chi Minh City, Vietnam',
    date_range: 'Ho Chi Minh City, Vietnam',
    created_at: 'Ho Chi Minh City, Vietnam',
    post_type: 'about',
    description:
      'Product Designer & AI Engineer bridging human mental models, dense information architecture, and autonomous AI systems.',
    content:
      'Product Designer & AI Engineer bridging human mental models, dense information architecture, and autonomous AI systems.',
    extracted_data: {
      subtitle: 'Product Designer & AI Engineer',
      date_range: 'Ho Chi Minh City, Vietnam',
      address_raw: 'Bạch Nhật Minh',
    },
    buildings: {
      address_text: 'Bạch Nhật Minh',
      street_text: 'Product Designer & AI Engineer',
    },
    article: {
      tagline:
        'Product Designer & AI Engineer bridging human mental models, dense information architecture, and autonomous AI systems.',
      callout:
        'Product Designer & AI Engineer bridging human mental models, dense information architecture, and autonomous AI systems.',
      sections: [
        {
          sectionTitle: 'Who I Am',
          paragraphs: [
            'I am a Product Designer and AI Engineer with a background in Data Science & Artificial Intelligence from Hanoi University of Science and Technology (HUST).',
            'I specialize in 0-to-1 product discovery, high-velocity frontend shipping (Next.js, React, Tailwind CSS), and designing deterministic AI agent workflows that bridge cognitive load and user intent.',
          ],
        },
        {
          sectionTitle: 'Design & Product Philosophy',
          listItems: [
            'Empathy is the input; Information Architecture is the output — Visual polish exists strictly to serve cognitive clarity and reduce scanning friction.',
            'Claude as a peer, not a novelty — Designing AI-legible design systems, deterministic context tokens, and structured prompt architectures for autonomous pair programming.',
            'Judgment over completeness — Prioritizing high-leverage surfaces where user experience moves the core business funnel most directly.',
          ],
        },
        {
          sectionTitle: 'Core Capabilities',
          listItems: [
            'UI/UX Architecture & Cognitive Load Reduction',
            'PostHog & Telemetry Funnel Optimization',
            'Next.js, React, TypeScript, Tailwind CSS Frontend Execution',
            'LLM Context Routing & Autonomous Agent Orchestration',
            'Data Science & Multi-modal Deep Learning (PyTorch, Computer Vision)',
          ],
        },
        {
          sectionTitle: 'Location & Working Style',
          paragraphs: [
            'Based in Ho Chi Minh City, Vietnam. Available for hybrid collaboration and pair programming sessions at Workflow Thao Dien.',
            'Async-first, written-first documentation, and a culture of radical candor and direct iterative feedback.',
          ],
        },
        {
          sectionTitle: 'Education',
          listItems: [
            'Hanoi University of Science and Technology (2022 – 2026) — B.S. in Data Science and AI, School of Information and Communication Technology (SoICT). Graduation Thesis on coding agent context routing (coretext).',
            'Hanoi – Amsterdam High School for the Gifted (2019 – 2022) — High School Diploma, Specialized in Mathematics.',
          ],
        },
        {
          sectionTitle: 'Direct Channels',
          listItems: [
            'GitHub: github.com/bnmbanhmi',
            'LinkedIn: linkedin.com/in/bachnhatminh',
            'Email: bach.n.minh@gmail.com',
          ],
        },
      ],
    },
  },

  // ==========================================
  // TAB 2: PRODUCTS
  // ==========================================
  {
    id: 'nhaminhbach',
    short_id: 'nhaminhbach',
    title: 'nhaminhbach.com',
    price: 0,
    published_at: 'July 2026 – Present',
    date_range: 'July 2026 – Present',
    created_at: 'July 2026 – Present',
    post_type: 'products',
    source_url: 'https://nhaminhbach.com',
    link_text: 'nhaminhbach.com (Live Platform)',
    description:
      'Map-based rental discovery platform transforming unstructured social housing posts into verified spatial listings.',
    content:
      'Map-based rental discovery platform transforming unstructured social housing posts into verified spatial listings.',
    extracted_data: {
      subtitle: 'Solo 0-to-1 product',
      date_range: 'July 2026 – Present',
      address_raw: 'nhaminhbach.com',
      link_text: 'nhaminhbach.com (Live Platform)',
      contact_info: 'https://nhaminhbach.com',
    },
    buildings: {
      address_text: 'nhaminhbach.com',
      street_text: 'Solo 0-to-1 product',
    },
    article: {
      sections: [
        {
          sectionTitle: 'Problem & Mental Model Reconstruction',
          paragraphs: [
            'Rental hunters in Hanoi and Ho Chi Minh City face extreme information fragmentation across chaotic Facebook groups, fake broker posts, duplicate listings, and inaccurate pricing.',
            'nhaminhbach reconstructs the mental model from unstructured social feeds into map-anchored, building-clustered spatial intelligence with verifiable transparency.',
          ],
        },
        {
          sectionTitle: 'Master-Detail Architecture & Glance Tokens',
          paragraphs: [
            'Engineered a high-density split-screen viewport combining a responsive map canvas with a sticky, scroll-synchronized master-detail pane.',
            'Replaced ambiguous classified headlines with standardized glance tokens: verified rent badges, move-in dates, gender preferences, and room transfer badges.',
          ],
        },
        {
          sectionTitle: 'PostHog Telemetry & Funnel Optimization',
          paragraphs: [
            'Implemented granular custom telemetry tracking card dwell time, inspection depth via IntersectionObserver sentinels, contact disclosure triggers, and outbound conversion rates.',
            'Optimized the discovery funnel by eliminating intermediate clicks and establishing direct 1-tap contact pathways.',
          ],
        },
        {
          sectionTitle: 'Zero-State & Deep-Link Synchronization',
          paragraphs: [
            'Full bidirectional URL query parameter serialization (?post=..., ?building=..., ?tab=...) enabling instant sharing, bookmarking, and seamless browser history navigation.',
            'Designed intelligent zero-state fallback handlers with actionable search expansion suggestions when queries yield sparse results.',
          ],
        },
      ],
    },
  },
  {
    id: 'coretext',
    short_id: 'coretext',
    title: 'coretext',
    price: 0,
    published_at: 'Oct 2025 – July 2026',
    date_range: 'Oct 2025 – July 2026',
    created_at: 'Oct 2025 – July 2026',
    post_type: 'products',
    description:
      'Deterministic context routing framework and file-native discovery protocols designed for autonomous coding agents.',
    content:
      'Deterministic context routing framework and file-native discovery protocols designed for autonomous coding agents.',
    extracted_data: {
      subtitle: '🎓 Graduation Thesis — HUST',
      date_range: 'Oct 2025 – July 2026',
      address_raw: 'coretext',
    },
    buildings: {
      address_text: 'coretext',
      street_text: '🎓 Graduation Thesis — HUST',
    },
    article: {
      sections: [
        {
          sectionTitle: 'The LLM Context Window Bottleneck',
          paragraphs: [
            'Modern autonomous coding agents face significant context pollution, token exhaustion, and hallucination when navigating enterprise codebases with arbitrary vector embeddings or unfiltered context dumps.',
            'Existing RAG approaches lack awareness of codebase topologies, dependency subtrees, and project-specific architectural boundaries.',
          ],
        },
        {
          sectionTitle: 'File-Native Deterministic Routing Protocols',
          paragraphs: [
            'Engineered coretext — a file-native, declarative routing framework that directs agent attention via deterministic manifest files, semantic skill triggers, and subtree synchronization rules.',
            'Ensures autonomous agents operate with high-precision local context without exceeding token budgets or degrading reasoning quality.',
          ],
        },
        {
          sectionTitle: 'Agent Evaluation Benchmarks',
          paragraphs: [
            'Benchmarked agent performance on multi-step software engineering tasks, demonstrating significant reduction in prompt token consumption and higher first-pass code generation accuracy.',
          ],
        },
      ],
    },
  },
  {
    id: 'seekwell',
    short_id: 'seekwell',
    title: 'SeekWell',
    price: 0,
    published_at: 'Oct 2025',
    date_range: 'Oct 2025',
    created_at: 'Oct 2025',
    post_type: 'products',
    source_url:
      'https://news.laodong.vn/ldt/thi-truong/diem-nhan-tu-cuoc-thi-kham-pha-khoa-hoc-du-lieu-asean-2025-1600914.ldo',
    link_text: 'Lao Động Newspaper coverage',
    description:
      'AI clinical screening ecosystem democratizing early skin lesion risk detection for outdoor workers using Vision Transformers.',
    content:
      'AI clinical screening ecosystem democratizing early skin lesion risk detection for outdoor workers using Vision Transformers.',
    extracted_data: {
      subtitle: '🏆 National Champion — ASEAN Data Science Explorers',
      date_range: 'Oct 2025',
      address_raw: 'SeekWell',
      link_text: 'Lao Động Newspaper coverage',
      contact_info:
        'https://news.laodong.vn/ldt/thi-truong/diem-nhan-tu-cuoc-thi-kham-pha-khoa-hoc-du-lieu-asean-2025-1600914.ldo',
    },
    buildings: {
      address_text: 'SeekWell',
      street_text: '🏆 National Champion — ASEAN Data Science Explorers',
    },
    article: {
      sections: [
        {
          sectionTitle: 'Clinical Problem & Sun-Exposed Laborers',
          paragraphs: [
            'Millions of outdoor workers and manual laborers across Southeast Asia face prolonged, severe solar radiation exposure with negligible access to specialized dermatological care or early skin lesion screening.',
            'Late detection of malignant skin lesions drastically worsens mortality rates and clinical healthcare burdens.',
          ],
        },
        {
          sectionTitle: 'Vision Transformer (ViT) Clinical Triage',
          paragraphs: [
            'Fine-tuned lightweight Vision Transformer (ViT) backbones on curated dermatoscopic datasets (ISIC Archive), achieving 70% multi-class classification accuracy in under 10 seconds on mobile devices.',
            'Architected confidence thresholding and Grad-CAM saliency maps to provide interpretable visual explanations to community healthcare volunteers.',
          ],
        },
        {
          sectionTitle: 'SAP Analytics Cloud UV/Climate Telemetry',
          paragraphs: [
            'Integrated SAP Analytics Cloud to process geospatial meteorological telemetry, regional UV index forecasts, and demographic vulnerability maps across ASEAN member states.',
          ],
        },
        {
          sectionTitle: 'Multi-Tier Triage Dashboard',
          paragraphs: [
            'Designed a comprehensive multi-tier triage interface connecting outdoor laborers, field health workers, and certified dermatologists for rapid remote consultation and referral.',
          ],
        },
      ],
    },
  },
  {
    id: 'etraffic',
    short_id: 'etraffic',
    title: 'eTraffic',
    price: 0,
    published_at: 'Nov 2024',
    date_range: 'Nov 2024',
    created_at: 'Nov 2024',
    post_type: 'products',
    source_url:
      'https://dantri.com.vn/thoi-su/pgsts-nguyen-phi-le-sang-kien-an-toan-giao-thong-viet-nam-khong-chi-la-mot-cuoc-thi-20241213003519921.htm',
    link_text: 'Post-competition talkshow on Dân trí Newspaper',
    description:
      'Intelligent traffic safety data platform aggregating incident reports into real-time risk heat maps and proactive alerts.',
    content:
      'Intelligent traffic safety data platform aggregating incident reports into real-time risk heat maps and proactive alerts.',
    extracted_data: {
      subtitle: '🥈 Runner-up — National Traffic Safety Initiative',
      date_range: 'Nov 2024',
      address_raw: 'eTraffic',
      link_text: 'Post-competition talkshow on Dân trí Newspaper',
      contact_info:
        'https://dantri.com.vn/thoi-su/pgsts-nguyen-phi-le-sang-kien-an-toan-giao-thong-viet-nam-khong-chi-la-mot-cuoc-thi-20241213003519921.htm',
    },
    buildings: {
      address_text: 'eTraffic',
      street_text: '🥈 Runner-up — National Traffic Safety Initiative',
    },
    article: {
      sections: [
        {
          sectionTitle: 'Traffic Incident Fragmentation Challenge',
          paragraphs: [
            'Traffic incident records in Vietnam historically suffered from siloed local reporting, unstructured narrative logs, missing GIS coordinates, and significant latency in deploying preventative interventions.',
          ],
        },
        {
          sectionTitle: 'Dual-Surface Command Console & Heatmaps',
          paragraphs: [
            'Designed and engineered a dual-surface visualization system: a dense command console for traffic police authorities and an accessible citizen awareness portal.',
            'Aggregated multi-source incident reports into real-time geospatial risk heatmaps and blackspot clustering.',
          ],
        },
        {
          sectionTitle: 'Predictive V2X Risk Modeling',
          paragraphs: [
            'Incorporated spatial-temporal graph models and historical weather/traffic density data to forecast high-probability collision zones and trigger proactive road safety advisories.',
          ],
        },
      ],
    },
  },

  // ==========================================
  // TAB 3: EXPERIENCE
  // ==========================================
  {
    id: 'gdgoc-hust',
    short_id: 'gdgoc-hust',
    title: 'Google Developer Group on Campus – HUST',
    price: 0,
    published_at: 'Nov 2022 – Aug 2025',
    date_range: 'Nov 2022 – Aug 2025',
    created_at: 'Nov 2022 – Aug 2025',
    post_type: 'experience',
    source_url: 'https://www.facebook.com/gdgoc.hust',
    link_text: 'GDG on Campus HUST Facebook Page',
    description:
      'Led developer community initiatives, technical programs, speaker/sponsor relations, and university-wide hackathons.',
    content:
      'Led developer community initiatives, technical programs, speaker/sponsor relations, and university-wide hackathons.',
    extracted_data: {
      subtitle: 'Sub-lead, Head of Operations',
      date_range: 'Nov 2022 – Aug 2025',
      address_raw: 'Google Developer Group on Campus – HUST',
      link_text: 'GDG on Campus HUST Facebook Page',
      contact_info: 'https://www.facebook.com/gdgoc.hust',
    },
    buildings: {
      address_text: 'Google Developer Group on Campus – HUST',
      street_text: 'Sub-lead, Head of Operations',
    },
    article: {
      callout:
        'Led developer community initiatives, technical programs, speaker/sponsor relations, and university-wide hackathons.',
      sections: [
        {
          sectionTitle: 'Leadership & Operations',
          paragraphs: [
            'Managed core team operations, event planning cadence, and external relations with tech industry sponsors and Google Developer Experts.',
          ],
        },
        {
          sectionTitle: 'Key Initiatives & Hackathons',
          paragraphs: [
            'Directed major technical events including Google I/O Extended, DevFest, and hands-on developer workshops on Cloud, Flutter, and AI technologies, engaging 500+ student developers.',
          ],
          sources: [
            {
              title: 'Google Developer Group on Campus – HUST Community',
              url: 'https://www.facebook.com/gdgoc.hust',
            },
          ],
        },
      ],
    },
  },
  {
    id: 'bkai-ecgfusion',
    short_id: 'bkai-ecgfusion',
    title: 'The International Research Center for AI (BK.AI) | HUST',
    price: 0,
    published_at: 'Oct 2024 – Aug 2025',
    date_range: 'Oct 2024 – Aug 2025',
    created_at: 'Oct 2024 – Aug 2025',
    post_type: 'experience',
    source_url: 'https://doi.org/10.1016/j.bspc.2026.110651',
    link_text: 'BSPC Q1 Journal Publication (DOI: 10.1016/j.bspc.2026.110651)',
    description:
      'Published peer-reviewed research on multi-modal ECG signal deep learning in Biomedical Signal Processing and Control (BSPC, Q1 Journal).',
    content:
      'Published peer-reviewed research on multi-modal ECG signal deep learning in Biomedical Signal Processing and Control (BSPC, Q1 Journal).',
    extracted_data: {
      subtitle: 'Research Student, Bio-informatics Lab',
      date_range: 'Oct 2024 – Aug 2025',
      address_raw: 'The International Research Center for AI (BK.AI) | HUST',
      link_text: 'BSPC Q1 Journal Publication (DOI: 10.1016/j.bspc.2026.110651)',
      contact_info: 'https://doi.org/10.1016/j.bspc.2026.110651',
    },
    buildings: {
      address_text: 'The International Research Center for AI (BK.AI) | HUST',
      street_text: 'Research Student, Bio-informatics Lab',
    },
    article: {
      callout:
        'Published peer-reviewed research on multi-modal ECG signal deep learning in Biomedical Signal Processing and Control (BSPC, Q1 Journal).',
      sections: [
        {
          sectionTitle: 'Research Focus: ECGFusion',
          paragraphs: [
            'Investigated multi-modal deep fusion of raw time-series ECG and spectral representations for automated cardiovascular disease detection.',
            'ECGFusion: Multi-modal deep fusion of time-series and spectral representations for heart disease detection.',
          ],
        },
        {
          sectionTitle: 'Architecture & Optimization',
          paragraphs: [
            'Conducted comparative studies and optimization of deep ResNet backbones combined with Multi-Head Self-Attention mechanisms and contrastive representation learning.',
          ],
          sources: [
            {
              title: 'Biomedical Signal Processing and Control (Elsevier BSPC)',
              url: 'https://doi.org/10.1016/j.bspc.2026.110651',
            },
          ],
        },
      ],
    },
  },
  {
    id: 'ai4life-hust',
    short_id: 'ai4life-hust',
    title: 'Institute for AI Innovation & Societal Impact | HUST',
    price: 0,
    published_at: 'Mar 2025 – Aug 2025',
    date_range: 'Mar 2025 – Aug 2025',
    created_at: 'Mar 2025 – Aug 2025',
    post_type: 'experience',
    description:
      'Researched AIoT edge intelligence, lightweight embedded neural networks, and environmental sensory analytics.',
    content:
      'Researched AIoT edge intelligence, lightweight embedded neural networks, and environmental sensory analytics.',
    extracted_data: {
      subtitle: 'Intern Research Student, AIoT Lab',
      date_range: 'Mar 2025 – Aug 2025',
      address_raw: 'Institute for AI Innovation & Societal Impact | HUST',
    },
    buildings: {
      address_text: 'Institute for AI Innovation & Societal Impact | HUST',
      street_text: 'Intern Research Student, AIoT Lab',
    },
    article: {
      callout:
        'Researched AIoT edge intelligence, lightweight embedded neural networks, and environmental sensory analytics.',
      sections: [
        {
          sectionTitle: 'AIoT & Edge Intelligence',
          paragraphs: [
            'Researched model quantization, pruning, and low-latency inference for edge IoT nodes and microcontroller deployment.',
          ],
        },
        {
          sectionTitle: 'Sensory Data Pipelines',
          paragraphs: [
            'Designed streaming telemetry pipelines processing continuous environmental and sensor data for automated anomaly detection.',
          ],
        },
      ],
    },
  },
];

