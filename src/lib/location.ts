export type HanoiUnitType = 'ward' | 'commune';

export interface HanoiUnit {
  code: string;
  name: string;
  slug: string;
  type: HanoiUnitType;
}

export interface LocationAlias {
  id: string;
  alias: string;
  displayName: string;
  locationType: 'ward' | 'radius' | 'landmark';
  wardCodes: string[];
  lat?: number;
  lng?: number;
  radiusM?: number;
  city?: CityCode;
}

export type LocationSelectionRadius = {
  type: 'radius';
  lat: number;
  lng: number;
  radiusM: number;
  label: string;
  wardCode?: string;
};

export type LocationSelectionWard = {
  type: 'ward';
  wardCode: string;
  wardCodes: string[];
  label: string;
};

export type LocationSelection = LocationSelectionRadius | LocationSelectionWard;

const CURRENT_WARD_NAMES = new Set([
  'Ba Đình',
  'Bạch Mai',
  'Bồ Đề',
  'Cầu Giấy',
  'Chương Mỹ',
  'Cửa Nam',
  'Đại Mỗ',
  'Định Công',
  'Đống Đa',
  'Đông Ngạc',
  'Dương Nội',
  'Giảng Võ',
  'Hà Đông',
  'Hai Bà Trưng',
  'Hoàn Kiếm',
  'Hoàng Liệt',
  'Hoàng Mai',
  'Hồng Hà',
  'Khương Đình',
  'Kiến Hưng',
  'Kim Liên',
  'Láng',
  'Lĩnh Nam',
  'Long Biên',
  'Nghĩa Đô',
  'Ngọc Hà',
  'Ô Chợ Dừa',
  'Phú Diễn',
  'Phú Lương',
  'Phú Thượng',
  'Phúc Lợi',
  'Phương Liệt',
  'Sơn Tây',
  'Tây Hồ',
  'Tây Mỗ',
  'Tây Tựu',
  'Thanh Liệt',
  'Thanh Xuân',
  'Thượng Cát',
  'Từ Liêm',
  'Tùng Thiện',
  'Tương Mai',
  'Văn Miếu - Quốc Tử Giám',
  'Việt Hưng',
  'Vĩnh Hưng',
  'Vĩnh Tuy',
  'Xuân Đỉnh',
  'Xuân Phương',
  'Yên Hòa',
  'Yên Nghĩa',
  'Yên Sở',
]);

