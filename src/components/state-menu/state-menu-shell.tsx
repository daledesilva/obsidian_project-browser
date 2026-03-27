import * as React from "react";
import classnames from 'classnames';
import { useAtomValue } from 'jotai';
import { stateMenuAtom } from 'src/logic/stores';
import { StateSettings } from 'src/types/types-map';
import { sanitizeInternalLinkName } from 'src/utils/string-processes';

interface StateMenuShellProps {
    currentStateSettings: StateSettings | null;
    visibleStates: StateSettings[];
    hiddenStates: StateSettings[];
    onSetState: (stateSettings: StateSettings | null) => Promise<boolean>;
}

export const StateMenuShell = (props: StateMenuShellProps) => {
    const stateMenuSettings = useAtomValue(stateMenuAtom);
    const [menuIsActive, setMenuIsActive] = React.useState(false);
    const showHighlightRef = React.useRef<boolean>(false);
    const stateMenuRef = React.useRef<HTMLDivElement>(null);
    const stateMenuContentRef = React.useRef<HTMLDivElement>(null);
    const resizeObserverRef = React.useRef<ResizeObserver | null>(null);

    const stateMenuSettingsRef = React.useRef(stateMenuSettings);
    React.useEffect(() => {
        stateMenuSettingsRef.current = stateMenuSettings;
    }, [stateMenuSettings]);

    const displayState = props.currentStateSettings?.name || 'Set State';

    React.useEffect(() => {
        function handleClickOutside(event: PointerEvent) {
            if (stateMenuRef.current && !stateMenuRef.current.contains(event.target as Node)) {
                setMenuIsActive(false);
            }
        }

        document.addEventListener('pointerdown', handleClickOutside);
        monitorWorkspaceResizes();

        return () => {
            unmonitorWorkspaceResizes();
            document.removeEventListener('pointerdown', handleClickOutside);
        };
    }, []);

    React.useEffect(() => {
        setHeight();
    }, [stateMenuSettings, menuIsActive]);

    React.useEffect(() => {
        showHighlightRef.current = false;
    });

    return (
        <div
            className='ddc_pb_state-menu'
            ref={stateMenuRef}
        >
            <div
                className='ddc_pb_state-menu-content'
                ref={stateMenuContentRef}
            >
                {!menuIsActive && (
                    <button
                        className={classnames([
                            'ddc_pb_state-btn',
                            'ddc_pb_in-closed-menu',
                            showHighlightRef.current && 'ddc_pb_has-return-transition',
                        ])}
                        onClick={() => {
                            setMenuIsActive(true);
                        }}
                    >
                        {displayState}
                    </button>
                )}

                {menuIsActive && (
                    <>
                        <div className='ddc_pb_visible-state-btns'>
                            {props.visibleStates.map((visibleStateSettings) => (
                                <button
                                    key={visibleStateSettings.name}
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
                        <div className='ddc_pb_hidden-state-btns'>
                            {props.hiddenStates.map((hiddenStateSettings) => (
                                <button
                                    key={hiddenStateSettings.name}
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
                    </>
                )}
            </div>
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

    function setHeight() {
        if (stateMenuSettingsRef.current.visible) {
            setVisibleHeight();
        } else {
            setHiddenHeight();
        }
    }

    function setVisibleHeight() {
        if (!stateMenuContentRef.current || !stateMenuRef.current) return;
        const contentHeight = stateMenuContentRef.current.getBoundingClientRect().height;
        stateMenuRef.current.style.height = `${contentHeight}px`;
    }

    function setHiddenHeight() {
        if (!stateMenuRef.current) return;
        stateMenuRef.current.style.height = '0';
    }

    function monitorWorkspaceResizes() {
        const surroundingWorkspaceSplit = stateMenuRef.current?.closest('.workspace-split');

        let resizeTimeout: NodeJS.Timeout | null = null;
        resizeObserverRef.current = new ResizeObserver(() => {
            if (resizeTimeout) clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                setHeight();
            }, 50);
        });
        if (surroundingWorkspaceSplit) {
            resizeObserverRef.current?.observe(surroundingWorkspaceSplit);
        }
    }

    function unmonitorWorkspaceResizes() {
        const surroundingWorkspaceSplit = stateMenuRef.current?.closest('.workspace-split');
        if (surroundingWorkspaceSplit) {
            resizeObserverRef.current?.unobserve(surroundingWorkspaceSplit);
        }
        resizeObserverRef.current?.disconnect();
    }
};
