import classNames from 'classnames';
import './section.scss';
import * as React from "react";
import { Section } from 'src/logic/section-processes';
import { FolderButtonSet } from '../folder-button-set/folder-button-set';
import { sortItemsByName } from 'src/utils/sorting';
import { FolderQuickMenu } from '../section-quick-menu/folder-quick-menu';

//////////
//////////

interface FolderSectionProps {
    section: Section,
}

export const FolderSection = (props: FolderSectionProps) => {
    const sortedFolders = sortItemsByName(props.section.items, 'ascending');

    return <>
        <BaseSection
            className = "ddc_pb_folder-section"
            section = {props.section}
            showQuickMenu = {false}
        >
            <FolderButtonSet
                folders = {sortedFolders}
            />
        </BaseSection>
    </>
}

///////

interface BaseSectionProps extends React.PropsWithChildren {
    className?: string
    showQuickMenu?: boolean
    section: Section
}

const BaseSection = React.forwardRef<HTMLDivElement, BaseSectionProps>((props, ref) => {
    const {
        showQuickMenu = true
    } = props;

    return <>
        <div
            ref = {ref}
            className = {classNames([
                'ddc_pb_section',
                props.className && props.className
            ])}
        >
            {props.children}

            {showQuickMenu && (
                <FolderQuickMenu section = {props.section} />
            )}
        </div>
    </>
}); 