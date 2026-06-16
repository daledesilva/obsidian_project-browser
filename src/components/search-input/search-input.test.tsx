import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchInput } from './search-input';

describe('SearchInput', () => {
  const defaultProps = {
    searchActive: true,
    onChange: jest.fn(),
    showSearchInput: jest.fn(),
    hideSearchInput: jest.fn(),
  };

  beforeEach(() => {
    defaultProps.onChange.mockClear();
    defaultProps.hideSearchInput.mockClear();
    defaultProps.showSearchInput.mockClear();
  });

  test('container is visible when searchActive is true', () => {
    render(<SearchInput {...defaultProps} searchActive={true} />);
    const container = document.querySelector('.ddc_pb_search-input-container');
    expect(container).toBeInTheDocument();
    expect(container).toHaveStyle({ display: 'flex' });
  });

  test('container is hidden when searchActive is false', () => {
    render(<SearchInput {...defaultProps} searchActive={false} />);
    const container = document.querySelector('.ddc_pb_search-input-container');
    expect(container).toHaveStyle({ display: 'none' });
  });

  test('onChange is called when typing in input', () => {
    render(<SearchInput {...defaultProps} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'hello' } });
    expect(defaultProps.onChange).toHaveBeenCalledWith('hello');
  });

  test('clear button calls hideSearchInput and clears input', () => {
    render(<SearchInput {...defaultProps} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });
    expect(defaultProps.onChange).toHaveBeenCalledWith('test');
    const clearBtn = screen.getByRole('button', { name: '' });
    fireEvent.click(clearBtn);
    expect(defaultProps.onChange).toHaveBeenCalledWith('');
    expect(defaultProps.hideSearchInput).toHaveBeenCalled();
  });
});
