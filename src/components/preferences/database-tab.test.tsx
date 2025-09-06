import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DatabaseTab } from './database-tab';

describe('DatabaseTab', () => {
  const mockSettings = {
    version: 1,
    db_path: '/fake/test.db',
    theme: 'dark',
  };

  it('renders the database path', () => {
    render(
      <DatabaseTab
        draftSettings={mockSettings}
        onChooseDbFile={() => {}}
        onTestDb={() => {}}
      />
    );
    expect(screen.getByLabelText('Database Path')).toHaveValue(mockSettings.db_path);
  });

  it('calls onChooseDbFile when "Choose..." is clicked', () => {
    const handleChoose = jest.fn();
    render(
      <DatabaseTab
        draftSettings={mockSettings}
        onChooseDbFile={handleChoose}
        onTestDb={() => {}}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /Choose.../i }));
    expect(handleChoose).toHaveBeenCalledTimes(1);
  });

  it('calls onTestDb when "Test Connection" is clicked', () => {
    const handleTest = jest.fn();
    render(
      <DatabaseTab
        draftSettings={mockSettings}
        onChooseDbFile={() => {}}
        onTestDb={handleTest}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /Test Connection/i }));
    expect(handleTest).toHaveBeenCalledTimes(1);
  });
});
