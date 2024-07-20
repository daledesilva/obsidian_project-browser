import './list-note-card-set.scss';
import { TAbstractFile, TFile, TFolder } from "obsidian";
import * as React from "react";
import { ListNoteCard } from '../cards/list-note-card/list-note-card';

/////////
/////////

interface ListNoteCardSetProps {
    files: TAbstractFile[],
    onFileSelect: (file: TFile) => void,
    lastTouchedFilePath?: string,
}
export const ListNoteCardSet = (props: ListNoteCardSetProps) => {

    const cards = props.files.map( file => {
        return (
            <ListNoteCard
                file = {file as TFile}
                key = {file.path}
                onSelect = {props.onFileSelect}
                showSettleTransition = {props.lastTouchedFilePath === file.path}
            />
        )
    });

    return <>
        <div
            className = 'ddc_pb_list-note-card-set'
        >
            {cards}
        </div>
    </>
}

///////


