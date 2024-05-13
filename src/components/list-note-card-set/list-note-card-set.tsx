import './list-note-card-set.scss';
import { TAbstractFile, TFile, TFolder } from "obsidian";
import * as React from "react";
import { ListNoteCard } from '../cards/list-note-card/list-note-card';

/////////
/////////

interface ListNoteCardSetProps {
    files: TAbstractFile[],
    onFileSelect: (file: TFile) => void,
}
export const ListNoteCardSet = (props: ListNoteCardSetProps) => {

    const cards = props.files.map( file => {
        return <div>
            <ListNoteCard
                file = {file as TFile}
                key = {file.path}
                onSelect = {props.onFileSelect}
            />
        </div>
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


