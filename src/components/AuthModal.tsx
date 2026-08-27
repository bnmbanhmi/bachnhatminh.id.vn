'use client';

import GoogleSignInButton from '@/components/GoogleSignInButton';
import BaseModal from '@/components/ui/BaseModal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export default function AuthModal({
  isOpen,
  onClose,
  title = 'Đăng nhập',
}: AuthModalProps) {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-xs">
      <div className="flex flex-col gap-3 pt-2 text-center">
        <div className="flex justify-center w-full">
          <GoogleSignInButton />
        </div>
        <button
          type="button"
          onClick={onClose}
          className="py-2 text-xs text-secondary hover:text-primary font-medium text-center transition-colors cursor-pointer"
        >
          Để sau
        </button>
      </div>
    </BaseModal>
  );
}
