import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import { ConfirmationModal } from './confirmation-modal';

jest.mock('src/logic/stores', () => ({
  getGlobals: jest.fn(),
}));

const { getGlobals } = jest.requireMock('src/logic/stores');

describe('ConfirmationModal', () => {
  beforeEach(() => {
    getGlobals.mockReturnValue({
      plugin: {
        app: {},
      },
    });
  });

  test('constructor assigns options to instance', () => {
    const confirmAction = jest.fn();
    const modal = new ConfirmationModal({
      title: 'Confirm action',
      message: 'Are you sure?',
      confirmLabel: 'Yes',
      confirmAction,
    }) as ConfirmationModal & { title: string; message: string; confirmLabel: string };
    expect(modal.title).toBe('Confirm action');
    expect(modal.message).toBe('Are you sure?');
    expect(modal.confirmLabel).toBe('Yes');
  });

  test('constructor uses defaults when options omitted', () => {
    const modal = new ConfirmationModal({
      confirmAction: jest.fn(),
    }) as ConfirmationModal & { title: string; message: string };
    expect(modal.title).toBe('Confirmation');
    expect(modal.message).toBe('Are you sure?');
  });
});
