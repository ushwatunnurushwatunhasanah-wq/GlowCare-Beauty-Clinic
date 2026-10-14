import React, { useState } from 'react';
import {
  Star,
  MessageSquare,
  CheckCircle,
  EyeOff,
  AlertTriangle,
  Reply,
  ShieldCheck,
  Search,
  Plus,
  Send
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { CommentStatus, PatientRatingComment } from '../../../types';
import { formatDateId } from '../../../utils/formatters';

export const RatingsModerationView: React.FC = () => {
  const {
    ratings,
    updateRatingStatus,
    replyToReview,
    openModal,
    currentUser,
    currentDoctor,
    isMyDoctorData
  } = useApp();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);

  const isDoctorRole = currentUser?.role === 'dokter';

  const filteredRatings = ratings.filter(r => {
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
    const matchesSearch =
      r.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.treatmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.comment.toLowerCase().includes(searchQuery.toLowerCase());

    if (isDoctorRole && currentDoctor) {
      return matchesStatus && matchesSearch && isMyDoctorData(undefined, r.doctorName);
    }

    return matchesStatus && matchesSearch;
  });

  const handleSendReply = (id: string) => {
    const text = replyTextMap[id];
    if (text && text.trim()) {
      replyToReview(id, text.trim());
      setReplyTextMap(prev => ({ ...prev, [id]: '' }));
      setActiveReplyId(null);
    }
  };

  const getStatusBadge = (status: CommentStatus) => {
    switch (status) {
      case 'Ditampilkan':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Menunggu':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Disembunyikan':
        return 'bg-stone-100 text-stone-600 border-stone-200';
      case 'Ditindaklanjuti':
        return 'bg-rose-100 text-rose-800 border-rose-200 font-bold';
      default:
        return 'bg-stone-100 text-stone-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-stone-900 flex items-center gap-2">
            <span>Moderasi Komentar & Rating Pasien</span>
            {isDoctorRole && currentDoctor && (
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
                {currentDoctor.name.split(',')[0]}
              </span>
            )}
            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-800 font-mono">
              {filteredRatings.length} Ulasan
            </span>
          </h2>
          <p className="text-xs text-stone-500">
            {isDoctorRole && currentDoctor
              ? `Ulasan, rating bintang, dan feedback kepuasan pasien atas pelayanan dokter ${currentDoctor.name}`
              : 'Evaluasi pengalaman pasien pasca treatment, sensor privasi data diri, dan kontrol publikasi'}
          </p>
        </div>

        <button
          onClick={() => openModal('patient-review-modal')}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-rose-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>+ Simulasi Input Review Pasien</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['all', 'Menunggu', 'Ditampilkan', 'Disembunyikan', 'Ditindaklanjuti'].map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap transition-colors ${
                  filterStatus === st
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                }`}
              >
                {st === 'all' ? 'Semua Status' : st}
              </button>
            ))}
          </div>

          <div className="relative min-w-[260px]">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari komentar, dokter, treatment..."
              className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3 py-1.5 text-xs text-stone-900 placeholder:text-stone-400 focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
          </div>
        </div>
      </div>

      {/* Reviews Cards List */}
      <div className="space-y-4">
        {filteredRatings.length === 0 ? (
          <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center text-stone-400 text-xs">
            Tidak ada ulasan pasien sesuai kriteria filter.
          </div>
        ) : (
          filteredRatings.map(rev => (
            <div
              key={rev.id}
              className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs transition-all hover:border-rose-200"
            >
              {/* Header: Patient Info, Overall Stars, Status Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-stone-100">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-800 font-bold text-xs shrink-0">
                    {rev.patientName.substring(0, 1)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900 text-sm">{rev.patientName}</span>
                      <span className="text-[10px] text-stone-400">(Nama disamarkan untuk privasi)</span>
                    </div>
                    <p className="text-[11px] text-stone-500">
                      Treatment: <strong className="text-rose-700">{rev.treatmentName}</strong> · Dokter: {rev.doctorName} · {formatDateId(rev.date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Stars */}
                  <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                    <div className="flex items-center text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${
                            i < rev.overallRating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-stone-900 font-mono">
                      {rev.overallRating}.0
                    </span>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadge(
                      rev.status
                    )}`}
                  >
                    {rev.status}
                  </span>
                </div>
              </div>

              {/* Multi-Aspect Detailed Ratings Breakdown */}
              <div className="mt-3.5 py-2.5 px-3 rounded-xl bg-stone-50/70 border border-stone-100 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-[11px]">
                <div>
                  <span className="text-stone-400 block text-[10px]">Kualitas Treatment</span>
                  <strong className="text-stone-800 font-mono">★ {rev.aspectRatings?.treatmentQuality || rev.overallRating}/5</strong>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">Pelayanan Dokter</span>
                  <strong className="text-stone-800 font-mono">★ {rev.aspectRatings?.doctorCare || rev.overallRating}/5</strong>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">Pelayanan Perawat</span>
                  <strong className="text-stone-800 font-mono">★ {rev.aspectRatings?.nurseService || rev.overallRating}/5</strong>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">Keramahan Loket</span>
                  <strong className="text-stone-800 font-mono">★ {rev.aspectRatings?.receptionistFriendliness || rev.overallRating}/5</strong>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">Kebersihan Klinik</span>
                  <strong className="text-stone-800 font-mono">★ {rev.aspectRatings?.clinicCleanliness || rev.overallRating}/5</strong>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">Kenyamanan Ruang</span>
                  <strong className="text-stone-800 font-mono">★ {rev.aspectRatings?.roomComfort || rev.overallRating}/5</strong>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">Kecepatan Pelayanan</span>
                  <strong className="text-stone-800 font-mono">★ {rev.aspectRatings?.serviceSpeed || rev.overallRating}/5</strong>
                </div>
              </div>

              {/* Patient's Experience Testimonial */}
              <div className="mt-3">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                  Ulasan Pengalaman Pasien:
                </span>
                <p className="text-xs text-stone-800 leading-relaxed italic bg-rose-50/20 p-3 rounded-xl border border-rose-100/40">
                  "{rev.comment}"
                </p>
              </div>

              {/* Official Clinic Response (if any) */}
              {rev.clinicResponse && (
                <div className="mt-3 rounded-xl bg-purple-50/60 p-3 text-xs text-stone-700 border border-purple-100">
                  <div className="flex items-center gap-1.5 font-bold text-purple-900 mb-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-purple-700" />
                    <span>Tanggapan Resmi GlowCare Beauty Clinic:</span>
                  </div>
                  <p>{rev.clinicResponse}</p>
                </div>
              )}

              {/* Admin Internal Notes (if flagged for follow up) */}
              {rev.adminNotes && (
                <div className="mt-2 text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                  <strong>Catatan Tindak Lanjut:</strong> {rev.adminNotes}
                </div>
              )}

              {/* Actions Toolbar */}
              <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => updateRatingStatus(rev.id, 'Ditampilkan')}
                    className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                      rev.status === 'Ditampilkan'
                        ? 'bg-emerald-600 text-white'
                        : 'border border-stone-200 text-stone-600 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                  >
                    <CheckCircle className="h-3 w-3" />
                    <span>Tampilkan</span>
                  </button>

                  <button
                    onClick={() => updateRatingStatus(rev.id, 'Disembunyikan')}
                    className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                      rev.status === 'Disembunyikan'
                        ? 'bg-stone-800 text-white'
                        : 'border border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <EyeOff className="h-3 w-3" />
                    <span>Sembunyikan</span>
                  </button>

                  <button
                    onClick={() => {
                      const notes = prompt('Masukkan catatan tindak lanjut keluhan:', rev.adminNotes || '');
                      if (notes !== null) {
                        updateRatingStatus(rev.id, 'Ditindaklanjuti', notes);
                      }
                    }}
                    className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                      rev.status === 'Ditindaklanjuti'
                        ? 'bg-rose-600 text-white'
                        : 'border border-stone-200 text-stone-600 hover:bg-rose-50 hover:text-rose-700'
                    }`}
                  >
                    <AlertTriangle className="h-3 w-3" />
                    <span>Tandai Tindak Lanjut</span>
                  </button>
                </div>

                <div>
                  <button
                    onClick={() => setActiveReplyId(activeReplyId === rev.id ? null : rev.id)}
                    className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700"
                  >
                    <Reply className="h-3.5 w-3.5" />
                    <span>{rev.clinicResponse ? 'Ubah Balasan' : 'Beri Tanggapan Resmi'}</span>
                  </button>
                </div>
              </div>

              {/* Inline Reply Input */}
              {activeReplyId === rev.id && (
                <div className="mt-3 pt-3 border-t border-stone-100 flex items-center gap-2">
                  <input
                    type="text"
                    value={replyTextMap[rev.id] !== undefined ? replyTextMap[rev.id] : rev.clinicResponse || ''}
                    onChange={e => setReplyTextMap({ ...replyTextMap, [rev.id]: e.target.value })}
                    placeholder="Tulis respon klinik yang hangat dan profesional..."
                    className="flex-1 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
                  />
                  <button
                    onClick={() => handleSendReply(rev.id)}
                    className="flex items-center gap-1 rounded-xl bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-700"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Kirim</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
