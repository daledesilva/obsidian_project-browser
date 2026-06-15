import './folder-button-set.scss';
import { TAbstractFile, TFolder } from "obsidian";
import * as React from "react";
import { FolderButton } from "../folder-button/folder-button";

/////////
/////////

interface FolderButtonSetProps {
    folders: TAbstractFile[],
}
export const FolderButtonSet = (props: FolderButtonSetProps) => {

    const cards = props.folders
        .filter((folder): folder is TFolder => folder instanceof TFolder)
        .map( folder => {
        return <FolderButton
            folder = {folder}
            key = {folder.path}
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
