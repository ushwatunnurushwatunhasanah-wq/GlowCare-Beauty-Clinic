import React, { useState } from 'react';
import { X, Star, Sparkles, Send, Heart } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface PatientReviewModalProps {
  onClose: () => void;
}

export const PatientReviewModal: React.FC<PatientReviewModalProps> = ({ onClose }) => {
  const { patients, treatments, doctors, addRatingComment } = useApp();

  const [patientName, setPatientName] = useState('Siti Rahmawati');
  const [patientRm, setPatientRm] = useState('RM-2026-0101');
  const [treatmentName, setTreatmentName] = useState(treatments[0]?.name || 'Hydrafacial Deep Infusion');
  const [doctorName, setDoctorName] = useState(doctors[0]?.name || 'dr. Andini Putri, Sp.DV');

  const [overallRating, setOverallRating] = useState(5);
  const [aspectRatings, setAspectRatings] = useState({
    treatmentQuality: 5,
    doctorCare: 5,
    nurseService: 5,
    receptionistFriendliness: 5,
    clinicCleanliness: 5,
    roomComfort: 5,
    serviceSpeed: 5
  });

  const [comment, setComment] = useState(
    'Pelayanannya sangat ramah dan treatment dilakukan dengan sangat baik. Ruangannya juga nyaman, sejuk, dan wangi bunga rose.'
  );

  const aspectLabels = [
    { key: 'treatmentQuality', label: '1. Kualitas Treatment' },
    { key: 'doctorCare', label: '2. Pelayanan Dokter' },
    { key: 'nurseService', label: '3. Pelayanan Perawat' },
    { key: 'receptionistFriendliness', label: '4. Keramahan Petugas Loket' },
    { key: 'clinicCleanliness', label: '5. Kebersihan Klinik' },
    { key: 'roomComfort', label: '6. Kenyamanan Ruangan' },
    { key: 'serviceSpeed', label: '7. Kecepatan Pelayanan' },
  ];

  const handleAspectChange = (key: string, rating: number) => {
    setAspectRatings(prev => ({ ...prev, [key]: rating }));
  };

  const maskName = (name: string) => {
    if (name.length <= 4) return name;
    return `${name.substring(0, 3)}****`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      alert('Mohon isi ulasan pengalaman Anda.');
      return;
    }

    addRatingComment({
      patientName: maskName(patientName),
      patientRm,
      treatmentName,
      doctorName,
      overallRating,
      aspectRatings,
      comment: comment.trim()
    });

    alert('Terima kasih banyak! Ulasan dan rating kepuasan Anda telah berhasil dikirimkan.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-stone-200 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 bg-rose-50/60 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-600 text-white">
              <Heart className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-sm">Formulir Kepuasan & Ulasan Pasien</h3>
              <p className="text-[11px] text-stone-500">Bantu kami terus meningkatkan kualitas pelayanan klinik</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          {/* Patient and Treatment Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Nama Pasien</label>
              <input
                type="text"
                required
                value={patientName}
                onChange={e => setPatientName(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Layanan Treatment</label>
              <select
                value={treatmentName}
                onChange={e => setTreatmentName(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
              >
                {treatments.map(t => (
                  <option key={t.id} value={t.name}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Overall Star Rating */}
          <div className="rounded-xl border border-rose-100 bg-rose-50/30 p-4 text-center">
            <label className="block text-xs font-bold text-stone-900 mb-2">
              Penilaian Keseluruhan (Overall Rating)
            </label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setOverallRating(star)}
                  className="p-1 hover:scale-125 transition-transform"
                >
                  <Star
                    className={`h-7 w-7 ${
                      star <= overallRating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-xs font-bold text-amber-600 font-mono mt-1 block">
              {overallRating} dari 5 Bintang
            </span>
          </div>

          {/* 7 Specific Aspect Ratings from Prompt */}
          <div className="space-y-2 pt-2 border-t border-stone-100">
            <span className="text-xs font-bold text-stone-900 block mb-1">
              Nilai Detail Aspek Pelayanan (1 - 5 Bintang):
            </span>
            {aspectLabels.map(aspect => (
              <div key={aspect.key} className="flex items-center justify-between p-2 rounded-lg bg-stone-50">
                <span className="font-medium text-stone-700">{aspect.label}</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleAspectChange(aspect.key, num)}
                      className="p-0.5"
                    >
                      <Star
                        className={`h-4 w-4 ${
                          num <= (aspectRatings as any)[aspect.key]
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-stone-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Prompt Question: "Bagaimana pengalaman Anda setelah mendapatkan perawatan di GlowCare Beauty Clinic?" */}
          <div className="pt-2 border-t border-stone-100">
            <label className="block font-bold text-stone-900 mb-1.5 leading-snug">
              "Bagaimana pengalaman Anda setelah mendapatkan perawatan di GlowCare Beauty Clinic?" *
            </label>
            <textarea
              rows={3}
              required
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Ceritakan kepuasan Anda terhadap keramahan staf, hasil tindakan, dan kenyamanan klinik..."
              className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-3 text-xs text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-stone-200 px-4 py-2 font-semibold text-stone-600 hover:bg-stone-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-5 py-2 font-semibold text-white hover:bg-rose-700 shadow-sm"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Kirim Ulasan Pasien</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
