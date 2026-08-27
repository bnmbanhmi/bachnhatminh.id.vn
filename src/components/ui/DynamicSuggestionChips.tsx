'use client';

export type ChipCategory = 'location' | 'price' | 'keyword' | 'default';

export interface DynamicSuggestionChipsProps {
  activeContext?: ChipCategory;
  mode?: 'building' | 'units' | 'reviews' | 'roommates';
  onSelectLocation?: (selection: any, label: string) => void;
  onSelectPrice?: (minPrice: string, maxPrice: string) => void;
  onSelectKeyword?: (keyword: string) => void;
  className?: string;
}

const BUILDING_PRICE_CHIPS = [
  { label: 'Dưới 3tr', min: '', max: '3tr' },
  { label: '3tr - 5tr', min: '3tr', max: '5tr' },
  { label: '5tr - 8tr', min: '5tr', max: '8tr' },
  { label: 'Trên 8tr', min: '8tr', max: '' },
];

const ROOMMATE_PRICE_CHIPS = [
  { label: 'Dưới 1.5tr', min: '', max: '1.5tr' },
  { label: '1.5tr - 2.5tr', min: '1.5tr', max: '2.5tr' },
  { label: '2.5tr - 4tr', min: '2.5tr', max: '4tr' },
  { label: 'Trên 4tr', min: '4tr', max: '' },
];

const BUILDING_KEYWORD_CHIPS = [
  'Không chung chủ',
  'Giờ giấc tự do',
  'Nhận xe điện',
  'Ban công',
  'Máy giặt',
  'Full nội thất',
  'Điện nước giá dân',
];

const REVIEW_KEYWORD_CHIPS = [
  'Bùng cọc',
  'Quỵt cọc',
  'Điện giá cao',
  'Nước bẩn',
  'Hợp đồng bẫy',
  'Phạt vô lý',
  'Chủ trọ tốt',
];

const ROOMMATE_KEYWORD_CHIPS = [
  'Sạch sẽ',
  'Không hút thuốc',
  'Giờ giấc tự do',
  'Nấu ăn',
  'Đi làm',
  'Sinh viên',
];

export default function DynamicSuggestionChips({
  activeContext = 'default',
  mode = 'building',
  onSelectPrice,
  onSelectKeyword,
  className = '',
}: DynamicSuggestionChipsProps) {
  const priceChips = mode === 'roommates' ? ROOMMATE_PRICE_CHIPS : BUILDING_PRICE_CHIPS;

  const keywordChips =
    mode === 'reviews'
      ? REVIEW_KEYWORD_CHIPS
      : mode === 'roommates'
      ? ROOMMATE_KEYWORD_CHIPS
      : BUILDING_KEYWORD_CHIPS;

  const handlePriceClick = (item: { label: string; min: string; max: string }) => {
    if (onSelectPrice) {
      onSelectPrice(item.min, item.max);
    }
  };

  const handleKeywordClick = (chip: string) => {
    if (onSelectKeyword) {
      onSelectKeyword(chip);
    }
  };

  if (activeContext === 'location') {
    return null;
  }

  return (
    <div className={`flex flex-wrap items-center gap-1.5 text-xs ${className}`}>
      <span className="font-semibold text-secondary whitespace-nowrap shrink-0">Gợi ý:</span>

      <div className="flex flex-wrap items-center gap-1.5 min-w-0 flex-1">
        {activeContext === 'price' &&
          priceChips.map((item, idx) => (
            <button
              key={`price-${idx}`}
              type="button"
              onClick={() => handlePriceClick(item)}
              className="px-2.5 py-0.5 bg-neutral hover:bg-gray-200 border border-secondary rounded-full text-xs text-primary transition-colors cursor-pointer shrink-0"
            >
              {item.label}
            </button>
          ))}

        {activeContext === 'keyword' &&
          keywordChips.map((chip, idx) => (
            <button
              key={`kw-${idx}`}
              type="button"
              onClick={() => handleKeywordClick(chip)}
              className="px-2.5 py-0.5 bg-neutral hover:bg-gray-200 border border-secondary rounded-full text-xs text-primary transition-colors cursor-pointer shrink-0"
            >
              {chip}
            </button>
          ))}

        {activeContext === 'default' && (
          <>
            {priceChips.slice(0, 2).map((item, idx) => (
              <button
                key={`def-price-${idx}`}
                type="button"
                onClick={() => handlePriceClick(item)}
                className="px-2.5 py-0.5 bg-neutral hover:bg-gray-200 border border-secondary rounded-full text-xs text-primary transition-colors cursor-pointer shrink-0"
              >
                {item.label}
              </button>
            ))}
            {keywordChips.slice(0, 3).map((chip, idx) => (
              <button
                key={`def-kw-${idx}`}
                type="button"
                onClick={() => handleKeywordClick(chip)}
                className="px-2.5 py-0.5 bg-neutral hover:bg-gray-200 border border-secondary rounded-full text-xs text-primary transition-colors cursor-pointer shrink-0"
              >
                {chip}
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
