import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { Calendar, Clock, Video, MapPin } from 'lucide-react';

export const AppointmentCard = ({ appointment, onJoin }) => {
  const { psychologist, date, timeSlot, duration, mode, status, meetingId } = appointment;

  const statusColors = {
    Pending: 'bg-amber-100 text-amber-900 border-amber-500',
    Confirmed: 'bg-emerald-100 text-emerald-900 border-emerald-500',
    Completed: 'bg-blue-100 text-blue-900 border-blue-500',
    Cancelled: 'bg-red-100 text-red-900 border-red-500',
  };

  const displayMode = mode || 'Online Video';
  const isVideo = displayMode === 'Online Video' || displayMode === 'Both';

  return (
    <Card className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-2 hover:border-black transition-all">
      <div className="flex items-start space-x-4">
        <Avatar src={psychologist?.avatar} name={psychologist?.name || 'Psychologist'} size="lg" />
        <div>
          <div className="flex items-center space-x-2 flex-wrap gap-1">
            <h4 className="text-base font-black text-black">{psychologist?.name || 'Dr. Therapist'}</h4>
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${statusColors[status] || statusColors.Pending}`}>
              {status}
            </span>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-neutral-100 text-neutral-800 rounded border border-neutral-300">
              {displayMode}
            </span>
          </div>

          <p className="text-xs font-semibold text-neutral-600 mt-0.5">{psychologist?.title || 'Clinical Practitioner'}</p>

          <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-neutral-700 mt-2">
            <span className="flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1 text-[#B82126]" />
              {date || 'Upcoming'}
            </span>
            <span className="flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1 text-[#B82126]" />
              {timeSlot || '02:00 PM'} ({duration || 50}m)
            </span>
            {!isVideo && psychologist?.visitingAddress && (
              <span className="flex items-center text-neutral-600">
                <MapPin className="w-3.5 h-3.5 mr-1 text-[#B82126]" />
                {psychologist.visitingAddress}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2 self-end md:self-center">
        {status === 'Confirmed' && isVideo && (
          <Button icon={Video} size="sm" onClick={() => onJoin && onJoin(meetingId)}>
            Join Video Call
          </Button>
        )}

        {status === 'Pending' && (
          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-300">
            Awaiting Doctor Acceptance
          </span>
        )}

        {status === 'Cancelled' && (
          <span className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-lg border border-red-200">
            Booking Declined
          </span>
        )}
      </div>
    </Card>
  );
};
