import React from 'react';
import type { BaseElementProps } from '../types';

// ── Search Bar ──────────────────────────────────────────
export interface SearchBarInputProps extends BaseElementProps {
  placeholder?: string;
  accentColor?: string;
  borderRadius?: number;
}

export const SearchBarInput: React.FC<SearchBarInputProps> = ({
  placeholder = 'Search...',

  borderRadius = 10,
  isDark = false,
  className = '',
  style,
}) => {
  const bg = isDark ? '#1e2235' : '#f9fafb';
  const border = isDark ? '#2a2d45' : '#e5e7eb';
  const textColor = isDark ? '#94a3b8' : '#6b7280';
  return (
    <div className={className} style={{ position: 'relative', ...style }}>
      <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: textColor }}>🔍</span>
      <input readOnly placeholder={placeholder} style={{ width: '100%', boxSizing: 'border-box', paddingLeft: 38, paddingRight: 12, paddingTop: 10, paddingBottom: 10, background: bg, border: `1px solid ${border}`, borderRadius, fontSize: 14, color: textColor, outline: 'none', cursor: 'default' }} />
    </div>
  );
};

// ── Text Input ──────────────────────────────────────────
export interface TextInputProps extends BaseElementProps {
  placeholder?: string;
  label?: string;
  borderRadius?: number;
}

export const TextInput: React.FC<TextInputProps> = ({
  placeholder = 'Enter value...',
  label = 'Email',
  borderRadius = 8,
  isDark = false,
  className = '',
  style,
}) => {
  const bg = isDark ? '#1e2235' : '#f9fafb';
  const border = isDark ? '#2a2d45' : '#e5e7eb';
  const labelColor = isDark ? '#94a3b8' : '#374151';
  const textColor = isDark ? '#94a3b8' : '#6b7280';
  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
      {label && <label style={{ fontSize: 13, fontWeight: 500, color: labelColor }}>{label}</label>}
      <input readOnly placeholder={placeholder} style={{ background: bg, border: `1px solid ${border}`, borderRadius, fontSize: 14, color: textColor, padding: '9px 12px', outline: 'none', cursor: 'default' }} />
    </div>
  );
};

// ── Textarea ──────────────────────────────────────────
export interface TextareaProps extends BaseElementProps {
  placeholder?: string;
  label?: string;
  rows?: number;
  borderRadius?: number;
}

export const Textarea: React.FC<TextareaProps> = ({
  placeholder = 'Write your message...',
  label = 'Message',
  rows = 4,
  borderRadius = 8,
  isDark = false,
  className = '',
  style,
}) => {
  const bg = isDark ? '#1e2235' : '#f9fafb';
  const border = isDark ? '#2a2d45' : '#e5e7eb';
  const labelColor = isDark ? '#94a3b8' : '#374151';
  const textColor = isDark ? '#94a3b8' : '#6b7280';
  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
      {label && <label style={{ fontSize: 13, fontWeight: 500, color: labelColor }}>{label}</label>}
      <textarea readOnly placeholder={placeholder} rows={rows} style={{ background: bg, border: `1px solid ${border}`, borderRadius, fontSize: 14, color: textColor, padding: '9px 12px', outline: 'none', resize: 'none', cursor: 'default', fontFamily: 'inherit' }} />
    </div>
  );
};

// ── Dropdown ──────────────────────────────────────────
export interface DropdownProps extends BaseElementProps {
  label?: string;
  options?: string[];
  placeholder?: string;
  borderRadius?: number;
}

export const Dropdown: React.FC<DropdownProps> = ({
  label = 'Category',
  options = ['Option 1', 'Option 2', 'Option 3'],
  placeholder = 'Select an option',
  borderRadius = 8,
  isDark = false,
  className = '',
  style,
}) => {
  const bg = isDark ? '#1e2235' : '#f9fafb';
  const border = isDark ? '#2a2d45' : '#e5e7eb';
  const labelColor = isDark ? '#94a3b8' : '#374151';
  const textColor = isDark ? '#94a3b8' : '#6b7280';
  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
      {label && <label style={{ fontSize: 13, fontWeight: 500, color: labelColor }}>{label}</label>}
      <div style={{ position: 'relative' }}>
        <select disabled style={{ width: '100%', background: bg, border: `1px solid ${border}`, borderRadius, fontSize: 14, color: textColor, padding: '9px 12px', paddingRight: 32, outline: 'none', appearance: 'none', cursor: 'default' }}>
          <option>{placeholder}</option>
          {options.map(o => <option key={o}>{o}</option>)}
        </select>
        <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: textColor, pointerEvents: 'none' }}>▾</span>
      </div>
    </div>
  );
};

