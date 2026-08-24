import React from 'react';

export const Check = ({ size = 10, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 10 10" fill="none" className={className}>
    <path d="M2 5L4 7L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const XMark = ({ size = 10, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 10 10" fill="none" className={className}>
    <path d="M2 2L8 8M8 2L2 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

export const Export = ({ size = 10, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 10 10" fill="none" className={className}>
    <path d="M5 1V7M3 5L5 7L7 5M2 9H8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const Folder = ({ size = 14, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className={className}>
    <path d="M2 4H5.5L7 5.5H12V12H2V4Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" fill="none"/>
  </svg>
);

export const Import = ({ size = 14, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className={className}>
    <path d="M7 2V9M4 7L7 10L10 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 12H12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
);

export const Spinner = ({ size = 24, className = '' }) => (
  <svg className={`animate-spin ${className}`} width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeLinecap="round"/>
  </svg>
);

export const PresetsIcon = ({ size = 18, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className={className}>
    <rect x="2" y="2" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <rect x="10" y="2" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <rect x="2" y="10" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <rect x="10" y="10" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
  </svg>
);

export const CursorIcon = ({ size = 18, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className={className}>
    <path d="M3 2L15 9L9 10L7 16L3 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
  </svg>
);

export const SoundIcon = ({ size = 18, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className={className}>
    <path d="M3 7V11M6 5V13M9 3V15M12 6V12M15 8V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const FontIcon = ({ size = 18, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className={className}>
    <path d="M4 4H14M9 4V15M6 15H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const SkyboxIcon = ({ size = 18, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className={className}>
    <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <path d="M9 2C6 6 6 12 9 16C12 12 12 6 9 2Z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
  </svg>
);

export const MaterialIcon = ({ size = 18, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className={className}>
    <rect x="2" y="2" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <rect x="5" y="5" width="3" height="3" rx="0.5" stroke="currentColor" strokeWidth="1" fill="none"/>
    <rect x="10" y="5" width="3" height="3" rx="0.5" stroke="currentColor" strokeWidth="1" fill="none"/>
    <rect x="5" y="10" width="3" height="3" rx="0.5" stroke="currentColor" strokeWidth="1" fill="none"/>
    <rect x="10" y="10" width="3" height="3" rx="0.5" stroke="currentColor" strokeWidth="1" fill="none"/>
  </svg>
);

export const ProfileIcon = ({ size = 18, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className={className}>
    <path d="M4 2H14V16H4V2Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <path d="M7 6H11M7 9H11M7 12H9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

export const StarIcon = ({ size = 18, className = '', filled = false }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill={filled ? 'currentColor' : 'none'} className={className}>
    <path d="M9 2L11.1 6.3L16 6.9L12.5 10.3L13.3 15.2L9 12.9L4.7 15.2L5.5 10.3L2 6.9L6.9 6.3L9 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
  </svg>
);

export const FolderOpenIcon = ({ size = 18, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className={className}>
    <path d="M2 5H6L7.5 3.5H14V14H2V5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" fill="none"/>
    <path d="M2 5L4 10H16L14 5" stroke="currentColor" strokeWidth="1.3" fill="none"/>
  </svg>
);

export const AppIcon = ({ size = 12, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 12 12" fill="none" className={className}>
    <path d="M2 2L6 1L10 2L11 6L10 10L6 11L2 10L1 6L2 2Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
  </svg>
);

export const SettingsIcon = ({ size = 14, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className={className}>
    <circle cx="7" cy="7" r="2.2" stroke="currentColor" strokeWidth="1.2" fill="none"/>
    <path d="M7 1.5V2.5M7 11.5V12.5M1.5 7H2.5M11.5 7H12.5M3.1 3.1L3.8 3.8M10.2 10.2L10.9 10.9M10.9 3.1L10.2 3.8M3.8 10.2L3.1 10.9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

export const PlayIcon = ({ size = 10, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 10 10" fill="none" className={className}>
    <polygon points="3,1 9,5 3,9" fill="currentColor"/>
  </svg>
);

export const SmallSpinner = ({ size = 12, className = '' }) => (
  <svg className={`animate-spin ${className}`} width={size} height={size} viewBox="0 0 12 12" fill="none">
    <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="16" strokeLinecap="round"/>
  </svg>
);