const UNIT_TUPLES: ReadonlyArray<readonly [string, string]> = [
  ['AK', 'An Khánh'], ['BB', 'Bất Bạt'], ['BD', 'Ba Đình'], ['BI', 'Bình Minh'],
  ['BM', 'Bạch Mai'], ['BO', 'Bồ Đề'], ['BT', 'Bát Tràng'], ['BV', 'Ba Vì'],
  ['CD', 'Chương Dương'], ['CG', 'Cầu Giấy'], ['CM', 'Chương Mỹ'], ['CN', 'Cửa Nam'],
  ['CO', 'Cổ Đô'], ['CY', 'Chuyên Mỹ'], ['DA', 'Đông Anh'], ['DC', 'Định Công'],
  ['DD', 'Đống Đa'], ['DF', 'Đa Phúc'], ['DR', 'Đoài Phương'], ['DH', 'Dân Hòa'],
  ['DN', 'Dương Nội'], ['DG', 'Đông Ngạc'], ['DM', 'Đại Mỗ'], ['DP', 'Đan Phượng'],
  ['DT', 'Đại Thanh'], ['DU', 'Dương Hòa'], ['DX', 'Đại Xuyên'], ['PT', 'Phúc Thọ'],
  ['GL', 'Gia Lâm'], ['GV', 'Giảng Võ'], ['HA', 'Hát Môn'], ['HB', 'Hạ Bằng'],
  ['HD', 'Hà Đông'], ['HH', 'Hồng Hà'], ['HI', 'Hoàng Liệt'], ['HK', 'Hoàn Kiếm'],
  ['HL', 'Hòa Lạc'], ['HM', 'Hoàng Mai'], ['HS', 'Hồng Sơn'], ['HG', 'Hưng Đạo'],
  ['HP', 'Hòa Phú'], ['HU', 'Hương Sơn'], ['HT', 'Hai Bà Trưng'], ['HO', 'Hoài Đức'],
  ['HV', 'Hồng Vân'], ['HX', 'Hòa Xá'], ['KA', 'Kim Anh'], ['KD', 'Khương Đình'],
  ['KH', 'Kiến Hưng'], ['KL', 'Kim Liên'], ['KP', 'Kiều Phú'], ['LA', 'Láng'],
  ['LB', 'Long Biên'], ['LM', 'Liên Minh'], ['LN', 'Lĩnh Nam'], ['MC', 'Minh Châu'],
  ['MD', 'Mỹ Đức'], ['ML', 'Mê Linh'], ['NH', 'Ngọc Hà'], ['NB', 'Nội Bài'],
  ['ND', 'Nghĩa Đô'], ['NO', 'Ngọc Hồi'], ['NP', 'Nam Phù'], ['OD', 'Ô Chợ Dừa'],
  ['OI', 'Ô Diên'], ['PC', 'Phú Cát'], ['FD', 'Phù Đổng'], ['PD', 'Phú Diễn'],
  ['PL', 'Phú Lương'], ['FT', 'Phúc Thịnh'], ['FL', 'Phúc Lợi'], ['FY', 'Phương Liệt'],
  ['PN', 'Phú Nghĩa'], ['FC', 'Phúc Lộc'], ['PS', 'Phúc Sơn'], ['PU', 'Phú Thượng'],
  ['PZ', 'Phượng Dực'], ['PX', 'Phú Xuyên'], ['QW', 'Quảng Oai'], ['QB', 'Quảng Bị'],
  ['QM', 'Quang Minh'], ['QO', 'Quốc Oai'], ['SD', 'Sơn Đồng'], ['SH', 'Suối Hai'],
  ['SS', 'Sóc Sơn'], ['ST', 'Sơn Tây'], ['TA', 'Thuận An'], ['TE', 'Tùng Thiện'],
  ['TC', 'Thượng Cát'], ['TI', 'Thiên Lộc'], ['TL', 'Từ Liêm'], ['TW', 'Tây Phương'],
  ['TS', 'Tiến Thắng'], ['TH', 'Tây Hồ'], ['TY', 'Thanh Liệt'], ['TF', 'Thượng Phúc'],
  ['TK', 'Thư Lâm'], ['TM', 'Tương Mai'], ['TU', 'Tam Hưng'], ['TO', 'Thanh Oai'],
  ['TP', 'Trần Phú'], ['TG', 'Trung Giã'], ['TT', 'Thạch Thất'], ['TR', 'Thanh Trì'],
  ['TN', 'Thường Tín'], ['TZ', 'Tây Tựu'], ['TX', 'Thanh Xuân'], ['TB', 'Tây Mỗ'],
  ['UH', 'Ứng Hòa'], ['UT', 'Ứng Thiên'], ['VT', 'Vĩnh Thanh'], ['VD', 'Vân Đình'],
  ['VH', 'Vĩnh Hưng'], ['VI', 'Việt Hưng'], ['VL', 'Vật Lại'], ['VM', 'Văn Miếu - Quốc Tử Giám'],
  ['VY', 'Vĩnh Tuy'], ['XD', 'Xuân Đỉnh'], ['XM', 'Xuân Mai'], ['XP', 'Xuân Phương'],
  ['YB', 'Yên Bài'], ['YH', 'Yên Hòa'], ['YL', 'Yên Lãng'], ['YN', 'Yên Nghĩa'],
  ['YS', 'Yên Sở'], ['YX', 'Yên Xuân'],
];

export function normalizeLocationText(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ');
}

function slugifyLocation(value: string): string {
  return normalizeLocationText(value).replace(/\s+/g, '-');
}

export const HANOI_UNITS: HanoiUnit[] = UNIT_TUPLES.map(([code, name]) => ({
  code,
  name,
  slug: slugifyLocation(name),
  type: CURRENT_WARD_NAMES.has(name) ? 'ward' : 'commune',
}));

