import './state-menu.scss';
import { CachedMetadata, TFile } from 'obsidian';
import * as React from "react";
import { getFileStateSettings, setFileState } from 'src/logic/frontmatter-processes';
import { getGlobals } from 'src/logic/stores';
import { isMarkdownFileInProject } from 'src/logic/project-page-states';
import { StateSettings } from 'src/types/types-map';
import { ProjectPageStateMenu } from './project-page-state-menu';
import { StateMenuShell } from './state-menu-shell';

//////////
//////////

interface StateMenuProps {
    file: TFile,
}

export const StateMenu = (props: StateMenuProps) => {
    const [isProjectPage, setIsProjectPage] = React.useState<boolean | null>(null);

    React.useEffect(() => {
        let cancelled = false;

        void isMarkdownFileInProject(props.file).then((nextIsProjectPage) => {
            if (!cancelled) {
                setIsProjectPage(nextIsProjectPage);
            }
        });

        return () => {
            cancelled = true;
        };
    }, [props.file.path]);

    if (isProjectPage === null) {
        return null;
    }

    if (isProjectPage) {
        return <ProjectPageStateMenu file={props.file} />;
    }

    return <StandardStateMenu file={props.file} />;
}

const StandardStateMenu = (props: StateMenuProps) => {
    const { plugin } = getGlobals();
    const [stateSettings, setStateSettings] = React.useState<StateSettings | null>(getFileStateSettings(props.file));
    const fileRef = React.useRef(props.file);

    React.useEffect(() => {
        fileRef.current = props.file;
        setStateSettings(getFileStateSettings(props.file));
    }, [props.file.path]);

    React.useEffect(() => {
        let fileChangeTimeout: NodeJS.Timeout | null = null;
        const handleMetadataChanged = (modifiedFile: TFile, data: string, cache: CachedMetadata) => {
            if (modifiedFile.path !== fileRef.current.path) return;
            if (fileChangeTimeout) window.clearTimeout(fileChangeTimeout);
            fileChangeTimeout = window.setTimeout(() => {
                setStateSettings(getFileStateSettings(fileRef.current));
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
            visibleStates={plugin.settings.states.visible}
            hiddenStates={plugin.settings.states.hidden}
            onSetState={setStateAndUpdateMenu}
        />
    );

    async function setStateAndUpdateMenu(newStateSettings: StateSettings | null): Promise<boolean> {
        const successInSettingState = await setFileState(fileRef.current, newStateSettings);
        if (successInSettingState) {
            setStateSettings(newStateSettings);
            return true;
        }
        return false;
    }
};

