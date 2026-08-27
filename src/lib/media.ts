/**
 * Client-side media processing and Cloudflare R2 upload helper module.
 */

export interface MediaUploadResult {
  publicUrl: string;
  objectKey: string;
}

export interface MediaValidationOptions {
  maxSizeMb?: number;
  allowedTypes?: string[];
}

const DEFAULT_ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
];

/**
 * Validates file type and max raw file size before processing.
 */
export function validateMediaFile(
  file: File,
  options: MediaValidationOptions = {}
): { valid: boolean; error?: string } {
  const maxSizeMb = options.maxSizeMb ?? 15;
  const allowedTypes = options.allowedTypes ?? DEFAULT_ALLOWED_TYPES;

  if (!file) {
    return { valid: false, error: 'Không tìm thấy tập tin.' };
  }

  const isTypeAllowed = allowedTypes.some((t) =>
    file.type.toLowerCase().startsWith(t.toLowerCase())
  );
  if (!isTypeAllowed) {
    return {
      valid: false,
      error: 'Định dạng hình ảnh không hợp lệ (hỗ trợ JPG, PNG, WebP, HEIC).',
    };
  }

  const maxSizeBytes = maxSizeMb * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `Dung lượng hình ảnh vượt quá ${maxSizeMb}MB.`,
    };
  }

  return { valid: true };
}

/**
 * Resizes and converts an image file to WebP format using HTML5 Canvas.
 */
export async function compressImageToWebP(
  file: File,
  maxDimension = 1920,
  quality = 0.82
): Promise<File> {
  // If browser does not support Image/Canvas (e.g. SSR edge case), return raw file
  if (typeof window === 'undefined' || typeof HTMLCanvasElement === 'undefined') {
    return file;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // Scale down if width or height exceeds maxDimension
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return resolve(file); // Fallback to original file
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            return resolve(file);
          }

          const originalNameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
          const compressedFile = new File(
            [blob],
            `${originalNameWithoutExt}.webp`,
            {
              type: 'image/webp',
              lastModified: Date.now(),
            }
          );

          resolve(compressedFile);
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Không thể đọc dữ liệu hình ảnh.'));
    };

    img.src = objectUrl;
  });
}

/**
 * Requests a presigned URL from the backend API and uploads the file directly to R2.
 */
export async function uploadFileToR2(
  file: File,
  postType: string,
  onProgress?: (percent: number) => void
): Promise<MediaUploadResult> {
  // 1. Compress image to WebP
  onProgress?.(10);
  const compressedFile = await compressImageToWebP(file);
  onProgress?.(30);

  // 2. Request presigned upload URL from backend
  const presignRes = await fetch('/api/media/upload-url', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fileName: compressedFile.name,
      fileType: compressedFile.type,
      fileSize: compressedFile.size,
      postType,
    }),
  });

  if (!presignRes.ok) {
    const errorData = await presignRes.json().catch(() => ({}));
    throw new Error(
      errorData.error || 'Không thể tạo liên kết tải ảnh lên hệ thống.'
    );
  }

  const { uploadUrl, publicUrl, objectKey, isMock } = await presignRes.json();
  onProgress?.(50);

  // If mock mode (e.g. local dev without R2 secrets configured), convert actual file to Data URL so photo displays
  if (isMock) {
    onProgress?.(100);
    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string || publicUrl);
      reader.readAsDataURL(compressedFile);
    });
    return { publicUrl: dataUrl, objectKey };
  }

  // 3. Upload binary file directly to R2 using PUT request
  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': compressedFile.type,
    },
    body: compressedFile,
  });

  if (!uploadRes.ok) {
    throw new Error('Tải ảnh lên R2 thất bại. Vui lòng thử lại.');
  }

  onProgress?.(100);
  return { publicUrl, objectKey };
}
