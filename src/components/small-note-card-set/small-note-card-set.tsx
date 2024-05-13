import './small-note-card-set.scss';
import { TAbstractFile, TFile, TFolder } from "obsidian";
import * as React from "react";
import { SmallNoteCard } from '../cards/small-note-card/small-note-card';

/////////
/////////

interface SmallNoteCardSetProps {
    files: TAbstractFile[],
    onFileSelect: (file: TFile) => void,
}
export const SmallNoteCardSet = (props: SmallNoteCardSetProps) => {

    const cards = props.files.map( file => {
        return <SmallNoteCard
            file = {file as TFile}
            key = {file.path}
            onSelect = {props.onFileSelect}
        />
    });

    return <>
        <div
            className = 'ddc_pb_small-note-card-set'
        >
            {cards}
        </div>
    </>
}

///////


