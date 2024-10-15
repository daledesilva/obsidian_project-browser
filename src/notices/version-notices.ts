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
    noticeBody.createEl('h1').setText(`Changes in Ink v0.1`);
    noticeBody.createEl('p').setText(`Added:`);
    const listEl = noticeBody.createEl('ul');
    listEl.createEl('li').setText(`Search directly in the browser view.`);
    listEl.createEl('li').setText(`Change notes states on right click.`);
    listEl.createEl('li').setText(`Hide/Unhide folders.`);
    listEl.createEl('li').setText(`Open notes in a background tab.`);
    listEl.createEl('li').setText(`Rename files and folders.`);
    listEl.createEl('li').setText(`Set a launch folder other than root.`);
    
    const link = noticeBody.createEl('a');
    link.setAttribute('href', 'https://youtube.com/live/Rxfr4nK4FjY?feature=share')
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
            plugin.saveSettings();
        });
    }
    
}