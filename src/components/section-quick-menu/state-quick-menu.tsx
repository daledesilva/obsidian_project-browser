import './section-quick-menu.scss';
import * as React from "react";
import { ArrowUpDown, LayoutGrid, Ungroup } from 'lucide-react';
import classNames from 'classnames';
import { Section } from 'src/logic/section-processes';
import { StateSettings, StateViewMode, StateViewOrder } from 'src/types/types-map';
import { projectPageStateSettingsByNameAtom, stateSettingsByNameAtom } from 'src/logic/stores';
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
        props.section.stateScope === 'projectPage'
            ? projectPageStateSettingsByNameAtom(props.section.title)
            : stateSettingsByNameAtom(props.section.title), 
        [props.section.stateScope, props.section.title]
    );
    
    const [stateSettings, setStateSettings] = useAtom(stateSettingsAtom);

    const viewModes = Object.values(StateViewMode);
    const viewOrders = Object.values(StateViewOrder);

    const curViewMode = stateSettings?.defaultViewMode || StateViewMode.List;
    const curViewOrder = stateSettings?.defaultViewOrder || StateViewOrder.AliasOrFilename;
    const curPriorityAppearance = getPriorityAppearance(stateSettings);
    
    const cycleViewOrder = () => {
        const currentIndex = viewOrders.indexOf(curViewOrder);
        const nextIndex = (currentIndex + 1) % viewOrders.length;
        const newViewOrder = viewOrders[nextIndex];
        setStateSettings({defaultViewOrder: newViewOrder});
    };

    const cycleViewMode = () => {
        const currentIndex = viewModes.indexOf(curViewMode);
        const nextIndex = (currentIndex + 1) % viewModes.length;
        const newViewMode = viewModes[nextIndex];
        setStateSettings({defaultViewMode: newViewMode});
    };

    const cyclePriorityAppearance = () => {
        if(!stateSettings) return;
        
        if(!stateSettings.defaultViewPriorityVisibility) {
            setStateSettings({
                defaultViewPriorityVisibility: true,
                defaultViewPriorityGrouping: false
            });
        } else if(stateSettings.defaultViewPriorityVisibility && !stateSettings.defaultViewPriorityGrouping) {
            setStateSettings({
                defaultViewPriorityGrouping: true
            });
        } else {
            setStateSettings({
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