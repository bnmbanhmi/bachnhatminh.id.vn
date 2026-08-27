'use client';

import React from 'react';
import PostDetailPane, { type Profile } from '@/components/PostDetailPane';

export { type Profile };

export interface RoommateDetailPaneProps {
  profileId: string;
  onClose?: () => void;
  onRequireAuth?: () => void;
  isMobile?: boolean;
  className?: string;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

export default function RoommateDetailPane(props: RoommateDetailPaneProps) {
  return <PostDetailPane {...props} />;
}
