import classNames from 'classnames';
import './section.scss';
import * as React from "react";
import { Section } from 'src/logic/section-processes';
import { FolderSet, NoteCardSet } from '../card-set/card-set';
import { TFile, TFolder } from 'obsidian';

//////////
//////////

interface FolderSectionProps {
    section: Section,
    openFolder: (folder: TFolder) => void,
}
export const FolderSection = (props: FolderSectionProps) => {

    return <>
        <BaseSection key={props.section.title} className="ddc_pb_folder-section">
            <FolderSet
                folders = {props.section.items}
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

    return <>
        <BaseSection key={props.section.title} className="ddc_pb_state-section">
            <SectionHeader>
                {props.section.title}
            </SectionHeader>
            <NoteCardSet
                files = {props.section.items}
                onFileSelect = {props.openFile}
            />
        </BaseSection>
    </>
}

///////

interface StatelessSectionProps {
    section: Section,
    openFile: (file: TFile) => void,
}
export const StatelessSection = (props: React.PropsWithChildren<StatelessSectionProps>) => {

    return <>
        <BaseSection key={props.section.title} className="ddc_pb_stateless-section">
            <NoteCardSet
                files = {props.section.items}
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