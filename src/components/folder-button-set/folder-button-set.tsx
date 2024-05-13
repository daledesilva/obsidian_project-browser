import './folder-button-set.scss';
import { TAbstractFile, TFolder } from "obsidian";
import * as React from "react";
import { FolderButton } from "../cards/folder-button/folder-button";

/////////
/////////

interface FolderButtonSetProps {
    folders: TAbstractFile[],
    onFolderSelect: (folder: TFolder) => void,
}
export const FolderButtonSet = (props: FolderButtonSetProps) => {

    const cards = props.folders.map( folder => {
        return <FolderButton
            folder = {folder as TFolder}
            key = {folder.path}
            onSelect = {props.onFolderSelect}
        />
    });

    return <>
        <div
            className = 'project-browser_folder-set'
        >
            {cards}
        </div>
    </>
}
