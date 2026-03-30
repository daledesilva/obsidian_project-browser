import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { getDefaultStore } from 'jotai';
import { StatelessQuickMenu } from './stateless-quick-menu';
import { Section } from 'src/logic/section-processes';
import {
  initializeSettingsAtoms,
  projectPageStatelessSettingsAtom,
  setGlobals,
  statelessSettingsAtom,
} from 'src/logic/stores';
import { DEFAULT_SETTINGS } from 'src/types/types-map';

jest.mock('src/components/tooltip/tooltip', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactElement }) => children,
}));

function createPluginSettings() {
  return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
}

function createStatelessSection(stateScope?: 'standardNote' | 'projectPage'): Section {
  const settings = createPluginSettings();

  return {
    title: ' ',
    type: 'stateless',
    items: [],
    settings: stateScope === 'projectPage' ? settings.projectPageStateless : settings.stateless,
    stateScope,
  };
}

describe('StatelessQuickMenu', () => {
  beforeEach(() => {
    const pluginSettings = createPluginSettings();
    const mockPlugin = {
      settings: pluginSettings,
      saveSettings: jest.fn(),
    };

    setGlobals({ plugin: mockPlugin as any });
    initializeSettingsAtoms();
  });

  test('updates standard stateless settings for standard sections', () => {
    const store = getDefaultStore();
    const initialStandardViewOrder = store.get(statelessSettingsAtom).defaultViewOrder;
    const initialProjectViewOrder = store.get(projectPageStatelessSettingsAtom).defaultViewOrder;

    render(<StatelessQuickMenu section={createStatelessSection('standardNote')} />);

    fireEvent.click(screen.getAllByRole('button')[0]);

    expect(store.get(statelessSettingsAtom).defaultViewOrder).not.toBe(initialStandardViewOrder);
    expect(store.get(projectPageStatelessSettingsAtom).defaultViewOrder).toBe(initialProjectViewOrder);
  });

  test('updates project-page stateless settings for project sections', () => {
    const store = getDefaultStore();
    const initialStandardViewOrder = store.get(statelessSettingsAtom).defaultViewOrder;
    const initialProjectViewOrder = store.get(projectPageStatelessSettingsAtom).defaultViewOrder;

    render(<StatelessQuickMenu section={createStatelessSection('projectPage')} />);

    fireEvent.click(screen.getAllByRole('button')[0]);

    expect(store.get(projectPageStatelessSettingsAtom).defaultViewOrder).not.toBe(initialProjectViewOrder);
    expect(store.get(statelessSettingsAtom).defaultViewOrder).toBe(initialStandardViewOrder);
  });
});