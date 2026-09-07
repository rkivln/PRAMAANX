import React, { useEffect, useState } from 'react';
import { Database, Search, ArrowLeft, RefreshCw, FileText, Download, FileSpreadsheet } from 'lucide-react';
import { AuditRecord } from '../types/verification';

interface AuditTrailViewProps {
  onBackToScreening: () => void;
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({ onBackToScreening }) => {
  const [records, setRecords] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [downloadingAll, setDownloadingAll] = useState<string | null>(null);
  const [downloadingRow, setDownloadingRow] = useState<{ id: string; fmt: string } | null>(null);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:5001/api/audit/records');
      const json = await res.json();
      if (json.data && Array.isArray(json.data)) {
        setRecords(json.data);
      } else {
        setRecords([]);
      }
    } catch (e) {
      console.warn('Failed to load audit records:', e);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleExportAll = async (format: 'pdf' | 'excel' | 'word' | 'csv') => {
    setDownloadingAll(format);
    try {
      const res = await fetch(`http://127.0.0.1:5001/api/report/audit-all?format=${format}`);
      if (!res.ok) throw new Error(`Download failed with status ${res.status}`);
      const blob = await res.blob();
      const ext = format === 'excel' ? 'xlsx' : format === 'word' ? 'docx' : format;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PRAMAANX_Master_Audit_Ledger_${new Date().toISOString().slice(0, 10)}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export audit ledger:', err);
    } finally {
      setDownloadingAll(null);
    }
  };

  const handleExportRow = async (verificationId: string, format: 'pdf' | 'excel' | 'word' | 'csv') => {
    setDownloadingRow({ id: verificationId, fmt: format });
    try {
      const res = await fetch(`http://127.0.0.1:5001/api/report/individual/${verificationId}?format=${format}`);
      if (!res.ok) throw new Error(`Download failed with status ${res.status}`);
      const blob = await res.blob();
      const ext = format === 'excel' ? 'xlsx' : format === 'word' ? 'docx' : format;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PRAMAANX_Dossier_${verificationId}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export row dossier:', err);
    } finally {
      setDownloadingRow(null);
    }
  };

  const filteredRecords = records.filter((rec) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (rec.verification_id && rec.verification_id.toLowerCase().includes(term)) ||
      (rec.document?.name && rec.document.name.toLowerCase().includes(term)) ||
      (rec.document?.document_number && rec.document.document_number.toLowerCase().includes(term));

    if (!matchesSearch) return false;
    if (statusFilter === 'ALL') return true;
    return rec.risk_assessment?.recommendation === statusFilter;
  });

