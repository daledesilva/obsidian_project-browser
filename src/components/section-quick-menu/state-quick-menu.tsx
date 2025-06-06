import './section-quick-menu.scss';
import * as React from "react";
import { ArrowUpDown, LayoutGrid } from 'lucide-react';
import classNames from 'classnames';
import { Section } from 'src/logic/section-processes';
import { StateViewMode, StateViewOrder } from 'src/types/types-map';
import { stateSettingsByNameAtom } from 'src/logic/stores';
import { useAtom } from 'jotai';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'; // optional
import Tooltip from '../tooltip/tooltip';

//////////
//////////

let tooltipTimeout: NodeJS.Timeout | null = null;

interface StateQuickMenuProps {
    section: Section
}

export const StateQuickMenu = (props: StateQuickMenuProps) => {
    // Memoize the atom to prevent infinite re-renders
    const stateSettingsAtom = React.useMemo(() => 
        stateSettingsByNameAtom(props.section.title), 
        [props.section.title]
    );
    
    const [stateSettings, setStateSettings] = useAtom(stateSettingsAtom);
    const tooltipRef = React.useRef<HTMLDivElement>(null);

    const viewModes = Object.values(StateViewMode);
    const viewOrders = Object.values(StateViewOrder);

    const curViewMode = stateSettings?.defaultViewMode || StateViewMode.List;
    const curViewOrder = stateSettings?.defaultViewOrder || StateViewOrder.AliasOrFilename;
    
    const [tooltip, setTooltip] = React.useState<"viewOrder" | "viewMode" | null>(null);

    const cycleViewOrder = () => {
        const currentIndex = viewOrders.indexOf(curViewOrder);
        const nextIndex = (currentIndex + 1) % viewOrders.length;
        const newViewOrder = viewOrders[nextIndex];
        setStateSettings({defaultViewOrder: newViewOrder});
        setTooltip("viewOrder")
    };

    const cycleViewMode = () => {
        const currentIndex = viewModes.indexOf(curViewMode);
        const nextIndex = (currentIndex + 1) % viewModes.length;
        const newViewMode = viewModes[nextIndex];
        setStateSettings({defaultViewMode: newViewMode});
        setTooltip("viewMode")
    };

    React.useEffect( () => {
        if(tooltip) {
            if(tooltipTimeout) {
                clearTimeout(tooltipTimeout);
                tooltipTimeout = null;
            }
            tooltipTimeout = setTimeout( () => {
                setTooltip(null);
            }, 1000);
        }
    }, [tooltip]);

    return <>
        <div className="ddc_pb_section-quick-menu">
            <Tooltip content={curViewOrder}>
                <button
                    className={classNames([
                        'ddc_pb_quick-menu-button',
                        'ddc_pb_sort-button',
                    ])}
                    onClick={cycleViewOrder}
                >
                    <ArrowUpDown className="ddc_pb_icon" />
                </button>
            </Tooltip>
            
            <Tooltip content={curViewMode}>
                <button
                    className={classNames([
                        'ddc_pb_quick-menu-button',
                        'ddc_pb_view-button',
                    ])}
                    onClick={cycleViewMode}
                >
                    <LayoutGrid className="ddc_pb_icon" />
                </button>
            </Tooltip>
        </div>
    </>
} 