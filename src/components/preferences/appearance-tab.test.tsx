import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AppearanceTab } from './appearance-tab';

describe('AppearanceTab', () => {
  beforeAll(() => {
    window.HTMLElement.prototype.scrollIntoView = jest.fn()
  });

  const mockSettings = {
    version: 1,
    db_path: '/fake/test.db',
    theme: 'system',
  };

  it('renders the current theme', async () => {
    render(
      <AppearanceTab
        draftSettings={mockSettings}
        onThemeChange={() => {}}
      />
    );
    expect(screen.getByRole('combobox')).toHaveTextContent('System');
  });

  it('calls onThemeChange when a new theme is selected', async () => {
    const handleChange = jest.fn();
    render(
      <AppearanceTab
        draftSettings={mockSettings}
        onThemeChange={handleChange}
      />
    );
    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(await screen.findByText('Dark'));
    expect(handleChange).toHaveBeenCalledWith('dark');
  });
});
