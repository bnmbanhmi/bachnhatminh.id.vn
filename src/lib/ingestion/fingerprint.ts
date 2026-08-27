export interface CandidateData {
  street: string;
  house_number: string;
  ward: string;
  city: string;
  price: number;
  deposit: number | null;
  room_description: string;
  contact_phone: string;
}

export interface House {
  nmb_id: string;
  street: string;
  house_number: string;
  ward: string;
  city: string;
  landlord_phone?: string | null;
}

export type MatchType = 'primary' | 'secondary' | 'fuzzy' | 'none';

export interface FingerprintMatch {
  house: House;
  matchType: MatchType;
}

/**
 * Normalizes strings by trimming and converting to lowercase.
 */
function normalizeString(val: string | null | undefined): string {
  return (val || '').trim().toLowerCase();
}

/**
 * Normalizes phone numbers by removing all non-digit characters.
 */
function normalizePhone(val: string | null | undefined): string {
  return (val || '').replace(/\D/g, '');
}

/**
 * Checks a candidate listing against existing houses in the database to prevent duplicates and broker spam.
 * Overlaps checked:
 * 1. Primary: Address overlap (street + house_number + ward + city)
 * 2. Secondary: Contact overlap (landlord_phone + street)
 * 3. Fuzzy: Phone match or (street + house_number) match
 */
export function checkFingerprint(candidate: CandidateData, existingHouses: House[]): FingerprintMatch | null {
  const candCity = normalizeString(candidate.city);
  const candWard = normalizeString(candidate.ward);
  const candStreet = normalizeString(candidate.street);
  const candNumber = normalizeString(candidate.house_number);
  const candPhone = normalizePhone(candidate.contact_phone);

  for (const house of existingHouses) {
    const houseCity = normalizeString(house.city);
    const houseWard = normalizeString(house.ward);
    const houseStreet = normalizeString(house.street);
    const houseNumber = normalizeString(house.house_number);
    const housePhone = normalizePhone(house.landlord_phone);

    // Primary fingerprint: city + ward + street + house_number
    if (
      candCity === houseCity &&
      candWard === houseWard &&
      candStreet === houseStreet &&
      candNumber === houseNumber &&
      candNumber !== '' &&
      candStreet !== ''
    ) {
      return { house, matchType: 'primary' };
    }

    // Secondary fingerprint: landlord_phone + street
    if (
      candPhone === housePhone &&
      candStreet === houseStreet &&
      candPhone !== '' &&
      candStreet !== ''
    ) {
      return { house, matchType: 'secondary' };
    }

    // Fuzzy match: either same phone (not empty) or same street + house_number (not empty)
    const hasPhoneMatch = candPhone === housePhone && candPhone !== '';
    const hasStreetNumMatch =
      candStreet === houseStreet &&
      candNumber === houseNumber &&
      candStreet !== '' &&
      candNumber !== '';

    if (hasPhoneMatch || hasStreetNumMatch) {
      return { house, matchType: 'fuzzy' };
    }
  }

  return null;
}
