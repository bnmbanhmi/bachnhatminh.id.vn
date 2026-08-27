'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/hooks/useAdmin';

interface AdminHideButtonProps {
  postId?: string | null;
  onHidden?: () => void;
  className?: string;
}

export default function AdminHideButton({
  postId,
  onHidden,
  className = '',
}: AdminHideButtonProps) {
  const { isAdmin, hidePost } = useAdmin();
  const [isHiding, setIsHiding] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  if (!isAdmin || !postId) return null;

  if (isHidden) {
    return (
      <span className={`px-1.5 py-0.5 text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 rounded shrink-0 select-none ${className}`}>
        Đã ẩn
      </span>
    );
  }

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm('Ẩn bài viết này khỏi hệ thống công khai?')) {
      return;
    }

    setIsHiding(true);
    const res = await hidePost(postId);
    if (res.success) {
      setIsHidden(true);
      onHidden?.();
    } else {
      alert(res.error || 'Không thể ẩn bài viết.');
      setIsHiding(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isHiding}
      title="Ẩn bài viết (Admin)"
      className={`px-1.5 py-0.5 text-[10px] font-bold text-red-600 hover:text-white hover:bg-red-600 border border-red-300 rounded transition-colors cursor-pointer shrink-0 select-none ${
        isHiding ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
    >
      {isHiding ? '...' : '[Ẩn]'}
    </button>
  );
}
