import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { toast } from 'sonner';
import * as adminService from '../services/adminService';
import {
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Briefcase,
  Award,
  Calendar,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const AdminDashboard = () => {
  const [psychologists, setPsychologists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All'); // 'All', 'Pending', 'Verified', 'Rejected'
  const [expandedId, setExpandedId] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    loadPsychologists();
  }, []);

  const loadPsychologists = async () => {
    setLoading(true);
    try {
      const res = await adminService.fetchPsychologists();
      if (res.success && res.data) {
        setPsychologists(res.data);
      }
    } catch (err) {
      toast.error('Failed to load psychologists list');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id, status) => {
    setActionLoadingId(id);
    try {
      const res = await adminService.verifyPsychologist(id, status);
      if (res.success && res.data) {
        toast.success(`Psychologist status updated to ${status}`);
        setPsychologists((prev) =>
          prev.map((p) => (p._id === id ? { ...p, ...res.data } : p))
        );
      }
    } catch (err) {
      toast.error('Failed to update verification status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredPsychologists = psychologists.filter((p) => {
    const status = p.verificationStatus || (p.isVerified ? 'Verified' : 'Pending');
    if (filter === 'All') return true;
    return status === filter;
  });

  const stats = {
    total: psychologists.length,
    pending: psychologists.filter(
      (p) => (p.verificationStatus || (p.isVerified ? 'Verified' : 'Pending')) === 'Pending'
    ).length,
    verified: psychologists.filter(
      (p) => (p.verificationStatus || (p.isVerified ? 'Verified' : 'Pending')) === 'Verified'
    ).length,
    rejected: psychologists.filter(
      (p) => (p.verificationStatus || (p.isVerified ? 'Verified' : 'Pending')) === 'Rejected'
    ).length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-black text-white text-[10px] font-black uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#B82126]" />
              <span>Admin Verification Portal</span>
            </div>
            <h1 className="text-3xl font-black uppercase text-black">Psychologist Verification</h1>
            <p className="text-xs font-bold text-neutral-600">
              Review registered psychologists, verify credentials, and view visiting slots & timings
            </p>
          </div>

          <Button variant="outline" size="sm" onClick={loadPsychologists} loading={loading}>
            Refresh Directory
          </Button>
        </div>

        {/* Verification Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card
            onClick={() => setFilter('All')}
            className={`cursor-pointer transition-all ${
              filter === 'All' ? 'ring-2 ring-black bg-neutral-100' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-extrabold uppercase text-neutral-500">Total Practitioners</p>
                <h4 className="text-2xl font-black text-black">{stats.total}</h4>
              </div>
              <div className="p-3 bg-black text-white rounded-xl polo-border">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>
          </Card>

          <Card
            onClick={() => setFilter('Pending')}
            className={`cursor-pointer transition-all ${
              filter === 'Pending' ? 'ring-2 ring-amber-500 bg-amber-50/50' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-extrabold uppercase text-amber-700">Pending Review</p>
                <h4 className="text-2xl font-black text-amber-900">{stats.pending}</h4>
              </div>
              <div className="p-3 bg-amber-500 text-white rounded-xl polo-border">
                <Clock className="w-5 h-5" />
              </div>
            </div>
          </Card>

          <Card
            onClick={() => setFilter('Verified')}
            className={`cursor-pointer transition-all ${
              filter === 'Verified' ? 'ring-2 ring-emerald-500 bg-emerald-50/50' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-extrabold uppercase text-emerald-700">Verified</p>
                <h4 className="text-2xl font-black text-emerald-900">{stats.verified}</h4>
              </div>
              <div className="p-3 bg-emerald-600 text-white rounded-xl polo-border">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </Card>

          <Card
            onClick={() => setFilter('Rejected')}
            className={`cursor-pointer transition-all ${
              filter === 'Rejected' ? 'ring-2 ring-red-500 bg-red-50/50' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-extrabold uppercase text-red-700">Rejected</p>
                <h4 className="text-2xl font-black text-red-900">{stats.rejected}</h4>
              </div>
              <div className="p-3 bg-red-600 text-white rounded-xl polo-border">
                <XCircle className="w-5 h-5" />
              </div>
            </div>
          </Card>
        </div>

        {/* Directory List */}
        <Card className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b-2 border-neutral-200">
            <h3 className="text-lg font-black uppercase text-black">
              Psychologist Directory ({filter} Filter)
            </h3>
            <div className="flex items-center space-x-2">
              {['All', 'Pending', 'Verified', 'Rejected'].map((statusOption) => (
                <button
                  key={statusOption}
                  onClick={() => setFilter(statusOption)}
                  className={`px-3 py-1 text-xs font-black uppercase rounded-lg border-2 transition-all ${
                    filter === statusOption
                      ? 'bg-[#B82126] text-white border-black polo-shadow-sm'
                      : 'bg-white text-black border-neutral-300 hover:border-black'
                  }`}
                >
                  {statusOption}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p className="text-xs font-bold text-neutral-500 py-8 text-center">Loading psychologist data...</p>
          ) : filteredPsychologists.length === 0 ? (
            <div className="py-12 text-center border-2 border-dashed border-neutral-300 rounded-xl">
              <p className="text-sm font-black text-black">No Psychologists Found</p>
              <p className="text-xs text-neutral-500 mt-1">
                There are currently no psychologists matching the &quot;{filter}&quot; filter.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPsychologists.map((psych) => {
                const status = psych.verificationStatus || (psych.isVerified ? 'Verified' : 'Pending');
                const isExpanded = expandedId === psych._id;
                const slotsCount = psych.visitingSlots?.length || 0;

                return (
                  <div
                    key={psych._id}
                    className="p-5 bg-neutral-50 rounded-2xl polo-border hover:border-black transition-all space-y-4"
                  >
                    {/* Top Row: Basic Info & Verification Controls */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 rounded-xl bg-[#1A1A1A] text-white flex items-center justify-center font-black text-lg polo-border flex-shrink-0">
                          {psych.avatar ? (
                            <img
                              src={psych.avatar}
                              alt={psych.name}
                              className="w-full h-full object-cover rounded-xl"
                            />
                          ) : (
                            psych.name?.[0]?.toUpperCase() || 'P'
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 flex-wrap">
                            <h4 className="text-base font-black text-black">{psych.name}</h4>
                            <span
                              className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                                status === 'Verified'
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-400'
                                  : status === 'Rejected'
                                  ? 'bg-red-100 text-red-800 border-red-400'
                                  : 'bg-amber-100 text-amber-800 border-amber-400'
                              }`}
                            >
                              {status}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-neutral-600">{psych.email}</p>
                          {psych.title && (
                            <div className="flex items-center space-x-1.5 text-xs font-extrabold text-[#B82126] mt-1">
                              <Briefcase className="w-3.5 h-3.5" />
                              <span>{psych.title}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Admin Verification Action Buttons */}
                      <div className="flex items-center space-x-2 self-end lg:self-center">
                        {status !== 'Verified' && (
                          <Button
                            size="sm"
                            variant="primary"
                            icon={CheckCircle2}
                            loading={actionLoadingId === psych._id}
                            onClick={() => handleVerify(psych._id, 'Verified')}
                          >
                            Verify & Approve
                          </Button>
                        )}
                        {status !== 'Rejected' && (
                          <Button
                            size="sm"
                            variant="outline"
                            icon={XCircle}
                            loading={actionLoadingId === psych._id}
                            onClick={() => handleVerify(psych._id, 'Rejected')}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            Reject
                          </Button>
                        )}
                        {status !== 'Pending' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            loading={actionLoadingId === psych._id}
                            onClick={() => handleVerify(psych._id, 'Pending')}
                          >
                            Reset to Pending
                          </Button>
                        )}

                        <button
                          onClick={() => setExpandedId(isExpanded ? null : psych._id)}
                          className="p-2 bg-white border-2 border-black rounded-xl hover:bg-neutral-100 transition-colors"
                          title="Toggle Details & Visiting Slots"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Metadata summary line */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-bold pt-2 border-t border-neutral-200">
                      <div className="flex items-center space-x-2 text-neutral-700">
                        <Award className="w-4 h-4 text-neutral-400" />
                        <span>Experience: {psych.experience || 'Not specified'}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-neutral-700">
                        <MapPin className="w-4 h-4 text-neutral-400" />
                        <span>Visiting Clinic: {psych.visitingAddress || 'Not specified'}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-neutral-700">
                        <Calendar className="w-4 h-4 text-neutral-400" />
                        <span>Visiting Slots: {slotsCount} Active Slots</span>
                      </div>
                    </div>

                    {/* Expandable Section: Bio, Specialties, Visiting Slots & Timings */}
                    {isExpanded && (
                      <div className="pt-4 border-t-2 border-black space-y-4">
                        {psych.bio && (
                          <div>
                            <p className="text-[11px] font-black uppercase text-neutral-500">Bio / Summary</p>
                            <p className="text-xs font-medium text-neutral-800 mt-1">{psych.bio}</p>
                          </div>
                        )}

                        {psych.specialties && psych.specialties.length > 0 && (
                          <div>
                            <p className="text-[11px] font-black uppercase text-neutral-500 mb-1">
                              Clinical Specialties
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {psych.specialties.map((spec, i) => (
                                <span
                                  key={i}
                                  className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-white border border-neutral-300 rounded-md"
                                >
                                  {spec}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Visiting Slots & Timings Display */}
                        <div>
                          <p className="text-[11px] font-black uppercase text-neutral-500 mb-2">
                            Psychologist Visiting Slots & Timings
                          </p>
                          {!psych.visitingSlots || psych.visitingSlots.length === 0 ? (
                            <p className="text-xs italic text-neutral-500 bg-white p-3 rounded-xl border border-neutral-200">
                              No visiting slots created by this psychologist yet.
                            </p>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                              {psych.visitingSlots.map((slot) => (
                                <div
                                  key={slot._id || slot.id}
                                  className="p-3 bg-white rounded-xl border-2 border-black space-y-1"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-black text-black">{slot.dayOrDate}</span>
                                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 bg-neutral-100 border border-neutral-300 rounded">
                                      {slot.mode}
                                    </span>
                                  </div>
                                  <p className="text-xs font-extrabold text-[#B82126]">
                                    {slot.startTime} - {slot.endTime}
                                  </p>
                                  <p className="text-[10px] font-bold text-neutral-500">
                                    Duration: {slot.durationMinutes} mins
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};
