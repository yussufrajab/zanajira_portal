import React from 'react';

interface Props {
  illustration?: 'no-vacancies' | 'no-applications' | 'no-results' | 'no-data';
  title: string;
  description?: string;
  ctaLabel?: string;
  ctaOnClick?: () => void;
}

const illustrations: Record<string, React.ReactElement> = {
  'no-vacancies': (
    <svg viewBox="0 0 200 160" className="w-48 h-36" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Ocean waves */}
      <path d="M0 120 Q25 108 50 120 Q75 132 100 120 Q125 108 150 120 Q175 132 200 120 L200 160 L0 160Z" fill="#D6E8F7"/>
      <path d="M0 130 Q25 118 50 130 Q75 142 100 130 Q125 118 150 130 Q175 142 200 130 L200 160 L0 160Z" fill="#1B4F72" opacity="0.15"/>
      {/* Dhow boat */}
      <path d="M70 115 L130 115 L120 125 L80 125Z" fill="#1B4F72"/>
      <path d="M100 60 L100 115 L75 115Z" fill="#C0932A"/>
      <path d="M100 60 L100 115 L125 115Z" fill="#C0932A" opacity="0.7"/>
      {/* Mast */}
      <line x1="100" y1="40" x2="100" y2="115" stroke="#1A2940" strokeWidth="2"/>
      {/* Stars */}
      <circle cx="40" cy="30" r="2" fill="#C0932A"/>
      <circle cx="160" cy="20" r="1.5" fill="#C0932A" opacity="0.7"/>
      <circle cx="80" cy="15" r="1" fill="#C0932A" opacity="0.5"/>
      {/* Geometric pattern */}
      <polygon points="100,5 108,20 95,20" fill="none" stroke="#1B4F72" strokeWidth="1" opacity="0.3"/>
    </svg>
  ),
  'no-applications': (
    <svg viewBox="0 0 200 160" className="w-48 h-36" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Folder */}
      <path d="M30 60 L30 130 L170 130 L170 70 L100 70 L85 60Z" fill="#D6E8F7"/>
      <path d="M30 70 L170 70 L170 130 L30 130Z" fill="#EBF4FB"/>
      <path d="M30 70 L170 70" stroke="#1B4F72" strokeWidth="1.5" opacity="0.3"/>
      {/* Gold star */}
      <path d="M100 85 L103 95 L113 95 L105 101 L108 111 L100 105 L92 111 L95 101 L87 95 L97 95Z" fill="#C0932A"/>
      {/* Lines suggesting empty */}
      <line x1="55" y1="118" x2="145" y2="118" stroke="#9BB2C9" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="65" y1="124" x2="135" y2="124" stroke="#9BB2C9" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  'no-results': (
    <svg viewBox="0 0 200 160" className="w-48 h-36" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Geometric tile background */}
      <g opacity="0.12" stroke="#1B4F72" strokeWidth="0.8">
        <polygon points="100,20 130,40 130,80 100,100 70,80 70,40"/>
        <polygon points="100,30 120,45 120,75 100,90 80,75 80,45"/>
        <line x1="100" y1="20" x2="100" y2="100"/>
        <line x1="70" y1="40" x2="130" y2="80"/>
        <line x1="130" y1="40" x2="70" y2="80"/>
      </g>
      {/* Magnifying glass */}
      <circle cx="95" cy="70" r="28" fill="white" stroke="#1B4F72" strokeWidth="3"/>
      <circle cx="95" cy="70" r="20" fill="#F5F8FC" stroke="#1B4F72" strokeWidth="1.5"/>
      <line x1="116" y1="91" x2="140" y2="115" stroke="#1B4F72" strokeWidth="4" strokeLinecap="round"/>
      {/* Question mark inside */}
      <text x="88" y="77" fontFamily="serif" fontSize="20" fill="#C0932A" fontWeight="bold">?</text>
    </svg>
  ),
  'no-data': (
    <svg viewBox="0 0 200 160" className="w-48 h-36" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Coral stone arch */}
      <path d="M50 140 L50 80 Q50 40 100 40 Q150 40 150 80 L150 140Z" fill="#EBF4FB" stroke="#E2EAF4" strokeWidth="1.5"/>
      <path d="M65 140 L65 85 Q65 55 100 55 Q135 55 135 85 L135 140Z" fill="#D6E8F7"/>
      {/* Door detail */}
      <path d="M80 140 L80 100 Q80 80 100 80 Q120 80 120 100 L120 140Z" fill="#1B4F72" opacity="0.15"/>
      {/* Birds */}
      <path d="M30 30 Q35 25 40 30" stroke="#C0932A" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M160 45 Q165 40 170 45" stroke="#C0932A" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* Geometric ornament */}
      <circle cx="100" cy="65" r="6" fill="none" stroke="#C0932A" strokeWidth="1.5"/>
      <circle cx="100" cy="65" r="3" fill="#C0932A"/>
    </svg>
  ),
};

export default function EmptyState({ illustration = 'no-data', title, description, ctaLabel, ctaOnClick }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-up">
      <div className="mb-6 opacity-90">
        {illustrations[illustration]}
      </div>
      <h3 className="font-display text-xl font-semibold text-text-primary mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-text-secondary max-w-xs font-body leading-relaxed">{description}</p>
      )}
      {ctaLabel && ctaOnClick && (
        <button onClick={ctaOnClick} className="btn-primary mt-6">
          {ctaLabel}
        </button>
      )}
    </div>
  );
}
