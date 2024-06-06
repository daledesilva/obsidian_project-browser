import classNames from 'classnames';
import './section.scss';
import * as React from "react";
import { Section } from 'src/logic/section-processes';
import { TFile, TFolder } from 'obsidian';
import { FolderButtonSet } from '../folder-button-set/folder-button-set';
import { DetailedNoteCardSet } from '../detailed-note-card-set/detailed-note-card-set';
import { SimpleNoteCardSet } from '../simple-note-card-set/simple-note-card-set';
import { ListNoteCardSet } from '../list-note-card-set/list-note-card-set';
import { SmallNoteCardSet } from '../small-note-card-set/small-note-card-set';
import { StateViewMode_0_0_5 } from 'src/types/plugin-settings0_0_5';
import { sortItemsAlphabetically } from 'src/utils/sorting';

//////////
//////////

interface FolderSectionProps {
    section: Section,
    openFolder: (folder: TFolder) => void,
}
export const FolderSection = (props: FolderSectionProps) => {

    const sortedFolders = sortItemsAlphabetically(props.section.items, 'ascending');

    return <>
        <BaseSection key={props.section.title} className="ddc_pb_folder-section">
            <FolderButtonSet
                folders = {sortedFolders}
                onFolderSelect = {props.openFolder}
            />
        </BaseSection>
    </>
}

///////

interface StateSectionProps {
    section: Section,
    openFile: (file: TFile) => void,
}
export const StateSection = (props: React.PropsWithChildren<StateSectionProps>) => {

    const sortedFiles = sortItemsAlphabetically(props.section.items, 'ascending');

    return <>
        <BaseSection key={props.section.title} className="ddc_pb_state-section">
            <SectionHeader>
                {props.section.title}
            </SectionHeader>

            {props.section.settings.defaultView === StateViewMode_0_0_5.DetailedCards && (
                <DetailedNoteCardSet
                    files = {sortedFiles}
                    onFileSelect = {props.openFile}
                />
            )}

            {props.section.settings.defaultView === StateViewMode_0_0_5.SimpleCards && (
                <SimpleNoteCardSet
                    files = {sortedFiles}
                    onFileSelect = {props.openFile}
                />
            )}

            {props.section.settings.defaultView === StateViewMode_0_0_5.SmallCards && (
                <SmallNoteCardSet
                    files = {sortedFiles}
                    onFileSelect = {props.openFile}
                />
            )}

            {props.section.settings.defaultView === StateViewMode_0_0_5.List && (
                <ListNoteCardSet
                    files = {sortedFiles}
                    onFileSelect = {props.openFile}
                />
            )}
        </BaseSection>
    </>
}

///////

interface StatelessSectionProps {
    section: Section,
    openFile: (file: TFile) => void,
}
export const StatelessSection = (props: React.PropsWithChildren<StatelessSectionProps>) => {

    const sortedFiles = sortItemsAlphabetically(props.section.items, 'ascending');

    return <>
        <BaseSection key={props.section.title} className="ddc_pb_stateless-section">
            <ListNoteCardSet
                files = {sortedFiles}
                onFileSelect = {props.openFile}
            />
        </BaseSection>
    </>
}

///////

interface BaseSectionProps {
    className?: string
}
const BaseSection = (props: React.PropsWithChildren<BaseSectionProps>) => {

    return <>
        <div
            className = {classNames([
                'ddc_pb_section',
                props.className && props.className
            ])}
        >
            {props.children}
        </div>
    </>
}

///////

interface SectionHeaderProps {}
const SectionHeader = (props: React.PropsWithChildren<SectionHeaderProps>) => {

    return <>
        <div
            className = 'ddc_pb_section-header'
        >
            <h2>
                {props.children}
            </h2>
        </div>
    </>
}