export const HANOI_WARDS = HANOI_UNITS.filter((unit) => unit.type === 'ward');
export const HANOI_COMMUNES = HANOI_UNITS.filter((unit) => unit.type === 'commune');

export type CoordinatesTuple = [number, number] & { lat: number; lng: number };

export const DEFAULT_HANOI_CENTER: CoordinatesTuple = Object.assign(
  [21.0285, 105.8542] as [number, number],
  { lat: 21.0285, lng: 105.8542 }
);

export const DEFAULT_HCMC_CENTER: CoordinatesTuple = Object.assign(
  [10.7769, 106.7009] as [number, number],
  { lat: 10.7769, lng: 106.7009 }
);

export type CityCode = 'HN' | 'SG';

export interface CityConfig {
  code: CityCode;
  name: string;
  shortName: string;
  defaultCenter: CoordinatesTuple;
  bounds: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
}

export const CITIES: Record<CityCode, CityConfig> = {
  HN: {
    code: 'HN',
    name: 'Hà Nội',
    shortName: 'HN',
    defaultCenter: DEFAULT_HANOI_CENTER,
    bounds: {
      minLat: 20.0,
      maxLat: 22.0,
      minLng: 105.0,
      maxLng: 106.5,
    },
  },
  SG: {
    code: 'SG',
    name: 'Sài Gòn',
    shortName: 'SG',
    defaultCenter: DEFAULT_HCMC_CENTER,
    bounds: {
      minLat: 10.0,
      maxLat: 11.6,
      minLng: 106.0,
      maxLng: 107.5,
    },
  },
};

export const DEFAULT_CITY: CityCode = 'HN';

export function isWithinHanoiBounds(lat: number, lng: number): boolean {
  return lat >= 20.0 && lat <= 22.0 && lng >= 105.0 && lng <= 106.5;
}

export function isWithinHcmBounds(lat: number, lng: number): boolean {
  return lat >= 10.0 && lat <= 11.6 && lng >= 106.0 && lng <= 107.5;
}

export function isWithinCityBounds(lat: number, lng: number, city: CityCode): boolean {
  if (city === 'SG') return isWithinHcmBounds(lat, lng);
  return isWithinHanoiBounds(lat, lng);
}

const SAIGON_ADDRESS_KEYWORDS = [
  'tphcm', 'tp.hcm', 'tp hcm', 'sài gòn', 'saigon', 'hồ chí minh',
  'quận 1', 'quận 2', 'quận 3', 'quận 4', 'quận 5', 'quận 6', 'quận 7', 'quận 8', 'quận 9', 'quận 10', 'quận 11', 'quận 12',
  'q1', 'q.1', 'q2', 'q.2', 'q3', 'q.3', 'q4', 'q.4', 'q5', 'q.5', 'q6', 'q.6', 'q7', 'q.7', 'q8', 'q.8', 'q9', 'q.9', 'q10', 'q.10', 'q11', 'q.11', 'q12', 'q.12',
  'bình thạnh', 'tân bình', 'gò vấp', 'phú nhuận', 'thủ đức', 'bình tân', 'tân phú', 'nhà bè', 'hóc môn', 'củ chi', 'cần giờ', 'bình chánh',
  'ftu2', 'ueh', 'bkhcm', 'vnu-hcm', 'làng đại học',
  'hẻm ',
];

export function isSaigonAddress(text: string | null | undefined): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return SAIGON_ADDRESS_KEYWORDS.some((kw) => lower.includes(kw));
}

