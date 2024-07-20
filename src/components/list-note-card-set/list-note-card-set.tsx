import './list-note-card-set.scss';
import { TAbstractFile, TFile, TFolder } from "obsidian";
import * as React from "react";
import { ListNoteCard } from '../cards/list-note-card/list-note-card';

/////////
/////////

interface ListNoteCardSetProps {
    files: TAbstractFile[],
}
export const ListNoteCardSet = (props: ListNoteCardSetProps) => {

    const cards = props.files.map( file => {
        return (
            <ListNoteCard
                key = {file.path}
                file = {file as TFile}
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


