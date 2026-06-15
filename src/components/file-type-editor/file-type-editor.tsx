import { createRoot } from 'react-dom/client';
import * as React from 'react';
import { ItemInterface, ReactSortable } from 'react-sortablejs';
import Tippy from '@tippyjs/react';
import { GripVertical } from 'lucide-react';
import classNames from 'classnames';
import type { App } from 'obsidian';
import { getGlobals } from 'src/logic/stores';
import type { FileTypeSurface } from 'src/types/plugin-settings_0_4_0';
import 'tippy.js/dist/tippy.css';
import './file-type-editor.scss';

///////////
///////////

/** Pretty names only for Note, Canvas, Base; all others show .ext */
const EXTENSION_DISPLAY_NAMES: Record<string, string> = {
    md: 'Note',
    canvas: 'Canvas',
    base: 'Base',
};

/** Note, Canvas, Base use full primary colour; other default types use semi-outline */
const CORE_EXTENSIONS_FULL_PRIMARY = new Set(['md', 'canvas', 'base']);

/** Minimal fallback when viewRegistry is inaccessible */
const REGISTRY_FALLBACK_EXTENSIONS = new Set(['md', 'canvas', 'base']);

function getDisplayNameForExtension(extension: string): string {
    const normalized = (extension ?? '').toLowerCase();
    return EXTENSION_DISPLAY_NAMES[normalized] ?? `.${normalized}`;
}

type FileTypeCategory = 'default' | 'registered' | 'unsupported';

function isPluginRegisteredExtension(app: App, extension: string): boolean {
    try {
        const registry = (app as {
            viewRegistry?: {
                typeByExtension?: Record<string, string>;
                typeByExt?: Record<string, string>;
                views?: Record<string, { pluginId?: string; plugin?: { id?: string } }>;
                byType?: Record<string, { pluginId?: string; plugin?: { id?: string } }>;
            };
        }).viewRegistry;
        if (!registry) return false;
        const typeByExtension = registry.typeByExtension ?? registry.typeByExt ?? {};
        const viewType = typeByExtension[(extension ?? '').toLowerCase()];
        if (!viewType || typeof viewType !== 'string') return false;
        const views = registry.views ?? registry.byType ?? {};
        const viewMeta = views[viewType];
        if (!viewMeta) return false;
        return !!(viewMeta.pluginId ?? viewMeta.plugin?.id);
    } catch {
        return false;
    }
}

function getFileTypeCategory(
    app: App,
    extension: string,
    registeredExtensions: Set<string>,
    unsupportedSet: Set<string>
): FileTypeCategory {
    const norm = (extension ?? '').toLowerCase();
    if (unsupportedSet.has(norm)) return 'unsupported';
    if (registeredExtensions.has(norm)) {
        return isPluginRegisteredExtension(app, extension) ? 'registered' : 'default';
    }
    return 'unsupported';
}

function getRegisteredExtensionsFromApp(app: App): Set<string> {
    try {
        const appWithRegistry = app as {
            viewRegistry?: { typeByExtension?: Record<string, unknown>; typeByExt?: Record<string, unknown> };
            workspace?: { viewRegistry?: { typeByExtension?: Record<string, unknown>; typeByExt?: Record<string, unknown> } };
        };
        const registry = appWithRegistry.viewRegistry ?? appWithRegistry.workspace?.viewRegistry;
        if (!registry) return new Set([...REGISTRY_FALLBACK_EXTENSIONS]);
        const typeByExtension = registry.typeByExtension ?? registry.typeByExt ?? {};
        const keys = Object.keys(typeByExtension);
        const result = new Set(keys.map((k) => k.toLowerCase()).filter((k) => k && k !== 'pbs'));
        if (result.size === 0) return new Set([...REGISTRY_FALLBACK_EXTENSIONS]);
        return result;
    } catch {
        return new Set([...REGISTRY_FALLBACK_EXTENSIONS]);
    }
}

function getPluginNameForExtension(app: App, extension: string): string | null {
    try {
        const registry = (app as {
            viewRegistry?: {
                typeByExtension?: Record<string, string>;
                typeByExt?: Record<string, string>;
                views?: Record<string, { pluginId?: string; plugin?: { id?: string } }>;
                byType?: Record<string, { pluginId?: string; plugin?: { id?: string } }>;
            };
        }).viewRegistry;
        if (!registry) return null;
        const typeByExtension = registry.typeByExtension ?? registry.typeByExt ?? {};
        const viewType = typeByExtension[(extension ?? '').toLowerCase()];
        if (!viewType || typeof viewType !== 'string') return null;
        const views = registry.views ?? registry.byType ?? {};
        const viewMeta = views[viewType];
        if (!viewMeta) return null;
        const pluginId = viewMeta.pluginId ?? viewMeta.plugin?.id;
        if (!pluginId) return null;
        const plugin = app.plugins?.plugins?.[pluginId];
        return (plugin as { manifest?: { name?: string } })?.manifest?.name ?? null;
    } catch {
        return null;
    }
}

