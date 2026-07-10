import {type ComponentChild, type JSX, h} from 'preact';

export interface RibbonButtonProps {
  size?: 'large' | 'small';
  active?: boolean;
  disabled?: boolean;
  onClick?: (e: MouseEvent) => void;
  title?: string;
  label: string;
  icon?: ComponentChild;
  style?: JSX.CSSProperties;
}

export function RibbonButton({
  size = 'large',
  active = false,
  disabled = false,
  onClick,
  title,
  label,
  icon,
  style,
}: RibbonButtonProps) {
  const sizeClass = size === 'large' ? 'ribbon-btn-large' : 'ribbon-btn-small';
  const activeClass = active ? 'active' : '';
  const iconClass =
    size === 'large' ? 'ribbon-btn-large-icon' : 'ribbon-btn-small-icon';
  const labelClass =
    size === 'large' ? 'ribbon-btn-large-label' : 'ribbon-btn-small-label';

  return (
    <button
      type="button"
      className={`${sizeClass} ${activeClass}`.trim()}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title || label}
      style={style}
    >
      {icon && <span className={iconClass}>{icon}</span>}
      <span className={labelClass}>{label}</span>
    </button>
  );
}
