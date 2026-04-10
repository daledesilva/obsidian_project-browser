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
    noticeBody.createEl('h1').setText(`Changes in Project Browser v0.4`);
    // noticeBody.createEl('p').setText(`Added:`);
    const listEl = noticeBody.createEl('ul');
    listEl.createEl('li').setText(`Added note priorities.`);
    listEl.createEl('li').setText(`Added quick menu to sections.`);
    listEl.createEl('li').setText(`Markdown is now stripped from preview text.`);
    listEl.createEl('li').setText(`Fixed initial state not being applied.`);
    listEl.createEl('li').setText(`Fixed errors in styling of notices.`);
        
    const link = noticeBody.createEl('a');
    link.setAttribute('href', 'https://youtu.be/OehEyapjCO8')
    link.setText(`View release video`);

    noticeBody.createEl('h2').setText('Also...');
    noticeBody.createEl('p').appendText('Multi-page projects are coming in version 0.4!');

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