export function resolveEntityCity(entity: {
  building_id?: string | null;
  house_id?: string | null;
  nmb_id?: string | null;
  lat?: number | null;
  lng?: number | null;
  address?: string | null;
  address_raw?: string | null;
  address_text?: string | null;
  address_masked?: string | null;
  locationText?: string | null;
  desired_lat?: number | null;
  desired_lng?: number | null;
  desired_ward?: string | null;
  extracted_data?: {
    lat?: number | null;
    lng?: number | null;
    address_raw?: string | null;
    desired_lat?: number | null;
    desired_lng?: number | null;
    desired_ward?: string | null;
  } | null;
  buildings?: {
    nmb_id?: string | null;
    address_text?: string | null;
    street_text?: string | null;
    ward_code?: string | null;
    canonical_location?: unknown;
  } | null;
}): CityCode {
  const bId = (entity.buildings?.nmb_id || entity.nmb_id || entity.building_id || entity.house_id || '').toUpperCase();
  if (bId.startsWith('SG')) return 'SG';
  if (bId.startsWith('HN')) return 'HN';

  const ext = entity.extracted_data || {};
  let lat = entity.lat ?? entity.desired_lat ?? ext.lat ?? ext.desired_lat;
  let lng = entity.lng ?? entity.desired_lng ?? ext.lng ?? ext.desired_lng;

  if ((!lat || !lng) && entity.buildings?.canonical_location) {
    const geo = parseGeographyPoint(entity.buildings.canonical_location);
    if (geo) {
      lat = geo.lat;
      lng = geo.lng;
    }
  }

  if (lat && lng && lat !== 0 && lng !== 0) {
    if (isWithinHcmBounds(lat, lng)) return 'SG';
    if (isWithinHanoiBounds(lat, lng)) return 'HN';
  }

  const addr =
    entity.address ||
    entity.address_raw ||
    entity.address_text ||
    entity.buildings?.address_text ||
    entity.buildings?.street_text ||
    ext.address_raw ||
    entity.address_masked ||
    entity.locationText ||
    entity.desired_ward ||
    ext.desired_ward;

  if (addr && isSaigonAddress(addr)) return 'SG';

  return 'HN';
}

