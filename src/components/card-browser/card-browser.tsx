import './card-browser.scss';
import * as React from "react";
import ProjectCardsPlugin from "src/main";
import { getSortedItemsInFolder } from "src/logic/get-files";
import { SectionHeader } from "../section-header/section-header";
import { CardSet } from "../card-set/card-set";
import { TFile, TFolder, WorkspaceLeaf } from 'obsidian';
import { BackButtonAndPath } from '../back-button-and-path/back-button-and-path';

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
    const sectionsOfItems = getSortedItemsInFolder(props.plugin, curFolder);
    
    return <>
        <div
            className = 'project-cards_browser'
        >
            <BackButtonAndPath
                folder = {curFolder}
                onBackClick = {openParentFolder}
            />
            <div>
                {sectionsOfItems.map( (section) => <>
                    <SectionHeader title={section.title}/>
                    <CardSet
                        items = {section.items}
                        onFileSelect = {openFile}
                        onFolderSelect = {openFolder}
                    />
                </>)}
            </div>
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

    function openParentFolder() {
        if(!curFolder.parent) return;
        setCurFolder(curFolder.parent);
    }

};

//////////
//////////

export default CardBrowser;