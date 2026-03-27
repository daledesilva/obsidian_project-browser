import './state-menu.scss';
import { CachedMetadata, MarkdownView, TFile } from 'obsidian';
import * as React from "react";
import { getFileStateSettings, setFileState } from 'src/logic/frontmatter-processes';
import { getGlobals } from 'src/logic/stores';
import { StateSettings } from 'src/types/types-map';
import { StateMenuShell } from './state-menu-shell';

//////////
//////////

interface StateMenuProps {
    file: TFile,
}

export const StateMenu = (props: StateMenuProps) => {
    const {plugin} = getGlobals();
    
    const parentLeafRef = React.useRef(plugin.app.workspace.getActiveViewOfType(MarkdownView)?.leaf);
    const [file, setFile] = React.useState( props.file );
    const [stateSettings, setStateSettings] = React.useState<StateSettings | null>( getFileStateSettings(file) );

    // NOTE: These allow any listening events to use the updated value when it changes.
    // Because the useState value is captured by the listener's closure and will not update.
    const curFileRef = React.useRef(file);
    React.useEffect(() => {
        curFileRef.current = file;
    }, [file]);

    // On first run
    React.useEffect( () => {
        listenForFileChanges();

        return () => {
        };
    }, [])


    return (
        <StateMenuShell
            currentStateSettings={stateSettings}
            onSetState={setStateAndUpdateMenu}
        />
    )

    //////////

    function listenForFileChanges() {
        if(!plugin) return;

        plugin.registerEvent(plugin.app.workspace.on('file-open', (newFile) => {
            if(!newFile) return;
            let activeLeaf = plugin.app.workspace.getActiveViewOfType(MarkdownView)?.leaf;
            if(!activeLeaf) return;
            if(activeLeaf.view != parentLeafRef.current?.view) return;

            setFile(newFile);
            const newStateSettings = getFileStateSettings(newFile);
            setStateSettings(newStateSettings);
        }));

        let fileChangeTimeout: NodeJS.Timeout | null = null;
        plugin.registerEvent(plugin.app.metadataCache.on('changed', (modifiedFile: TFile, data: string, cache: CachedMetadata) => {
            if(modifiedFile.path !== curFileRef.current.path) return;
            if(fileChangeTimeout) clearTimeout(fileChangeTimeout);
            fileChangeTimeout = setTimeout(() => {
                setStateSettings(getFileStateSettings(curFileRef.current));
            }, 100);
        }));
    }

    async function setStateAndUpdateMenu(newStateSettings: StateSettings | null): Promise<boolean> {
        if(!plugin) return false;

        const successInSettingState = await setFileState(file, newStateSettings);
        if (successInSettingState) {
            setStateSettings(newStateSettings);
            return true;
        }
        return false;
    }
}

