import { TFile } from 'obsidian';
import * as React from 'react';
import { ExternalLink } from 'lucide-react';
import classNames from 'classnames';
import { registerFileContextMenu } from 'src/context-menus/file-context-menu';
import { getFileDisplayNameParts } from 'src/logic/get-file-display-name';
import { getFileTypeLabel } from 'src/logic/get-file-type-label';
import { isExtensionUnsupportedByObsidian } from 'src/logic/is-extension-unsupported';
import { getGlobals } from 'src/logic/stores';

export interface ProjectPageMenuFileButtonProps {
    file: TFile;
    isCurrentPage: boolean;
    context: 'fab' | 'sidebar';
    onPageClick: (file: TFile) => void;
    onFileChange: () => void;
}

export const ProjectPageMenuFileButton = (props: ProjectPageMenuFileButtonProps) => {
    const buttonRef = React.useRef<HTMLButtonElement>(null);
    const { plugin } = getGlobals();

    React.useEffect(() => {
        if (!plugin || !buttonRef.current) return;
        registerFileContextMenu({
            fileButtonEl: buttonRef.current,
            file: props.file,
            onFileChange: props.onFileChange,
        });
    }, [props.file.path]);

    const fileTypeLabel = getFileTypeLabel(props.file.extension ?? '');
    const isUnsupported = isExtensionUnsupportedByObsidian(props.file.extension ?? '');
    const { basename, extension } = getFileDisplayNameParts(props.file);

    return (
        <button
            ref={buttonRef}
            type="button"
            className={classNames(
                'ddc_pb_project-page-menu__file-button',
                `ddc_pb_project-page-menu__file-button--${props.context}`,
                props.isCurrentPage && 'ddc_pb_project-page-menu__file-button--active'
            )}
            onClick={props.isCurrentPage ? undefined : () => props.onPageClick(props.file)}
            disabled={props.isCurrentPage}
        >
            {fileTypeLabel && (
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
            {basename}
            {extension && <span className="ddc_pb_file-ext-faint">{extension}</span>}
        </button>
    );
};
