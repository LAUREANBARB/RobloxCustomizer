import React from 'react';
import useStore from '../store';

const typeStyles = {
  success: 'border-success/30 bg-success/5 text-success',
  error: 'border-danger/30 bg-danger/5 text-danger',
  info: 'border-accent/30 bg-accent/5 text-accent-light',
  warning: 'border-warning/30 bg-warning/5 text-warning',
};

const icons = {
  success: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M3 7L6 10L11 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  error: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M4 4L10 10M10 4L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  info: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <line x1="7" y1="6" x2="7" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="7" cy="4.5" r="0.75" fill="currentColor"/>
    </svg>
  ),
  warning: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 3L13 12H1L7 3Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" fill="none"/>
      <line x1="7" y1="7" x2="7" y2="9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <circle cx="7" cy="5.5" r="0.6" fill="currentColor"/>
    </svg>
  ),
};

export default function Notifications() {
  const { notifications } = useStore();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border backdrop-blur-xl text-sm font-medium ${n.exiting ? 'notif-exit' : 'notif-enter'} ${typeStyles[n.type] || typeStyles.info}`}
        >
          {icons[n.type] || icons.info}
          {n.msg}
        </div>
      ))}
    </div>
  );
}
