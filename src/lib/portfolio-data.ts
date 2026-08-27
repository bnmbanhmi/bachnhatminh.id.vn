import type { Listing } from '@/components/ListingCard';

export const PORTFOLIO_LISTINGS: Listing[] = [
  // Projects
  {
    id: 'nhaminhbach',
    short_id: 'nhaminhbach',
    title: 'nhaminhbach.com',
    price: 0,
    published_at: '2026',
    created_at: '2026',
    post_type: 'projects',
    source_url: 'https://nhaminhbach.com',
    description:
      'Spatial rental discovery platform aggregating social housing feeds across Hanoi & HCMC into structured map pins, direct contact triggers, and zero-state recovery.',
    content:
      'Spatial rental discovery platform aggregating social housing feeds across Hanoi & HCMC into structured map pins, direct contact triggers, and zero-state recovery.',
    extracted_data: {
      move_in_date: '2026',
      gender_preference: 'Solo 0-to-1 project • Grew to ~150 users within 7 days of launch',
      address_raw: 'nhaminhbach.com',
      contact_info: 'https://nhaminhbach.com',
    },
    buildings: {
      address_text: 'nhaminhbach.com',
      street_text: 'Solo 0-to-1 project • Grew to ~150 users within 7 days of launch',
    },
  },
  // Achievements
  {
    id: 'asean-dse',
    short_id: 'asean-dse',
    title: 'National Champion — ASEAN Data Science Explorers',
    price: 0,
    published_at: 'Oct 2025',
    created_at: 'Oct 2025',
    post_type: 'achievements',
    source_url:
      'https://news.laodong.vn/ldt/thi-truong/diem-nhan-tu-cuoc-thi-kham-pha-khoa-hoc-du-lieu-asean-2025-1600914.ldo',
    description:
      'SeekWell: AI healthcare ecosystem democratizing early skin cancer screening for outdoor workers using Vision Transformers (ViT) and SAP Analytics Cloud UV/climate analytics.',
    content:
      'SeekWell: AI healthcare ecosystem democratizing early skin cancer screening for outdoor workers using Vision Transformers (ViT) and SAP Analytics Cloud UV/climate analytics.',
    extracted_data: {
      move_in_date: 'Oct 2025',
      gender_preference: 'ASEAN Foundation & SAP • Regional Finalist',
      address_raw: 'National Champion — ASEAN Data Science Explorers',
      contact_info:
        'https://news.laodong.vn/ldt/thi-truong/diem-nhan-tu-cuoc-thi-kham-pha-khoa-hoc-du-lieu-asean-2025-1600914.ldo',
    },
    buildings: {
      address_text: 'National Champion — ASEAN Data Science Explorers',
      street_text: 'ASEAN Foundation & SAP • Regional Finalist',
    },
  },
  {
    id: 'skatgt-etraffic',
    short_id: 'skatgt-etraffic',
    title: 'Runner-up — Sáng kiến An toàn Giao thông Việt Nam',
    price: 0,
    published_at: 'Nov 2024',
    created_at: 'Nov 2024',
    post_type: 'achievements',
    source_url:
      'https://dantri.com.vn/thoi-su/pgsts-nguyen-phi-le-sang-kien-an-toan-giao-thong-viet-nam-khong-chi-la-mot-cuoc-thi-20241213003519921.htm',
    description:
      'eTraffic: Intelligent traffic data standardization platform featuring real-time risk heat maps, V2X coordination, and predictive accident prevention.',
    content:
      'eTraffic: Intelligent traffic data standardization platform featuring real-time risk heat maps, V2X coordination, and predictive accident prevention.',
    extracted_data: {
      move_in_date: 'Nov 2024',
      gender_preference: 'Dân trí Newspaper',
      address_raw: 'Runner-up — Sáng kiến An toàn Giao thông Việt Nam',
      contact_info:
        'https://dantri.com.vn/thoi-su/pgsts-nguyen-phi-le-sang-kien-an-toan-giao-thong-viet-nam-khong-chi-la-mot-cuoc-thi-20241213003519921.htm',
    },
    buildings: {
      address_text: 'Runner-up — Sáng kiến An toàn Giao thông Việt Nam',
      street_text: 'Dân trí Newspaper',
    },
  },
  // Education & Experience
  {
    id: 'ai4life-hust',
    short_id: 'ai4life-hust',
    title: 'AI4LIFE | Institute for AI Innovation and Societal Impact | HUST',
    price: 0,
    published_at: 'Mar 2025 – Aug 2025',
    created_at: 'Mar 2025 – Aug 2025',
    post_type: 'education',
    description:
      'Intern Research Student, AIoT Lab at AI4LIFE | Institute for AI Innovation and Societal Impact | HUST.',
    content:
      'Intern Research Student, AIoT Lab at AI4LIFE | Institute for AI Innovation and Societal Impact | HUST.',
    extracted_data: {
      move_in_date: 'Mar 2025 – Aug 2025',
      gender_preference: 'Intern Research Student, AIoT Lab',
      address_raw: 'AI4LIFE | Institute for AI Innovation and Societal Impact | HUST',
    },
    buildings: {
      address_text: 'AI4LIFE | Institute for AI Innovation and Societal Impact | HUST',
      street_text: 'Intern Research Student, AIoT Lab',
    },
  },
  {
    id: 'bkai-ecgfusion',
    short_id: 'bkai-ecgfusion',
    title: 'BKAI | The International Research Center for Artificial Intelligence | HUST',
    price: 0,
    published_at: 'Oct 2024 – Aug 2025',
    created_at: 'Oct 2024 – Aug 2025',
    post_type: 'education',
    source_url: 'https://doi.org/10.1016/j.bspc.2026.110651',
    description:
      'ECGFusion: Multi-modal deep fusion of time-series and spectral representations for heart disease detection (BSPC Q1 Journal).',
    content:
      'ECGFusion: Multi-modal deep fusion of time-series and spectral representations for heart disease detection (BSPC Q1 Journal).',
    extracted_data: {
      move_in_date: 'Oct 2024 – Aug 2025',
      gender_preference: 'Research Student, Bio-informatics Lab',
      address_raw: 'BKAI | The International Research Center for Artificial Intelligence | HUST',
      contact_info: 'https://doi.org/10.1016/j.bspc.2026.110651',
    },
    buildings: {
      address_text: 'BKAI | The International Research Center for Artificial Intelligence | HUST',
      street_text: 'Research Student, Bio-informatics Lab',
    },
  },
  {
    id: 'gdgoc-hust',
    short_id: 'gdgoc-hust',
    title: 'Google Developer Group on Campus – HUST',
    price: 0,
    published_at: 'Nov 2022 – Aug 2025',
    created_at: 'Nov 2022 – Aug 2025',
    post_type: 'education',
    source_url: 'https://www.facebook.com/gdgoc.hust',
    description:
      'Sub-lead, Head of Operations at Google Developer Group on Campus – HUST.',
    content:
      'Sub-lead, Head of Operations at Google Developer Group on Campus – HUST.',
    extracted_data: {
      move_in_date: 'Nov 2022 – Aug 2025',
      gender_preference: 'Sub-lead, Head of Operations',
      address_raw: 'Google Developer Group on Campus – HUST',
      contact_info: 'https://www.facebook.com/gdgoc.hust',
    },
    buildings: {
      address_text: 'Google Developer Group on Campus – HUST',
      street_text: 'Sub-lead, Head of Operations',
    },
  },
  {
    id: 'hust-education',
    short_id: 'hust-education',
    title: 'Hanoi University of Science and Technology',
    price: 0,
    published_at: '2022 – 2026',
    created_at: '2022 – 2026',
    post_type: 'education',
    description:
      'Graduation Thesis: coretext — file-native context routing and deterministic discovery protocols for autonomous coding agents.',
    content:
      'Graduation Thesis: coretext — file-native context routing and deterministic discovery protocols for autonomous coding agents.',
    extracted_data: {
      move_in_date: '2022 – 2026',
      gender_preference: 'B.S. in Data Science and AI',
      address_raw: 'Hanoi University of Science and Technology',
    },
    buildings: {
      address_text: 'Hanoi University of Science and Technology',
      street_text: 'B.S. in Data Science and AI',
    },
  },
  {
    id: 'ams-education',
    short_id: 'ams-education',
    title: 'Hanoi – Amsterdam High School for the Gifted',
    price: 0,
    published_at: '2019 – 2022',
    created_at: '2019 – 2022',
    post_type: 'education',
    description:
      'Hanoi – Amsterdam High School for the Gifted (2019 – 2022).',
    content:
      'Hanoi – Amsterdam High School for the Gifted (2019 – 2022).',
    extracted_data: {
      move_in_date: '2019 – 2022',
      gender_preference: 'High School Diploma',
      address_raw: 'Hanoi – Amsterdam High School for the Gifted',
    },
    buildings: {
      address_text: 'Hanoi – Amsterdam High School for the Gifted',
      street_text: 'High School Diploma',
    },
  },
];
