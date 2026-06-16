import './state-menu.scss';
import { CachedMetadata, TFile } from 'obsidian';
import * as React from "react";
import { getFileStateSettingsAsync, setFileState } from 'src/logic/frontmatter-processes';
import { getGlobals } from 'src/logic/stores';
import { StateSettings } from 'src/types/types-map';
import { StateMenuShell } from './state-menu-shell';

interface ProjectPageStateMenuProps {
    file: TFile;
}

export const ProjectPageStateMenu = (props: ProjectPageStateMenuProps) => {
    const { plugin } = getGlobals();
    const [stateSettings, setStateSettings] = React.useState<StateSettings | null>(null);
    const fileRef = React.useRef(props.file);

    React.useEffect(() => {
        fileRef.current = props.file;
        void loadCurrentState(props.file);
    }, [props.file.path]);

    React.useEffect(() => {
        let fileChangeTimeout: NodeJS.Timeout | null = null;
        const handleMetadataChanged = (modifiedFile: TFile, data: string, cache: CachedMetadata) => {
            if (modifiedFile.path !== fileRef.current.path) return;
            if (fileChangeTimeout) window.clearTimeout(fileChangeTimeout);
            fileChangeTimeout = window.setTimeout(() => {
                void loadCurrentState(fileRef.current);
            }, 100);
        };
        plugin.app.metadataCache.on('changed', handleMetadataChanged);

        return () => {
            if (fileChangeTimeout) window.clearTimeout(fileChangeTimeout);
            plugin.app.metadataCache.off('changed', handleMetadataChanged);
        };
    }, [plugin]);

    return (
        <StateMenuShell
            currentStateSettings={stateSettings}
            visibleStates={plugin.settings.projectPageStates.visible}
            hiddenStates={plugin.settings.projectPageStates.hidden}
            onSetState={setStateAndUpdateMenu}
        />
    );

    async function loadCurrentState(file: TFile) {
        const currentStateSettings = await getFileStateSettingsAsync(file);
        if (fileRef.current.path === file.path) {
            setStateSettings(currentStateSettings);
        }
    }

    async function setStateAndUpdateMenu(newStateSettings: StateSettings | null): Promise<boolean> {
        const successInSettingState = await setFileState(fileRef.current, newStateSettings);
        if (successInSettingState) {
            setStateSettings(newStateSettings);
            return true;
        }
        return false;
    }
};
