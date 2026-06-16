import { Menu, TAbstractFile } from 'obsidian';
import { ICON_PROJECT_BROWSER } from 'src/constants';
import { getProjectBrowserRevealTargetForSelection, revealInProjectBrowser } from 'src/logic/reveal-in-project-browser';
import { getGlobals } from 'src/logic/stores';

//////////
//////////

export const REVEAL_IN_PROJECT_BROWSER_TITLE = 'Reveal in Project Browser';

const REVEAL_IN_FINDER_TITLES = [
    'Reveal in Finder',
    'Reveal in File Explorer',
    'Reveal in system explorer',
    'Show in system explorer',
];

const revealInFinderSectionsBySource = new Map<string, string>();

interface NativeMenuItemSnapshot {
    title?: unknown,
    section?: unknown,
    dom?: {
        dataset?: {
            section?: string,
        },
        textContent?: string,
    },
}

interface NativeMenuSnapshot {
    items?: NativeMenuItemSnapshot[],
}

function getMenuItemText(rawText: unknown): string {
    if (typeof rawText !== 'string') return '';
    return rawText.replace(/\s+/g, ' ').trim();
}

function getRevealInFinderSectionFromMenu(menu: Menu): string {
    const menuSnapshot = menu as Menu & NativeMenuSnapshot;
    const menuItems = menuSnapshot.items ?? [];

    for (const menuItem of menuItems) {
        const itemTitle = getMenuItemText(menuItem.title ?? menuItem.dom?.textContent);
        const itemMatchesRevealInFinder = REVEAL_IN_FINDER_TITLES.includes(itemTitle);
        if (!itemMatchesRevealInFinder) continue;

        const itemSection = menuItem.section;
        if (typeof itemSection === 'string' && itemSection.length > 0) return itemSection;

        const domSection = menuItem.dom?.dataset?.section;
        if (typeof domSection === 'string' && domSection.length > 0) return domSection;
    }

    return '';
}

function getRevealInFinderSectionForSource(menu: Menu, source: string): string {
    const sectionFromMenu = getRevealInFinderSectionFromMenu(menu);
    if (sectionFromMenu) {
        revealInFinderSectionsBySource.set(source, sectionFromMenu);
        return sectionFromMenu;
    }

    return revealInFinderSectionsBySource.get(source) ?? '';
}

function addRevealInProjectBrowserMenuItem(menu: Menu, target: TAbstractFile, source: string) {
    const finderSection = getRevealInFinderSectionForSource(menu, source);

    menu.addItem((item) => {
        item.setTitle(REVEAL_IN_PROJECT_BROWSER_TITLE);
        item.setIcon(ICON_PROJECT_BROWSER);
        if (finderSection) {
            item.setSection(finderSection);
        }
        item.onClick(() => {
            void revealInProjectBrowser(target);
        });
    });
}

export function registerRevealInProjectBrowserMenus() {
    const {plugin} = getGlobals();

    plugin.registerEvent(plugin.app.workspace.on('file-menu', (menu, file, source) => {
        const revealTarget = getProjectBrowserRevealTargetForSelection([file]);
        if(!revealTarget) return;

        addRevealInProjectBrowserMenuItem(menu, revealTarget, source);
    }));

    plugin.registerEvent(plugin.app.workspace.on('files-menu', (menu, files, source) => {
        const revealTarget = getProjectBrowserRevealTargetForSelection(files);
        if(!revealTarget) return;

        addRevealInProjectBrowserMenuItem(menu, revealTarget, source);
    }));
}