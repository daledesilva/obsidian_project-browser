import './card-set.scss';
import { TAbstractFile, TFile, TFolder } from "obsidian";
import * as React from "react";
import { MdFileCard } from "../cards/md-file-card/md-file-card";
import { FolderCard } from "../cards/folder-card/folder-card";

/////////
/////////


interface CardSetProps {
    items: TAbstractFile[],
    onFileSelect: (file: TFile) => void,
    onFolderSelect: (folder: TFolder) => void,
}

export const CardSet = (props: CardSetProps) => {

    const cards = props.items.map( item => {
        if(item instanceof TFile) {
            return <MdFileCard
                file = {item}
                key = {item.path}
                onSelect = {props.onFileSelect}
            />
        } else if(item instanceof TFolder) {
            return <FolderCard
                folder = {item}
                key = {item.path}
                onSelect = {props.onFolderSelect}
            />
        }
    });

    return <>
        <div
            className = 'project-browser_card-set'
        >
            {cards}
        </div>
    </>
}


