'use client';

import React, { useState } from 'react';
import { Building2 } from 'lucide-react';

interface JobLogoProps {
  logo?: string;
  organization?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function JobLogo({
  logo,
  organization = 'প্রতিষ্ঠানের লোগো',
  className = '',
  size = 'sm'
}: JobLogoProps) {
  const [imgError, setImgError] = useState(false);

  // Check if logo is an image URL (http, https, relative path, or data URI)
  const isImageUrl = Boolean(
    logo &&
    typeof logo === 'string' &&
    (logo.startsWith('http://') ||
     logo.startsWith('https://') ||
     logo.startsWith('/') ||
     logo.startsWith('data:image/'))
  );

  const sizeMap = {
    sm: {
      img: 'w-7 h-7 min-w-[28px] max-h-7 object-cover rounded-lg border border-slate-200/90 shadow-2xs bg-white',
      icon: 'w-4 h-4 text-emerald-700 flex-shrink-0',
      badge: 'w-7 h-7 min-w-[28px] p-1 bg-emerald-50 rounded-lg border border-emerald-200/60 flex items-center justify-center',
      emoji: 'text-lg leading-none select-none flex-shrink-0'
    },
    md: {
      img: 'w-9 h-9 min-w-[36px] max-h-9 object-cover rounded-xl border border-slate-200 shadow-2xs bg-white',
      icon: 'w-5 h-5 text-emerald-700 flex-shrink-0',
      badge: 'w-9 h-9 min-w-[36px] p-1.5 bg-emerald-50 rounded-xl border border-emerald-200/60 flex items-center justify-center',
      emoji: 'text-2xl leading-none select-none flex-shrink-0'
    },
    lg: {
      img: 'w-14 h-14 min-w-[56px] max-h-14 object-cover rounded-2xl border border-slate-200 shadow-sm bg-white',
      icon: 'w-8 h-8 text-emerald-700 flex-shrink-0',
      badge: 'w-14 h-14 min-w-[56px] p-2 bg-emerald-50 rounded-2xl border border-emerald-200/60 flex items-center justify-center',
      emoji: 'text-4xl leading-none select-none flex-shrink-0'
    }
  };

  const currentSize = sizeMap[size];

  // If no logo is provided or image loading failed, render semantic Building2 icon badge
  if (!logo || (isImageUrl && imgError)) {
    return (
      <span className={`${currentSize.badge} ${className}`} title={organization}>
        <Building2 className={currentSize.icon} />
      </span>
    );
  }

  // If logo is a URL, render an HTML <img> element
  if (isImageUrl) {
    return (
      <img
        src={logo}
        alt={`${organization} logo`}
        onError={() => setImgError(true)}
        className={`${currentSize.img} ${className}`}
        loading="lazy"
      />
    );
  }

  // Otherwise, render emoji (e.g. 🏛️, 🏦, 🎓) or short text symbol
  return (
    <span className={`${currentSize.emoji} ${className}`} aria-hidden="true">
      {logo}
    </span>
  );
}
