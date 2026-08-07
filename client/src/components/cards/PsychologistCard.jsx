import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { Star, Award, Calendar } from 'lucide-react';

export const PsychologistCard = ({ psychologist, onBook }) => {
  const { name, title, rating, reviews, specialties, avatar, available, experience } = psychologist;

  return (
    <Card className="flex flex-col justify-between space-y-4 hover:translate-y-[-2px] transition-transform">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <Avatar src={avatar} name={name} size="lg" status={available ? 'online' : 'offline'} />
          <div>
            <h4 className="text-base font-black text-black">{name}</h4>
            <p className="text-xs font-semibold text-neutral-600">{title || 'Clinical Practitioner'}</p>
            {rating != null && (
              <div className="flex items-center space-x-1 mt-1">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span className="text-xs font-bold text-black">{rating}</span>
                {reviews != null && (
                  <span className="text-xs text-neutral-500">({reviews} reviews)</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {experience && (
        <div className="flex items-center text-xs font-semibold text-neutral-700 space-x-2">
          <Award className="w-3.5 h-3.5 text-[#9F1239]" />
          <span>{experience}</span>
        </div>
      )}

      {/* Specialties Tags */}
      {specialties && specialties.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {specialties.map((spec, i) => (
            <span
              key={i}
              className="text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded-md border border-neutral-300"
            >
              {spec}
            </span>
          ))}
        </div>
      )}


      <Button
        icon={Calendar}
        variant={available ? 'primary' : 'outline'}
        disabled={!available}
        onClick={() => onBook && onBook(psychologist)}
        className="w-full mt-2"
        size="sm"
      >
        {available ? 'Book Session' : 'Currently Unavailable'}
      </Button>
    </Card>
  );
};