// Database aliases override this fallback. This seed keeps the picker useful
// before a newly-created environment has loaded its first alias query.
export const DEFAULT_LOCATION_ALIASES: LocationAlias[] = [
  {
    id: 'tmu',
    alias: 'TMU',
    displayName: 'Đại học Thương Mại (TMU)',
    locationType: 'landmark',
    wardCodes: ['CG', 'TL'],
    city: 'HN',
    lat: 21.0368,
    lng: 105.7738,
    radiusM: 1000,
  },
  {
    id: 'bach-khoa',
    alias: 'Bách Khoa',
    displayName: 'Khu Bách Khoa (BKHN / BKX)',
    locationType: 'landmark',
    wardCodes: ['BM', 'HT'],
    city: 'HN',
    lat: 21.006523,
    lng: 105.847512,
    radiusM: 1000,
  },
  {
    id: 'bkx',
    alias: 'BKX',
    displayName: 'Khu Bách - Kinh - Xây',
    locationType: 'landmark',
    wardCodes: ['BM', 'HT'],
    city: 'HN',
    lat: 21.0055,
    lng: 105.8445,
    radiusM: 1000,
  },
  {
    id: 'neu',
    alias: 'NEU',
    displayName: 'ĐH Kinh tế Quốc dân (NEU)',
    locationType: 'landmark',
    wardCodes: ['BM', 'HT'],
    city: 'HN',
    lat: 20.9995,
    lng: 105.8425,
    radiusM: 1000,
  },
  {
    id: 'vnu-hnue',
    alias: 'ĐH Quốc Gia',
    displayName: 'ĐH Quốc Gia / ĐH Sư Phạm (Xuân Thủy)',
    locationType: 'landmark',
    wardCodes: ['CG', 'ND'],
    city: 'HN',
    lat: 21.0378,
    lng: 105.7825,
    radiusM: 1000,
  },
  {
    id: 'ftu',
    alias: 'FTU',
    displayName: 'ĐH Ngoại Thương (Chùa Láng)',
    locationType: 'landmark',
    wardCodes: ['DD', 'LA'],
    city: 'HN',
    lat: 21.0232,
    lng: 105.8055,
    radiusM: 1000,
  },
  {
    id: 'hvbc',
    alias: 'HVBC',
    displayName: 'Học viện Báo chí & Tuyên truyền',
    locationType: 'landmark',
    wardCodes: ['CG'],
    city: 'HN',
    lat: 21.0360,
    lng: 105.7895,
    radiusM: 1000,
  },
  {
    id: 'haui',
    alias: 'HaUI',
    displayName: 'ĐH Công nghiệp Hà Nội (Nhổn)',
    locationType: 'landmark',
    wardCodes: ['TL', 'TZ'],
    city: 'HN',
    lat: 21.0537,
    lng: 105.7351,
    radiusM: 1000,
  },
  {
    id: 'aof',
    alias: 'AOF',
    displayName: 'Học viện Tài chính',
    locationType: 'landmark',
    wardCodes: ['TL', 'XD'],
    city: 'HN',
    lat: 21.0772,
    lng: 105.7766,
    radiusM: 1000,
  },
  {
    id: 'hmu',
    alias: 'HMU',
    displayName: 'ĐH Y Hà Nội (Tôn Thất Tùng)',
    locationType: 'landmark',
    wardCodes: ['DD', 'TX'],
    city: 'HN',
    lat: 21.0028,
    lng: 105.8315,
    radiusM: 1000,
  },
  {
    id: 'ba',
    alias: 'BA',
    displayName: 'Học viện Ngân hàng (Chùa Bộc)',
    locationType: 'landmark',
    wardCodes: ['DD'],
    city: 'HN',
    lat: 21.0092,
    lng: 105.8288,
    radiusM: 1000,
  },
  {
    id: 'hau-ptit',
    alias: 'HAU',
    displayName: 'ĐH Kiến Trúc / Học viện Bưu chính (Hà Đông)',
    locationType: 'landmark',
    wardCodes: ['HD', 'TX'],
    city: 'HN',
    lat: 20.9808,
    lng: 105.7885,
    radiusM: 1000,
  },
  // Saigon Landmarks
  {
    id: 'ftu2',
    alias: 'FTU2',
    displayName: 'ĐH Ngoại Thương Cơ sở 2 (Bình Thạnh)',
    locationType: 'landmark',
    wardCodes: [],
    city: 'SG',
    lat: 10.8037,
    lng: 106.7132,
    radiusM: 1000,
  },
  {
    id: 'ueh',
    alias: 'UEH',
    displayName: 'ĐH Kinh Tế TP.HCM (UEH)',
    locationType: 'landmark',
    wardCodes: [],
    city: 'SG',
    lat: 10.7830,
    lng: 106.6949,
    radiusM: 1000,
  },
  {
    id: 'bkhcm',
    alias: 'BKHCM',
    displayName: 'ĐH Bách Khoa TP.HCM (Q10)',
    locationType: 'landmark',
    wardCodes: [],
    city: 'SG',
    lat: 10.7725,
    lng: 106.6578,
    radiusM: 1000,
  },
  {
    id: 'vnu-hcm',
    alias: 'VNU-HCM',
    displayName: 'ĐH Quốc Gia TP.HCM (Làng ĐH Thủ Đức)',
    locationType: 'landmark',
    wardCodes: [],
    city: 'SG',
    lat: 10.8700,
    lng: 106.8030,
    radiusM: 1000,
  },
];

export function getLocationSelectionFromChip(label: string): LocationSelection | null {
  const wardCoords = getWardCoordinates(label);
  if (wardCoords) {
    return {
      type: 'radius',
      lat: wardCoords.lat,
      lng: wardCoords.lng,
      radiusM: 1000,
      label,
    };
  }
  return null;
}

export function findHanoiUnit(code: string | null | undefined): HanoiUnit | undefined {
  if (!code) return undefined;
  return HANOI_UNITS.find((unit) => unit.code === code.toUpperCase());
}

