import { describe, expect, test, jest, beforeEach, afterEach } from '@jest/globals';
import { setGlobals, setStateMenuSettings, getStateMenuSettings } from './stores';
import { toggleStateMenuSurface, openStateMenuIfClosed, returnStateMenuAfterDelay } from './toggle-state-menu';

describe('toggle-state-menu', () => {
  const mockSaveSettings = jest.fn();
  const mockPlugin = {
    settings: {
      showStateMenu: true,
      showNoteAndProjectStateMenu: true,
      showPageStateMenu: true,
    },
    saveSettings: mockSaveSettings,
  };

  beforeEach(() => {
    setGlobals({ plugin: mockPlugin as unknown as ReturnType<typeof import('./stores').getGlobals>['plugin'] });
    setStateMenuSettings({ noteAndProjectVisible: true, pageVisible: true });
    mockPlugin.settings.showStateMenu = true;
    mockPlugin.settings.showNoteAndProjectStateMenu = true;
    mockPlugin.settings.showPageStateMenu = true;
    mockSaveSettings.mockClear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('toggleStateMenu', () => {
    test('toggles note and project visibility and keeps legacy showStateMenu in sync', () => {
      expect(getStateMenuSettings().noteAndProjectVisible).toBe(true);
      toggleStateMenuSurface('noteAndProject');
      expect(getStateMenuSettings().noteAndProjectVisible).toBe(false);
      expect(mockPlugin.settings.showStateMenu).toBe(false);
      expect(mockPlugin.settings.showNoteAndProjectStateMenu).toBe(false);
      expect(mockSaveSettings).toHaveBeenCalled();

      toggleStateMenuSurface('noteAndProject');
      expect(getStateMenuSettings().noteAndProjectVisible).toBe(true);
      expect(mockPlugin.settings.showStateMenu).toBe(true);
      expect(mockPlugin.settings.showNoteAndProjectStateMenu).toBe(true);
      expect(mockSaveSettings).toHaveBeenCalledTimes(2);
    });

    test('toggles page visibility without changing note and project visibility', () => {
      toggleStateMenuSurface('page');
      expect(getStateMenuSettings()).toEqual({
        noteAndProjectVisible: true,
        pageVisible: false,
      });
      expect(mockPlugin.settings.showPageStateMenu).toBe(false);
      expect(mockPlugin.settings.showNoteAndProjectStateMenu).toBe(true);
    });
  });

  describe('openStateMenuIfClosed', () => {
    test('returns true when menu already visible', () => {
      setStateMenuSettings({ noteAndProjectVisible: true, pageVisible: true });
      expect(openStateMenuIfClosed()).toBe(true);
    });

    test('opens menu and returns false when menu was closed', () => {
      setStateMenuSettings({ noteAndProjectVisible: true, pageVisible: false });
      expect(openStateMenuIfClosed('page')).toBe(false);
      expect(getStateMenuSettings().pageVisible).toBe(true);
    });
  });

  describe('returnStateMenuAfterDelay', () => {
    test('closes menu after delay when it was opened by openStateMenuIfClosed', () => {
      setStateMenuSettings({ noteAndProjectVisible: true, pageVisible: false });
      openStateMenuIfClosed('page');
      expect(getStateMenuSettings().pageVisible).toBe(true);
      returnStateMenuAfterDelay('page');
      jest.advanceTimersByTime(1000);
      expect(getStateMenuSettings().pageVisible).toBe(false);
      expect(getStateMenuSettings().noteAndProjectVisible).toBe(true);
    });
  });
});
