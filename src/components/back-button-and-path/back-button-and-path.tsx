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
            className = 'project-browser_back-button-and-path'
        >
            {folderTrail.length > 1 && (
                <button onClick={() => props.onBackClick()}>
                    {'^ Up'}
                </button>
            )}
            {folderTrail.map( (folderName, index) => (
                <div key={index}>
                    {index < folderTrail.length-1 && (
                        <div key={index}>
                            {folderName + ' /'}
                        </div>
                    )}
                    {index === folderTrail.length-1 && (
                        <h1 key={index}>
                            {folderName}
                        </h1>
                    )}
                </div>
            ))}            
        </div>
    </>
}

