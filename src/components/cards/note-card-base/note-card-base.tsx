import classNames from 'classnames';
import './note-card-base.scss';
import { TFile, TFolder } from "obsidian";
import * as React from "react";
import { registerFileContextMenu } from 'src/context-menus/file-context-menu';
import { CardBrowserContext } from 'src/components/card-browser/card-browser';
import { getGlobals } from 'src/logic/stores';
import { openFileInBackgroundTab, openFileInSameLeaf } from 'src/logic/file-access-processes';
import { getFilePrioritySettings } from 'src/logic/frontmatter-processes';
import { getFileTypeLabel } from 'src/logic/get-file-type-label';
import { isExtensionUnsupportedByObsidian } from 'src/logic/is-extension-unsupported';
import { isFileProjectExcerptSource } from 'src/logic/project-excerpt-source';
import { basenameHasHiddenSuffix } from 'src/logic/filename-suffixes';
import { getFolderSettings } from 'src/utils/file-manipulation';
import { ExternalLink } from 'lucide-react';

/////////
/////////

export interface NoteCardBaseProps {
    file: TFile,
    className?: string,
    children?: React.ReactNode,
    rotation?: number,
    titleRotation?: number,
    contentRotation?: number,
}

export const NoteCardBase = (props: NoteCardBaseProps) => {
    const {plugin} = getGlobals();
    const cardBrowserContext = React.useContext(CardBrowserContext);
    const noteRef = React.useRef(null);
    const [isExcerptSource, setIsExcerptSource] = React.useState(false);

    const prioritySettings = getFilePrioritySettings(props.file);
    const showSettleTransition = props.file.path === cardBrowserContext.lastTouchedFilePath;
    const fileTypeLabel = getFileTypeLabel(props.file.extension ?? '');
    const isUnsupported = isExtensionUnsupportedByObsidian(props.file.extension ?? '');
    const isHiddenFromSearchGraph = basenameHasHiddenSuffix(props.file.basename);

    React.useEffect( () => {
        if(!plugin) return;
        if(noteRef.current) registerFileContextMenu({
            fileButtonEl: noteRef.current,
            file: props.file,
            onFileChange: () => {
                cardBrowserContext.rememberLastTouchedFile(props.file);
                // PBS excerpt-source changes don't remount cards by path; force a browser refresh
                // so every card re-evaluates its outline.
                cardBrowserContext.rerender();
            },
        });
    }, [])

    React.useEffect(() => {
        let cancelled = false;
        async function refreshExcerptSourceIndicator() {
            const parent = props.file.parent;
            if (!(parent instanceof TFolder)) {
                if (!cancelled) setIsExcerptSource(false);
                return;
            }
            const folderSettings = await getFolderSettings(plugin.app.vault, parent);
            if (!folderSettings.isProject) {
                if (!cancelled) setIsExcerptSource(false);
                return;
            }
            const isSource = await isFileProjectExcerptSource(props.file, parent);
            if (!cancelled) setIsExcerptSource(isSource);
        }
        void refreshExcerptSourceIndicator();
        return () => {
            cancelled = true;
        };
    }, [props.file.path, plugin, cardBrowserContext.refreshId]);
    
    return <>
        <article
            ref = {noteRef}
            className = {classNames([
                'ddc_pb_note-card-base',
                props.className,
                prioritySettings?.name.includes('High') && 'ddc_pb_high-priority',
                prioritySettings?.name.includes('Low') && 'ddc_pb_low-priority',
                showSettleTransition && 'ddc_pb_closing',
                isExcerptSource && 'ddc_pb_excerpt-source',
                isHiddenFromSearchGraph && 'ddc_pb_hidden-from-search-graph',
            ])}
            onClick = { (event) => {
                if (event.ctrlKey || event.metaKey) {
                    void openFileInBackgroundTab(props.file)
                } else {
                    cardBrowserContext.rememberLastTouchedFile(props.file);
                    void openFileInSameLeaf(props.file)
                }
            }}
            style = {{
                rotate: props.rotation ? props.rotation + 'deg' : undefined,
            }}
        >
            {(fileTypeLabel || isUnsupported) && (
                <div className="ddc_pb_note-card-top-right">
                    {fileTypeLabel && (
                        <span className="ddc_pb_note-card-type-label" aria-hidden>
                            {fileTypeLabel}
                        </span>
                    )}
                    {isUnsupported && (
                        <ExternalLink
                            className="ddc_pb_external-file-icon"
                            aria-label="Opens in external program"
                            size={14}
                        />
                    )}
                </div>
            )}
            {props.children}
        </article>
    </>
}
