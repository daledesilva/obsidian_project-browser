import "./card-browser.scss";
import * as React from "react";
import { FolderSection } from "../section/folder-section";
import { StateSection } from "../section/state-section";
import { StatelessSection } from "../section/stateless-section";
import { TFile, TFolder } from "obsidian";
import { BackButtonAndPath } from "../back-button-and-path/back-button-and-path";
import {
  filterSectionsByString,
  getSortedSectionsInFolder,
  orderItemsInSections,
} from "src/logic/folder-processes";
// NEW: Import tag processes
import { getSortedSectionsByTag, TagFolder } from "src/logic/tag-processes";
import {
  CardBrowserViewEState,
  CardBrowserViewState,
  PartialCardBrowserViewState,
} from "src/views/card-browser-view/card-browser-view";
import { v4 as uuidv4 } from "uuid";
import { registerCardBrowserContextMenu } from "src/context-menus/card-browser-context-menu";
import { getGlobals } from "src/logic/stores";
import { SearchInput } from "../search-input/search-input";
import classNames from "classnames";
import { CardBrowserFloatingMenu } from "../card-browser-floating-menu/card-browser-floating-menu";

//////////
//////////

export const CardBrowserContext = React.createContext<{
  // Changed from TFolder to any to accept TagFolder without complex Typescript refactoring
  folder: null | TFolder | any;
  lastTouchedFilePath: string;
  rememberLastTouchedFile: (file: TFile) => void;
  openFolderInSameLeaf: (folder: TFolder | any) => void;
  rerender: () => void;
}>({
  folder: null,
  lastTouchedFilePath: "",
  rememberLastTouchedFile: () => {},
  openFolderInSameLeaf: () => {},
  rerender: () => {},
});

export interface CardBrowserHandlers {
  rerender: Function;
}
// export const cardBrowserHandlers = atom<CardBrowserHandlers>()

interface CardBrowserProps {
  path: string;
  setViewStateWithHistory: (viewState: PartialCardBrowserViewState) => void;
  rememberLastTouchedFilepath: (filepath: string) => {};
  resetLastTouchedFilepath: Function;
  getViewStates: () => {
    state: CardBrowserViewState;
    eState: CardBrowserViewEState;
  };
  passBackHandlers: (handlers: CardBrowserHandlers) => void;
}

