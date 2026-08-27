'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import BaseModal from '@/components/ui/BaseModal';
import ContactField from '@/components/ui/ContactField';
import { getUserContact, saveUserContact } from '@/lib/contact';

interface DisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetReviewId?: string;
  houseId?: string;
  address?: string;
}

export default function DisputeModal({
  isOpen,
  onClose,
  targetReviewId,
  houseId,
  address,
}: DisputeModalProps) {
  const supabase = createClient();

  const [claimantName, setClaimantName] = useState('');
  const [phone, setPhone] = useState('');
  const [saveForLater, setSaveForLater] = useState(false);
  const phoneRef = useRef(phone);
  phoneRef.current = phone;
  const [role, setRole] = useState<'landlord' | 'tenant' | 'broker' | 'other'>('landlord');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const maybePrefill = (user: { user_metadata?: Record<string, unknown> } | null) => {
      if (!phoneRef.current.trim()) {
        const saved = getUserContact(user);
        if (saved) setPhone(saved);
      }
    };

    supabase.auth.getUser().then(({ data: { user } }) => maybePrefill(user));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => maybePrefill(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, [isOpen, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!claimantName.trim() || !phone.trim() || !reason.trim()) {
      setErrorMsg('Vui lòng điền đầy đủ Họ tên, Thông tin liên hệ và Lý do khiếu nại.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        request_type: 'review_dispute',
        target_type: targetReviewId ? 'review' : 'building',
        target_id: targetReviewId || houseId || null,
        requester_name: claimantName.trim(),
        contact_info: phone.trim(),
        notes: reason.trim(),
        metadata: { role },
      };

      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gửi yêu cầu thất bại');
      }

      if (saveForLater && phone.trim()) {
        await saveUserContact(supabase, phone);
      }

      setSuccess(true);
    } catch (err: any) {
      console.error('Error submitting dispute:', err);
      setErrorMsg(err?.message || 'Đã có lỗi xảy ra khi gửi yêu cầu đính chính. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Yêu cầu đính chính / Khiếu nại thông tin"
      maxWidth="max-w-lg"
    >
      {address && (
        <div className="bg-neutral p-3 rounded-sm border border-secondary text-xs mb-4 text-secondary">
          Địa chỉ: <span className="font-bold text-primary">{address}</span>
          {houseId && <span className="block text-[10px] mt-0.5 font-space-grotesk">MÃ TÒA NHÀ: {houseId.toUpperCase()}</span>}
        </div>
      )}

      {success ? (
        <div className="text-center py-6">
          <div className="w-14 h-14 bg-green-50 border border-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h4 className="text-base font-bold text-primary mb-2">Đã nhận yêu cầu khiếu nại!</h4>
          <p className="text-secondary text-xs mb-6 max-w-sm mx-auto leading-relaxed">
            Đội ngũ nhaminhbach.com sẽ kiểm tra thông tin đối chứng và phản hồi trực tiếp qua SĐT của bạn trong 24h làm việc.
          </p>
          <button onClick={onClose} aria-label="Đóng" className="btn-primary px-6 py-2 text-sm font-bold">
            Hoàn tất
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-primary label-caps">Họ và tên *</label>
            <input
              type="text"
              className="input-field py-2 text-xs focus:outline-none"
              placeholder="Nhập họ tên của bạn..."
              value={claimantName}
              onChange={(e) => setClaimantName(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <ContactField
              label="Thông tin liên hệ"
              required
              placeholder="SĐT/Zalo, Facebook, Instagram"
              value={phone}
              onChange={setPhone}
              disabled={submitting}
              showSaveOption
              saveForLater={saveForLater}
              onSaveForLaterChange={setSaveForLater}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-primary label-caps">Vai trò của bạn *</label>
            <select
              className="input-field py-2 text-xs bg-surface focus:outline-none"
              value={role}
              onChange={(e: any) => setRole(e.target.value)}
              disabled={submitting}
            >
              <option value="landlord">Chủ nhà / Chủ sở hữu</option>
              <option value="tenant">Người đang thuê / Người thuê cũ</option>
              <option value="broker">Môi giới / Quản lý tòa nhà</option>
              <option value="other">Khác</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-primary label-caps">Nội dung đính chính / Lý do khiếu nại *</label>
            <textarea
              rows={4}
              className="input-field p-2.5 text-xs focus:outline-none"
              placeholder="Mô tả chi tiết điểm không chính xác hoặc cung cấp chứng từ minh chứng đối kháng..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          {errorMsg && <p className="text-error text-xs font-semibold">{errorMsg}</p>}

          <div className="flex justify-end gap-2 border-t border-secondary pt-4 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-secondary rounded-sm text-xs font-semibold text-primary hover:bg-gray-100 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn-primary py-2 px-6 text-xs font-bold bg-error hover:bg-red-800 border-error cursor-pointer"
              disabled={submitting}
            >
              {submitting ? 'Đang gửi...' : 'Gửi yêu cầu đính chính'}
            </button>
          </div>
        </form>
      )}
    </BaseModal>
  );
}
