'use client';

import React from 'react';
import BaseCard from '@/components/BaseCard';
import { formatDisplayDate } from '@/lib/dates';
import { formatDesiredWardDisplay } from '@/lib/location';

export interface SearchDemand {
  id: string;
  short_id?: string | null;
  desired_ward?: string | null;
  budget_min?: number | null;
  budget_max?: number | null;
  content?: string | null;
  published_at?: string | null;
  created_at?: string | null;
}

export interface SearchCardProps {
  demand: SearchDemand;
}

export default function SearchCard({ demand }: SearchCardProps) {
  const minText =
    demand.budget_min && demand.budget_min > 0
      ? (demand.budget_min / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })
      : '';
  const maxText =
    demand.budget_max && demand.budget_max > 0
      ? (demand.budget_max / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })
      : '';

  let budgetDisplay: string | null = null;
  if (minText && maxText) {
    budgetDisplay = minText === maxText ? `${minText}tr` : `${minText}tr - ${maxText}tr`;
  } else if (maxText) {
    budgetDisplay = `< ${maxText}tr`;
  } else if (minText) {
    budgetDisplay = `> ${minText}tr`;
  }

  const demandDate = formatDisplayDate(demand.published_at || demand.created_at);

  return (
    <BaseCard
      title={demand.desired_ward ? formatDesiredWardDisplay(demand.desired_ward) : undefined}
      statusBadge={
        budgetDisplay ? (
          <span className="text-xs font-bold text-tertiary">{budgetDisplay}</span>
        ) : null
      }
      specParts={demandDate ? [demandDate] : []}
    >
      {demand.content}
    </BaseCard>
  );
}