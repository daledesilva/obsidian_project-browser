import { CornerLeftUp } from 'lucide-react';
import './back-button-and-path.scss';
import { TFolder } from "obsidian";
import * as React from "react";
import classNames from 'classnames';


/////////
/////////


interface BackButtonAndPathProps {
    folder: TFolder,
    onBackClick: Function,
    onFolderClick: (folder: TFolder) => {},
}

export const BackButtonAndPath = (props: BackButtonAndPathProps) => {
    

    // let folderTrail: string[] = [];
    // if(props.folder.path !== '/') {
    //     folderTrail = props.folder.path.split('/');
    // }

    const folderTrail: TFolder[] = [props.folder];
    while(folderTrail[folderTrail.length-1].parent) {
        // @ts-ignore
        folderTrail.push(folderTrail[folderTrail.length-1].parent)
    }
    folderTrail.reverse();

    console.log('folderTrail', folderTrail)

    // folderTrail.unshift(rootName);
    // let displayPath = rootName;
    // const isInSubfolder = folderTrail.length > 0;
    // if(isInSubfolder) {
    //     displayPath += ' / ' + folderTrail.join(' / ');
    // }

    return <>
        <div
            className = 'project-browser_back-button-and-path'
        >
            {folderTrail.length > 1 && (
                <CornerLeftUp
                    onClick={() => props.onBackClick()}
                    className = 'ddc_pb_icon'
                />
            )}
            {folderTrail.map( (folder, index) => (<>
                <PathButton
                    key = {index}
                    folder = {folder}
                    onClick = {folderTrail.length > 1 && index !== folderTrail.length-1 ? props.onFolderClick : undefined}
                    isCurrentFolder = {index === folderTrail.length-1}
                />
                {index < folderTrail.length-1 && (
                    <div>
                        {'>'}
                    </div>
                )}
            </>))}
        </div>
    </>
}

interface PathButtonProps {
    folder: TFolder,
    onClick?: (folder: TFolder) => {},
    isCurrentFolder: boolean,
}
function PathButton(props: PathButtonProps) {
    const v = props.folder.vault;
    const rootName = v.getName();

    let name: string;
    if(props.folder.path === '/') {
        name = rootName;
    } else {
        name = props.folder.name;
    }

    console.log('isCurrentFolder', props.isCurrentFolder)

    return <>
        {props.onClick && (
            <a
                onClick = {() => props.onClick(props.folder)}
            >
                {name}
            </a>
        )}
        {!props.onClick && (
            <div
                onClick = {() => props.onClick(props.folder)}
                className = {classNames([
                    props.isCurrentFolder && 'ddc_pb_current-folder'
                ])}
            >
                {name}
            </div>
        )}
    </>
}