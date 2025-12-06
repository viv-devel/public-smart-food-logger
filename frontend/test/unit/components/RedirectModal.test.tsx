import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RedirectModal from '@/components/RedirectModal';
import React from 'react';

describe('RedirectModal', () => {
  it('does not render when isOpen is false', () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    render(<RedirectModal isOpen={false} onClose={onClose} onConfirm={onConfirm} />);

    expect(screen.queryByText('食事の記録を登録する')).toBeNull();
  });

  it('renders correctly when isOpen is true', () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    render(<RedirectModal isOpen={true} onClose={onClose} onConfirm={onConfirm} />);

    expect(screen.getByText('食事の記録を登録する')).toBeDefined();
    expect(screen.getByText('次回以降もこの設定を記憶する')).toBeDefined();
    expect(screen.getByText('閉じる')).toBeDefined();
  });

  it('calls onConfirm with false when checkbox is not checked', () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    render(<RedirectModal isOpen={true} onClose={onClose} onConfirm={onConfirm} />);

    fireEvent.click(screen.getByText('食事の記録を登録する'));
    expect(onConfirm).toHaveBeenCalledWith(false);
  });

  it('calls onConfirm with true when checkbox is checked', () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    render(<RedirectModal isOpen={true} onClose={onClose} onConfirm={onConfirm} />);

    const checkbox = screen.getByLabelText('次回以降もこの設定を記憶する');
    fireEvent.click(checkbox);

    fireEvent.click(screen.getByText('食事の記録を登録する'));
    expect(onConfirm).toHaveBeenCalledWith(true);
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    render(<RedirectModal isOpen={true} onClose={onClose} onConfirm={onConfirm} />);

    fireEvent.click(screen.getByText('閉じる'));
    expect(onClose).toHaveBeenCalled();
  });
});
