import * as semVer from 'semver';
import { createNoticeTemplate, createNoticeCtaBar, launchPersistentNotice } from 'src/components/dom-components/notice-components';
import { getGlobals } from 'src/logic/stores';

///////////
///////////

export function showVersionNotice() {
    const {plugin} = getGlobals()
    const curVersion = plugin.manifest.version;

    const lastVersionTipRead = plugin.settings.onboardingNotices.lastVersionNoticeRead;
    const noLastVersionTipRead = !semVer.valid(lastVersionTipRead)
    const updatedToNewerVersion = semVer.gt(curVersion, lastVersionTipRead);

    if(noLastVersionTipRead || updatedToNewerVersion) {
        showLatestChanges();
    }
}

//////////

function showLatestChanges() {
    const {plugin} = getGlobals()

    const noticeBody = createNoticeTemplate(1,3);
    noticeBody.createEl('h1').setText(`Project Browser v0.4`);
    noticeBody.createEl('p').setText(`Added:`);
    let listEl = noticeBody.createEl('ul');
    listEl.createEl('li').setText(`Multi-page projects are here!`);
    listEl.createEl('li').setText(`Every note, base, or canvas is already considered a project and can have multiple pages added to it`);
    listEl.createEl('li').setText(`Custom states for pages.`);
    listEl.createEl('li').setText(`Convert folders to projects.`);
    listEl.createEl('li').setText(`File type visibility options.`);
    listEl.createEl('li').setText(`File extension visibility option.`);
    listEl.createEl('li').setText(`Reveal files/folders in Project Browser from files pane.`);
    listEl.createEl('li').setText(`Design tweaks to floating buttons.`);
    listEl.createEl('li').setText(`Fixed stateless sections ignoring quick menu settings.`);
    listEl.createEl('li').setText(`Fixed files/folders moving to the vault root upon renaming.`);
    
    noticeBody.createEl('p').setText(`Breaking changes:`);
    listEl = noticeBody.createEl('ul');
    listEl.createEl('li').setText(`Default hotkeys have been removed to align with Obsidian recommendations. Set you preferred hotkeys in the Obsidian settings.`);
        
    const link = noticeBody.createEl('a');
    link.setAttribute('href', 'https://youtu.be/na0eSecbRUI')
    link.setText(`View release video`);

    // Prevent clicking link from closing notice
    link.onClickEvent( e => e.stopPropagation())
        
    const {
        tertiaryBtnEl
    } = createNoticeCtaBar(noticeBody, {
        tertiaryLabel: 'Dismiss',
    })

    const notice = launchPersistentNotice(noticeBody);

    if(tertiaryBtnEl) {
        tertiaryBtnEl.addEventListener('click', () => {
            notice.hide();
            plugin.settings.onboardingNotices.lastVersionNoticeRead = plugin.manifest.version;
            void plugin.saveSettings();
        });
    }
    
}