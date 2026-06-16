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
    settings: { showStateMenu: true },
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
      setStateMenuSettings({ visible: true });
      expect(getStateMenuSettings()).toEqual({ visible: true });
      setStateMenuSettings({ visible: false });
      expect(getStateMenuSettings()).toEqual({ visible: false });
    });
  });

  describe('initStateMenuSettings', () => {
    test('sets state menu visible from plugin.settings.showStateMenu', () => {
      setStateMenuSettings({ visible: true });
      const plugin = { settings: { showStateMenu: false }, saveSettings: jest.fn() };
      setGlobals({ plugin: plugin as unknown as ReturnType<typeof getGlobals>['plugin'] });
      initStateMenuSettings();
      expect(getStateMenuSettings().visible).toBe(false);
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
