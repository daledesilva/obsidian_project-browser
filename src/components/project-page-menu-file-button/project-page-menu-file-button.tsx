import { TFile } from 'obsidian';
import * as React from 'react';
import { ExternalLink } from 'lucide-react';
import classNames from 'classnames';
import { registerFileContextMenu } from 'src/context-menus/file-context-menu';
import { getFileDisplayNameParts } from 'src/logic/get-file-display-name';
import { getFileTypeLabel } from 'src/logic/get-file-type-label';
import { isExtensionUnsupportedByObsidian } from 'src/logic/is-extension-unsupported';
import { basenameIsHiddenFromSearchGraph, parseDraftBasename } from 'src/logic/filename-suffixes';
import { getGlobals } from 'src/logic/stores';

export interface ProjectPageMenuFileButtonProps {
    file: TFile;
    isCurrentPage: boolean;
    context: 'fab' | 'sidebar';
    onPageClick: (file: TFile) => void;
    onFileChange: () => void;
    /** When set, clicking the already-active page toggles draft expansion instead of being disabled. */
    onActivePageClick?: () => void;
    /** Optional label override (e.g. draft date stamp). */
    displayLabel?: string;
    isDraft?: boolean;
    allowCreateVersion?: boolean;
    /** True when this markdown page is the project's active excerpt source. */
    isExcerptSource?: boolean;
}

export const ProjectPageMenuFileButton = (props: ProjectPageMenuFileButtonProps) => {
    const buttonRef = React.useRef<HTMLButtonElement>(null);
    const { plugin } = getGlobals();

    // Context menu reads these attributes when opened so it always targets the live vault file
    // at this path (avoids stale TFile refs after "Create new version" renames in place).
    React.useLayoutEffect(() => {
        const buttonEl = buttonRef.current;
        if (!buttonEl) return;
        buttonEl.dataset.pbFilePath = props.file.path;
        buttonEl.dataset.pbAllowCreateVersion = props.allowCreateVersion ? 'true' : 'false';
        buttonEl.dataset.pbIsCurrentPage = props.isCurrentPage ? 'true' : 'false';
    });

    React.useEffect(() => {
        if (!plugin || !buttonRef.current) return;
        return registerFileContextMenu({
            fileButtonEl: buttonRef.current,
            onFileChange: props.onFileChange,
        });
    }, [plugin, props.onFileChange]);

    const fileTypeLabel = getFileTypeLabel(props.file.extension ?? '');
    const isUnsupported = isExtensionUnsupportedByObsidian(props.file.extension ?? '');
    const { basename, extension } = getFileDisplayNameParts(props.file);
    const draftMeta = props.isDraft ? parseDraftBasename(props.file.basename) : null;
    const label = props.displayLabel ?? (draftMeta ? draftMeta.dateStamp : basename);
    const isHiddenFromSearchGraph = basenameIsHiddenFromSearchGraph(props.file.basename);

    function handleClick() {
        if (props.isCurrentPage && props.onActivePageClick) {
            props.onActivePageClick();
            return;
        }
        if (!props.isCurrentPage) {
            props.onPageClick(props.file);
        }
    }

    return (
        <button
            ref={buttonRef}
            type="button"
            className={classNames(
                'ddc_pb_project-page-menu__file-button',
                `ddc_pb_project-page-menu__file-button--${props.context}`,
                props.isCurrentPage && 'ddc_pb_project-page-menu__file-button--active',
                props.isDraft && 'ddc_pb_project-page-menu__file-button--draft',
                (props.isDraft || isHiddenFromSearchGraph) && 'ddc_pb_hidden-from-search-graph',
                props.isExcerptSource && 'ddc_pb_excerpt-source',
            )}
            onClick={handleClick}
            // Keep active live pages clickable so a second click can fold drafts open/closed.
            disabled={props.isCurrentPage && !props.onActivePageClick}
        >
            {fileTypeLabel && !props.isDraft && (
                <span className="ddc_pb_project-page-menu__file-button-tags">
                    <span className="ddc_pb_file-type-tag" aria-hidden>
                        {fileTypeLabel}
                    </span>
                </span>
            )}
            {isUnsupported && (
                <span className="ddc_pb_project-page-menu__file-button-external-icon">
                    <ExternalLink
                        className="ddc_pb_external-file-icon"
                        aria-label="Opens in external program"
                        size={12}
                    />
                </span>
            )}
            {label}
            {extension && !props.isDraft && <span className="ddc_pb_file-ext-faint">{extension}</span>}
        </button>
    );
};
