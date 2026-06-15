import './project-card-base.scss';
import { TFolder } from "obsidian";
import * as React from "react";
import { registerProjectContextMenu } from 'src/context-menus/project-context-menu';
import { CardBrowserContext } from 'src/components/card-browser/card-browser';
import { getGlobals } from 'src/logic/stores';
import classNames from 'classnames';
import { getFolderPriorityName } from 'src/utils/file-manipulation';

/////////
/////////

export interface ProjectCardBaseProps {
    folder: TFolder,
    className?: string,
    children?: React.ReactNode,
    rotation?: number,
}

export const ProjectCardBase = (props: ProjectCardBaseProps) => {
    const {plugin} = getGlobals();
    const cardBrowserContext = React.useContext(CardBrowserContext);
    const cardRef = React.useRef<HTMLElement>(null);
    const [priorityName, setPriorityName] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (!plugin) return;
        if (cardRef.current) {
            registerProjectContextMenu({
                projectButtonEl: cardRef.current,
                folder: props.folder,
                onProjectChange: () => {
                    cardBrowserContext.rerender();
                },
            });
        }
    }, []);

    React.useEffect(() => {
        let cancelled = false;

        void getFolderPriorityName(props.folder).then((nextPriorityName) => {
            if (!cancelled) {
                setPriorityName(nextPriorityName);
            }
        });

        return () => {
            cancelled = true;
        };
    }, [props.folder.path]);

    return (
        <article
            ref={cardRef}
            className={classNames([
                'ddc_pb_project-card',
                'ddc_pb_project-card-base',
                priorityName?.includes('High') && 'ddc_pb_high-priority',
                priorityName?.includes('Low') && 'ddc_pb_low-priority',
                props.className,
            ])}
            onClick={(event) => {
                if (event.ctrlKey || event.metaKey) {
                    cardBrowserContext.openFolderInSameLeaf(props.folder);
                } else {
                    cardBrowserContext.openFolderInSameLeaf(props.folder);
                }
            }}
            style={{
                rotate: props.rotation ? props.rotation + 'deg' : undefined,
            }}
        >
            {props.children}
        </article>
    );
};
