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
    noticeBody.createEl('h1').setText(`Changes in Project Browser v0.2`);
    // noticeBody.createEl('p').setText(`Added:`);
    const listEl = noticeBody.createEl('ul');
    listEl.createEl('li').setText(`Project Browser can now show note aliases (Turn on in settings).`);
    listEl.createEl('li').setText(`States can now be links (Turn on in each state's settings).`);
    listEl.createEl('li').setText(`Toggle the state menu on/off in settings or with Cmd+Shift+S.`);
    listEl.createEl('li').setText(`Cycle the active note's state forward with Cmd+Shift+D.`);
    listEl.createEl('li').setText(`Cycle the active note's state backward with Cmd+Shift+A.`);
    
    noticeBody.createEl('p').setText(`Note: State changes in settings won't update existing notes yet.`);
    
    const link = noticeBody.createEl('a');
    link.setAttribute('href', 'https://youtube.com/live/_Sv6foasgyg')
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