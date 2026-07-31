import './state-menu.scss';
import * as React from "react";
import { TFolder } from 'obsidian';
import { getStateByName } from 'src/logic/get-state-by-name';
import { getGlobals } from 'src/logic/stores';
import { StateSettings } from 'src/types/types-map';
import { getFolderStateName, setFolderState } from 'src/utils/file-manipulation';
import { isRootPath } from 'src/utils/string-processes';
import { getFolderDisplayName } from 'src/logic/get-folder-display-name';
import { StateMenuShell } from './state-menu-shell';

interface ProjectFolderStateMenuProps {
    folder: TFolder;
    refreshKey?: string;
    closedButtonPortalContainer?: HTMLElement | null;
}

export const ProjectFolderStateMenu = (props: ProjectFolderStateMenuProps) => {
    const { plugin } = getGlobals();
    const [currentStateSettings, setCurrentStateSettings] = React.useState<StateSettings | null>(null);

    React.useEffect(() => {
        let cancelled = false;

        void loadCurrentState();

        return () => {
            cancelled = true;
        };

        async function loadCurrentState() {
            const stateName = await getFolderStateName(props.folder);
            if (cancelled) return;
            setCurrentStateSettings(stateName ? getStateByName(stateName) : null);
        }
    }, [props.folder.path, props.refreshKey]);

    // Tippy subject when the leaf title is easy to miss (phone) or stacked away from the panel.
    const subjectLabel = isRootPath(props.folder.path)
        ? props.folder.vault.getName()
        : getFolderDisplayName(props.folder);

    return (
        <StateMenuShell
            currentStateSettings={currentStateSettings}
            visibleStates={plugin.settings.states.visible}
            hiddenStates={plugin.settings.states.hidden}
            visibilitySurface="noteAndProject"
            subjectLabel={subjectLabel}
            closedButtonPortalContainer={props.closedButtonPortalContainer}
            onSetState={setProjectFolderState}
        />
    );

    async function setProjectFolderState(nextStateSettings: StateSettings | null): Promise<boolean> {
        await setFolderState(props.folder, nextStateSettings);
        setCurrentStateSettings(nextStateSettings);
        return true;
    }
};
