import React from 'react';
import { X, User, Calendar, Phone, Mail, MapPin, AlertCircle, FileText, Sparkles, Clock, Stethoscope } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Patient } from '../../types';
import { formatDateId } from '../../utils/formatters';

interface PatientDetailModalProps {
  patient: Patient;
  onClose: () => void;
}

export const PatientDetailModal: React.FC<PatientDetailModalProps> = ({ patient, onClose }) => {
  const { medicalRecords, openModal } = useApp();

  const patientHistory = medicalRecords.filter(
    mr => mr.patientId === patient.id || mr.patientRm === patient.rmNumber
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-stone-200 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 bg-rose-50/50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600 text-white font-bold text-sm">
              {patient.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-sm">{patient.name}</h3>
              <p className="text-[11px] font-mono text-rose-700 font-medium">
                {patient.rmNumber} · NIK: {patient.nik}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-xs">
          {/* Patient Card Demographics */}
          <div className="rounded-xl border border-stone-200/80 bg-stone-50/50 p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <span className="text-[10px] text-stone-400 uppercase font-bold block">Jenis Kelamin</span>
              <strong className="text-stone-800">{patient.gender}</strong>
            </div>
            <div>
              <span className="text-[10px] text-stone-400 uppercase font-bold block">Tanggal Lahir</span>
              <strong className="text-stone-800">{formatDateId(patient.birthDate)}</strong>
            </div>
            <div>
              <span className="text-[10px] text-stone-400 uppercase font-bold block">Kontak Telepon</span>
              <strong className="text-stone-800 font-mono">{patient.phone}</strong>
            </div>
            <div className="sm:col-span-2">
              <span className="text-[10px] text-stone-400 uppercase font-bold block">Alamat Tinggal</span>
              <p className="text-stone-700">{patient.address}</p>
            </div>
            <div>
              <span className="text-[10px] text-stone-400 uppercase font-bold block">Total Kunjungan</span>
              <strong className="text-rose-700 font-mono text-sm">{patient.totalVisits || 1} Kali</strong>
            </div>
          </div>

          {/* Allergy warning card */}
          {patient.allergies && !patient.allergies.toLowerCase().includes('tidak') ? (
            <div className="rounded-xl bg-red-50 p-3 border border-red-200 flex items-start gap-2.5 text-red-800">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
              <div>
                <strong className="block text-[11px]">Peringatan Alergi Pasien:</strong>
                <p>{patient.allergies}</p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-stone-50 p-2.5 text-stone-500">
              Riwayat Alergi: Tidak ada riwayat alergi yang dilaporkan.
            </div>
          )}

          {/* Timeline of Treatments */}
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-stone-200 mb-4">
              <h4 className="font-bold text-sm text-stone-900 flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-rose-600" />
                <span>Riwayat Rekam Perawatan & Tindakan (Timeline)</span>
              </h4>
              <button
                onClick={() => {
                  onClose();
                  openModal('medical-exam-form', { patientId: patient.id });
                }}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700"
              >
                + Tambah Rekam Medis
              </button>
            </div>

            {patientHistory.length === 0 ? (
              <div className="p-6 text-center text-stone-400">
                Belum ada arsip riwayat perawatan untuk pasien ini.
              </div>
            ) : (
              <div className="space-y-4">
                {patientHistory.map(record => (
                  <div
                    key={record.id}
                    className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs space-y-2"
                  >
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                          {formatDateId(record.date)}
                        </span>
                        <strong className="text-stone-900">{record.treatmentName}</strong>
                      </div>
                      <span className="text-stone-500">Dokter: {record.doctorName}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="font-semibold text-stone-700 block">Keluhan:</span>
                        <p className="text-stone-600 italic">"{record.complaints}"</p>
                      </div>
                      <div>
                        <span className="font-semibold text-stone-700 block">Diagnosis & Kondisi Kulit:</span>
                        <p className="text-stone-600">{record.skinCondition}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-stone-700 block">Tindakan:</span>
                        <p className="text-stone-600">{record.actionTaken}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-stone-700 block">Anjuran Skincare:</span>
                        <p className="text-stone-600">{record.followUpAdvice}</p>
                      </div>
                    </div>

                    {record.nextControlDate && (
                      <div className="pt-2 border-t border-stone-100 text-[10px] text-rose-700 font-medium">
                        Jadwal Kontrol Berikutnya: {formatDateId(record.nextControlDate)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-100 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-stone-800 px-5 py-2 text-xs font-semibold text-white hover:bg-stone-900"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
