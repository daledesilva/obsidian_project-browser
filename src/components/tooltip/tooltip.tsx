import * as React from 'react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

interface TooltipProps {
    content: React.ReactNode;
    children: React.ReactElement;
}

export const Tooltip: React.FC<TooltipProps> = ({ 
    content, 
    children
}: TooltipProps) => {
    return (
        <Tippy
            content={content}
            delay={[500, 250]}
            hideOnClick={false}
        >
            {children}
        </Tippy>
    );
};

export default Tooltip;