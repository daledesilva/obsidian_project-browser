import './card-set.scss';
import { TAbstractFile, TFile, TFolder } from "obsidian";
import * as React from "react";
import { DetailedNoteCard } from "../cards/detailed-note-card/detailed-note-card";
import { FolderButton } from "../cards/folder-button/folder-button";

/////////
/////////

interface FolderSetProps {
    folders: TAbstractFile[],
    onFolderSelect: (folder: TFolder) => void,
}
export const FolderSet = (props: FolderSetProps) => {

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

///////

interface NoteCardSetProps {
    files: TAbstractFile[],
    onFileSelect: (file: TFile) => void,
}
export const NoteCardSet = (props: NoteCardSetProps) => {

    const cards = props.files.map( file => {
        return <DetailedNoteCard
            file = {file as TFile}
            key = {file.path}
            onSelect = {props.onFileSelect}
        />
    });

    return <>
        <div
            className = 'project-browser_card-set'
        >
            {cards}
        </div>
    </>
}

///////


