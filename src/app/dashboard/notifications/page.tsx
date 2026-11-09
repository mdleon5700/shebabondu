'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Bell, 
  Check, 
  Clock, 
  Calendar, 
  FileText, 
  ChevronRight, 
  Trash2, 
  CheckCheck, 
  Filter, 
  RefreshCw,
  AlertTriangle,
  Info
} from 'lucide-react';
import { NotificationItem } from '@/lib/types';
import { storage } from '@/lib/store';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'deadline' | 'application' | 'system'>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const token = storage.getToken();
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/candidate/notifications', { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
          setUnreadCount(data.unreadCount || 0);
          setIsLoading(false);
          return;
        }
      }
    } catch {
      // Fallback to local storage if offline
    }

    // Local storage fallback
    const local = storage.getNotifications();
    setNotifications(local);
    setUnreadCount(local.filter(n => !n.read).length);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchNotifications().finally(() => setIsLoading(false));
  }, []);

  const handleMarkRead = async (id: string) => {
    // 1. Optimistic local update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
    storage.markNotificationRead(id);
    window.dispatchEvent(new Event('cs_notifications_changed'));

    // 2. Server API update
    try {
      const token = storage.getToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch('/api/candidate/notifications', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ id })
      });
    } catch {
      // State is already updated
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    storage.getNotifications().forEach(n => storage.markNotificationRead(n.id));
    window.dispatchEvent(new Event('cs_notifications_changed'));

    try {
      const token = storage.getToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch('/api/candidate/notifications', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ all: true })
      });
    } catch {
      // Handled
    }
  };

  const handleDelete = async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    setUnreadCount(prev => {
      const deleted = notifications.find(n => n.id === id);
      return deleted && !deleted.read ? Math.max(0, prev - 1) : prev;
    });
    window.dispatchEvent(new Event('cs_notifications_changed'));

    try {
      const token = storage.getToken();
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch(`/api/candidate/notifications?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers
      });
    } catch {
      // Handled
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'all') return true;
    if (activeTab === 'deadline') return n.type === 'deadline';
    if (activeTab === 'application') return n.type === 'application' || n.type === 'admit' || n.type === 'exam';
    if (activeTab === 'system') return n.type === 'system' || (!['deadline', 'application', 'admit', 'exam'].includes(n.type));
    return true;
  });

  return (
    <div data-testid="notifications-page" className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-emerald-700" />
            <span>নোটিফিকেশন ও অ্যালার্ট সেন্টার</span>
            {unreadCount > 0 && (
              <span data-testid="unread-badge-counter" className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-600 text-white">
                {unreadCount}টি নতুন
              </span>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            আপনার সংরক্ষিত চাকরির ডেডলাইন, সার্কুলার পরিবর্তন, আবেদন ও পরীক্ষার সার্বক্ষণিক আপডেট।
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              data-testid="mark-all-read-btn"
              onClick={handleMarkAllRead}
              className="px-3.5 py-2 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <CheckCheck className="w-4 h-4" />
              <span>সব পড়া হয়েছে</span>
            </button>
          )}
          <button
            onClick={fetchNotifications}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="রিফ্রেশ"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          data-testid="tab-all"
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          সব নোটিফিকেশন ({notifications.length})
        </button>
        <button
          data-testid="tab-deadline"
          onClick={() => setActiveTab('deadline')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'deadline'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          ডেডলাইন ও জরুরি অ্যালার্ট ({notifications.filter(n => n.type === 'deadline').length})
        </button>
        <button
          data-testid="tab-application"
          onClick={() => setActiveTab('application')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'application'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          আবেদন ও পরীক্ষা ({notifications.filter(n => n.type === 'application' || n.type === 'admit' || n.type === 'exam').length})
        </button>
        <button
          data-testid="tab-system"
          onClick={() => setActiveTab('system')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'system'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          সিস্টেম নোটিশ ({notifications.filter(n => n.type === 'system' || (!['deadline', 'application', 'admit', 'exam'].includes(n.type))).length})
        </button>
      </div>

      {/* Notification List */}
      {filteredNotifications.length > 0 ? (
        <div className="space-y-3">
          {filteredNotifications.map((n) => (
            <div
              key={n.id}
              data-testid="notification-card"
              className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                n.read 
                  ? 'bg-white border-slate-200 shadow-xs' 
                  : 'bg-emerald-50/50 border-emerald-300 shadow-sm'
              }`}
            >
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  {!n.read && (
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse flex-shrink-0" />
                  )}
                  {n.type === 'deadline' ? (
                    <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  ) : n.type === 'application' || n.type === 'admit' || n.type === 'exam' ? (
                    <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  ) : (
                    <Info className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  )}
                  <h3 className="font-bold text-sm text-slate-900">{n.title}</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                <div className="text-[11px] text-slate-400 flex items-center gap-2">
                  <span>{new Date(n.date).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                {!n.read && (
                  <button
                    data-testid="mark-read-btn"
                    onClick={() => handleMarkRead(n.id)}
                    className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    পড়া হয়েছে
                  </button>
                )}
                {n.link && (
                  <Link
                    href={n.link}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>দেখুন</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                )}
                <button
                  data-testid="delete-notif-btn"
                  onClick={() => handleDelete(n.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                  title="মুছুন"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <Bell className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800">কোনো নোটিফিকেশন নেই</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            আপনার পছন্দের চাকরি সেভ করে রাখুন এবং ডেডলাইন রিমাইন্ডার অন করলে সময়মতো গুরুত্বপূর্ণ নোটিফিকেশন পাবেন।
          </p>
          <Link
            href="/jobs"
            className="inline-block px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold mt-2 hover:bg-emerald-800 cursor-pointer"
          >
            সার্কুলার ব্রাউজ করুন
          </Link>
        </div>
      )}
    </div>
  );
}
