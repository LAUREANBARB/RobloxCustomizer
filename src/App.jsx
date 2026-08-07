import React, { useEffect, useCallback, useRef } from 'react';
import useStore from './store';
import { applyTheme } from './themes';
import TitleBar from './components/TitleBar';
import Sidebar from './components/Sidebar';
import CursorGrid from './components/CursorGrid';
import SoundGrid from './components/SoundGrid';
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

      const running = await window.api.isRobloxRunning();
      setRobloxRunning(running);
    } catch {
      addNotification('Failed to load data', 'error');
    }
  }, [addNotification, setConfig, setCursorPresets, setFontPresets, setMaterialPresets, setRobloxRunning, setRobloxVersion, setSkyboxPresets, setSoundPresets, setTheme]);

  useEffect(() => {
    loadData();
    let mounted = true;

    const onReapplied = (_e, result) => {
      if (mounted && result.success) addNotification(`Mods re-applied to ${result.version}`, 'success');
    };
    const onTheme = (_e, theme) => {
      if (mounted) {
        setTheme(theme);
        applyTheme(theme || '');
      }
    };
    const onUpdateAvailable = (_e, data) => {
      if (mounted) {
        addNotification(`Update v${data.version} available. Click to install.`, 'info', () => {
          window.api.downloadAndInstall(data);
        });
      }
    };
    const onUpdateStatus = (_e, data) => {
      if (mounted) {
        addNotification(data.status, data.error ? 'error' : 'info');
      }
    };

    const cleanupReapplied = window.api.onModsReapplied(onReapplied);
    const cleanupTheme = window.api.onThemeChanged(onTheme);
    const cleanupUpdates = window.api.onUpdateAvailable(onUpdateAvailable);
    const cleanupStatus = window.api.onUpdateStatus(onUpdateStatus);

    loadInterval.current = setInterval(async () => {
      if (!mounted) return;
      const running = await window.api.isRobloxRunning();
      if (mounted) setRobloxRunning(running);
    }, 3000);

    return () => {
      mounted = false;
      clearInterval(loadInterval.current);
      cleanupReapplied?.();
      cleanupTheme?.();
      cleanupUpdates?.();
      cleanupStatus?.();
    };
  }, [loadData, addNotification, setRobloxRunning, setTheme]);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      <TitleBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            <div key={activeTab} className="tab-enter">
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
