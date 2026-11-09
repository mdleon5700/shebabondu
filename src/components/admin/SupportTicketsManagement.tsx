'use client';

import React, { useState, useEffect } from 'react';
import { 
  Headphones, 
  CheckCircle2, 
  Clock, 
  Search, 
  RefreshCw, 
  Filter, 
  MessageSquare, 
  User, 
  Phone, 
  Mail, 
  Send, 
  AlertCircle,
  HelpCircle,
  Check,
  X
} from 'lucide-react';
import { ContactMessageItem } from '@/lib/types';

export default function SupportTicketsManagement() {
  const [tickets, setTickets] = useState<ContactMessageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<ContactMessageItem | null>(null);
  const [replyNotes, setReplyNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const [counts, setCounts] = useState({
    total: 0,
    new: 0,
    in_progress: 0,
    replied: 0,
    closed: 0
  });

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const url = statusFilter && statusFilter !== 'all' 
        ? `/api/admin/support-tickets?status=${statusFilter}` 
        : '/api/admin/support-tickets';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.tickets)) {
          setTickets(data.tickets);
          if (data.counts) setCounts(data.counts);
        }
      }
    } catch (err) {
      console.error('Failed to fetch support tickets', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter]);

  const handleUpdateStatus = async (id: string, newStatus: 'new' | 'in_progress' | 'replied' | 'closed') => {
    setIsUpdating(true);
    setActionMsg(null);
    try {
      const res = await fetch('/api/admin/support-tickets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status: newStatus,
          replyNotes: replyNotes.trim() || undefined
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionMsg(`টিকেট ${id} এর স্ট্যাটাস '${newStatus}' এ সফলভাবে আপডেট হয়েছে!`);
        setSelectedTicket(null);
        setReplyNotes('');
        await fetchTickets();
      } else {
        alert(data.error || 'আপডেট ব্যর্থ হয়েছে');
      }
    } catch (err: any) {
      alert('ত্রুটি: ' + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredTickets = tickets.filter(t => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.id.toLowerCase().includes(q) ||
      t.name.toLowerCase().includes(q) ||
      t.phone.toLowerCase().includes(q) ||
      (t.email && t.email.toLowerCase().includes(q)) ||
      t.subject.toLowerCase().includes(q) ||
      t.message.toLowerCase().includes(q)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200"><Clock className="w-3 h-3" /> নতুন টিকেট</span>;
      case 'in_progress':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200"><RefreshCw className="w-3 h-3 animate-spin" /> সমাধান চলমান</span>;
      case 'replied':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200"><Send className="w-3 h-3" /> উত্তর প্রেরিত</span>;
      case 'closed':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300"><CheckCircle2 className="w-3 h-3 text-slate-500" /> নিষ্পত্তি</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'application_help': return 'আবেদন ও ফরম সহায়তা';
      case 'payment_issue': return 'পেমেন্ট ও ওয়ালেট সমস্যা';
      case 'technical_bug': return 'কারিগরি বা ওয়েবসাইট ত্রুটি';
      case 'feedback': return 'মতামত ও পরামর্শ';
      default: return 'সাধারণ অনুসন্ধান';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">সাপোর্ট টিকেট ও হেল্পডেস্ক কন্ট্রোল</h2>
              <p className="text-xs sm:text-sm text-slate-600">ওয়েবসাইটের /contact ও হেল্পডেস্ক ফর্ম থেকে প্রাপ্ত চাকরিপ্রার্থীদের প্রশ্ন ও সমস্যার দ্রুত সমাধান।</p>
            </div>
          </div>
          <button 
            onClick={fetchTickets}
            disabled={isLoading}
            className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>রিফ্রেশ করুন</span>
          </button>
        </div>

        {/* Counter cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-6">
          <div 
            onClick={() => setStatusFilter('all')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${statusFilter === 'all' ? 'border-emerald-600 bg-emerald-50/50 shadow-xs' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'}`}
          >
            <div className="text-xs font-semibold text-slate-500">মোট টিকেট</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{counts.total}</div>
          </div>
          <div 
            onClick={() => setStatusFilter('new')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${statusFilter === 'new' ? 'border-amber-500 bg-amber-50 shadow-xs' : 'border-slate-200 bg-slate-50/50 hover:bg-amber-50/30'}`}
          >
            <div className="text-xs font-semibold text-amber-700">নতুন অনুসন্ধান</div>
            <div className="text-2xl font-black text-amber-900 mt-1">{counts.new}</div>
          </div>
          <div 
            onClick={() => setStatusFilter('in_progress')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${statusFilter === 'in_progress' ? 'border-sky-500 bg-sky-50 shadow-xs' : 'border-slate-200 bg-slate-50/50 hover:bg-sky-50/30'}`}
          >
            <div className="text-xs font-semibold text-sky-700">সমাধান চলমান</div>
            <div className="text-2xl font-black text-sky-900 mt-1">{counts.in_progress}</div>
          </div>
          <div 
            onClick={() => setStatusFilter('replied')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${statusFilter === 'replied' ? 'border-emerald-500 bg-emerald-50 shadow-xs' : 'border-slate-200 bg-slate-50/50 hover:bg-emerald-50/30'}`}
          >
            <div className="text-xs font-semibold text-emerald-700">উত্তর প্রেরিত</div>
            <div className="text-2xl font-black text-emerald-900 mt-1">{counts.replied}</div>
          </div>
          <div 
            onClick={() => setStatusFilter('closed')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${statusFilter === 'closed' ? 'border-slate-600 bg-slate-100 shadow-xs' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100'}`}
          >
            <div className="text-xs font-semibold text-slate-600">নিষ্পত্তি / ক্লোজড</div>
            <div className="text-2xl font-black text-slate-800 mt-1">{counts.closed}</div>
          </div>
        </div>
      </div>

      {actionMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-2xl flex items-center gap-3 text-xs sm:text-sm font-semibold">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 flex-shrink-0" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="টিকেট আইডি, নাম, ফোন বা বিষয় দিয়ে খুঁজুন..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          প্রদর্শিত হচ্ছে: <strong className="text-slate-800">{filteredTickets.length}</strong> টি টিকেট
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="py-16 text-center text-slate-500 text-sm flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
            <span>টিকেট তালিকা লোড হচ্ছে...</span>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm space-y-2">
            <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-700">কোনো টিকেট পাওয়া যায়নি</p>
            <p className="text-xs text-slate-400">ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTickets.map((ticket) => (
              <div 
                key={ticket.id} 
                className="p-5 sm:p-6 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-black bg-slate-100 px-2.5 py-1 rounded-md text-slate-800">
                      {ticket.id}
                    </span>
                    {getStatusBadge(ticket.status)}
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                      {getCategoryLabel(ticket.category)}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(ticket.createdAt).toLocaleDateString('bn-BD', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900">
                    {ticket.subject}
                  </h4>

                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                    {ticket.message}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {ticket.name}
                    </span>
                    <a 
                      href={`tel:${ticket.phone}`} 
                      className="flex items-center gap-1 text-emerald-700 hover:underline font-mono"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      {ticket.phone}
                    </a>
                    {ticket.email && (
                      <span className="flex items-center gap-1 text-slate-500">
                        <Mail className="w-3.5 h-3.5" />
                        {ticket.email}
                      </span>
                    )}
                  </div>

                  {ticket.replyNotes && (
                    <div className="bg-emerald-50/70 border border-emerald-200 p-2.5 rounded-xl text-xs text-emerald-900 mt-2">
                      <span className="font-bold">অ্যাডমিন উত্তর/নোট: </span>
                      {ticket.replyNotes}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 self-start md:self-center">
                  <button
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setReplyNotes(ticket.replyNotes || '');
                    }}
                    className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                  >
                    <span>উত্তর ও রিভিউ</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ticket Reply & Moderation Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8">
            <button
              onClick={() => setSelectedTicket(null)}
              className="absolute right-5 top-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black bg-slate-100 px-2.5 py-1 rounded-md text-slate-800">
                  {selectedTicket.id}
                </span>
                {getStatusBadge(selectedTicket.status)}
              </div>
              <h3 className="text-lg font-black text-slate-900 pt-2">
                {selectedTicket.subject}
              </h3>
              <p className="text-xs text-slate-500">
                প্রেরক: <strong className="text-slate-800">{selectedTicket.name}</strong> ({selectedTicket.phone})
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">প্রার্থীর বার্তা:</div>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                {selectedTicket.message}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                অ্যাডমিন রিপ্লাই ও সমাধান নোট:
              </label>
              <textarea
                rows={3}
                value={replyNotes}
                onChange={(e) => setReplyNotes(e.target.value)}
                placeholder="প্রার্থীকে পাঠানো সমাধানের বিবরণ বা অভ্যন্তরীণ ফলোআপ নোট লিখুন..."
                className="w-full p-3 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700 mb-2">স্ট্যাটাস পরিবর্তন করুন:</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleUpdateStatus(selectedTicket.id, 'new')}
                  className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all ${selectedTicket.status === 'new' ? 'bg-amber-100 border-amber-400 text-amber-900 ring-2 ring-amber-400' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                >
                  নতুন
                </button>
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleUpdateStatus(selectedTicket.id, 'in_progress')}
                  className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all ${selectedTicket.status === 'in_progress' ? 'bg-sky-100 border-sky-400 text-sky-900 ring-2 ring-sky-400' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                >
                  প্রক্রিয়াধীন
                </button>
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleUpdateStatus(selectedTicket.id, 'replied')}
                  className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all ${selectedTicket.status === 'replied' ? 'bg-emerald-100 border-emerald-400 text-emerald-900 ring-2 ring-emerald-400' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                >
                  উত্তর প্রেরিত
                </button>
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleUpdateStatus(selectedTicket.id, 'closed')}
                  className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all ${selectedTicket.status === 'closed' ? 'bg-slate-200 border-slate-400 text-slate-900 ring-2 ring-slate-400' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                >
                  ক্লোজড
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                বাতিল
              </button>
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => handleUpdateStatus(selectedTicket.id, selectedTicket.status)}
                className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
              >
                {isUpdating ? 'সংরক্ষণ হচ্ছে...' : 'নোট সংরক্ষণ করুন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
