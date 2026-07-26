import React, { useState, useEffect } from 'react';

export default function WelcomePopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    window.api.getWelcomeDismissed().then((dismissed) => {
      if (!dismissed) setVisible(true);
    });
  }, []);

  const handleDismiss = () => {
    window.api.setWelcomeDismissed(true);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
      <div className="slide-in w-96 rounded-2xl border p-8 text-center" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
        <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ background: 'var(--accent-glow)' }}>
          <svg width="32" height="32" viewBox="0 0 12 12" fill="none" style={{ color: 'var(--accent)' }}>
            <path d="M2 2L6 1L10 2L11 6L10 10L6 11L2 10L1 6L2 2Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          </svg>
        </div>
        <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Welcome!</h2>
        <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
          Roblox Customizer lets you swap cursors, sounds, fonts, skyboxes and materials.
        </p>
        <button
          onClick={handleDismiss}
          className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 bg-[var(--accent)] text-[var(--bg-primary)] shadow-[0_0_16px_var(--accent-glow)] hover:shadow-[0_0_20px_var(--accent-glow)]"
        >
          Okay
        </button>
      </div>
    </div>
  );
}
