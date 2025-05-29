import './section-quick-menu.scss';
import * as React from "react";
import { LayoutGrid } from 'lucide-react';
import classNames from 'classnames';
import { Section } from 'src/logic/section-processes';

//////////
//////////

let tooltipTimeout: NodeJS.Timeout | null = null;

interface FolderQuickMenuProps {
    section: Section
}

export const FolderQuickMenu = (props: FolderQuickMenuProps) => {
    const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
    const tooltipRef = React.useRef<HTMLDivElement>(null);
    const [tooltip, setTooltip] = React.useState<"viewMode" | null>(null);

    const cycleViewMode = () => {
        setTooltip("viewMode")
    };

    React.useEffect( () => {
        if(tooltip) {
            tooltipRef.current!.style.display = 'block';
            if(tooltipTimeout) {
                clearTimeout(tooltipTimeout);
                tooltipTimeout = null;
            }
            tooltipTimeout = setTimeout( () => {
                tooltipRef.current!.style.display = 'none';
                setTooltip(null);
            }, 1000);
        }
    }, [tooltip]);

    return <>
        <div className="ddc_pb_section-quick-menu">
            <div
                className="ddc_pb_tooltip"
                ref={tooltipRef}
            >
                {tooltip === "viewMode" && "Small"}
            </div>
            
            <button
                className={classNames([
                    'ddc_pb_quick-menu-button',
                    'ddc_pb_view-button',
                    viewMode === 'list' && 'ddc_pb_view-list'
                ])}
                onClick={cycleViewMode}
                title={`View mode: Small`}
            >
                <LayoutGrid className="ddc_pb_icon" />
            </button>
        </div>
    </>
} 