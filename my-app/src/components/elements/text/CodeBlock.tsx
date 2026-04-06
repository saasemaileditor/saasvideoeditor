import React from 'react';
import { motion } from 'motion/react';
import type { BaseElementProps } from '../types';

export interface CodeBlockProps extends BaseElementProps {
  code?: string;
  language?: string;
  showLineNumbers?: boolean;
  backgroundColor?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code = `const greet = (name: string) => {\n  return \`Hello, \${name}!\`;\n};\n\nconsole.log(greet("World"));`,
  language = 'typescript',
  showLineNumbers = true,
  backgroundColor,
  isDark = false,
  className = '',
  style,
}) => {
  const bg = backgroundColor ?? (isDark ? '#0f172a' : '#1e293b');
  const lines = code.split('\n');
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className={className}
      style={{ borderRadius: 10, overflow: 'hidden', ...style }}
    >
      <div style={{ background: isDark ? '#1e293b' : '#334155', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
        {['#ef4444','#f59e0b','#22c55e'].map((c, i) => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
        ))}
        <span style={{ marginLeft: 8, fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' }}>{language}</span>
      </div>
      <pre style={{ background: bg, margin: 0, padding: '12px 16px', fontSize: 13, lineHeight: 1.7, overflowX: 'auto' }}>
        <code>
          {lines.map((line, i) => (
            <div key={i} style={{ display: 'flex', gap: 16 }}>
              {showLineNumbers && (
                <span style={{ color: '#475569', minWidth: 20, textAlign: 'right', userSelect: 'none', fontFamily: 'monospace' }}>{i + 1}</span>
              )}
              <span style={{ color: '#e2e8f0', fontFamily: 'monospace' }}>{line}</span>
            </div>
          ))}
        </code>
      </pre>
    </motion.div>
  );
};