export const CardBrowser = (props: CardBrowserProps) => {
  const { plugin } = getGlobals();
  const [viewInstanceId] = React.useState<string>(uuidv4());
  const [refreshId, setRefreshId] = React.useState<number>(uuidv4());
  const [searchActive, setSearchActive] = React.useState<boolean>(false);
  const [searchStr, setSearchStr] = React.useState<string>("");
  const { state, eState } = props.getViewStates();
  const browserRef = React.useRef(null);

  // const setCardBrowserHandlers = useSetAtom(cardBrowserHandlers);

  // const [files, setFiles] = useState
  const v = plugin.app.vault;

  // NEW: Logic to switch between Tag mode and Folder mode
  let initialFolder: any;
  let sectionsOfItems = [];

  if (plugin.settings.browserMode === "tag") {
    // TAG MODE
    // Treat path as tag path (e.g. "project/marketing")
    const tagPath =
      state.path === "/" || state.path === "root" ? "" : state.path;

    sectionsOfItems = getSortedSectionsByTag(tagPath);

    // Create a virtual folder object so the UI components (Breadcrumbs/Buttons) have something to read
    initialFolder = new TagFolder(
      tagPath === "" ? "All Tags" : tagPath.split("/").pop() || "Tag",
      tagPath,
      v,
    );
  } else {
    // FOLDER MODE (Original Logic)
    initialFolder = v.getFolderByPath(state.path) || v.getRoot();
    sectionsOfItems = getSortedSectionsInFolder(initialFolder);
  }

  // Filter whatever we found
  filterSectionsByString(sectionsOfItems, searchStr);

  const lastTouchedFilePath = eState?.lastTouchedFilePath || "";

  // on mount
  React.useEffect(() => {
    if (!plugin) return;

    props.passBackHandlers({
      rerender,
    });
    plugin.addGlobalFileDependant(`card-browser_${viewInstanceId}`, rerender);

    // NOTE: When the view is changed to something else, this is never given the chance to unmount.
    // Must removeDependant from elsewhere?
    // return;

    if (plugin && browserRef.current) {
      // Only register context menu if we are in folder mode (or handle tag mode inside context menu logic later)
      // For now, passing initialFolder (which might be TagFolder) might limit functionality of the context menu
      registerCardBrowserContextMenu(browserRef.current, initialFolder, {
        openFile: () => {}, // TODO: maybe remove this... it used to be a function
        getCurFolder,
      });
    }
  }, []);

  const getCurFolder = (): TFolder => {
    const curFolder =
      v.getFolderByPath(props.getViewStates().state.path) || v.getRoot();
    return curFolder;
  };

  function rerender() {
    setRefreshId(uuidv4());
  }

  return (
    <CardBrowserContext.Provider
      value={{
        folder: initialFolder,
        lastTouchedFilePath,
        openFolderInSameLeaf,
        rememberLastTouchedFile,
        rerender,
      }}
    >
      <div ref={browserRef} className="ddc_pb_browser">
        <BackButtonAndPath
          folder={initialFolder}
          onBackClick={openParentFolder}
          onFolderClick={(folder: TFolder) => openFolderInSameLeaf(folder)}
        />
        <div
          className={classNames([
            "ddc_pb_section",
            "ddc_pb_nav-and-filter-section",
          ])}
        >
          {sectionsOfItems.map((section) => (
            <React.Fragment key={section.title}>
              {section.type === "folders" && (
                <>
                  <FolderSection section={section} />
                </>
              )}
            </React.Fragment>
          ))}
          <SearchInput
            searchActive={searchActive}
            onChange={setSearchStr}
            hideSearchInput={() => setSearchActive(false)}
            showSearchInput={() => setSearchActive(true)}
          />
        </div>
        <div>
          {sectionsOfItems.map((section, index) => (
            <React.Fragment key={section.title}>
              {section.type !== "folders" &&
                (!searchActive ||
                  (searchActive && section.items.length > 0)) && (
                  <div>
                    {section.type === "state" && (
                      <StateSection section={section} />
                    )}
                    {section.type === "stateless" && (
                      <StatelessSection section={section} />
                    )}
                  </div>
                )}
            </React.Fragment>
          ))}
        </div>
        <CardBrowserFloatingMenu
          folder={initialFolder}
          searchActive={searchActive}
          activateSearch={() => setSearchActive(true)}
          deactivateSearch={() => setSearchActive(false)}
        />
      </div>
    </CardBrowserContext.Provider>
  );

  ////////

  function rememberLastTouchedFile(file: TFile) {
    props.rememberLastTouchedFilepath(file.path);
  }

  // Updated to accept TFolder OR TagFolder
  function openFolderInSameLeaf(nextFolder: any) {
    const { plugin } = getGlobals();
    let { workspace } = plugin.app;
    let leaf = workspace.getMostRecentLeaf();

    // TODO: Unwrap this (remove if)??
    if (leaf) {
      props.resetLastTouchedFilepath();
    }

    props.setViewStateWithHistory({
      path: nextFolder.path,
    });
  }

  // Updated logic to handle "Parent" of a Tag path (e.g. #tag/sub -> #tag)
  function openParentFolder() {
    if (plugin.settings.browserMode === "tag") {
      if (!state.path || state.path === "/" || state.path === "") return;
      const segments = state.path.split("/");
      segments.pop(); // remove last segment
      const nextPath = segments.join("/");
      props.setViewStateWithHistory({ path: nextPath });
    } else {
      // Original Folder Logic
      const nextFolder = initialFolder.parent;
      if (!nextFolder) return;
      openFolderInSameLeaf(nextFolder);
    }
  }
};

//////////
//////////

export default CardBrowser;