export function parseGeographyPoint(value: unknown): { lat: number; lng: number } | null {
  if (!value) return null;
  if (typeof value === 'object') {
    const geo = value as { type?: string; coordinates?: unknown; lat?: unknown; lng?: unknown; latitude?: unknown; longitude?: unknown };
    if (geo.type === 'Point' && Array.isArray(geo.coordinates) && geo.coordinates.length >= 2) {
      const lng = Number(geo.coordinates[0]);
      const lat = Number(geo.coordinates[1]);
      if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
    }
    if (typeof geo.lat === 'number' && typeof geo.lng === 'number') {
      return { lat: geo.lat, lng: geo.lng };
    }
    if (typeof geo.latitude === 'number' && typeof geo.longitude === 'number') {
      return { lat: geo.latitude, lng: geo.longitude };
    }
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    const wktMatch = trimmed.match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i);
    if (wktMatch) {
      const lng = Number(wktMatch[1]);
      const lat = Number(wktMatch[2]);
      if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
    }
    // PostGIS EWKB / WKB Hex String (e.g. 0101000020E6100000...)
    if (/^[0-9A-Fa-f]{42,50}$/.test(trimmed)) {
      try {
        const len = trimmed.length / 2;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = parseInt(trimmed.substr(i * 2, 2), 16);
        }
        const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
        const isLittleEndian = view.getUint8(0) === 1;
        if (len === 25) { // EWKB with SRID (25 bytes / 50 hex characters)
          const lng = view.getFloat64(9, isLittleEndian);
          const lat = view.getFloat64(17, isLittleEndian);
          if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
        } else if (len === 21) { // WKB without SRID (21 bytes / 42 hex characters)
          const lng = view.getFloat64(5, isLittleEndian);
          const lat = view.getFloat64(13, isLittleEndian);
          if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
        }
      } catch {}
    }
  }
  return null;
}

const WARD_CENTER_COORDINATES: Record<string, { lat: number; lng: number }> = {
  BM: { lat: 21.006523, lng: 105.847512 }, // Bạch Mai / Bách Khoa
  CG: { lat: 21.0366, lng: 105.7906 },   // Cầu Giấy
  TX: { lat: 20.9984, lng: 105.8118 },   // Thanh Xuân
  DD: { lat: 21.0125, lng: 105.8283 },   // Đống Đa
  BD: { lat: 21.0341, lng: 105.8322 },   // Ba Đình
  HK: { lat: 21.0285, lng: 105.8542 },   // Hoàn Kiếm
  TH: { lat: 21.0664, lng: 105.8188 },   // Tây Hồ
  HD: { lat: 20.9722, lng: 105.7772 },   // Hà Đông
  HM: { lat: 20.9768, lng: 105.8465 },   // Hoàng Mai
  LB: { lat: 21.0458, lng: 105.8812 },   // Long Biên
  TL: { lat: 21.0368, lng: 105.7538 },   // Từ Liêm / Nam Từ Liêm
  DM: { lat: 21.0025, lng: 105.7588 },   // Đại Mỗ
  PD: { lat: 21.0452, lng: 105.7582 },   // Phú Diễn
  ND: { lat: 21.0378, lng: 105.7944 },   // Nghĩa Đô / Xuân Thủy
  XD: { lat: 21.0682, lng: 105.7745 },   // Xuân Đỉnh
  XP: { lat: 21.0268, lng: 105.7412 },   // Xuân Phương
  GL: { lat: 21.0210, lng: 105.9400 },   // Gia Lâm
};

export function getWardCoordinatesByCode(
  wardCode: string | null | undefined,
  city?: CityCode
): { lat: number; lng: number } | null {
  if (!wardCode) return null;
  const upper = wardCode.trim().toUpperCase();

  if (city === 'SG' && (upper.startsWith('HN') || WARD_CENTER_COORDINATES[upper])) {
    return null;
  }

  const match = upper.match(/^HN([A-Z]{2})/);
  const code = match ? match[1] : upper;

  if (WARD_CENTER_COORDINATES[code]) {
    if (city === 'SG') return null;
    return WARD_CENTER_COORDINATES[code];
  }
  if (WARD_CENTER_COORDINATES[upper]) {
    if (city === 'SG') return null;
    return WARD_CENTER_COORDINATES[upper];
  }

  const alias = DEFAULT_LOCATION_ALIASES.find((item) => {
    const itemCity = item.city || 'HN';
    if (city && itemCity !== city) return false;
    return item.wardCodes.includes(code) || item.wardCodes.includes(upper);
  });
  if (alias?.lat !== undefined && alias.lng !== undefined) {
    return { lat: alias.lat, lng: alias.lng };
  }
  return null;
}

