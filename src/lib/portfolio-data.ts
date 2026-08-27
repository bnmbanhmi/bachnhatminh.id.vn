import type { Listing } from '@/components/ListingCard';

export const PORTFOLIO_LISTINGS: Listing[] = [
  // Projects
  {
    id: 'nhaminhbach',
    short_id: 'nhaminhbach',
    title: 'nhaminhbach.com',
    price: 0,
    published_at: 'July 2026 – Present',
    date_range: 'July 2026 – Present',
    created_at: 'July 2026 – Present',
    post_type: 'projects',
    source_url: 'https://nhaminhbach.com',
    link_text: 'nhaminhbach.com (Live Platform)',
    description:
      'Spatial rental discovery platform aggregating social housing feeds across Hanoi & HCMC into structured map pins, direct contact triggers, and zero-state recovery. Grew to ~150 users within 7 days of launch.',
    content:
      'Spatial rental discovery platform aggregating social housing feeds across Hanoi & HCMC into structured map pins, direct contact triggers, and zero-state recovery. Grew to ~150 users within 7 days of launch.',
    extracted_data: {
      subtitle: 'Solo 0-to-1 project',
      date_range: 'July 2026 – Present',
      address_raw: 'nhaminhbach.com',
      link_text: 'nhaminhbach.com (Live Platform)',
      contact_info: 'https://nhaminhbach.com',
    },
    buildings: {
      address_text: 'nhaminhbach.com',
      street_text: 'Solo 0-to-1 project',
    },
  },
  // Achievements
  {
    id: 'asean-dse',
    short_id: 'asean-dse',
    title: 'National Champion — ASEAN Data Science Explorers',
    price: 0,
    published_at: 'Oct 2025',
    date_range: 'Oct 2025',
    created_at: 'Oct 2025',
    post_type: 'achievements',
    source_url:
      'https://news.laodong.vn/ldt/thi-truong/diem-nhan-tu-cuoc-thi-kham-pha-khoa-hoc-du-lieu-asean-2025-1600914.ldo',
    link_text: 'Lao Động Newspaper coverage',
    description:
      'SeekWell: AI healthcare ecosystem democratizing early skin cancer screening for outdoor workers using Vision Transformers (ViT) and SAP Analytics Cloud UV/climate analytics. Fine-tuned ViT on dermatoscopic images (70% accuracy in under 10s) with automated triage and climate risk analytics.',
    content:
      'SeekWell: AI healthcare ecosystem democratizing early skin cancer screening for outdoor workers using Vision Transformers (ViT) and SAP Analytics Cloud UV/climate analytics. Fine-tuned ViT on dermatoscopic images (70% accuracy in under 10s) with automated triage and climate risk analytics.',
    extracted_data: {
      subtitle: 'ASEAN Foundation & SAP',
      date_range: 'Oct 2025',
      address_raw: 'National Champion — ASEAN Data Science Explorers',
      link_text: 'Lao Động Newspaper coverage',
      contact_info:
        'https://news.laodong.vn/ldt/thi-truong/diem-nhan-tu-cuoc-thi-kham-pha-khoa-hoc-du-lieu-asean-2025-1600914.ldo',
    },
    buildings: {
      address_text: 'National Champion — ASEAN Data Science Explorers',
      street_text: 'ASEAN Foundation & SAP',
    },
  },
  {
    id: 'skatgt-etraffic',
    short_id: 'skatgt-etraffic',
    title: 'Runner-up — Sáng kiến An toàn Giao thông Việt Nam',
    price: 0,
    published_at: 'Nov 2024',
    date_range: 'Nov 2024',
    created_at: 'Nov 2024',
    post_type: 'achievements',
    source_url:
      'https://dantri.com.vn/thoi-su/pgsts-nguyen-phi-le-sang-kien-an-toan-giao-thong-viet-nam-khong-chi-la-mot-cuoc-thi-20241213003519921.htm',
    link_text: 'Post-competition talkshow on Dân trí Newspaper',
    description:
      'eTraffic: Intelligent traffic data standardization platform featuring real-time risk heat maps, interactive official/public dashboards, and AI-powered predictive accident prevention with V2X coordination.',
    content:
      'eTraffic: Intelligent traffic data standardization platform featuring real-time risk heat maps, interactive official/public dashboards, and AI-powered predictive accident prevention with V2X coordination.',
    extracted_data: {
      subtitle: 'Dân trí Newspaper & Traffic Police Department',
      date_range: 'Nov 2024',
      address_raw: 'Runner-up — Sáng kiến An toàn Giao thông Việt Nam',
      link_text: 'Post-competition talkshow on Dân trí Newspaper',
      contact_info:
        'https://dantri.com.vn/thoi-su/pgsts-nguyen-phi-le-sang-kien-an-toan-giao-thong-viet-nam-khong-chi-la-mot-cuoc-thi-20241213003519921.htm',
    },
    buildings: {
      address_text: 'Runner-up — Sáng kiến An toàn Giao thông Việt Nam',
      street_text: 'Dân trí Newspaper & Traffic Police Department',
    },
  },
  // Education & Experience
  {
    id: 'hust-education',
    short_id: 'hust-education',
    title: 'Hanoi University of Science and Technology',
    price: 0,
    published_at: '2022 – 2026',
    date_range: '2022 – 2026',
    created_at: '2022 – 2026',
    post_type: 'education',
    description:
      'Graduation Thesis: coretext — file-native context routing and deterministic discovery protocols for autonomous coding agents.',
    content:
      'Graduation Thesis: coretext — file-native context routing and deterministic discovery protocols for autonomous coding agents.',
    extracted_data: {
      subtitle: 'B.S. in Data Science and AI',
      date_range: '2022 – 2026',
      address_raw: 'Hanoi University of Science and Technology',
    },
    buildings: {
      address_text: 'Hanoi University of Science and Technology',
      street_text: 'B.S. in Data Science and AI',
    },
  },
  {
    id: 'gdgoc-hust',
    short_id: 'gdgoc-hust',
    title: 'Google Developer Group on Campus – HUST',
    price: 0,
    published_at: 'Nov 2022 – Aug 2025',
    date_range: 'Nov 2022 – Aug 2025',
    created_at: 'Nov 2022 – Aug 2025',
    post_type: 'education',
    source_url: 'https://www.facebook.com/gdgoc.hust',
    link_text: 'Google Developer Group on Campus – HUST Facebook page',
    description:
      'Managed club activities, tech events, and hackathons; directed event technical programs, external relations with speakers/sponsors, and operations.',
    content:
      'Managed club activities, tech events, and hackathons; directed event technical programs, external relations with speakers/sponsors, and operations.',
    extracted_data: {
      subtitle: 'Sub-lead, Head of Operations',
      date_range: 'Nov 2022 – Aug 2025',
      address_raw: 'Google Developer Group on Campus – HUST',
      link_text: 'Google Developer Group on Campus – HUST Facebook page',
      contact_info: 'https://www.facebook.com/gdgoc.hust',
    },
    buildings: {
      address_text: 'Google Developer Group on Campus – HUST',
      street_text: 'Sub-lead, Head of Operations',
    },
  },
  {
    id: 'bkai-ecgfusion',
    short_id: 'bkai-ecgfusion',
    title: 'The International Research Center for Artificial Intelligence (BK.AI) | HUST',
    price: 0,
    published_at: 'Oct 2024 – Aug 2025',
    date_range: 'Oct 2024 – Aug 2025',
    created_at: 'Oct 2024 – Aug 2025',
    post_type: 'education',
    source_url: 'https://doi.org/10.1016/j.bspc.2026.110651',
    link_text: 'Publication on BSPC (Q1 Journal)',
    description:
      'ECGFusion: Multi-modal deep fusion of time-series and spectral representations for heart disease detection (BSPC Q1 Journal). Comparative study and optimization of ResNet with Attention mechanisms and contrastive learning.',
    content:
      'ECGFusion: Multi-modal deep fusion of time-series and spectral representations for heart disease detection (BSPC Q1 Journal). Comparative study and optimization of ResNet with Attention mechanisms and contrastive learning.',
    extracted_data: {
      subtitle: 'Research Student, Bio-informatics Lab',
      date_range: 'Oct 2024 – Aug 2025',
      address_raw: 'The International Research Center for Artificial Intelligence (BK.AI) | HUST',
      link_text: 'Publication on BSPC (Q1 Journal)',
      contact_info: 'https://doi.org/10.1016/j.bspc.2026.110651',
    },
    buildings: {
      address_text: 'The International Research Center for Artificial Intelligence (BK.AI) | HUST',
      street_text: 'Research Student, Bio-informatics Lab',
    },
  },
  {
    id: 'ai4life-hust',
    short_id: 'ai4life-hust',
    title: 'Institute for AI Innovation and Societal Impact | HUST',
    price: 0,
    published_at: 'Mar 2025 – Aug 2025',
    date_range: 'Mar 2025 – Aug 2025',
    created_at: 'Mar 2025 – Aug 2025',
    post_type: 'education',
    description: '',
    content: '',
    extracted_data: {
      subtitle: 'Intern Research Student, AIoT Lab',
      date_range: 'Mar 2025 – Aug 2025',
      address_raw: 'Institute for AI Innovation and Societal Impact | HUST',
    },
    buildings: {
      address_text: 'Institute for AI Innovation and Societal Impact | HUST',
      street_text: 'Intern Research Student, AIoT Lab',
    },
  },
  {
    id: 'ams-education',
    short_id: 'ams-education',
    title: 'Hanoi – Amsterdam High School for the Gifted',
    price: 0,
    published_at: '2019 – 2022',
    date_range: '2019 – 2022',
    created_at: '2019 – 2022',
    post_type: 'education',
    description: '',
    content: '',
    extracted_data: {
      subtitle: 'High School Diploma',
      date_range: '2019 – 2022',
      address_raw: 'Hanoi – Amsterdam High School for the Gifted',
    },
    buildings: {
      address_text: 'Hanoi – Amsterdam High School for the Gifted',
      street_text: 'High School Diploma',
    },
  },
];
