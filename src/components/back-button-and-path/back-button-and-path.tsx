import './back-button-and-path.scss';
import { TFolder } from "obsidian";
import * as React from "react";


/////////
/////////


interface BackButtonAndPathProps {
    folder: TFolder,
    onBackClick: Function,
}

export const BackButtonAndPath = (props: BackButtonAndPathProps) => {
    const v = props.folder.vault;
    const rootName = v.getName();

    let folderTrail: string[] = [];
    if(props.folder.path !== '/') {
        folderTrail = props.folder.path.split('/');
    }

    let displayPath = rootName;
    const isInSubfolder = folderTrail.length > 0;
    if(isInSubfolder) {
        displayPath += ' / ' + folderTrail.join(' / ');
    }

    return <>
        <div
            className = 'project-cards_back-button-and-path'
        >
            {isInSubfolder && (
                <button onClick={() => props.onBackClick()}>
                    {'< Back'}
                </button>
            )}
            <div>
                {displayPath}
            </div>
        </div>
    </>
}

