import './fab-menu-action-button.scss';
import * as React from 'react';
import { Plus } from 'lucide-react';
import classNames from 'classnames';

const MENU_ACTION_ICON_SIZE_PX = 11;

export interface FabMenuActionButtonProps {
    variant: 'primary' | 'secondary';
    /** Matches the smaller “Add page” chip in the page menu FAB. */
    density?: 'compact' | 'default';
    label: string;
    title?: string;
    onClick: () => void;
    disabled?: boolean;
}

export function FabMenuActionButton(props: FabMenuActionButtonProps) {
    const { variant, density = 'default', label, title, onClick, disabled } = props;

    return (
        <button
            type="button"
            className={classNames(
                'ddc_pb_fab-menu-action-button',
                `ddc_pb_fab-menu-action-button--${variant}`,
                density === 'compact' && 'ddc_pb_fab-menu-action-button--compact'
            )}
            onClick={onClick}
            title={title ?? label}
            disabled={disabled}
        >
            <Plus size={MENU_ACTION_ICON_SIZE_PX} aria-hidden />
            <span className="ddc_pb_fab-menu-action-button__label">{label}</span>
        </button>
    );
}

export interface FabMenuActionButtonStackProps {
    children: React.ReactNode;
    /** Extra space before the next FAB control (e.g. card browser main + button). */
    padBottom?: boolean;
}

export function FabMenuActionButtonStack(props: FabMenuActionButtonStackProps) {
    return (
        <div
            className={classNames(
                'ddc_pb_fab-menu-action-button-stack',
                props.padBottom && 'ddc_pb_fab-menu-action-button-stack--pad-bottom'
            )}
        >
            {props.children}
        </div>
    );
}
