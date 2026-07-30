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
}

/**
 * Renders a live page row plus nested drafts. Clicking the selected live page folds drafts open/closed.
 */
export const ProjectPageMenuGroupView = (props: ProjectPageMenuGroupViewProps) => {
    const { group, currentFile } = props;
    const liveFile = group.liveFile;
    const isLiveCurrent = !!liveFile && liveFile.path === currentFile.path;
    const isDraftCurrent = group.drafts.some((draft) => draft.path === currentFile.path);
    const [isExpanded, setIsExpanded] = React.useState(isLiveCurrent || isDraftCurrent);

    React.useEffect(() => {
        // Auto-expand when navigating into this group's live page or any of its drafts.
        if (isLiveCurrent || isDraftCurrent) {
            setIsExpanded(true);
        }
    }, [isLiveCurrent, isDraftCurrent, currentFile.path]);

    if (!liveFile && group.drafts.length === 0) {
        return null;
    }

    const showDrafts = isExpanded && group.drafts.length > 0;
    const primaryFile = liveFile ?? group.drafts[0];

    return (
        <div
            className={classNames(
                'ddc_pb_project-page-menu__group',
                showDrafts && 'ddc_pb_project-page-menu__group--expanded',
            )}
        >
            {liveFile ? (
                <ProjectPageMenuFileButton
                    file={liveFile}
                    isCurrentPage={isLiveCurrent}
                    context={props.context}
                    onPageClick={props.onPageClick}
                    onFileChange={props.onFileChange}
                    allowCreateVersion={true}
                    onActivePageClick={
                        group.drafts.length > 0
                            ? () => setIsExpanded((prev) => !prev)
                            : undefined
                    }
                />
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
