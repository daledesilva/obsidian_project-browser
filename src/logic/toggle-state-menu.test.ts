import { describe, expect, test, jest, beforeEach, afterEach } from '@jest/globals';
import { setGlobals, setStateMenuSettings, getStateMenuSettings } from './stores';
import { toggleStateMenu, openStateMenuIfClosed, returnStateMenuAfterDelay } from './toggle-state-menu';

describe('toggle-state-menu', () => {
  const mockSaveSettings = jest.fn();
  const mockPlugin = {
    settings: { showStateMenu: true },
    saveSettings: mockSaveSettings,
  };

  beforeEach(() => {
    setGlobals({ plugin: mockPlugin as unknown as ReturnType<typeof import('./stores').getGlobals>['plugin'] });
    setStateMenuSettings({ visible: true });
    mockSaveSettings.mockClear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('toggleStateMenu', () => {
    test('toggles visible and updates plugin.settings.showStateMenu and saveSettings', () => {
      expect(getStateMenuSettings().visible).toBe(true);
      toggleStateMenu();
      expect(getStateMenuSettings().visible).toBe(false);
      expect(mockPlugin.settings.showStateMenu).toBe(false);
      expect(mockSaveSettings).toHaveBeenCalled();

      toggleStateMenu();
      expect(getStateMenuSettings().visible).toBe(true);
      expect(mockPlugin.settings.showStateMenu).toBe(true);
      expect(mockSaveSettings).toHaveBeenCalledTimes(2);
    });
  });

  describe('openStateMenuIfClosed', () => {
    test('returns true when menu already visible', () => {
      setStateMenuSettings({ visible: true });
      expect(openStateMenuIfClosed()).toBe(true);
    });

    test('opens menu and returns false when menu was closed', () => {
      setStateMenuSettings({ visible: false });
      expect(openStateMenuIfClosed()).toBe(false);
      expect(getStateMenuSettings().visible).toBe(true);
    });
  });

  describe('returnStateMenuAfterDelay', () => {
    test('closes menu after delay when it was opened by openStateMenuIfClosed', () => {
      setStateMenuSettings({ visible: false });
      openStateMenuIfClosed();
      expect(getStateMenuSettings().visible).toBe(true);
      returnStateMenuAfterDelay();
      jest.advanceTimersByTime(1000);
      expect(getStateMenuSettings().visible).toBe(false);
    });
  });
});
