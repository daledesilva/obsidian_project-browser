import './simple-note-card-set.scss';
import { TAbstractFile, TFile, TFolder } from "obsidian";
import * as React from "react";
import { SimpleNoteCard } from '../cards/simple-note-card/simple-note-card';

/////////
/////////

interface SimpleNoteCardSetProps {
    files: TAbstractFile[],
    onFileSelect: (file: TFile) => void,
}
export const SimpleNoteCardSet = (props: SimpleNoteCardSetProps) => {

    const cards = props.files.map( file => {
        return <SimpleNoteCard
            file = {file as TFile}
            key = {file.path}
            onSelect = {props.onFileSelect}
        />
    });

    return <>
        <div
            className = 'ddc_pb_simple-note-card-set'
        >
            {cards}
        </div>
    </>
}

///////


