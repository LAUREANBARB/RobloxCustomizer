import { useState, useEffect, useCallback } from 'react';
import useStore from '../store';

export default function usePresetGrid(type) {
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const singular = type.replace(/s$/, '');
  const Type = cap(singular);

  const store = useStore();
  const listKey = `${singular}Presets`;
  const setKey = `set${Type}Presets`;
  const activeKey = `active${Type}Preset`;
  const presets = store[listKey];
  const setPresets = store[setKey];
  const { config, setConfig, addNotification } = store;

  const [search, setSearch] = useState('');

  const filteredPresets = (presets ?? []).filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const loadPresets = useCallback(async () => {
    try {
      const p = await window.api[`get${Type}Presets`]();
      setPresets(p);
    } catch {
      addNotification('Failed to load presets', 'error');
    }
  }, [Type, setPresets, addNotification]);

  useEffect(() => {
    loadPresets();
  }, [loadPresets]);

  const handleApply = async (name) => {
    try {
      const result = await window.api[`apply${Type}Preset`](name);
      if (result.success) {
        const cfg = await window.api.getConfig();
        setConfig(cfg);
        addNotification(`${Type} "${name}" applied`, 'success');
      } else {
        addNotification(result.reason || 'Failed', 'error');
      }
    } catch {
      addNotification('Apply failed', 'error');
    }
  };

  const handleRemove = async () => {
    try {
      await window.api[`remove${Type}Preset`]();
      const cfg = await window.api.getConfig();
      setConfig(cfg);
      addNotification(`${Type} reset to default`, 'info');
    } catch {
      addNotification('Failed', 'error');
    }
  };

  const handleExport = async (name) => {
    try {
      const result = await window.api.exportPack({ type, presetName: name });
      if (result.success) {
        addNotification(`Exported "${name}"`, 'success');
      } else if (result.reason !== 'Cancelled') {
        addNotification(result.reason || 'Export failed', 'error');
      }
    } catch {
      addNotification('Export failed', 'error');
    }
  };

  const handleImport = async () => {
    try {
      const result = await window.api.importPack();
      if (result.success) {
        loadPresets();
        addNotification(`Imported: ${result.name}`, 'success');
      } else {
        addNotification('No packs imported', 'info');
      }
    } catch {
      addNotification('Import failed', 'error');
    }
  };

  const handleDelete = async (name) => {
    try {
      await window.api[`delete${Type}Preset`](name);
      loadPresets();
      const cfg = await window.api.getConfig();
      setConfig(cfg);
      addNotification(`Deleted "${name}"`, 'info');
    } catch {
      addNotification('Delete failed', 'error');
    }
  };

  const handleOpenFolder = () => window.api.openPresetFolder(type);

  const isActive = (name) => config[activeKey] === name;

  return {
    Type,
    type,
    presets,
    config,
    search,
    setSearch,
    filteredPresets,
    loadPresets,
    handleApply,
    handleRemove,
    handleExport,
    handleImport,
    handleDelete,
    handleOpenFolder,
    isActive,
    addNotification,
  };
}
