import './state-menu.scss';
import * as React from "react";
import classnames from 'classnames';
import { createPortal } from 'react-dom';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { useAtomValue } from 'jotai';
import { getStateMenuSurfaceVisibility, stateMenuAtom, StateMenuSurface } from 'src/logic/stores';
import { StateSettings } from 'src/types/types-map';
import { sanitizeInternalLinkName } from 'src/utils/string-processes';

interface StateMenuShellProps {
    currentStateSettings: StateSettings | null;
    visibleStates: StateSettings[];
    hiddenStates: StateSettings[];
    visibilitySurface: StateMenuSurface;
    closedButtonPortalContainer?: HTMLElement | null;
    onSetState: (stateSettings: StateSettings | null) => Promise<boolean>;
}

const VIEWPORT_EDGE_GUTTER_PX = 12;

/** Cap the picker at the visible viewport (minus gutter), not a fixed fraction of width. */
function getViewportMaxWidthPx(): number {
    const viewportWidth =
        activeWindow.innerWidth || activeDocument.documentElement.clientWidth || 320;
    return Math.max(160, viewportWidth - VIEWPORT_EDGE_GUTTER_PX * 2);
}

export const StateMenuShell = (props: StateMenuShellProps) => {
    const stateMenuSettings = useAtomValue(stateMenuAtom);
    const stateMenuIsVisible = getStateMenuSurfaceVisibility(stateMenuSettings, props.visibilitySurface);
    const [menuIsActive, setMenuIsActive] = React.useState(false);
    const [tippyMaxWidthPx, setTippyMaxWidthPx] = React.useState(() => getViewportMaxWidthPx());
    const showHighlightRef = React.useRef<boolean>(false);

    React.useEffect(() => {
        if (!stateMenuIsVisible) {
            setMenuIsActive(false);
        }
    }, [stateMenuIsVisible]);

    React.useEffect(() => {
        showHighlightRef.current = false;
    });

    React.useEffect(() => {
        if (!menuIsActive) return;
        setTippyMaxWidthPx(getViewportMaxWidthPx());
    }, [menuIsActive]);

    const displayState = props.currentStateSettings?.name || 'Set State';

    // Choices open as a Tippy under the closed control (header or inline) instead of an
    // in-flow strip, so notes/pages/projects share the same click-anchored picker.
    const tippyContent = (
        <div
            className="ddc_pb_state-menu-tippy-content"
            style={{ maxWidth: tippyMaxWidthPx }}
        >
            <div className="ddc_pb_visible-state-btns">
                {props.visibleStates.map((visibleStateSettings) => (
                    <button
                        key={visibleStateSettings.name}
                        type="button"
                        className={classnames([
                            'ddc_pb_state-btn',
                            'ddc_pb_visible-state',
                            visibleStateSettings.name === props.currentStateSettings?.name && 'is-set',
                        ])}
                        onClick={() => void setStateAndCloseMenu(visibleStateSettings)}
                    >
                        {sanitizeInternalLinkName(visibleStateSettings.name)}
                    </button>
                ))}
            </div>
            <div className="ddc_pb_hidden-state-btns">
                {props.hiddenStates.map((hiddenStateSettings) => (
                    <button
                        key={hiddenStateSettings.name}
                        type="button"
                        className={classnames([
                            'ddc_pb_state-btn',
                            'ddc_pb_hidden-state',
                            hiddenStateSettings.name === props.currentStateSettings?.name && 'is-set',
                        ])}
                        onClick={() => void setStateAndCloseMenu(hiddenStateSettings)}
                    >
                        {sanitizeInternalLinkName(hiddenStateSettings.name)}
                    </button>
                ))}
            </div>
        </div>
    );

    const closedMenuButton = stateMenuIsVisible ? (
        <Tippy
            content={tippyContent}
            visible={menuIsActive}
            onClickOutside={() => setMenuIsActive(false)}
            interactive={true}
            placement="bottom"
            maxWidth={tippyMaxWidthPx}
            theme="ddc_pb_state-menu"
            appendTo={() => activeDocument.body}
            // Off-center header buttons: shift the panel to stay in the viewport rather than clipping.
            popperOptions={{
                modifiers: [
                    {
                        name: 'preventOverflow',
                        options: {
                            padding: VIEWPORT_EDGE_GUTTER_PX,
                            boundary: 'viewport',
                        },
                    },
                ],
            }}
        >
            <button
                type="button"
                className={classnames([
                    'ddc_pb_state-btn',
                    'ddc_pb_in-closed-menu',
                    showHighlightRef.current && 'ddc_pb_has-return-transition',
                ])}
                onClick={() => setMenuIsActive((isActive) => !isActive)}
            >
                {displayState}
            </button>
        </Tippy>
    ) : null;

    return (
        <div className="ddc_pb_state-menu">
            {!props.closedButtonPortalContainer && closedMenuButton}
            {props.closedButtonPortalContainer &&
                closedMenuButton &&
                createPortal(closedMenuButton, props.closedButtonPortalContainer)}
        </div>
    );

    async function setStateAndCloseMenu(clickedStateSettings: StateSettings) {
        const nextStateSettings =
            clickedStateSettings.name === props.currentStateSettings?.name
                ? null
                : clickedStateSettings;
        showHighlightRef.current = true;
        await props.onSetState(nextStateSettings);
        setMenuIsActive(false);
    }
};
