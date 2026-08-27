'use client';

import React, { useState, useRef } from 'react';
import { validateMediaFile, uploadFileToR2 } from '@/lib/media';

export interface MediaUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  postType: 'listing' | 'review' | 'request' | 'roommate';
  minImages?: number;
  maxImages?: number;
  disabled?: boolean;
  className?: string;
}

interface UploadTask {
  id: string;
  file: File;
  progress: number;
  error?: string;
}

export default function MediaUploader({
  images,
  onChange,
  postType,
  minImages = 0,
  maxImages = 10,
  disabled = false,
  className = '',
}: MediaUploaderProps) {
  const [tasks, setTasks] = useState<UploadTask[]>([]);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canAddMore = images.length + tasks.length < maxImages && !disabled;

  const handleFilesSelected = async (files: FileList | File[]) => {
    setGeneralError(null);
    const selectedFiles = Array.from(files);

    if (images.length + tasks.length + selectedFiles.length > maxImages) {
      setGeneralError(`Tối đa ${maxImages} hình ảnh cho bài đăng.`);
      return;
    }

    // Process each selected file
    for (const file of selectedFiles) {
      const validation = validateMediaFile(file);
      if (!validation.valid) {
        setGeneralError(validation.error || 'Tập tin không hợp lệ.');
        continue;
      }

      const taskId = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const newTask: UploadTask = {
        id: taskId,
        file,
        progress: 5,
      };

      setTasks((prev) => [...prev, newTask]);

      try {
        const result = await uploadFileToR2(file, postType, (percent) => {
          setTasks((prev) =>
            prev.map((t) => (t.id === taskId ? { ...t, progress: percent } : t))
          );
        });

        // Add successful public URL to images array and remove task
        onChange([...images, result.publicUrl]);
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
      } catch (err: any) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId
              ? { ...t, error: err.message || 'Lỗi tải ảnh lên.' }
              : t
          )
        );
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    if (disabled) return;
    const updated = [...images];
    updated.splice(index, 1);
    onChange(updated);
  };

  const handleRemoveTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-xs md:text-sm font-bold text-primary">
          Hình ảnh thực tế{' '}
          {minImages > 0 ? (
            <span className="text-theme-terracotta">* (Tối thiểu {minImages} ảnh)</span>
          ) : (
            <span className="text-secondary font-normal">(Không bắt buộc)</span>
          )}
        </label>
        <span className="text-xs text-secondary font-medium">
          {images.length}/{maxImages} ảnh
        </span>
      </div>

      {generalError && (
        <div className="p-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-600 dark:text-red-400 rounded-lg text-xs font-semibold">
          {generalError}
        </div>
      )}

      {/* Grid of uploaded thumbnails + tasks + add trigger */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {/* Existing uploaded images */}
        {images.map((url, idx) => (
          <div
            key={url + idx}
            className="relative aspect-square rounded-lg overflow-hidden border border-secondary/40 bg-surface group"
          >
            {/* Standard img display */}
            <img
              src={url}
              alt={`Ảnh ${idx + 1}`}
              className="w-full h-full object-cover"
            />
            {!disabled && (
              <button
                type="button"
                onClick={() => handleRemoveImage(idx)}
                className="absolute top-1 right-1 bg-black/70 hover:bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                title="Xóa ảnh"
              >
                ✕
              </button>
            )}
          </div>
        ))}

        {/* Uploading tasks progress */}
        {tasks.map((task) => (
          <div
            key={task.id}
            className="relative aspect-square rounded-lg overflow-hidden border border-secondary/40 bg-neutral/80 p-2 flex flex-col items-center justify-center text-center"
          >
            {task.error ? (
              <div className="space-y-1">
                <span className="text-xs font-bold text-red-600 block">Lỗi</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTask(task.id)}
                  className="text-[10px] text-secondary underline hover:text-primary"
                >
                  Bỏ qua
                </button>
              </div>
            ) : (
              <div className="w-full space-y-1.5 px-2">
                <span className="text-[11px] font-bold text-primary block truncate">
                  Đang tải...
                </span>
                <div className="w-full bg-secondary/20 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-theme-terracotta h-full transition-all duration-200"
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
                <span className="text-[10px] text-secondary font-mono">
                  {task.progress}%
                </span>
              </div>
            )}
          </div>
        ))}

        {/* Add photo button dropzone trigger */}
        {canAddMore && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square rounded-lg border-2 border-dashed border-secondary/50 hover:border-tertiary bg-neutral/50 hover:bg-surface flex flex-col items-center justify-center p-2 text-center transition-all cursor-pointer group"
          >
            <span className="text-xl font-bold text-secondary group-hover:text-tertiary">
              +
            </span>
            <span className="text-[11px] font-bold text-secondary group-hover:text-primary mt-1">
              Thêm ảnh
            </span>
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/heic"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFilesSelected(e.target.files);
            e.target.value = ''; // Reset file input
          }
        }}
      />
    </div>
  );
}
