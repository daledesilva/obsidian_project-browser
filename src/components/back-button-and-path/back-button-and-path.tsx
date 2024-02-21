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

    folderTrail.unshift(rootName);
    // let displayPath = rootName;
    // console.log('folderTrail', folderTrail)
    // const isInSubfolder = folderTrail.length > 0;
    // if(isInSubfolder) {
    //     displayPath += ' / ' + folderTrail.join(' / ');
    // }

    return <>
        <div
            className = 'project-cards_back-button-and-path'
        >
            {folderTrail.length > 1 && (
                <button onClick={() => props.onBackClick()}>
                    {'< Back'}
                </button>
            )}
            {folderTrail.map( (folderName, index) => <>
                {index < folderTrail.length-1 && (
                    <div>
                        {folderName + ' /'}
                    </div>
                )}
                {index === folderTrail.length-1 && (
                    <h1>
                        {folderName}
                    </h1>
                )}
            </>)}            
        </div>
    </>
}

