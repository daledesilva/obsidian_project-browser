import { createNoticeTemplate, createNoticeCtaBar, launchPersistentNotice } from 'src/components/dom-components/notice-components';
import { getGlobals } from 'src/logic/stores';

///////////
///////////

export function showOnboardingNotices_maybe(): boolean {
    const {plugin} = getGlobals();
    // Bail if it's already been shown enough times
    if(plugin.settings.onboardingNotices.welcomeNoticeRead) return false;
    showOnboardingNotices();
    return true;
}

//////////

let noticeShowingOrDismissed: boolean = false;
export async function showOnboardingNotices() {
    const {plugin} = getGlobals();
    if(noticeShowingOrDismissed) return;
    noticeShowingOrDismissed = true;

    const noticeBody = createNoticeTemplate(1,3);
    noticeBody.createEl('h1').setText(`Welcome to Project Browser`);
    noticeBody.createEl('p').setText(`Project Browser is designed to simplify file navigation and help you focus on your priority projects.`);
    noticeBody.createEl('p').setText(`Here's a quick rundown to help you get started...`);
    
    const {
        primaryBtnEl,
        tertiaryBtnEl
    } = createNoticeCtaBar(noticeBody, {
        primaryLabel: `Read now`,
        tertiaryLabel: 'Remind me later',
    })
    
    const notice = launchPersistentNotice(noticeBody);

    if(tertiaryBtnEl) {
        tertiaryBtnEl.addEventListener('click', () => {
            notice.hide();
        });
    }
    if(primaryBtnEl) {
        primaryBtnEl.addEventListener('click', () => {
            notice.hide();
            showBrowserViewNotice();
        });
    }

}

function showBrowserViewNotice() {
    const {plugin} = getGlobals();
    const noticeBody = createNoticeTemplate();
    noticeBody.createEl('h1').setText(`The Browse view...`);
    noticeBody.createEl('p').setText(`By default, the Browse view appears when you create a new tab, but you can alter this in the settings.`);
    noticeBody.createEl('p').setText(`You can also open it from the button in the ribbon menu.`);
    // noticeBody.createEl('icon');
    
    const {
        primaryBtnEl,
        tertiaryBtnEl
    } = createNoticeCtaBar(noticeBody, {
        primaryLabel: 'Continue',
        tertiaryLabel: 'Dismiss for now',
    })

    const notice = launchPersistentNotice(noticeBody);

    if(primaryBtnEl) {
        primaryBtnEl.addEventListener('click', () => {
            notice.hide();
            showNotesNotice();
        });
    }
    
}

function showNotesNotice() {
    const {plugin} = getGlobals();
    const noticeBody = createNoticeTemplate();
    noticeBody.createEl('h1').setText(`Note statuses...`);
    noticeBody.createEl('p').setText(`The status for a note can be assigned through a status button at the top of the note.`);
    noticeBody.createEl('p').setText(`Notes in each folder are organised in the browse view by status.`);

    const {
        primaryBtnEl,
        tertiaryBtnEl
    } = createNoticeCtaBar(noticeBody, {
        primaryLabel: 'Continue',
        tertiaryLabel: 'Dismiss for now',
    })

    const notice = launchPersistentNotice(noticeBody);

    if(primaryBtnEl) {
        primaryBtnEl.addEventListener('click', () => {
            notice.hide();
            showCustomisationNotice();
        });
    }
    
}

function showCustomisationNotice() {
    const {plugin} = getGlobals();
    const noticeBody = createNoticeTemplate();
    noticeBody.createEl('h1').setText(`Customisation...`);
    noticeBody.createEl('p').setText(`The set of statuses, their order, and the view mode they display their notes in can all be customised in the settings.`);

    const {
        primaryBtnEl,
        tertiaryBtnEl
    } = createNoticeCtaBar(noticeBody, {
        primaryLabel: 'Continue',
        tertiaryLabel: 'Dismiss for now',
    })

    const notice = launchPersistentNotice(noticeBody);

    if(primaryBtnEl) {
        primaryBtnEl.addEventListener('click', () => {
            notice.hide();
            showDevelopmentWelcomeNotice();
        });
    }
    
}


function showDevelopmentWelcomeNotice() {
    const {plugin} = getGlobals();
    const noticeBody = createNoticeTemplate();
    noticeBody.createEl('h1').setText(`Help improve Project Browser...`);
    noticeBody.createEl('p').setText(`Project Browser is under construction. This means it has features missing and sometimes has bugs.`);
    noticeBody.createEl('p').setText(`If you notice any, please report them through the link in the settings.`);
    
    const {
        tertiaryBtnEl
    } = createNoticeCtaBar(noticeBody, {
        tertiaryLabel: 'Dismiss',
    })

    const notice = launchPersistentNotice(noticeBody);

    if(tertiaryBtnEl) {
        tertiaryBtnEl.addEventListener('click', () => {
            notice.hide();
            noticeShowingOrDismissed = false;
            plugin.settings.onboardingNotices.welcomeNoticeRead = true;
            plugin.settings.onboardingNotices.lastVersionNoticeRead = plugin.manifest.version;
            plugin.saveSettings();
        });
    }
    
}