export function getWardCoordinates(
  wardNameOrText: string | null | undefined,
  city?: CityCode
): { lat: number; lng: number } | null {
  if (!wardNameOrText) return null;
  const normalized = normalizeLocationText(wardNameOrText);
  if (!normalized) return null;

  const isSg = city === 'SG' || isSaigonAddress(wardNameOrText);

  // 1. Alias match (scoped by city if specified or detected)
  const alias = DEFAULT_LOCATION_ALIASES.find((item) => {
    const itemCity = item.city || 'HN';
    if (isSg && itemCity !== 'SG') return false;
    if (!isSg && city === 'HN' && itemCity !== 'HN') return false;

    const normAlias = normalizeLocationText(item.alias);
    const normDisplayName = normalizeLocationText(item.displayName);

    if (normalized === normAlias || normalized === normDisplayName) {
      return true;
    }

    // Whole-word token match only for aliases with length >= 3 to avoid false positive collisions on short tokens like "ba"
    if (normAlias.length >= 3) {
      const words = normalized.split(' ');
      if (words.includes(normAlias)) {
        return true;
      }
    }

    return false;
  });

  if (alias?.lat !== undefined && alias.lng !== undefined) {
    return { lat: alias.lat, lng: alias.lng };
  }

  // 2. Hanoi Administrative Units (Only for Hanoi)
  if (!isSg) {
    const matchedUnit = HANOI_UNITS.find(
      (unit) =>
        normalized === normalizeLocationText(unit.name) ||
        normalized.includes(normalizeLocationText(unit.name))
    );
    if (matchedUnit) {
      const coords = getWardCoordinatesByCode(matchedUnit.code, 'HN');
      if (coords) return coords;
    }
  }

  return null;
}

export function distanceMeters(
  first: { lat: number; lng: number },
  second: { lat: number; lng: number }
): number {
  const earthRadiusM = 6_371_000;
  const toRadians = (degrees: number) => degrees * Math.PI / 180;
  const deltaLat = toRadians(second.lat - first.lat);
  const deltaLng = toRadians(second.lng - first.lng);
  const lat1 = toRadians(first.lat);
  const lat2 = toRadians(second.lat);
  const a = Math.sin(deltaLat / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;
  return earthRadiusM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function createWardSelection(codes: string[]): LocationSelectionWard | null {
  const cleanCodes = codes.map((c) => c.trim().toUpperCase()).filter(Boolean);
  if (cleanCodes.length === 0) return null;

  const matchedNames = cleanCodes.map((code) => {
    const unit = HANOI_UNITS.find((u) => u.code === code);
    return unit ? unit.name : code;
  });

  let label = matchedNames.join(', ');
  if (cleanCodes.length > 2) {
    label = `${cleanCodes.length} khu vực`;
  }

  return {
    type: 'ward',
    wardCode: cleanCodes[0],
    wardCodes: cleanCodes,
    label,
  };
}

export function parseWardCodesFromText(text: string | null | undefined): string[] {
  if (!text) return [];
  const cleanText = text.replace(/\s*\[radius:[^\]]+\]/g, '').trim();
  const parts = cleanText.split(/[,;\+\/]/).map((p) => p.trim().toLowerCase()).filter(Boolean);
  const foundCodes: string[] = [];

  for (const part of parts) {
    const upper = part.toUpperCase();
    if (HANOI_UNITS.some((u) => u.code === upper)) {
      if (!foundCodes.includes(upper)) foundCodes.push(upper);
      continue;
    }

    const matched = HANOI_UNITS.find(
      (u) =>
        u.name.toLowerCase() === part ||
        part.includes(u.name.toLowerCase()) ||
        u.name.toLowerCase().includes(part)
    );
    if (matched && !foundCodes.includes(matched.code)) {
      foundCodes.push(matched.code);
    }
  }

  return foundCodes;
}

export function formatDesiredWardDisplay(
  desiredWard: string | null | undefined,
  _locationType?: string | null
): string {
  if (!desiredWard) return 'Tìm ở ghép';
  const clean = desiredWard.replace(/\s*\[radius:[^\]]+\]/g, '').trim();
  if (!clean) return 'Khu vực đã chọn';
  return clean;
}

