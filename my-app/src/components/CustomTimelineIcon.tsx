import React from 'react';

interface CustomTimelineIconProps {
    className?: string;
    color?: string;
    strokeWidth?: number | string;
}

export const CustomTimelineIcon: React.FC<CustomTimelineIconProps> = ({ 
    className = '', 
    color = 'currentColor',
    strokeWidth = 2
}) => {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width={24} 
            height={24} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke={color} 
            strokeWidth={strokeWidth} 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            {/* RectangleGraphic - Translated to match previous CSS transforms */}
            <g transform="translate(4, 0.5) scale(0.6666)">
                <rect width="20" height="12" x="2" y="6" rx="2" />
            </g>
            
            {/* RulerGraphic - Translated to match previous CSS transforms */}
            <g transform="translate(4, 6.4) scale(0.6666)">
                <path d="M10 15v-3" />
                <path d="M14 15v-3" />
                <path d="M18 15v-3" />
                <path d="M6 15v-3" />
                <rect x="2" y="12" width="20" height="8" rx="2" />
            </g>
        </svg>
    );
};
