import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import PreferencesPage from './page';
import * as settingsApi from '@/lib/settings';
import { Toaster } from "@/components/ui/toaster";

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
    toasts: [],
  }),
}));

// Mock the API functions from settings.ts
jest.mock('@/lib/settings', () => ({
  ...jest.requireActual('@/lib/settings'),
  getSettings: jest.fn(),
  setSettings: jest.fn(),
  validateDb: jest.fn(),
  backupDb: jest.fn(),
  chooseDbFile: jest.fn(),
  onSettingsUpdate: jest.fn(() => Promise.resolve(() => {})),
}));

const mockGetSettings = settingsApi.getSettings as jest.Mock;
const mockSetSettings = settingsApi.setSettings as jest.Mock;
const mockChooseDbFile = settingsApi.chooseDbFile as jest.Mock;

const mockInitialSettings = {
  version: 1,
  db_path: '/fake/initial.db',
  theme: 'system',
};

describe('PreferencesPage', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockGetSettings.mockResolvedValue(JSON.parse(JSON.stringify(mockInitialSettings)));
    mockSetSettings.mockResolvedValue(undefined);
    mockChooseDbFile.mockResolvedValue('/fake/new.db');

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
    window.confirm = jest.fn(() => true);
  });

  it('loads and displays the preferences page with initial values', async () => {
    render(<>
      <PreferencesPage />
      <Toaster />
    </>);

    await waitFor(() => {
      expect(screen.getByText('Database Settings')).toBeInTheDocument();
    });

    // Check that the apply button is disabled initially
    expect(screen.getByRole('button', { name: /Apply/i })).toBeDisabled();
  });

  it('enables apply button when settings are changed', async () => {
    const user = userEvent.setup();
    render(<>
      <PreferencesPage />
      <Toaster />
    </>);
    await waitFor(() => expect(mockGetSettings).toHaveBeenCalled());

    // Click choose file to change db_path
    await user.click(screen.getByRole('button', { name: /Choose.../i }));

    await waitFor(() => {
        expect(screen.getByRole('button', { name: /Apply/i })).not.toBeDisabled();
    });
  });

  it('calls setSettings when apply is clicked', async () => {
    const user = userEvent.setup();
    render(<>
      <PreferencesPage />
      <Toaster />
    </>);
    await waitFor(() => expect(mockGetSettings).toHaveBeenCalled());

    // Change settings
    await user.click(screen.getByRole('button', { name: /Choose.../i }));

    const applyButton = await screen.findByRole('button', { name: /Apply/i });
    await waitFor(() => expect(applyButton).not.toBeDisabled());

    await user.click(applyButton);

    await waitFor(() => {
      expect(mockSetSettings).toHaveBeenCalledWith(expect.objectContaining({
        db_path: '/fake/new.db'
      }));
    });
  });
});
