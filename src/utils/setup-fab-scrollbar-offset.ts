/**
 * Sets up scrollbar detection for FAB containers. When the scroll container has a
 * visible vertical scrollbar, sets --ddc-pb-fab-right-offset so the FAB can shift left.
 * Uses ResizeObserver to react to content and pane size changes.
 */
export const FAB_RIGHT_OFFSET_CSS_VAR = '--ddc-pb-fab-right-offset';

const SCROLL_CONTAINER_SELECTORS = ['.cm-scroller', '.ddc_pb_browser'];

export function setupFabScrollbarOffset(
    fabContainerEl: HTMLElement,
    leafContainerEl: HTMLElement
): () => void {
    function updateOffset() {
        let scroller: HTMLElement | null = null;
        for (const selector of SCROLL_CONTAINER_SELECTORS) {
            const el = leafContainerEl.querySelector(selector);
            if (el && el instanceof HTMLElement) {
                scroller = el;
                break;
            }
        }
        if (!scroller) {
            fabContainerEl.style.setProperty(FAB_RIGHT_OFFSET_CSS_VAR, '0px');
            return;
        }
        const hasVerticalScrollbar = scroller.scrollHeight > scroller.clientHeight;
        if (!hasVerticalScrollbar) {
            fabContainerEl.style.setProperty(FAB_RIGHT_OFFSET_CSS_VAR, '0px');
            return;
        }
        const scrollbarWidth = scroller.offsetWidth - scroller.clientWidth;
        fabContainerEl.style.setProperty(FAB_RIGHT_OFFSET_CSS_VAR, `${scrollbarWidth}px`);
    }

    updateOffset();

    let scroller: Element | null = null;
    for (const selector of SCROLL_CONTAINER_SELECTORS) {
        const el = leafContainerEl.querySelector(selector);
        if (el) {
            scroller = el;
            break;
        }
    }
    if (!scroller) return () => {};

    const resizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(updateOffset);
    });
    resizeObserver.observe(scroller);

    // When content grows while typing, .cm-scroller's size may not change (it's viewport-fixed).
    // Observe .cm-content too when present.
    if (scroller.classList.contains('cm-scroller')) {
        const content = scroller.querySelector('.cm-content');
        if (content) {
            resizeObserver.observe(content);
        }
    }

    return () => resizeObserver.disconnect();
}
