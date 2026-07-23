export const STATE_MENU_HEADER_BUTTON_CONTAINER_CLASS = 'ddc_pb_state-menu-header-button-container';
/** Host sits in remaining view-header chrome when the title container is hidden (phone + inline title). */
export const STATE_MENU_HEADER_CHROME_CLASS = 'ddc_pb_state-menu-header-button-container--chrome';
/** Host sits above view content when the whole view-header is unavailable. */
export const STATE_MENU_HEADER_STICKY_CLASS = 'ddc_pb_state-menu-header-button-container--sticky';
/** Marks the title row while it hosts the state control (for project name / state stacking). */
export const STATE_MENU_TITLE_WITH_STATE_CLASS = 'ddc_pb_has-state-menu-header';

function isElementVisiblyLaidOut(element: HTMLElement | null): element is HTMLElement {
    if (!element) return false;
    const style = getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
}

function isViewHeaderUsable(headerEl: HTMLElement): boolean {
    if (!isElementVisiblyLaidOut(headerEl)) return false;
    const style = getComputedStyle(headerEl);
    // Phone can keep the header in layout while sliding/fading it away (is-hidden-nav).
    if (Number.parseFloat(style.opacity || '1') < 0.15) return false;
    if (headerEl.getBoundingClientRect().bottom <= 1) return false;
    return true;
}

/**
 * Prefer the title-row portal (desktop/tablet). On phone markdown Obsidian hides
 * `.view-header-title-container` (inline title), so fall back to centered header chrome,
 * then a sticky strip when `is-hidden-nav` fades/slides the whole header away.
 */
function clearTitleWithStateMarkers(viewContainerEl: HTMLElement) {
    viewContainerEl
        .querySelectorAll(`.${STATE_MENU_TITLE_WITH_STATE_CLASS}`)
        .forEach((el) => el.classList.remove(STATE_MENU_TITLE_WITH_STATE_CLASS));
}

/** Removes portal hosts and title-stack markers when a view no longer shows header state. */
export function clearStateMenuHeaderButtonContainer(viewContainerEl: HTMLElement) {
    clearTitleWithStateMarkers(viewContainerEl);
    viewContainerEl
        .querySelectorAll(`.${STATE_MENU_HEADER_BUTTON_CONTAINER_CLASS}`)
        .forEach((el) => el.remove());
}

export function ensureStateMenuHeaderButtonContainer(viewContainerEl: HTMLElement): HTMLElement | null {
    const headerEl =
        (viewContainerEl.querySelector('.view-header') as HTMLElement | null) ??
        (viewContainerEl.children[0] instanceof HTMLElement ? viewContainerEl.children[0] : null);
    const existing = viewContainerEl.querySelector(
        `.${STATE_MENU_HEADER_BUTTON_CONTAINER_CLASS}`,
    ) as HTMLElement | null;
    const titleContainerEl = headerEl?.querySelector(
        '.view-header-title-container',
    ) as HTMLElement | null;

    if (headerEl && isViewHeaderUsable(headerEl) && isElementVisiblyLaidOut(titleContainerEl)) {
        const host = existing ?? titleContainerEl.createDiv(STATE_MENU_HEADER_BUTTON_CONTAINER_CLASS);
        host.classList.remove(STATE_MENU_HEADER_CHROME_CLASS, STATE_MENU_HEADER_STICKY_CLASS);
        if (host.parentElement !== titleContainerEl) {
            titleContainerEl.appendChild(host);
        }
        clearTitleWithStateMarkers(viewContainerEl);
        // Lets project browse CSS stack the leaf title above Set State without :has().
        titleContainerEl.classList.add(STATE_MENU_TITLE_WITH_STATE_CLASS);
        return host;
    }

    clearTitleWithStateMarkers(viewContainerEl);

    if (headerEl && isViewHeaderUsable(headerEl)) {
        // Host directly on the header so CSS can center it across the full bar
        // (view-header-left would keep the control left-aligned on phone).
        const host =
            existing ??
            headerEl.createDiv({
                cls: `${STATE_MENU_HEADER_BUTTON_CONTAINER_CLASS} ${STATE_MENU_HEADER_CHROME_CLASS}`,
            });
        host.classList.add(STATE_MENU_HEADER_CHROME_CLASS);
        host.classList.remove(STATE_MENU_HEADER_STICKY_CLASS);
        if (host.parentElement !== headerEl) {
            headerEl.appendChild(host);
        }
        return host;
    }

    const contentEl = viewContainerEl.querySelector('.view-content') as HTMLElement | null;
    if (!contentEl) return existing;

    const host =
        existing ??
        contentEl.createDiv({
            cls: `${STATE_MENU_HEADER_BUTTON_CONTAINER_CLASS} ${STATE_MENU_HEADER_STICKY_CLASS}`,
        });
    host.classList.add(STATE_MENU_HEADER_STICKY_CLASS);
    host.classList.remove(STATE_MENU_HEADER_CHROME_CLASS);
    if (host.parentElement !== contentEl) {
        contentEl.insertBefore(host, contentEl.firstChild);
    }
    return host;
}
