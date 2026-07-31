import './project-page-menu-group.scss';
import { TFile } from 'obsidian';
import * as React from 'react';
import classNames from 'classnames';
import { ProjectPageMenuFileButton } from 'src/components/project-page-menu-file-button/project-page-menu-file-button';
import { ProjectPageMenuGroup } from 'src/logic/project-page-menu-groups';

//////////////////
//////////////////

export interface ProjectPageMenuGroupViewProps {
    group: ProjectPageMenuGroup;
    currentFile: TFile;
    context: 'fab' | 'sidebar';
    onPageClick: (file: TFile) => void;
    onFileChange: () => void;
    /** Path of the project's active excerpt source page, when resolved. */
    excerptSourcePath?: string | null;
}

/**
 * Renders a live page row plus nested drafts. The live page stays collapsed when selected;
 * click the active live page to fold drafts open/closed.
 */
export const ProjectPageMenuGroupView = (props: ProjectPageMenuGroupViewProps) => {
    const { group, currentFile } = props;
    const liveFile = group.liveFile;
    const isLiveCurrent = !!liveFile && liveFile.path === currentFile.path;
    const isDraftCurrent = group.drafts.some((draft) => draft.path === currentFile.path);
    const [isExpanded, setIsExpanded] = React.useState(false);
    const prevDraftCountRef = React.useRef(group.drafts.length);
    const prevCurrentPathRef = React.useRef(currentFile.path);

    React.useEffect(() => {
        const previousPath = prevCurrentPathRef.current;
        const pathChanged = previousPath !== currentFile.path;
        const draftCountIncreased = group.drafts.length > prevDraftCountRef.current;
        const navigatedWithinGroup =
            group.drafts.some((draft) => draft.path === previousPath) ||
            (!!liveFile && liveFile.path === previousPath);

        if (isDraftCurrent) {
            setIsExpanded(true);
        } else if (isLiveCurrent) {
            if (draftCountIncreased) {
                setIsExpanded(true);
            } else if (pathChanged && !navigatedWithinGroup) {
                // Collapse when arriving on this live page from elsewhere, but not when
                // version creation briefly routes through the new draft before reopening live.
                setIsExpanded(false);
            }
        }

        prevDraftCountRef.current = group.drafts.length;
        prevCurrentPathRef.current = currentFile.path;
    }, [isLiveCurrent, isDraftCurrent, currentFile.path, group.drafts.length, liveFile]);

    if (!liveFile && group.drafts.length === 0) {
        return null;
    }

    const showDrafts = isExpanded && group.drafts.length > 0;
    const showStackedLiveHint = isLiveCurrent && group.drafts.length > 0 && !isExpanded;
    const primaryFile = liveFile ?? group.drafts[0];

    return (
        <div
            className={classNames(
                'ddc_pb_project-page-menu__group',
                `ddc_pb_project-page-menu__group--${props.context}`,
                showDrafts && 'ddc_pb_project-page-menu__group--expanded',
            )}
        >
            {liveFile ? (
                <div
                    className={classNames(
                        'ddc_pb_project-page-menu__live-row',
                        showStackedLiveHint && 'ddc_pb_project-page-menu__live-row--stacked',
                    )}
                >
                    <ProjectPageMenuFileButton
                        file={liveFile}
                        isCurrentPage={isLiveCurrent}
                        context={props.context}
                        onPageClick={props.onPageClick}
                        onFileChange={props.onFileChange}
                        allowCreateVersion={isLiveCurrent}
                        isExcerptSource={liveFile.path === props.excerptSourcePath}
                        onActivePageClick={
                            group.drafts.length > 0
                                ? () => setIsExpanded((prev) => !prev)
                                : undefined
                        }
                    />
                </div>
            ) : (
                <ProjectPageMenuFileButton
                    file={primaryFile}
                    isCurrentPage={primaryFile.path === currentFile.path}
                    context={props.context}
                    onPageClick={props.onPageClick}
                    onFileChange={props.onFileChange}
                    isDraft={true}
                    displayLabel={group.stem}
                />
            )}
            {showDrafts && (
                <div className="ddc_pb_project-page-menu__drafts">
                    {group.drafts.map((draft) => (
                        <ProjectPageMenuFileButton
                            key={draft.path}
                            file={draft}
                            isCurrentPage={draft.path === currentFile.path}
                            context={props.context}
                            onPageClick={props.onPageClick}
                            onFileChange={props.onFileChange}
                            isDraft={true}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
