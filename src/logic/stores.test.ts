import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import {
  setGlobals,
  getGlobals,
  setStateMenuSettings,
  getStateMenuSettings,
  initStateMenuSettings,
  hideHiddenFolders,
  unhideHiddenFolders,
  getShowHiddenFolders,
} from './stores';

describe('stores', () => {
  const mockPlugin = {
    settings: {
      showStateMenu: true,
      showNoteAndProjectStateMenu: true,
      showPageStateMenu: true,
    },
    saveSettings: jest.fn(),
  };

  beforeEach(() => {
    setGlobals({ plugin: mockPlugin as unknown as ReturnType<typeof getGlobals>['plugin'] });
    mockPlugin.saveSettings.mockClear();
  });

  describe('setGlobals / getGlobals', () => {
    test('getGlobals returns plugin set via setGlobals', () => {
      const plugin = { settings: {}, saveSettings: jest.fn() };
      setGlobals({ plugin: plugin as unknown as ReturnType<typeof getGlobals>['plugin'] });
      expect(getGlobals().plugin).toBe(plugin);
    });
  });

  describe('stateMenuAtom', () => {
    test('setStateMenuSettings and getStateMenuSettings round-trip', () => {
      setStateMenuSettings({ noteAndProjectVisible: true, pageVisible: false });
      expect(getStateMenuSettings()).toEqual({ noteAndProjectVisible: true, pageVisible: false });
      setStateMenuSettings({ noteAndProjectVisible: false, pageVisible: true });
      expect(getStateMenuSettings()).toEqual({ noteAndProjectVisible: false, pageVisible: true });
    });
  });

  describe('initStateMenuSettings', () => {
    test('sets state menu visibility from split plugin settings', () => {
      setStateMenuSettings({ noteAndProjectVisible: true, pageVisible: true });
      const plugin = {
        settings: {
          showStateMenu: true,
          showNoteAndProjectStateMenu: false,
          showPageStateMenu: true,
        },
        saveSettings: jest.fn(),
      };
      setGlobals({ plugin: plugin as unknown as ReturnType<typeof getGlobals>['plugin'] });
      initStateMenuSettings();
      expect(getStateMenuSettings()).toEqual({
        noteAndProjectVisible: false,
        pageVisible: true,
      });
    });

    test('falls back to legacy showStateMenu when split settings are absent', () => {
      setStateMenuSettings({ noteAndProjectVisible: true, pageVisible: true });
      const plugin = { settings: { showStateMenu: false }, saveSettings: jest.fn() };
      setGlobals({ plugin: plugin as unknown as ReturnType<typeof getGlobals>['plugin'] });
      initStateMenuSettings();
      expect(getStateMenuSettings()).toEqual({
        noteAndProjectVisible: false,
        pageVisible: false,
      });
    });
  });

  describe('showHiddenFoldersAtom', () => {
    test('hideHiddenFolders sets atom to false', () => {
      unhideHiddenFolders();
      hideHiddenFolders();
      expect(getShowHiddenFolders()).toBe(false);
    });

    test('unhideHiddenFolders sets atom to true', () => {
      hideHiddenFolders();
      unhideHiddenFolders();
      expect(getShowHiddenFolders()).toBe(true);
    });
  });
});
