import './section-quick-menu.scss';
import * as React from "react";
import { ArrowUpDown, LayoutGrid, Ungroup } from 'lucide-react';
import classNames from 'classnames';
import { Section } from 'src/logic/section-processes';
import { StateSettings, StateViewMode, StateViewOrder } from 'src/types/types-map';
import { projectPageStatelessSettingsAtom, statelessSettingsAtom } from 'src/logic/stores';
import { useAtom } from 'jotai';
import Tooltip from '../tooltip/tooltip';

//////////
//////////

let tooltipTimeout: NodeJS.Timeout | null = null;

interface StatelessQuickMenuProps {
    section: Section
}

export const StatelessQuickMenu = (props: StatelessQuickMenuProps) => {
    const scopedStatelessSettingsAtom = React.useMemo(
        () => props.section.stateScope === 'projectPage'
            ? projectPageStatelessSettingsAtom
            : statelessSettingsAtom,
        [props.section.stateScope]
    );
    const [statelessSettings, setStatelessSettings] = useAtom(scopedStatelessSettingsAtom);
    const tooltipRef = React.useRef<HTMLDivElement>(null);

    const viewModes = Object.values(StateViewMode);
    const viewOrders = Object.values(StateViewOrder);

    const curViewMode = statelessSettings?.defaultViewMode || StateViewMode.List;
    const curViewOrder = statelessSettings?.defaultViewOrder || StateViewOrder.AliasOrFilename;
    const curPriorityAppearance = getPriorityAppearance(statelessSettings);

    const cycleViewOrder = () => {
        const currentIndex = viewOrders.indexOf(curViewOrder);
        const nextIndex = (currentIndex + 1) % viewOrders.length;
        const newViewOrder = viewOrders[nextIndex];
        setStatelessSettings({...statelessSettings, defaultViewOrder: newViewOrder});
    };

    const cycleViewMode = () => {
        const currentIndex = viewModes.indexOf(curViewMode);
        const nextIndex = (currentIndex + 1) % viewModes.length;
        const newViewMode = viewModes[nextIndex];
        setStatelessSettings({...statelessSettings, defaultViewMode: newViewMode});
    };

    const cyclePriorityAppearance = () => {
        if(!statelessSettings) return;
        
        if(!statelessSettings.defaultViewPriorityVisibility) {
            setStatelessSettings({
                defaultViewPriorityVisibility: true,
                defaultViewPriorityGrouping: false
            });
        } else if(statelessSettings.defaultViewPriorityVisibility && !statelessSettings.defaultViewPriorityGrouping) {
            setStatelessSettings({
                defaultViewPriorityGrouping: true
            });
        } else {
            setStatelessSettings({
                defaultViewPriorityVisibility: false,
                defaultViewPriorityGrouping: false,
            });
        }
    };

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
                    <ArrowUpDown className="ddc_pb_icon" size={16} />
                </button>
            </Tooltip>
            
            <Tooltip content={curPriorityAppearance}>
                <button
                    className={classNames([
                        'ddc_pb_quick-menu-button',
                        'ddc_pb_sort-button',
                    ])}
                    onClick={cyclePriorityAppearance}
                >
                    <Ungroup className="ddc_pb_icon" size={16} />
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
                    <LayoutGrid className="ddc_pb_icon" size={16} />
                </button>
            </Tooltip>
        </div>
    </>
}

////////////////////
////////////////////

function getPriorityAppearance(stateSettings: StateSettings) {
    if(!stateSettings?.defaultViewPriorityVisibility) {
        return "Hide Priorities";
    } else if(stateSettings?.defaultViewPriorityVisibility && !stateSettings?.defaultViewPriorityGrouping) {
        return "Show Priorities";
    } else {
        return "Group Priorities";
    }
}