/** Discovery helper: adds new types to both surfaces. Returns true if any changes were made. */
function runFileTypeDiscovery(plugin: { app: App; settings: { fileTypes: { projectBrowser: { visible: string[]; hidden: string[] }; pageMenu: { visible: string[]; hidden: string[] } } }; saveSettings: () => Promise<void> }): boolean {
    const fileTypes = plugin.settings.fileTypes;
    const allKnown = new Set([
        ...(fileTypes.projectBrowser.visible ?? []).map((e) => e.toLowerCase()),
        ...(fileTypes.projectBrowser.hidden ?? []).map((e) => e.toLowerCase()),
        ...(fileTypes.pageMenu.visible ?? []).map((e) => e.toLowerCase()),
        ...(fileTypes.pageMenu.hidden ?? []).map((e) => e.toLowerCase()),
    ]);
    const registered = getRegisteredExtensionsFromApp(plugin.app);
    let addedPlugin = false;
    for (const ext of registered) {
        const norm = ext.toLowerCase();
        if (!allKnown.has(norm)) {
            allKnown.add(norm);
            fileTypes.projectBrowser.visible = [...(fileTypes.projectBrowser.visible ?? []), norm];
            fileTypes.pageMenu.hidden = [...(fileTypes.pageMenu.hidden ?? []), norm];
            addedPlugin = true;
        }
    }
    const vault = plugin.app.vault;
    const files = vault.getFiles();
    const vaultExtensions = new Set<string>();
    for (const file of files) {
        const ext = (file.extension ?? '').toLowerCase();
        if (ext && ext !== 'pbs') vaultExtensions.add(ext);
    }
    let addedVault = false;
    for (const ext of vaultExtensions) {
        if (!allKnown.has(ext)) {
            allKnown.add(ext);
            fileTypes.projectBrowser.hidden = [...(fileTypes.projectBrowser.hidden ?? []), ext];
            fileTypes.pageMenu.hidden = [...(fileTypes.pageMenu.hidden ?? []), ext];
            addedVault = true;
        }
    }
    if (addedPlugin || addedVault) {
        void plugin.saveSettings();
        return true;
    }
    return false;
}

///////////
///////////

export function insertFileTypeEditor(
    containerEl: HTMLElement,
    onScansComplete?: () => void,
    surface?: FileTypeSurface
) {
    const sectionEl = containerEl.createDiv('ddc_pb_settings-sub-section');
    const contentEl = sectionEl.createDiv();
    createRoot(contentEl).render(
        <FileTypeSettingsSection onScansComplete={onScansComplete} surface={surface} />
    );
}

interface FileTypeItem extends ItemInterface {
    id: string;
    extension: string;
}

interface FileTypeSettingsSectionProps {
    onScansComplete?: () => void;
    surface?: FileTypeSurface;
}

function FileTypeSettingsSection(props: FileTypeSettingsSectionProps) {
    const { plugin } = getGlobals();
    const { onScansComplete, surface } = props;

    React.useEffect(() => {
        const runOnMount = () => {
            const changed = runFileTypeDiscovery(plugin);
            if (changed) {
                onScansComplete?.();
            }
        };
        setTimeout(runOnMount, 0);
    }, [plugin, onScansComplete]);

    const surfaces: FileTypeSurface[] = surface ? [surface] : ['projectBrowser', 'pageMenu'];

    const legendContent = (
        <div className="ddc_pb_file-type-legend-popup">
            <div className="ddc_pb_file-type-legend-entry">
                <div className="ddc_pb_draggable ddc_pb_file-type-default ddc_pb_file-type-default-full ddc_pb_file-type-legend-chip">
                    <span className="ddc_pb_draggable-label">Native</span>
                </div>
                <div className="ddc_pb_file-type-legend-content">
                    <p className="ddc_pb_file-type-legend-subdesc">Core Obsidian file types.</p>
                </div>
            </div>
            <div className="ddc_pb_file-type-legend-entry">
                <div className="ddc_pb_draggable ddc_pb_file-type-registered ddc_pb_file-type-legend-chip">
                    <span className="ddc_pb_draggable-label">Plugin</span>
                </div>
                <div className="ddc_pb_file-type-legend-content">
                    <p className="ddc_pb_file-type-legend-subdesc">File types added by community plugins.</p>
                </div>
            </div>
            <div className="ddc_pb_file-type-legend-entry">
                <div className="ddc_pb_draggable ddc_pb_file-type-unsupported ddc_pb_file-type-legend-chip">
                    <span className="ddc_pb_draggable-label">Other</span>
                </div>
                <div className="ddc_pb_file-type-legend-content">
                    <p className="ddc_pb_file-type-legend-subdesc">Found in your vault but usually hidden by Obsidian.</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="ddc_pb_section-header ddc_pb_file-type-section-header">
            {surfaces.map((s) => (
                <FileTypeEditor key={s} surface={s} />
            ))}
            <div className="ddc_pb_file-type-legend-row ddc_pb_legend-btn-wrapper">
                <Tippy content={legendContent} trigger="click" interactive={true} hideOnClick={true} theme="ddc_pb_legend">
                    <button type="button" className="ddc_pb_file-type-legend-btn">
                        Legend
                    </button>
                </Tippy>
            </div>
        </div>
    );
}

