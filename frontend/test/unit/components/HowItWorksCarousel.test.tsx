import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HowItWorksCarousel from '@/components/HowItWorksCarousel';

// Mock framer-motion components since they use animation logic that is hard to test in jsdom
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, onDragEnd, drag, dragConstraints, dragElastic, ...props }: any) => {
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
  default: ({ fill, ...props }: any) => <img {...props} alt={props.alt} />,
}));

describe('HowItWorksCarousel', () => {
  it('renders the initial step correctly', () => {
    render(<HowItWorksCarousel />);

    // Check Title
    expect(screen.getByText('AIに食事を伝える')).toBeDefined();
    // Check Description - Match full text content to ensure readability and structure
    const descElement = screen.getByText(/写真を渡すだけでなく/).closest('p');
    expect(descElement?.textContent).toBe('写真を渡すだけでなく、「今日のお昼はペペロンチーノとサラダ」のように文章で伝えてもAIが栄養素を推定します。');

    // Check Image
    const img = screen.getByAltText('AIに食事を伝える');
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
    expect(screen.getByText('JSONを貼り付けて記録')).toBeDefined();

    const descElement = screen.getByText(/カスタムGeminiが生成した栄養情報/).closest('p');
    expect(descElement?.textContent).toBe('カスタムGeminiが生成した栄養情報（JSON）をフォームに貼り付け、ボタンを押すだけ。手間なく正確な記録が可能です。');

    const img = screen.getByAltText('JSONを貼り付けて記録');
    expect(img.getAttribute('src')).toBe('/images/2-json-copy.webp');
  });

  it('cycles through steps', () => {
    render(<HowItWorksCarousel />);

    const buttons = screen.getAllByRole('button');

    // Step 1 -> Step 3
    fireEvent.click(buttons[2]);
    expect(screen.getByText('Fitbitで栄養をチェック')).toBeDefined();

    const descElement = screen.getByText(/記録された食事はFitbitアプリで/).closest('p');
    expect(descElement?.textContent).toBe('記録された食事はFitbitアプリで消費カロリーと比較して確認できます。Fitbit WatchやPixel Watchユーザーに最適です。');

    // Step 3 -> Step 1
    fireEvent.click(buttons[0]);
    expect(screen.getByText('AIに食事を伝える')).toBeDefined();
  });
});