export function matchesLocationSelection(
  selection: LocationSelection | null,
  wardCode?: string | null,
  point?: unknown,
  addressText?: string | null
): boolean {
  if (!selection) return true;

  if (selection.type === 'ward') {
    const codes = (selection.wardCodes && selection.wardCodes.length > 0)
      ? selection.wardCodes.map((c) => c.toUpperCase())
      : selection.wardCode ? [selection.wardCode.toUpperCase()] : [];

    if (codes.length === 0) return true;

    if (wardCode && codes.includes(wardCode.toUpperCase())) {
      return true;
    }

    if (addressText) {
      const normalizedAddr = normalizeLocationText(addressText);
      const matched = codes.some((code) => {
        const unit = HANOI_UNITS.find((u) => u.code === code);
        return unit && normalizedAddr.includes(normalizeLocationText(unit.name));
      });
      if (matched) return true;
    }

    return false;
  }

  // Tier 1: Direct PostGIS / coordinates object
  const parsedPoint = parseGeographyPoint(point);
  if (parsedPoint) {
    return distanceMeters(selection, parsedPoint) <= selection.radiusM;
  }

  // Tier 2: Derived coordinates from wardCode
  const wardCoords = getWardCoordinatesByCode(wardCode);
  if (wardCoords) {
    return distanceMeters(selection, wardCoords) <= selection.radiusM;
  }

  // Tier 3: Derived coordinates from address text
  const textCoords = getWardCoordinates(addressText);
  if (textCoords) {
    return distanceMeters(selection, textCoords) <= selection.radiusM;
  }

  // Tier 4: Selection wardCode direct match
  if (selection.wardCode && wardCode) {
    return selection.wardCode.toUpperCase() === wardCode.toUpperCase();
  }

  return false;
}

export function appendLocationParams(params: URLSearchParams, selection: LocationSelection | null): void {
  if (!selection) return;
  if (selection.type === 'ward') {
    params.set('location_type', 'ward');
    params.set('ward', selection.wardCodes.join(','));
    return;
  }
  params.set('location_type', 'radius');
  params.set('lat', String(selection.lat));
  params.set('lng', String(selection.lng));
  params.set('radius', String(selection.radiusM));
  if (selection.wardCode) params.set('ward', selection.wardCode);
}

export function locationFromSearchParams(params: Pick<URLSearchParams, 'get'>): LocationSelection | null {
  const type = params.get('location_type');
  const wardParam = params.get('ward');

  if (type === 'ward' && wardParam) {
    return createWardSelection(wardParam.split(','));
  }

  const latParam = params.get('lat');
  const lngParam = params.get('lng');
  const radiusParam = params.get('radius');
  const hasCompleteRadius = [latParam, lngParam, radiusParam].every(
    (value) => value !== null && value.trim() !== ''
  );

  if (type === 'radius' || hasCompleteRadius) {
    if (!hasCompleteRadius) return null;

    const lat = Number(latParam);
    const lng = Number(lngParam);
    const radiusM = Number(radiusParam);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || !Number.isFinite(radiusM)) return null;
    return {
      type: 'radius',
      lat,
      lng,
      radiusM,
      label: 'Khu vực đã chọn',
      wardCode: params.get('ward') || undefined,
    };
  }

  if (wardParam) {
    return createWardSelection(wardParam.split(','));
  }

  return null;
}

export interface GeocodeLocationItem {
  id: string;
  label: string;
  detail?: string;
  lat: number;
  lng: number;
  type: 'ward' | 'radius' | 'osm';
  wardCode?: string;
}

export async function searchHybridLocation(query: string): Promise<GeocodeLocationItem[]> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  // Search OpenStreetMap Nominatim via API proxy (Multi-city dynamic geocoding)
  try {
    const res = await fetch(`/api/location/search?q=${encodeURIComponent(cleanQuery)}`);
    if (res.ok) {
      const data = await res.json();
      return (data.results || []) as GeocodeLocationItem[];
    }
  } catch (err) {
    console.warn('Error fetching OSM locations in searchHybridLocation:', err);
  }

  return [];
}