  return (
    <div className="flex flex-col h-full bg-[#F3F5F7]">
      {/* Header */}
      <div className="bg-white border-b border-[#D6DCE2] px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToScreening}
            className="p-1.5 hover:bg-[#F3F5F7] rounded text-[#5B6773] hover:text-[#0B2942] transition"
            title="Back to Screening"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-[#138808]" />
              <h1 className="text-lg font-bold text-[#0B2942]">Digital Audit Trail — Supabase Ledger</h1>
            </div>
            <p className="text-xs text-[#5B6773] mt-0.5">
              Cryptographic SHA-256 verified screening records and multi-modal evidence logs
            </p>
          </div>
        </div>

        {/* Global Action Bar: Refresh & Export All */}
        <div className="flex items-center gap-2">
          <button
            onClick={fetchRecords}
            className="px-3 py-1.5 bg-[#F8F9FA] hover:bg-[#E8ECF0] border border-[#D6DCE2] text-[#17212B] font-medium text-xs rounded flex items-center gap-1.5 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>

          <div className="h-5 w-px bg-[#D6DCE2] mx-1" />

          <button
            onClick={() => handleExportAll('pdf')}
            disabled={downloadingAll !== null}
            className="px-2.5 py-1.5 bg-[#B42318]/10 hover:bg-[#B42318]/20 text-[#B42318] border border-[#B42318]/30 font-bold text-xs rounded flex items-center gap-1 transition disabled:opacity-50"
            title="Export all records as PDF"
          >
            <FileText className="w-3.5 h-3.5" />
            {downloadingAll === 'pdf' ? 'PDF...' : 'PDF All'}
          </button>

          <button
            onClick={() => handleExportAll('excel')}
            disabled={downloadingAll !== null}
            className="px-2.5 py-1.5 bg-[#138808]/10 hover:bg-[#138808]/20 text-[#138808] border border-[#138808]/30 font-bold text-xs rounded flex items-center gap-1 transition disabled:opacity-50"
            title="Export all records as Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            {downloadingAll === 'excel' ? 'Excel...' : 'Excel All'}
          </button>

          <button
            onClick={() => handleExportAll('word')}
            disabled={downloadingAll !== null}
            className="px-2.5 py-1.5 bg-[#0B2942]/10 hover:bg-[#0B2942]/20 text-[#0B2942] border border-[#0B2942]/30 font-bold text-xs rounded flex items-center gap-1 transition disabled:opacity-50"
            title="Export all records as Word"
          >
            <FileText className="w-3.5 h-3.5 text-[#1E5A8A]" />
            {downloadingAll === 'word' ? 'Word...' : 'Word All'}
          </button>

          <button
            onClick={() => handleExportAll('csv')}
            disabled={downloadingAll !== null}
            className="px-2.5 py-1.5 bg-[#5B6773]/10 hover:bg-[#5B6773]/20 text-[#17212B] border border-[#5B6773]/30 font-bold text-xs rounded flex items-center gap-1 transition disabled:opacity-50"
            title="Export all records as CSV"
          >
            <Download className="w-3.5 h-3.5 text-[#5B6773]" />
            {downloadingAll === 'csv' ? 'CSV...' : 'CSV All'}
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-6 pb-0 flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-80">
          <Search className="w-4 h-4 text-[#7A858F] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Verification ID, Name, Doc No..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#D6DCE2] rounded focus:outline-none focus:ring-1 focus:ring-[#0B2942]"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-2 text-xs">
          {['ALL', 'VERIFIED', 'REVIEW', 'REJECTED'].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1 rounded font-medium transition ${
                statusFilter === filter
                  ? 'bg-[#0B2942] text-white'
                  : 'bg-white text-[#5B6773] border border-[#D6DCE2] hover:bg-[#F8F9FA]'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 p-6 overflow-hidden">
        <div className="bg-white border border-[#D6DCE2] rounded-lg h-full flex flex-col overflow-hidden shadow-sm">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F8F9FA] border-b border-[#D6DCE2] text-[#5B6773] font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Verification ID</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Subject &amp; Document</th>
                  <th className="py-3 px-4">Biometrics</th>
                  <th className="py-3 px-4">Forensics</th>
                  <th className="py-3 px-4">Risk &amp; Verdict</th>
                  <th className="py-3 px-4">SHA-256 Hashes</th>
                  <th className="py-3 px-4">Supabase Sync</th>
                  <th className="py-3 px-4 text-center">Export Dossier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8ECF0]">
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((rec) => {
                    const isRecVerified = rec.risk_assessment?.recommendation === 'VERIFIED';
                    const isRecReview = rec.risk_assessment?.recommendation === 'REVIEW';
                    const isRowBusy = downloadingRow?.id === rec.verification_id;
                    return (
                      <tr key={rec.verification_id} className="hover:bg-[#F8F9FA]/80">
                        <td className="py-3 px-4 font-mono font-bold text-[#0B2942]">
                          {rec.verification_id || '—'}
                        </td>

                        <td className="py-3 px-4 font-mono text-[#5B6773] text-[11px]">
                          {rec.timestamp ? new Date(rec.timestamp).toLocaleString() : '—'}
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-semibold text-[#17212B]">
                            {rec.document?.name || '—'}
                          </div>
                          <div className="font-mono text-[#5B6773] text-[11px]">
                            {rec.document?.type || '—'} • {rec.document?.document_number || '—'}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-mono font-medium">
                            {rec.biometrics?.similarity_score ?? 0}% Match
                          </div>
                          <div className="text-[10px] text-[#138808] font-bold">
                            Liveness: {rec.biometrics?.liveness_status || '—'}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="text-[11px] font-mono">
                            ELA: {rec.forensics?.ela_score ?? 0}/100
                          </div>
                          <div className="text-[10px] text-[#138808] font-bold">
                            Tamper: {rec.forensics?.tamper_status || '—'}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase inline-block ${
                              isRecVerified
                                ? 'bg-[#E6F4E6] text-[#138808]'
                                : isRecReview
                                ? 'bg-[#FFF3D6] text-[#C47A00]'
                                : 'bg-[#FDECEA] text-[#B42318]'
                            }`}
                          >
                            {rec.risk_assessment?.recommendation || '—'} (Score: {rec.risk_assessment?.score ?? 0})
                          </span>
                        </td>

                        <td className="py-3 px-4 font-mono text-[10px] text-[#5B6773] max-w-[140px] truncate" title={`Doc: ${rec.hashes?.document_sha256}\nFace: ${rec.hashes?.face_sha256}`}>
                          {rec.hashes?.document_sha256 ? `${rec.hashes.document_sha256.substring(0, 10)}...` : '—'}
                        </td>

                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#E6F4E6] text-[#138808] border border-[#138808]/30">
                            {rec.sync_status || 'LOCAL'}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleExportRow(rec.verification_id, 'pdf')}
                              disabled={isRowBusy}
                              className="px-1.5 py-0.5 bg-[#B42318]/10 hover:bg-[#B42318]/20 text-[#B42318] border border-[#B42318]/30 rounded text-[9px] font-bold transition disabled:opacity-50"
                              title="Download Case PDF"
                            >
                              PDF
                            </button>
                            <button
                              onClick={() => handleExportRow(rec.verification_id, 'excel')}
                              disabled={isRowBusy}
                              className="px-1.5 py-0.5 bg-[#138808]/10 hover:bg-[#138808]/20 text-[#138808] border border-[#138808]/30 rounded text-[9px] font-bold transition disabled:opacity-50"
                              title="Download Case Excel (.xlsx)"
                            >
                              XLSX
                            </button>
                            <button
                              onClick={() => handleExportRow(rec.verification_id, 'word')}
                              disabled={isRowBusy}
                              className="px-1.5 py-0.5 bg-[#0B2942]/10 hover:bg-[#0B2942]/20 text-[#0B2942] border border-[#0B2942]/30 rounded text-[9px] font-bold transition disabled:opacity-50"
                              title="Download Case Word (.docx)"
                            >
                              DOCX
                            </button>
                            <button
                              onClick={() => handleExportRow(rec.verification_id, 'csv')}
                              disabled={isRowBusy}
                              className="px-1.5 py-0.5 bg-[#5B6773]/10 hover:bg-[#5B6773]/20 text-[#17212B] border border-[#5B6773]/30 rounded text-[9px] font-bold transition disabled:opacity-50"
                              title="Download Case CSV"
                            >
                              CSV
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="py-16 text-center text-[#7A858F]">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FileText className="w-8 h-8 text-[#D6DCE2]" />
                        <span className="text-xs font-medium text-[#5B6773]">
                          {loading ? 'Connecting to digital audit ledger...' : 'No verification records yet'}
                        </span>
                        <span className="text-[11px] text-[#7A858F] max-w-sm">
                          Completed travel document and face verification screening sessions will automatically appear here.
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
