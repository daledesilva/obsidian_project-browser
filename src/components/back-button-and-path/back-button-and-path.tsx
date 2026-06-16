import { CornerLeftUp, ChevronRight } from 'lucide-react';
import './back-button-and-path.scss';
import { TFolder } from "obsidian";
import * as React from "react";
import classNames from 'classnames';
import { registerFileContextMenu } from 'src/context-menus/file-context-menu';
import { PluginContext } from 'src/utils/plugin-context';
import { registerFolderContextMenu } from 'src/context-menus/folder-context-menu';
import { getFolderSettings } from 'src/utils/file-manipulation';


/////////
/////////


interface BackButtonAndPathProps {
    folder: TFolder,
    onBackClick: Function,
    onFolderClick: (folder: TFolder) => void,
    refreshKey?: string,
}

export const BackButtonAndPath = (props: BackButtonAndPathProps) => {
    
    const folderTrail: TFolder[] = [props.folder];
    while(folderTrail[folderTrail.length-1].parent) {
        // @ts-ignore
        folderTrail.push(folderTrail[folderTrail.length-1].parent)
    }
    folderTrail.reverse();

    const [projectFolderPaths, setProjectFolderPaths] = React.useState<Set<string>>(new Set());

    React.useEffect(() => {
        const checkProjectFolders = async () => {
            const projectPaths = new Set<string>();
            for (const folder of folderTrail) {
                const folderSettings = await getFolderSettings(folder.vault, folder);
                if (folderSettings.isProject) projectPaths.add(folder.path);
            }
            setProjectFolderPaths(projectPaths);
        };
        void checkProjectFolders();
    }, [props.folder.path, props.refreshKey]);

    const firstProjectIndex = folderTrail.findIndex(f => projectFolderPaths.has(f.path));

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
                        isProjectFolder = {projectFolderPaths.has(folder.path)}
                        isInsideProject = {firstProjectIndex >= 0 && index > firstProjectIndex && !projectFolderPaths.has(folder.path)}
                    />
                    {index < folderTrail.length-1 && (
                        <ChevronRight
                            className = {classNames([
                                'ddc_pb_breadcrumb-separator',
                                firstProjectIndex >= 0 && index >= firstProjectIndex && 'ddc_pb_inside-project',
                            ])}
                        />
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
    isProjectFolder?: boolean,
    isInsideProject?: boolean,
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
                className = {classNames([
                    props.isProjectFolder && 'ddc_pb_project-folder',
                    props.isInsideProject && 'ddc_pb_inside-project',
                ])}
            >
                {name}
            </a>
        )}
        {!props.onClick && (
            <div
                onClick = {() => props.onClick(props.folder)}
                className = {classNames([
                    props.isCurrentFolder && 'ddc_pb_current-folder',
                    props.isProjectFolder && 'ddc_pb_project-folder',
                    props.isInsideProject && 'ddc_pb_inside-project',
                ])}
            >
                {name}
            </div>
        )}
    </>
}