import {h, render} from 'preact';
import {act} from 'preact/test-utils';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {RibbonButton} from './ribbon-button';

describe('RibbonButton Component', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(async () => {
    await act(() => {
      render(null, container);
    });
    container.remove();
  });

  it('renders default large button with label', async () => {
    await act(() => {
      render(<RibbonButton label="My Button" />, container);
    });

    const btn = container.querySelector('button');
    expect(btn).toBeTruthy();
    expect(btn?.className).toBe('ribbon-btn-large');
    expect(btn?.textContent).toBe('My Button');
    expect(container.querySelector('.ribbon-btn-large-label')).toBeTruthy();
    expect(container.querySelector('.ribbon-btn-large-icon')).toBeNull();
  });

  it('renders small button when size prop is small', async () => {
    await act(() => {
      render(<RibbonButton size="small" label="My Button" />, container);
    });

    const btn = container.querySelector('button');
    expect(btn?.className).toBe('ribbon-btn-small');
    expect(container.querySelector('.ribbon-btn-small-label')).toBeTruthy();
  });

  it('applies active class when active is true', async () => {
    await act(() => {
      render(<RibbonButton active={true} label="Active Button" />, container);
    });

    const btn = container.querySelector('button');
    expect(btn?.className).toContain('active');
  });

  it('sets disabled attribute and does not fire onClick when disabled is true', async () => {
    const handleClick = vi.fn();
    await act(() => {
      render(
        <RibbonButton
          disabled={true}
          onClick={handleClick}
          label="Disabled Button"
        />,
        container,
      );
    });

    const btn = container.querySelector('button') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);

    await act(() => {
      btn.click();
    });
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders icon child when icon prop is provided', async () => {
    const testIcon = <span data-testid="custom-icon">★</span>;
    await act(() => {
      render(<RibbonButton label="Starred" icon={testIcon} />, container);
    });

    const iconSpan = container.querySelector('.ribbon-btn-large-icon');
    expect(iconSpan).toBeTruthy();
    expect(iconSpan?.querySelector('[data-testid="custom-icon"]')).toBeTruthy();
  });

  it('fires onClick callback when clicked', async () => {
    const handleClick = vi.fn();
    await act(() => {
      render(
        <RibbonButton onClick={handleClick} label="Clickable" />,
        container,
      );
    });

    const btn = container.querySelector('button') as HTMLButtonElement;
    await act(() => {
      btn.click();
    });
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
