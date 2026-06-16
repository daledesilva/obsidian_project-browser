import './state-menu.scss';
import * as React from "react";
import { TFolder } from 'obsidian';
import { getStateByName } from 'src/logic/get-state-by-name';
import { getGlobals } from 'src/logic/stores';
import { StateSettings } from 'src/types/types-map';
import { getFolderStateName, setFolderState } from 'src/utils/file-manipulation';
import { StateMenuShell } from './state-menu-shell';

interface ProjectFolderStateMenuProps {
    folder: TFolder;
    refreshKey?: string;
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

    return (
        <StateMenuShell
            currentStateSettings={currentStateSettings}
            visibleStates={plugin.settings.states.visible}
            hiddenStates={plugin.settings.states.hidden}
            onSetState={setProjectFolderState}
        />
    );

    async function setProjectFolderState(nextStateSettings: StateSettings | null): Promise<boolean> {
        await setFolderState(props.folder, nextStateSettings);
        setCurrentStateSettings(nextStateSettings);
        return true;
    }
};