interface FileTypeEditorProps {
    surface: FileTypeSurface;
}

export const FileTypeEditor = (props: FileTypeEditorProps) => {
    const { plugin } = getGlobals();
    const { surface } = props;
    const surfaceSettings = plugin.settings.fileTypes[surface];

    const [visibleFileTypes, setVisibleFileTypes] = React.useState<FileTypeItem[]>(() =>
        (surfaceSettings?.visible ?? []).map((ext) => ({ id: ext, extension: ext }))
    );
    const [hiddenFileTypes, setHiddenFileTypes] = React.useState<FileTypeItem[]>(() =>
        (surfaceSettings?.hidden ?? []).map((ext) => ({ id: ext, extension: ext }))
    );

    const registeredExtensions = React.useMemo(
        () => getRegisteredExtensionsFromApp(plugin.app),
        [plugin.app]
    );
    const unsupportedSet = React.useMemo(() => {
        const hidden = surfaceSettings?.hidden ?? [];
        return new Set(
            hidden
                .map((e) => e.toLowerCase())
                .filter((ext) => !registeredExtensions.has(ext))
        );
    }, [surfaceSettings?.hidden, registeredExtensions]);

    const persistVisible = React.useCallback(
        async (items: FileTypeItem[]) => {
            plugin.settings.fileTypes[surface].visible = items.map((item) => item.extension);
            await plugin.saveSettings();
            setVisibleFileTypes(items);
        },
        [plugin, surface]
    );

    const persistHidden = React.useCallback(
        async (items: FileTypeItem[]) => {
            plugin.settings.fileTypes[surface].hidden = items.map((item) => item.extension);
            await plugin.saveSettings();
            setHiddenFileTypes(items);
        },
        [plugin, surface]
    );

    const surfaceLabel = surface === 'projectBrowser' ? 'Project Browser' : 'Page Menu';

    return (
        <>
            <div className="ddc_pb_file-type-section">
                <h3>Show these...</h3>
                <ReactSortable
                    list={visibleFileTypes}
                    setList={persistVisible}
                    group={`fileTypes-${surface}`}
                    animation={200}
                        className={classNames([
                            'ddc_pb_states-ctrl',
                            'ddc_pb_visible-states-ctrl',
                        ])}
                    >
                        {visibleFileTypes.map((item) => {
                            const category = getFileTypeCategory(plugin.app, item.extension, registeredExtensions, unsupportedSet);
                            const pluginName = getPluginNameForExtension(plugin.app, item.extension);
                            const displayName = getDisplayNameForExtension(item.extension);
                            return (
                            <div
                                key={item.id}
                                className={classNames(
                                    'ddc_pb_draggable',
                                    `ddc_pb_file-type-${category}`,
                                    category === 'default' && CORE_EXTENSIONS_FULL_PRIMARY.has(item.extension.toLowerCase()) && 'ddc_pb_file-type-default-full'
                                )}
                            >
                                <div className="ddc_pb_draggable-label ddc_pb_hidden-item-label">
                                    <GripVertical className="ddc_pb_icon ddc_pb_drag-icon" />
                                    <span className="ddc_pb_hidden-item-text">
                                        <span className="ddc_pb_hidden-item-ext">{displayName}</span>
                                        {pluginName && (
                                            <span className="ddc_pb_hidden-item-plugin">via {pluginName}</span>
                                        )}
                                    </span>
                                </div>
                            </div>
                            );
                        })}
                    </ReactSortable>
                </div>

                <div className="ddc_pb_file-type-section">
                    <h3>Hide these...</h3>
                    <ReactSortable
                        list={hiddenFileTypes}
                        setList={persistHidden}
                        group={`fileTypes-${surface}`}
                        animation={200}
                        className={classNames([
                            'ddc_pb_states-ctrl',
                            'ddc_pb_hidden-states-ctrl',
                        ])}
                    >
                        {hiddenFileTypes.map((item) => {
                            const displayName = getDisplayNameForExtension(item.extension);
                            const pluginName = getPluginNameForExtension(plugin.app, item.extension);
                            const category = getFileTypeCategory(plugin.app, item.extension, registeredExtensions, unsupportedSet);
                            return (
                                <div
                                    key={item.id}
                                    className={classNames(
                                        'ddc_pb_draggable',
                                        `ddc_pb_file-type-${category}`,
                                        category === 'default' && CORE_EXTENSIONS_FULL_PRIMARY.has(item.extension.toLowerCase()) && 'ddc_pb_file-type-default-full'
                                    )}
                                >
                                    <div className="ddc_pb_draggable-label ddc_pb_hidden-item-label">
                                        <GripVertical className="ddc_pb_icon ddc_pb_drag-icon" />
                                        <span className="ddc_pb_hidden-item-text">
                                            <span className="ddc_pb_hidden-item-ext">{displayName}</span>
                                            {pluginName && (
                                                <span className="ddc_pb_hidden-item-plugin">via {pluginName}</span>
                                            )}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </ReactSortable>
                </div>
        </>
    );
};
