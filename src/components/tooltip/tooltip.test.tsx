import React from 'react';
import { render, screen } from '@testing-library/react';
import { Tooltip } from './tooltip';

jest.mock('@tippyjs/react', () => {
  return function MockTippy({
    content,
    children,
  }: {
    content: React.ReactNode;
    children: React.ReactElement;
  }) {
    return (
      <span data-testid="tippy-wrapper">
        <span data-testid="tippy-content">{content}</span>
        {children}
      </span>
    );
  };
});

describe('Tooltip', () => {
  test('renders children', () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover target</button>
      </Tooltip>
    );
    expect(screen.getByRole('button', { name: 'Hover target' })).toBeInTheDocument();
  });

  test('passes content to Tippy', () => {
    render(
      <Tooltip content="Tooltip text">
        <span>Child</span>
      </Tooltip>
    );
    expect(screen.getByTestId('tippy-content')).toHaveTextContent('Tooltip text');
  });
});
