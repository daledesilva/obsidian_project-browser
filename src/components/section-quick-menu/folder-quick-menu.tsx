import './section-quick-menu.scss';
import * as React from "react";
import { LayoutGrid } from 'lucide-react';
import classNames from 'classnames';
import { Section } from 'src/logic/section-processes';
import { folderSettingsAtom } from 'src/logic/stores';
import { useAtom } from 'jotai';

//////////
//////////

let tooltipTimeout: NodeJS.Timeout | null = null;

interface FolderQuickMenuProps {
    section: Section
}

export const FolderQuickMenu = (props: FolderQuickMenuProps) => {
    const [folderSettings, setFolderSettings] = useAtom(folderSettingsAtom);
    const tooltipRef = React.useRef<HTMLDivElement>(null);
    const [tooltip, setTooltip] = React.useState<"viewMode" | null>(null);

    const curViewMode = folderSettings?.defaultView || 'Small';

    const cycleViewMode = () => {
        setTooltip("viewMode");
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
                {tooltip === "viewMode" && curViewMode}
            </div>
            
            <button
                className={classNames([
                    'ddc_pb_quick-menu-button',
                    'ddc_pb_view-button',
                ])}
                onClick={cycleViewMode}
                title={`View mode: ${curViewMode}`}
            >
                <LayoutGrid className="ddc_pb_icon" />
            </button>
        </div>
    </>
} 