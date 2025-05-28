import './section-quick-menu.scss';
import * as React from "react";
import { ArrowUpDown, LayoutGrid } from 'lucide-react';
import classNames from 'classnames';

//////////
//////////

interface SectionQuickMenuProps {}

export const SectionQuickMenu = (props: SectionQuickMenuProps) => {
    const [sortOrder, setSortOrder] = React.useState<'ascending' | 'descending'>('ascending');
    const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');

    const handleSortToggle = () => {
        setSortOrder(prev => prev === 'ascending' ? 'descending' : 'ascending');
    };

    const handleViewModeToggle = () => {
        setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
    };

    return <>
        <div className="ddc_pb_section-quick-menu">
            <button
                className={classNames([
                    'ddc_pb_quick-menu-button',
                    'ddc_pb_sort-button',
                    sortOrder === 'descending' && 'ddc_pb_sort-descending'
                ])}
                onClick={handleSortToggle}
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
                onClick={handleViewModeToggle}
                title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
            >
                <LayoutGrid className="ddc_pb_icon" />
            </button>
        </div>
    </>
} 