'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import SegmentedControl, { SegmentedOption } from '@/components/ui/SegmentedControl';

export interface NotificationItem {
  id: string;
  user_id: string | null;
  type: string;
  title: string;
  body: string;
  link_url: string | null;
  created_at: string;
  is_read: boolean;
}

const LOCAL_STORAGE_READ_KEY = 'nmb_read_broadcast_notifications';

const TAB_OPTIONS: SegmentedOption[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'personal', label: 'Cá nhân' },
  { key: 'broadcast', label: 'Hệ thống' },
];

function formatRelativeTime(dateStr: string): string {
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} ngày trước`;
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

export default function NotificationBell() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'personal' | 'broadcast'>('all');
  const [reloadKey, setReloadKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [, startTransition] = useTransition();

  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Fetch user auth status & subscribe
  useEffect(() => {
    let isMounted = true;

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (isMounted) {
        setUser(user);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setUser(session?.user ?? null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  // 2. Fetch notifications based on user auth status and reloadKey
  useEffect(() => {
    let isCancelled = false;

    async function loadNotifications() {
      setIsLoading(true);
      try {
        if (user) {
          // Fetch applicable notifications for authenticated user
          const { data: rawNotifs, error: notifsError } = await supabase
            .from('notifications')
            .select('id, user_id, type, title, body, link_url, created_at')
            .or(`user_id.is.null,user_id.eq.${user.id}`)
            .order('created_at', { ascending: false })
            .limit(30);

          if (notifsError) {
            console.error('Error fetching notifications:', notifsError.message || notifsError);
            if (!isCancelled) {
              setNotifications([]);
            }
            return;
          }

          // Fetch user's read receipts
          const { data: rawReads } = await supabase
            .from('notification_reads')
            .select('notification_id')
            .eq('user_id', user.id);

          const readSet = new Set((rawReads || []).map((r) => r.notification_id));

          const mapped: NotificationItem[] = (rawNotifs || []).map((n) => ({
            ...n,
            is_read: readSet.has(n.id),
          }));

          if (!isCancelled) {
            setNotifications(mapped);
          }
        } else {
          // Fetch broadcast notifications for anonymous user
          const { data: rawNotifs, error: notifsError } = await supabase
            .from('notifications')
            .select('id, user_id, type, title, body, link_url, created_at')
            .is('user_id', null)
            .order('created_at', { ascending: false })
            .limit(20);

          if (notifsError) {
            console.error('Error fetching broadcast notifications:', notifsError.message || notifsError);
            if (!isCancelled) {
              setNotifications([]);
            }
            return;
          }

          let readIds: string[] = [];
          try {
            const stored = localStorage.getItem(LOCAL_STORAGE_READ_KEY);
            if (stored) {
              readIds = JSON.parse(stored);
            }
          } catch {
            readIds = [];
          }

          const readSet = new Set(readIds);

          const mapped: NotificationItem[] = (rawNotifs || []).map((n) => ({
            ...n,
            is_read: readSet.has(n.id),
          }));

          if (!isCancelled) {
            setNotifications(mapped);
          }
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadNotifications();

    return () => {
      isCancelled = true;
    };
  }, [supabase, user, reloadKey]);

  // 3. Handle click outside & Esc key to close popover
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // 4. Mark single item as read
  const markAsRead = async (notifId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n))
    );

    if (user) {
      await supabase
        .from('notification_reads')
        .upsert({ notification_id: notifId, user_id: user.id })
        .select();
    } else {
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_READ_KEY);
        const list: string[] = stored ? JSON.parse(stored) : [];
        if (!list.includes(notifId)) {
          list.push(notifId);
          localStorage.setItem(LOCAL_STORAGE_READ_KEY, JSON.stringify(list));
        }
      } catch {
        // ignore localStorage errors
      }
    }
  };

  // 5. Mark all as read
  const markAllAsRead = async () => {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length === 0) return;

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));

    if (user) {
      const inserts = unreadIds.map((id) => ({
        notification_id: id,
        user_id: user.id,
      }));
      await supabase.from('notification_reads').upsert(inserts).select();
    } else {
      try {
        localStorage.setItem(
          LOCAL_STORAGE_READ_KEY,
          JSON.stringify(notifications.map((n) => n.id))
        );
      } catch {
        // ignore localStorage errors
      }
    }
  };

  const handleNotificationClick = (item: NotificationItem) => {
    markAsRead(item.id);
    setIsOpen(false);
    const targetUrl = item.link_url || (item.user_id ? '/account' : null);
    if (targetUrl) {
      if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
      } else {
        startTransition(() => {
          router.push(targetUrl);
        });
      }
    }
  };

  // Filtered list by active tab
  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'personal') return n.user_id !== null;
    if (activeTab === 'broadcast') return n.user_id === null;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="relative inline-block" ref={containerRef}>
      {/* Bell Trigger Button with clean static indicator dot */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            setReloadKey((k) => k + 1);
          }
        }}
        aria-label="Thông báo"
        aria-expanded={isOpen}
        className={`relative p-2 rounded-md transition-colors cursor-pointer border ${
          isOpen
            ? 'bg-neutral text-primary border-secondary/40'
            : 'text-secondary hover:text-primary hover:bg-neutral border-transparent'
        }`}
      >
        <svg
          className="w-4 h-4 md:w-4.5 md:h-4.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-tertiary"></span>
        )}
      </button>

      {/* Notifications Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[320px] sm:w-[360px] bg-surface border border-secondary/30 rounded-lg shadow-xl z-50 overflow-hidden flex flex-col font-sans">
          {/* Header */}
          <div className="px-4 py-3 border-b border-secondary/20 flex items-center justify-between bg-surface">
            <span className="text-xs font-bold text-primary">Thông báo</span>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] text-tertiary font-bold hover:underline cursor-pointer"
              >
                Đánh dấu đã đọc
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          {user && (
            <div className="p-2 border-b border-secondary/15 bg-neutral/30">
              <SegmentedControl
                options={TAB_OPTIONS}
                activeKey={activeTab}
                onChange={(key) => setActiveTab(key as 'all' | 'personal' | 'broadcast')}
                size="sm"
                fullWidth
                ariaLabel="Lọc thông báo"
              />
            </div>
          )}

          {/* Notification List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-secondary/15">
            {isLoading && notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-secondary">
                Đang tải...
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-secondary font-medium">
                Trống
              </div>
            ) : (
              filteredNotifications.map((item) => {
                return (
                  <div
                    key={item.id}
                    onClick={() => handleNotificationClick(item)}
                    className={`p-3.5 flex flex-col gap-1 transition-colors cursor-pointer text-left ${
                      item.is_read
                        ? 'bg-surface hover:bg-neutral/60 opacity-80'
                        : 'bg-neutral/40 hover:bg-neutral/80'
                    }`}
                  >
                    {/* Meta Row: Time + Unread Dot */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-secondary font-space-grotesk">
                        {formatRelativeTime(item.created_at)}
                      </span>
                      {!item.is_read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-tertiary shrink-0"></span>
                      )}
                    </div>

                    {/* Title */}
                    <h4
                      className={`text-xs font-bold leading-snug mt-0.5 ${
                        item.is_read ? 'text-primary' : 'text-primary font-extrabold'
                      }`}
                    >
                      {item.title}
                    </h4>

                    {/* Body */}
                    <p className="text-[11px] text-secondary leading-relaxed line-clamp-2">
                      {item.body}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
