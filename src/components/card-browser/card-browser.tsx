import './card-browser.scss';
import * as React from "react";
import ProjectCardsPlugin from "src/main";
import { getSortedNotesInFolder } from "src/logic/get-files";
import { SectionHeader } from "../section-header/section-header";
import { CardSet } from "../card-set/card-set";
import { TFile, TFolder, WorkspaceLeaf } from 'obsidian';

//////////
//////////

interface CardBrowserProps {
    plugin: ProjectCardsPlugin,
}

export const CardBrowser = (props: CardBrowserProps) => {
    // const [files, setFiles] = useState
    const v = props.plugin.app.vault;
    const [curFolder, setCurFolder] = React.useState( v.getRoot() );

    // on mount
    React.useEffect( () => {
        console.log("mounting");
    },[])

    // TODO: This should return an array of states with items
    const items = getSortedNotesInFolder(curFolder);
    
    return <>
        <div
            className = 'project-cards_browser'
        >

            {items && <>
                <SectionHeader title="Active"/>
                <CardSet
                    items = {items}
                    onFileSelect = {openFile}
                    onFolderSelect = {openFolder}
                />
            </>}

            {/* {items && <>
                <SectionHeader title="WIP"/>
                <CardSet items={items}/>
            </>}

            {items && <>
                <SectionHeader title="Seed"/>
                <CardSet items={items}/>
            </>} */}

        </div>
    </>;

    ////////

    function openFolder(folder: TFolder) {
        setCurFolder(folder);
    }
    
    function openFile(file: TFile) {
        let { workspace } = props.plugin.app;
        let leaf: null | WorkspaceLeaf;
        leaf = workspace.getMostRecentLeaf();
        if(!leaf) leaf = workspace.getLeaf();
        leaf.openFile(file);
    }

};

//////////
//////////

export default CardBrowser;