import { CornerLeftUp } from 'lucide-react';
import './back-button-and-path.scss';
import { TFolder } from "obsidian";
import * as React from "react";
import classNames from 'classnames';
import { registerNoteContextMenu } from 'src/context-menus/note-context-menu';
import { PluginContext } from 'src/utils/plugin-context';
import { registerFolderContextMenu } from 'src/context-menus/folder-context-menu';


/////////
/////////


interface BackButtonAndPathProps {
    folder: TFolder,
    onBackClick: Function,
    onFolderClick: (folder: TFolder) => {},
}

export const BackButtonAndPath = (props: BackButtonAndPathProps) => {
    
    const folderTrail: TFolder[] = [props.folder];
    while(folderTrail[folderTrail.length-1].parent) {
        // @ts-ignore
        folderTrail.push(folderTrail[folderTrail.length-1].parent)
    }
    folderTrail.reverse();

    /////////

    return <>
        <div
            className = 'ddc_pb_back-button-and-path'
        >
            {folderTrail.length > 1 && (
                <CornerLeftUp
                    onClick={() => props.onBackClick()}
                    className = 'ddc_pb_icon'
                />
            )}
            {folderTrail.map( (folder, index) => (
                <div
                    key = {index}
                    className = 'ddc_pb_breadcrumb'
                >
                    <PathButton
                        folder = {folder}
                        onClick = {folderTrail.length > 1 && index !== folderTrail.length-1 ? props.onFolderClick : undefined}
                        isCurrentFolder = {index === folderTrail.length-1}
                    />
                    {index < folderTrail.length-1 && (
                        <div>
                            {'>'}
                        </div>
                    )}
                </div>
            ))}
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