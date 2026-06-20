import { createNoticeTemplate, createNoticeCtaBar, launchPersistentNotice } from 'src/components/dom-components/notice-components';
import { getGlobals } from 'src/logic/stores';

///////////
///////////

export function showOnboardingNotices_maybe(): boolean {
    const {plugin} = getGlobals();
    if(plugin.settings.onboardingNotices.welcomeNoticeRead) return false;
    void showOnboardingNotices();
    return true;
}

export function showWelcomeTips() {
    noticeShowingOrDismissed = false;
    void showOnboardingNotices();
}

let noticeShowingOrDismissed: boolean = false;
export async function showOnboardingNotices() {
    const {plugin} = getGlobals();
    if(noticeShowingOrDismissed) return;
    noticeShowingOrDismissed = true;

    const { noticeBody, scrollAreaEl, footerEl } = createNoticeTemplate(1,3);
    scrollAreaEl.createEl('h1').setText(`Welcome to Project Browser`);
    scrollAreaEl.createEl('p').setText(`Project Browser is designed to simplify file navigation and help you focus on your priority projects.`);
    scrollAreaEl.createEl('p').setText(`Here's a quick rundown to help you get started...`);
    
    const {
        primaryBtnEl,
        tertiaryBtnEl
    } = createNoticeCtaBar(footerEl, {
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
    const { noticeBody, scrollAreaEl, footerEl } = createNoticeTemplate();
    scrollAreaEl.createEl('h1').setText(`The Browse view...`);
    scrollAreaEl.createEl('p').setText(`By default, the Browse view appears when you create a new tab. You can also open it from the button in the ribbon menu.`);
    // scrollAreaEl.createEl('icon');
    
    const {
        primaryBtnEl,
        tertiaryBtnEl
    } = createNoticeCtaBar(footerEl, {
        primaryLabel: 'Continue',
        tertiaryLabel: 'Remind me later',
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
    const { noticeBody, scrollAreaEl, footerEl } = createNoticeTemplate();
    scrollAreaEl.createEl('h1').setText(`Note states...`);
    scrollAreaEl.createEl('p').setText(`The state of each note can be assigned through a button at the top of the note or through the command shortcuts (Cmd+Shift+D and Cmd+Shift+A).`);
    scrollAreaEl.createEl('p').setText(`Notes in each folder are organised in the browse view by their state.`);

    const {
        primaryBtnEl,
        tertiaryBtnEl
    } = createNoticeCtaBar(footerEl, {
        primaryLabel: 'Continue',
        tertiaryLabel: 'Remind me later',
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
    const { noticeBody, scrollAreaEl, footerEl } = createNoticeTemplate();
    scrollAreaEl.createEl('h1').setText(`Customisation...`);
    scrollAreaEl.createEl('p').setText(`The states and their order can be customised in the settings. As well as when the browse view opens and a growing set of other features.`);
    scrollAreaEl.createEl('p').setText(`The state menu in each note can also be hidden with Cmd+Shift+S.`);

    const {
        primaryBtnEl,
        tertiaryBtnEl
    } = createNoticeCtaBar(footerEl, {
        primaryLabel: 'Continue',
        tertiaryLabel: 'Remind me later',
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
    const { noticeBody, scrollAreaEl, footerEl } = createNoticeTemplate();
    scrollAreaEl.createEl('h1').setText(`Get involved...`);
    scrollAreaEl.createEl('p').setText(`If you notice any bugs, please report them through the link in the settings.`);
    scrollAreaEl.createEl('p').setText(`You can also follow along with development and let me know which features are important to you at the links below.`);

    const {
        tertiaryBtnEl
    } = createNoticeCtaBar(footerEl, {
        footerLinks: [
            {
                href: 'https://www.youtube.com/playlist?list=PLAiv7XV4xFx3_JUHGUp_vrqturMTsoBUZ',
                label: 'View dev diaries',
            },
            {
                href: 'https://designdebt.club/socials',
                label: 'Follow on socials',
            },
        ],
        tertiaryLabel: 'Dismiss',
    })

    const notice = launchPersistentNotice(noticeBody);

    if(tertiaryBtnEl) {
        tertiaryBtnEl.addEventListener('click', () => {
            notice.hide();
            noticeShowingOrDismissed = false;
            plugin.settings.onboardingNotices.welcomeNoticeRead = true;
            plugin.settings.onboardingNotices.lastVersionNoticeRead = plugin.manifest.version;
            void plugin.saveSettings();
        });
    }
    
}
