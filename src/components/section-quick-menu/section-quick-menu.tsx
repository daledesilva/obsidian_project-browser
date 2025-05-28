import './section-quick-menu.scss';
import * as React from "react";
import { ArrowUpDown, LayoutGrid } from 'lucide-react';
import classNames from 'classnames';
import { Section } from 'src/logic/section-processes';
import { getGlobals } from 'src/logic/stores';
import { StateViewMode, StateViewOrder } from 'src/types/types-map';

//////////
//////////

let tooltipTimeout: NodeJS.Timeout | null = null;

interface SectionQuickMenuProps {
    section: Section
}

export const SectionQuickMenu = (props: SectionQuickMenuProps) => {
    const {plugin} = getGlobals();
    const [sortOrder, setSortOrder] = React.useState<'ascending' | 'descending'>('ascending');
    const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
    const tooltipRef = React.useRef<HTMLDivElement>(null);

    const viewModes = Object.values(StateViewMode);
    const viewOrders = Object.values(StateViewOrder);

    const [curViewMode, setCurViewMode] = React.useState(props.section.settings.defaultViewMode);
    const [curViewOrder, setCurViewOrder] = React.useState(props.section.settings.defaultViewOrder);
    const [tooltip, setTooltip] = React.useState<"viewOrder" | "viewMode" | null>(null);

    const cycleViewOrder = () => {
        const currentIndex = viewOrders.indexOf(curViewOrder);
        const nextIndex = (currentIndex + 1) % viewOrders.length;
        setCurViewOrder(viewOrders[nextIndex]);
        setTooltip("viewOrder")
    };

    const cycleViewMode = () => {
        const currentIndex = viewModes.indexOf(curViewMode);
        const nextIndex = (currentIndex + 1) % viewModes.length;
        setCurViewMode(viewModes[nextIndex]);
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
                {tooltip === "viewOrder" && curViewOrder}
                {tooltip === "viewMode" && curViewMode}
            </div>
            <button
                className={classNames([
                    'ddc_pb_quick-menu-button',
                    'ddc_pb_sort-button',
                    sortOrder === 'descending' && 'ddc_pb_sort-descending'
                ])}
                onClick={cycleViewOrder}
                title={`Sort ${sortOrder === 'ascending' ? 'descending' : 'ascending'}`}
            >
                <ArrowUpDown className="ddc_pb_icon" />
            </button>
            
            <button
                className={classNames([
                    'ddc_pb_quick-menu-button',
                    'ddc_pb_view-button',
                    viewMode === 'list' && 'ddc_pb_view-list'
                ])}
                onClick={cycleViewMode}
                title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
            >
                <LayoutGrid className="ddc_pb_icon" />
            </button>
        </div>
    </>
} 