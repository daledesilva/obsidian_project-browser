import './card-set.scss';
import { TAbstractFile, TFile, TFolder } from "obsidian";
import * as React from "react";
import { DetailedNoteCard } from "../cards/detailed-note-card/detailed-note-card";
import { FolderButton } from "../folder-button/folder-button";

/////////
/////////

interface FolderSetProps {
    folders: TAbstractFile[],
    onFolderSelect: (folder: TFolder) => void,
}
export const FolderSet = (props: FolderSetProps) => {

    const cards = props.folders
        .filter((folder): folder is TFolder => folder instanceof TFolder)
        .map( folder => {
        return <FolderButton
            folder = {folder}
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

    const cards = props.files
        .filter((file): file is TFile => file instanceof TFile)
        .map( file => {
        return <DetailedNoteCard
            file = {file}
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


