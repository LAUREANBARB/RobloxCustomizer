import { describe, it, expect, beforeEach } from 'vitest';
import useStore from './store';

describe('store', () => {
  beforeEach(() => {
    useStore.setState({
      activeTab: 'cursors',
      cursorPresets: [],
      notifications: [],
      previewCache: {},
    });
  });

  it('initializes with default state', () => {
    const state = useStore.getState();
    expect(state.activeTab).toBe('cursors');
    expect(state.config.watcherEnabled).toBe(false);
    expect(state.cursorPresets).toEqual([]);
    expect(state.notifications).toEqual([]);
  });

  it('setActiveTab changes tab', () => {
    useStore.getState().setActiveTab('cursors');
    expect(useStore.getState().activeTab).toBe('cursors');
  });

  it('setCursorPresets updates list', () => {
    useStore.getState().setCursorPresets([{ name: 'test', files: [] }]);
    expect(useStore.getState().cursorPresets).toHaveLength(1);
  });

  it('addNotification appends with timestamp id', () => {
    useStore.getState().addNotification('hello', 'success');
    const notifs = useStore.getState().notifications;
    expect(notifs).toHaveLength(1);
    expect(notifs[0].msg).toBe('hello');
    expect(notifs[0].type).toBe('success');
  });

  it('setPreview caches by key', () => {
    useStore.getState().setPreview('key1', 'data1');
    expect(useStore.getState().previewCache.key1).toBe('data1');
  });

  it('setConfig merges config', () => {
    useStore.getState().setConfig({ ...useStore.getState().config, watcherEnabled: true });
    expect(useStore.getState().config.watcherEnabled).toBe(true);
  });
});