// ── Checkbox ──────────────────────────────────────────
export interface CheckboxProps extends BaseElementProps {
  label?: string;
  checked?: boolean;
  accentColor?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label = 'I agree to the terms',
  checked = true,
  accentColor = '#7c3aed',
  isDark = false,
  className = '',
  style,
}) => {
  const textColor = isDark ? '#cbd5e1' : '#374151';
  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center', gap: 10, ...style }}>
      <div style={{ width: 18, height: 18, borderRadius: 5, background: checked ? accentColor : 'transparent', border: `2px solid ${checked ? accentColor : (isDark ? '#4b5563' : '#d1d5db')}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {checked && <span style={{ fontSize: 11, color: '#fff', fontWeight: 700 }}>✓</span>}
      </div>
      <span style={{ fontSize: 14, color: textColor }}>{label}</span>
    </div>
  );
};

// ── Radio ──────────────────────────────────────────
export interface RadioProps extends BaseElementProps {
  label?: string;
  checked?: boolean;
  accentColor?: string;
}

export const Radio: React.FC<RadioProps> = ({
  label = 'Select option',
  checked = true,
  accentColor = '#7c3aed',
  isDark = false,
  className = '',
  style,
}) => {
  const textColor = isDark ? '#cbd5e1' : '#374151';
  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center', gap: 10, ...style }}>
      <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${checked ? accentColor : (isDark ? '#4b5563' : '#d1d5db')}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {checked && <div style={{ width: 8, height: 8, borderRadius: '50%', background: accentColor }} />}
      </div>
      <span style={{ fontSize: 14, color: textColor }}>{label}</span>
    </div>
  );
};

// ── Toggle ──────────────────────────────────────────
export interface ToggleProps extends BaseElementProps {
  label?: string;
  checked?: boolean;
  accentColor?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  label = 'Enable feature',
  checked = true,
  accentColor = '#7c3aed',
  isDark = false,
  className = '',
  style,
}) => {
  const textColor = isDark ? '#cbd5e1' : '#374151';
  const trackBg = checked ? accentColor : (isDark ? '#374151' : '#e5e7eb');
  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center', gap: 10, ...style }}>
      <div style={{ width: 44, height: 24, borderRadius: 12, background: trackBg, position: 'relative', flexShrink: 0, transition: 'background 0.2s' }}>
        <div style={{ position: 'absolute', top: 2, left: checked ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'left 0.2s' }} />
      </div>
      {label && <span style={{ fontSize: 14, color: textColor }}>{label}</span>}
    </div>
  );
};

// ── Slider ──────────────────────────────────────────
export interface SliderProps extends BaseElementProps {
  label?: string;
  value?: number;
  min?: number;
  max?: number;
  accentColor?: string;
}

export const Slider: React.FC<SliderProps> = ({
  label = 'Volume',
  value = 60,
  min = 0,
  max = 100,
  accentColor = '#7c3aed',
  isDark = false,
  className = '',
  style,
}) => {
  const pct = ((value - min) / (max - min)) * 100;
  const trackColor = isDark ? '#2a2d45' : '#e5e7eb';
  const labelColor = isDark ? '#94a3b8' : '#374151';
  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: 8, ...style }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {label && <span style={{ fontSize: 13, fontWeight: 500, color: labelColor }}>{label}</span>}
        <span style={{ fontSize: 13, fontWeight: 600, color: accentColor }}>{value}%</span>
      </div>
      <div style={{ position: 'relative', height: 6, borderRadius: 3, background: trackColor }}>
        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${pct}%`, background: accentColor, borderRadius: 3 }} />
        <div style={{ position: 'absolute', top: '50%', left: `${pct}%`, transform: 'translate(-50%, -50%)', width: 16, height: 16, borderRadius: '50%', background: accentColor, boxShadow: `0 0 0 3px ${accentColor}33`, }} />
      </div>
    </div>
  );
};
