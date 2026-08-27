'use client';

import React from 'react';
import PostDetailPane from '@/components/PostDetailPane';

export interface BuildingDetailPaneProps {
  elasticId?: string;
  postId?: string;
  onClose?: () => void;
  onRequestWriteReview?: (buildingId: string) => void;
  isMobile?: boolean;
  className?: string;
  initialTab?: 'all' | 'listings' | 'reviews' | 'roommates';
  highlightReviewId?: string;
  highlightPostId?: string;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

export default function BuildingDetailPane(props: BuildingDetailPaneProps) {
  return <PostDetailPane {...props} />;
}
