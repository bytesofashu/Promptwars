import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Login } from './components/Login';
import '@testing-library/jest-dom';

describe('Login Component', () => {
  it('renders the app name and description', () => {
    render(<Login onLogin={() => {}} />);
    expect(screen.getByText('iamalive')).toBeInTheDocument();
    expect(screen.getByText(/A vital connection for isolated patients/i)).toBeInTheDocument();
  });

  it('calls onLogin when the button is clicked', () => {
    const onLogin = vi.fn();
    render(<Login onLogin={onLogin} />);
    const button = screen.getByRole('button', { name: /Sign in with Google/i });
    fireEvent.click(button);
    expect(onLogin).toHaveBeenCalledTimes(1);
  });
});
