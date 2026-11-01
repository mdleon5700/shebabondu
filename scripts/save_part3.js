const fs = require('fs');
const path = require('path');

let part3 = `
  const filteredApps = applications.filter(a => {
    if (orderStatusFilter !== 'all' && a.status !== orderStatusFilter) return false;
    if (orderSearchQuery) {
      const q = orderSearchQuery.toLowerCase();
      return (
        a.id.toLowerCase().includes(q) ||
        a.candidateName.toLowerCase().includes(q) ||
        a.candidatePhone.includes(q) ||
        a.jobTitle.toLowerCase().includes(q) ||
        (a.trxId && a.trxId.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {!isAdminAuthenticated && (
        <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-600/30 rounded-2xl border border-red-500/40 text-red-400">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-black">???????? ????????? ???????</h2>
              <p className="text-xs text-slate-300">???????? ???????, ???? ???? ? ????????? ????????? ???? ??? ????? ???? ?????</p>
            </div>
          </div>

          <form onSubmit={handleAdminLogin} className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="password"
              placeholder="???????? ??????? ???"
              value={adminPin}
              onChange={(e) => setAdminPin(e.target.value)}
              className="px-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={isLoggingIn}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow shrink-0"
            >
              {isLoggingIn ? '????? ?????...' : '???? ????'}
            </button>
          </form>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-red-600 text-white text-xs font-black px-2.5 py-0.5 rounded-full shadow-sm">
              ADMIN CONTROL
            </span>
            <h1 className="text-2xl font-black text-slate-900">
              ??????? ???????? ? ??????? ???????
            </h1>
          </div>
          <p className="text-[15px] text-slate-600 mt-1">
            ????? ????????, ?????????? ???????, ????????? ??????????? ? ?????????? ???????
          </p>
        </div>

        <button
          onClick={loadAdminData}
          className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2 self-start md:self-auto shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>??????? ????</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3.5">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm">
          <span className="text-xs font-bold text-slate-500 block">??? ????????</span>
          <span className="text-2xl font-black text-slate-900">{stats.totalCandidates || candidates.length} ??</span>
          <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">???????? ????????</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm">
          <span className="text-xs font-bold text-amber-700 block">??????? ???????</span>
          <span className="text-2xl font-black text-amber-600">{stats.pendingPayment} ??</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">???????? ????????</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm">
          <span className="text-xs font-bold text-blue-700 block">??? ????????</span>
          <span className="text-2xl font-black text-blue-600">{stats.processing} ??</span>
          <span className="text-[10px] text-blue-600 block mt-0.5">??????? ????????</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm">
          <span className="text-xs font-bold text-emerald-700 block">??????? ?????</span>
          <span className="text-2xl font-black text-emerald-700">{stats.completed} ??</span>
          <span className="text-[10px] text-emerald-600 block mt-0.5">????? ???????? ???</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm col-span-2 sm:col-span-1">
          <span className="text-xs font-bold text-slate-500 block">??????? ???????</span>
          <span className="text-2xl font-black text-slate-900">?{stats.totalRevenue || 2240}</span>
          <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">??? ??????</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 text-xs font-bold no-scrollbar">
        {[
          { id: 'orders', label: '????? ???', count: applications.length },
          { id: 'new-job', label: '???? ????????? ???????' },
          { id: 'builder', label: '?? ???????? ??????? (Elementor)' },
          { id: 'candidates', label: '??????????? ?????????', count: candidates.length },
          { id: 'coupons-raffle', label: '???? ? ???????? ???' },
          { id: 'sources', label: '?? ???? ??????? (OCR)', count: drafts.filter(d => d.status === 'pending_review').length },
          { id: 'companies', label: '???????? ? ????? (ATS)', count: companies.length },
          { id: 'audit', label: '???? ??', count: auditLogs.length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={'px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ' + (
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            )}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className={'px-1.5 py-0.2 rounded-full text-[10px] ' + (
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-800'
              )}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
`;

fs.writeFileSync(path.join(__dirname, 'admin_part3.txt'), part3, 'utf8');
console.log('Saved admin_part3.txt');
