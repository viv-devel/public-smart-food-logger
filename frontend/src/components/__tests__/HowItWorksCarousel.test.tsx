import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HowItWorksCarousel from '../HowItWorksCarousel';

// Mock framer-motion components since they use animation logic that is hard to test in jsdom
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, onDragEnd, ...props }: any) => {
        // Mock drag handling if needed
        return (
            <div className={className} data-testid="motion-div" {...props}>
                {children}
            </div>
        );
    },
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock Next.js Image
vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} alt={props.alt} />,
}));

describe('HowItWorksCarousel', () => {
  it('renders the initial step correctly', () => {
    render(<HowItWorksCarousel />);

    // Check Title
    expect(screen.getByText('食事の写真を送る')).toBeDefined();
    // Check Description
    expect(screen.getByText(/専用のカスタムGeminiに食事の写真を送ると/)).toBeDefined();
    // Check Image
    const img = screen.getByAltText('食事の写真を送る');
    expect(img).toBeDefined();
    expect(img.getAttribute('src')).toBe('/images/1-photo-analysis.webp');
  });

  it('renders pagination indicators', () => {
    render(<HowItWorksCarousel />);
    // Should have 3 buttons
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
  });

  it('changes step when pagination button is clicked', () => {
    render(<HowItWorksCarousel />);

    const buttons = screen.getAllByRole('button');
    // Click 2nd button (index 1)
    fireEvent.click(buttons[1]);

    // Should now show 2nd step
    expect(screen.getByText('JSONをコピー')).toBeDefined();
    expect(screen.getByText(/Geminiが出力した栄養情報/)).toBeDefined();
    const img = screen.getByAltText('JSONをコピー');
    expect(img.getAttribute('src')).toBe('/images/2-json-copy.webp');
  });

    it('cycles through steps', () => {
    render(<HowItWorksCarousel />);

    const buttons = screen.getAllByRole('button');

    // Step 1 -> Step 3
    fireEvent.click(buttons[2]);
    expect(screen.getByText('貼り付けて記録')).toBeDefined();

    // Step 3 -> Step 1
    fireEvent.click(buttons[0]);
    expect(screen.getByText('食事の写真を送る')).toBeDefined();
  });
});
