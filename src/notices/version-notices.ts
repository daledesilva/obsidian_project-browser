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
    noticeBody.createEl('h1').setText(`Changes in Project Browser v0.3`);
    // noticeBody.createEl('p').setText(`Added:`);
    const listEl = noticeBody.createEl('ul');
    listEl.createEl('li').setText(`Added priority context menu in browse view (Right click or hold on a note).`);
    listEl.createEl('li').setText(`Fixed initial state not being applied when new file is created within a state section.`);
    listEl.createEl('li').setText(`Fixed errors in styling of notices.`);
    
    const link = noticeBody.createEl('a');
    link.setAttribute('href', 'https://youtube.com/live/RkCLDY7WYrc?feature=share')
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