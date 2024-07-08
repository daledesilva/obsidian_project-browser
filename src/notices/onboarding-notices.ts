import { createNoticeTemplate, createNoticeCtaBar, launchPersistentNotice } from 'src/components/dom-components/notice-components';
import ProjectBrowserPlugin from 'src/main';

///////////
///////////

export function showOnboardingNotices_maybe(plugin: ProjectBrowserPlugin): boolean {
    // Bail if it's already been shown enough times
    if(plugin.settings.onboardingNotices.welcomeNoticeRead) return false;
    showOnboardingNotices(plugin);
    return true;
}

//////////

let noticeShowingOrDismissed: boolean = false;
export async function showOnboardingNotices(plugin: ProjectBrowserPlugin) {
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
        primaryLabel: `Let's go!`,
        tertiaryLabel: 'Dismiss for now',
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
            showDevelopmentWelcomeNotice(plugin);
        });
    }

}

// function showHandwritingWelcomeTip(plugin: ProjectBrowserPlugin) {
//     const noticeBody = createInkNoticeTemplate();
//     noticeBody.createEl('h1').setText(`Inserting handwriting sections...`);
//     noticeBody.createEl('p').setText(`In any markdown note, run the following command to begin writing where your cursor is.`);
//     noticeBody.createEl('blockquote').setText(`"Insert new handwriting section"`);
//     noticeBody.createEl('p').setText(`( Cmd+P or swipe down )`);
    
//     const {
//         primaryBtnEl,
//         tertiaryBtnEl
//     } = createNoticeCtaBar(noticeBody, {
//         primaryLabel: 'Continue',
//         tertiaryLabel: 'Dismiss for now',
//     })

//     const notice = launchPersistentNotice(noticeBody);

//     if(primaryBtnEl) {
//         primaryBtnEl.addEventListener('click', () => {
//             notice.hide();
//             showDrawingWelcomeTip(plugin);
//         });
//     }
    
// }

// function showDrawingWelcomeTip(plugin: ProjectBrowserPlugin) {
//     const noticeBody = createInkNoticeTemplate();
//     noticeBody.createEl('h1').setText(`Drawing sections...`);
//     noticeBody.createEl('p').setText(`Drawing sections are in early development.`);
//     noticeBody.createEl('p').setText(`You can turn them on in the settings (and restart Obsidian) if you'd like to begin using them.`);

//     const {
//         primaryBtnEl,
//         tertiaryBtnEl
//     } = createNoticeCtaBar(noticeBody, {
//         primaryLabel: 'Continue',
//         tertiaryLabel: 'Dismiss for now',
//     })

//     const notice = launchPersistentNotice(noticeBody);

//     if(primaryBtnEl) {
//         primaryBtnEl.addEventListener('click', () => {
//             notice.hide();
//             showSyncingWelcomeTip(plugin);
//         });
//     }
    
// }

// function showSyncingWelcomeTip(plugin: ProjectBrowserPlugin) {
//     const noticeBody = createInkNoticeTemplate();
//     noticeBody.createEl('h1').setText(`Syncing with your vault...`);
//     noticeBody.createEl('p').setText(`Ink files live in your vault and can sync with it to other devices.`);
//     noticeBody.createEl('p').setText(`If using Obsidian Sync, turn on "Sync all other types" in the Obsidian Sync settings.`);

//     const {
//         primaryBtnEl,
//         tertiaryBtnEl
//     } = createNoticeCtaBar(noticeBody, {
//         primaryLabel: 'Continue',
//         tertiaryLabel: 'Dismiss for now',
//     })

//     const notice = launchPersistentNotice(noticeBody);

//     if(primaryBtnEl) {
//         primaryBtnEl.addEventListener('click', () => {
//             notice.hide();
//             showDevelopmentWelcomeTip(plugin);
//         });
//     }
    
// }


function showDevelopmentWelcomeNotice(plugin: ProjectBrowserPlugin) {
    const noticeBody = createNoticeTemplate();
    noticeBody.createEl('h1').setText(`Help improve Ink...`);
    noticeBody.createEl('p').setText(`Ink is under construction. This means it has features missing and sometimes has bugs.`);
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
            plugin.settings.onboardingNotices.welcomeTipRead = true;
            plugin.settings.onboardingNotices.lastVersionTipRead = plugin.manifest.version;
            plugin.saveSettings();
        });
    }
    
}