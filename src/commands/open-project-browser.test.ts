import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import { registerOpenProjectBrowserCommand, registerOpenProjectBrowserRibbonIcon } from './open-project-browser';

jest.mock('src/logic/stores', () => ({
  getGlobals: jest.fn(),
}));
jest.mock('src/views/card-browser-view/card-browser-view', () => ({
  newProjectBrowserLeaf: jest.fn(),
}));

const { getGlobals } = jest.requireMock('src/logic/stores') as { getGlobals: jest.Mock };
const { newProjectBrowserLeaf } = jest.requireMock('src/views/card-browser-view/card-browser-view') as {
  newProjectBrowserLeaf: jest.Mock;
};

describe('open-project-browser commands', () => {
  const addCommandMock = jest.fn();
  const addRibbonIconMock = jest.fn();

  beforeEach(() => {
    getGlobals.mockReturnValue({
      plugin: {
        addCommand: addCommandMock,
        addRibbonIcon: addRibbonIconMock,
      },
    });
    addCommandMock.mockClear();
    addRibbonIconMock.mockClear();
    newProjectBrowserLeaf.mockClear();
  });

  test('registerOpenProjectBrowserCommand adds command with correct id and callback', async () => {
    await registerOpenProjectBrowserCommand();
    expect(addCommandMock).toHaveBeenCalledTimes(1);
    const call = addCommandMock.mock.calls[0][0];
    expect(call.id).toBe('open-project-browser');
    expect(call.name).toBe('Open');
    expect(typeof call.callback).toBe('function');
    call.callback();
    expect(newProjectBrowserLeaf).toHaveBeenCalled();
  });

  test('registerOpenProjectBrowserRibbonIcon adds ribbon icon with callback', async () => {
    await registerOpenProjectBrowserRibbonIcon();
    expect(addRibbonIconMock).toHaveBeenCalledTimes(1);
    const [icon, label, callback] = addRibbonIconMock.mock.calls[0];
    expect(label).toBe('Open project browser');
    expect(typeof callback).toBe('function');
    callback();
    expect(newProjectBrowserLeaf).toHaveBeenCalled();
  });
});
