import React, { useEffect, useCallback, useRef } from 'react';
import useStore from './store';
import { applyTheme } from './themes';
import TitleBar from './components/TitleBar';
import Sidebar from './components/Sidebar';
import CursorGrid from './components/CursorGrid';
import SoundGrid from './components/SoundGrid';
import PresetsGrid from './components/PresetsGrid';
import FontGrid from './components/FontGrid';
import SkyboxGrid from './components/SkyboxGrid';
import MaterialGrid from './components/MaterialGrid';
import ProfilesGrid from './components/ProfilesGrid';
import StatusBar from './components/StatusBar';
import Settings from './components/Settings';
import WelcomePopup from './components/WelcomePopup';
import WatcherPrompt from './components/WatcherPrompt';
import Notifications from './components/Notifications';

export default function App() {
  const {
    activeTab,
    setCursorPresets,
    setSoundPresets,
    setFontPresets,
    setSkyboxPresets,
    setMaterialPresets,
    setCategorizedCursors,
    setCategorizedSounds,
    setConfig,
    setTheme,
    setRobloxVersion,
    setRobloxRunning,
    addNotification,
  } = useStore();

  const loadInterval = useRef(null);

  const loadData = useCallback(async () => {
    try {
      const [cursorPresets, soundPresets, fontPresets, skyboxPresets, materialPresets, config, version] = await Promise.all([
        window.api.getCursorPresets(),
        window.api.getSoundPresets(),
        window.api.getFontPresets(),
        window.api.getSkyboxPresets(),
        window.api.getMaterialPresets(),
        window.api.getConfig(),
        window.api.getRobloxVersion(),
      ]);
      setCursorPresets(cursorPresets);
      setSoundPresets(soundPresets);
      setFontPresets(fontPresets);
      setSkyboxPresets(skyboxPresets);
      setMaterialPresets(materialPresets);
      setConfig(config);
      setTheme(config.theme || '');
      applyTheme(config.theme || '');
      setRobloxVersion(version);
      setTimeout(async () => {
        try {
          const [categorized, running] = await Promise.all([
            window.api.getCategorizedPresets(),
            window.api.isRobloxRunning(),
          ]);
          setCategorizedCursors(categorized.cursors);
          setCategorizedSounds(categorized.sounds);
          setRobloxRunning(running);
        } catch {}
      }, 200);
    } catch (e) {
      addNotification('Failed to load data', 'error');
    }
  }, []);

  useEffect(() => {
    loadData();
    let mounted = true;

    const onReapplied = (_e, result) => {
      if (mounted && result.success) addNotification(`Mods re-applied to ${result.version}`, 'success');
    };
    const onWatcher = (_e, enabled) => {
      if (mounted) window.api.getConfig().then(setConfig);
    };
    const onTheme = (_e, theme) => {
      if (mounted) {
        setTheme(theme);
        applyTheme(theme || '');
      }
    };

    const cleanupReapplied = window.api.onModsReapplied(onReapplied);
    const cleanupWatcher = window.api.onWatcherChanged(onWatcher);
    const cleanupTheme = window.api.onThemeChanged(onTheme);

    loadInterval.current = setInterval(async () => {
      if (!mounted) return;
      const running = await window.api.isRobloxRunning();
      if (mounted) setRobloxRunning(running);
    }, 3000);

    return () => {
      mounted = false;
      clearInterval(loadInterval.current);
      cleanupReapplied?.();
      cleanupWatcher?.();
      cleanupTheme?.();
    };
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      <TitleBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            <div key={activeTab} className="tab-enter">
              {activeTab === 'presets' && <PresetsGrid />}
              {activeTab === 'cursors' && <CursorGrid />}
              {activeTab === 'sounds' && <SoundGrid />}
              {activeTab === 'fonts' && <FontGrid />}
              {activeTab === 'skyboxes' && <SkyboxGrid />}
              {activeTab === 'materials' && <MaterialGrid />}
              {activeTab === 'profiles' && <ProfilesGrid />}
            </div>
          </div>
          <StatusBar />
        </main>
      </div>
      <Settings />
      <WelcomePopup />
      <WatcherPrompt />
      <Notifications />
    </div>
  );
}
