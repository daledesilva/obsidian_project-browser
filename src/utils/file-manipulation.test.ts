import { beforeEach, describe, expect, test, jest } from "@jest/globals";
import { TFile, TFolder } from "obsidian";

jest.mock("src/logic/stores", () => ({
  getGlobals: jest.fn(),
}));

jest.mock("src/logic/frontmatter-processes", () => ({
  getFilePrioritySettings: jest.fn(),
  getFileStateSettings: jest.fn(),
  setFilePriority: jest.fn(),
  setFileState: jest.fn(),
}));

jest.mock("src/logic/get-state-by-name", () => ({
  getProjectPageStateByName: jest.fn(),
  getStateByName: jest.fn(),
}));

const { getGlobals } = jest.requireMock("src/logic/stores") as {
  getGlobals: jest.Mock;
};
const {
  getFilePrioritySettings,
  getFileStateSettings,
  setFilePriority,
  setFileState,
} = jest.requireMock("src/logic/frontmatter-processes") as {
  getFilePrioritySettings: jest.Mock;
  getFileStateSettings: jest.Mock;
  setFilePriority: jest.Mock;
  setFileState: jest.Mock;
};

function getParentPath(path: string): string {
  const lastSlashIndex = path.lastIndexOf("/");
  if (lastSlashIndex === -1) return "";
  return path.slice(0, lastSlashIndex);
}

function getEntryName(path: string): string {
  const parentPath = getParentPath(path);
  if (!parentPath) return path;
  return path.slice(parentPath.length + 1);
}

function createMockVault(constructors: { TFile: typeof TFile; TFolder: typeof TFolder }) {
  const { TFile: MockTFile, TFolder: MockTFolder } = constructors;
  const entries = new Map<string, any>();
  const fileContents = new Map<string, string>();

  const rootFolder = new MockTFolder() as TFolder & {
    children: any[];
    path: string;
    vault: any;
    name: string;
  };
  rootFolder.name = "";
  rootFolder.path = "";
  rootFolder.children = [];

  function updateFileIdentity(file: any, nextPath: string) {
    const nextName = getEntryName(nextPath);
    file.path = nextPath;
    file.name = nextName;
    file.basename = nextName.replace(/\.[^.]+$/, "");
    file.extension = nextName.includes(".") ? nextName.split(".").pop() : "";
  }

  function detachFromParent(entry: any, path: string) {
    const parentPath = getParentPath(path);
    const parentFolder = entries.get(parentPath);
    if (!parentFolder) return;

    parentFolder.children = parentFolder.children.filter((child: any) => child !== entry);
  }

  function attachToParent(entry: any, path: string) {
    const parentPath = getParentPath(path);
    const parentFolder = ensureFolder(parentPath);
    parentFolder.children.push(entry);
  }

  function moveFolderChildren(folder: any, previousPath: string, nextPath: string) {
    for (const child of folder.children) {
      const childRelativePath = child.path.slice(previousPath.length + 1);
      const nextChildPath = `${nextPath}/${childRelativePath}`;
      entries.delete(child.path);

      if (child instanceof MockTFolder) {
        child.path = nextChildPath;
        child.name = getEntryName(nextChildPath);
        entries.set(nextChildPath, child);
        moveFolderChildren(child, `${previousPath}/${childRelativePath}`, nextChildPath);
        continue;
      }

      const previousFilePath = child.path;
      updateFileIdentity(child, nextChildPath);
      entries.set(nextChildPath, child);
      fileContents.set(nextChildPath, fileContents.get(previousFilePath) ?? "");
      fileContents.delete(previousFilePath);
    }
  }

  function ensureFolder(path: string): any {
    if (!path) return rootFolder;

    const existingEntry = entries.get(path);
    if (existingEntry) return existingEntry;

    const parentPath = getParentPath(path);
    const parentFolder = ensureFolder(parentPath);
    const folder = new MockTFolder() as TFolder & {
      children: any[];
      path: string;
      vault: any;
      name: string;
    };
    folder.path = path;
    folder.name = getEntryName(path);
    folder.children = [];
    folder.vault = vault;
    parentFolder.children.push(folder);
    entries.set(path, folder);
    return folder;
  }

  const vault = {
    adapter: {
      exists: jest.fn(async (path: string) => entries.has(path)),
    },
    getAbstractFileByPath: jest.fn((path: string) => entries.get(path) ?? null),
    getFileByPath: jest.fn((path: string) => {
      const entry = entries.get(path);
      if (entry instanceof MockTFile) return entry;
      return null;
    }),
    createFolder: jest.fn(async (path: string) => ensureFolder(path)),
    create: jest.fn(async (path: string, content: string) => {
      const parentFolder = ensureFolder(getParentPath(path));
      const file = new MockTFile() as TFile & {
        path: string;
        vault: any;
        basename: string;
        extension: string;
        name: string;
      };

      updateFileIdentity(file, path);
      file.vault = vault;
      parentFolder.children.push(file);
      entries.set(path, file);
      fileContents.set(path, content);
      return file;
    }),
    rename: jest.fn(async (entry: any, nextPath: string) => {
      const previousPath = entry.path;
      detachFromParent(entry, previousPath);
      entries.delete(previousPath);

      if (entry instanceof MockTFolder) {
        entry.path = nextPath;
        entry.name = getEntryName(nextPath);
        entries.set(nextPath, entry);
        attachToParent(entry, nextPath);
        moveFolderChildren(entry, previousPath, nextPath);
        return;
      }

      updateFileIdentity(entry, nextPath);
      entries.set(nextPath, entry);
      attachToParent(entry, nextPath);
      fileContents.set(nextPath, fileContents.get(previousPath) ?? "");
      fileContents.delete(previousPath);
    }),
    read: jest.fn(async (file: any) => fileContents.get(file.path) ?? ""),
    modify: jest.fn(async (file: any, content: string) => {
      fileContents.set(file.path, content);
    }),
  };

  rootFolder.vault = vault;
  entries.set("", rootFolder);

  return {
    vault,
    rootFolder,
    ensureFolder,
    createMarkdownFile(path: string, content: string = "") {
      const file = new MockTFile() as TFile & {
        path: string;
        vault: any;
        basename: string;
        extension: string;
        name: string;
      };

      updateFileIdentity(file, path);
      file.vault = vault;
      const parentFolder = ensureFolder(getParentPath(path));
      parentFolder.children.push(file);
      entries.set(path, file);
      fileContents.set(path, content);
      return file;
    },
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  getFilePrioritySettings.mockReturnValue(null);
  getFileStateSettings.mockReturnValue(null);
});

describe("renameTFile", () => {
  test("keeps a nested file inside its parent folder when renamed", async () => {
    await jest.isolateModulesAsync(async () => {
      const renameMock = jest.fn(async () => undefined);
      const file = {
        path: "Parent Folder/note.md",
        extension: "md",
        vault: {
          rename: renameMock,
        },
      } as any;

      const { renameTFile } = require("./file-manipulation");
      const renamedPath = await renameTFile(file, "renamed-note");

      expect(renameMock).toHaveBeenCalledWith(file, "Parent Folder/renamed-note.md");
      expect(renamedPath).toBe("Parent Folder/renamed-note.md");
    });
  });

  test("keeps a file multiple folders deep in place when renamed", async () => {
    await jest.isolateModulesAsync(async () => {
      const renameMock = jest.fn(async () => undefined);
      const file = {
        path: "Area/Projects/Project A/Notes/note.md",
        extension: "md",
        vault: {
          rename: renameMock,
        },
      } as any;

      const { renameTFile } = require("./file-manipulation");
      const renamedPath = await renameTFile(file, "renamed-note");

      expect(renameMock).toHaveBeenCalledWith(file, "Area/Projects/Project A/Notes/renamed-note.md");
      expect(renamedPath).toBe("Area/Projects/Project A/Notes/renamed-note.md");
    });
  });

  test("keeps a root-level file at vault root when renamed", async () => {
    await jest.isolateModulesAsync(async () => {
      const renameMock = jest.fn(async () => undefined);
      const file = {
        path: "note.md",
        extension: "md",
        vault: {
          rename: renameMock,
        },
      } as any;

      const { renameTFile } = require("./file-manipulation");
      const renamedPath = await renameTFile(file, "renamed-note");

      expect(renameMock).toHaveBeenCalledWith(file, "renamed-note.md");
      expect(renamedPath).toBe("renamed-note.md");
    });
  });
});

describe("renameTFolder", () => {
  test("keeps a nested folder inside its parent folder when renamed", async () => {
    await jest.isolateModulesAsync(async () => {
      const renameMock = jest.fn(async () => undefined);
      const folder = {
        path: "Parent Folder/Child Folder",
        name: "Child Folder",
        vault: {
          rename: renameMock,
        },
      } as any;

      const { renameTFolder } = require("./file-manipulation");
      const renamedPath = await renameTFolder(folder, "Renamed Child Folder");

      expect(renameMock).toHaveBeenCalledWith(folder, "Parent Folder/Renamed Child Folder");
      expect(renamedPath).toBe("Parent Folder/Renamed Child Folder");
    });
  });

  test("keeps a folder multiple folders deep in place when renamed", async () => {
    await jest.isolateModulesAsync(async () => {
      const renameMock = jest.fn(async () => undefined);
      const folder = {
        path: "Area/Projects/Project A/Resources/Research",
        name: "Research",
        vault: {
          rename: renameMock,
        },
      } as any;

      const { renameTFolder } = require("./file-manipulation");
      const renamedPath = await renameTFolder(folder, "References");

      expect(renameMock).toHaveBeenCalledWith(folder, "Area/Projects/Project A/Resources/References");
      expect(renamedPath).toBe("Area/Projects/Project A/Resources/References");
    });
  });

  test("keeps a nested folder inside its project folder when renamed", async () => {
    await jest.isolateModulesAsync(async () => {
      const renameMock = jest.fn(async () => undefined);
      const folder = {
        path: "Projects/Project A/Research",
        name: "Research",
        vault: {
          rename: renameMock,
        },
      } as any;

      const { renameTFolder } = require("./file-manipulation");
      const renamedPath = await renameTFolder(folder, "References");

      expect(renameMock).toHaveBeenCalledWith(folder, "Projects/Project A/References");
      expect(renamedPath).toBe("Projects/Project A/References");
    });
  });
});

describe("createProjectFromNote", () => {
  test.each([
    {
      label: "at the vault root",
      notePath: "Original Note.md",
      expectedProjectPath: "Original Note",
    },
    {
      label: "inside a subfolder",
      notePath: "Work/Original Note.md",
      expectedProjectPath: "Work/Original Note",
    },
    {
      label: "multiple folders deep",
      notePath: "Work/Active/2026/Original Note.md",
      expectedProjectPath: "Work/Active/2026/Original Note",
    },
  ])("creates a project from a standalone markdown note $label", async ({ notePath, expectedProjectPath }) => {
    await jest.isolateModulesAsync(async () => {
      const noteStateSettings = { name: "In Progress" };
      const notePrioritySettings = { name: "High" };
      const isolatedObsidian = require("obsidian") as {
        TFile: typeof TFile;
        TFolder: typeof TFolder;
      };
      const mockVaultState = createMockVault(isolatedObsidian);
      const note = mockVaultState.createMarkdownFile(notePath, "# Existing content");
      const parentFolderPath = getParentPath(notePath);
      const parentFolder = mockVaultState.ensureFolder(parentFolderPath);

      getFileStateSettings.mockReturnValue(noteStateSettings);
      getFilePrioritySettings.mockReturnValue(notePrioritySettings);

      getGlobals.mockReturnValue({
        plugin: {
          app: {
            vault: mockVaultState.vault,
          },
          refreshFileDependants: jest.fn(),
          settings: {
            defaultProjectPageState: "",
            defaultState: "",
          },
        },
      });

      const { createProjectFromNote } = require("./file-manipulation");
      const secondPage = await createProjectFromNote(note, parentFolder);

      const projectFolder = mockVaultState.vault.getAbstractFileByPath(expectedProjectPath);
      const pageOne = mockVaultState.vault.getFileByPath(`${expectedProjectPath}/Page 1.md`);
      const folderSettingsFile = mockVaultState.vault.getFileByPath(`${expectedProjectPath}/folder-settings.pbs`);

      expect(projectFolder).toBeInstanceOf(isolatedObsidian.TFolder);
      expect(mockVaultState.vault.getAbstractFileByPath(notePath)).toBeNull();
      expect(pageOne).toBe(note);
      expect(note.path).toBe(`${expectedProjectPath}/Page 1.md`);
      expect(secondPage.path).toBe(`${expectedProjectPath}/Page 2.md`);
      expect(folderSettingsFile).toBeInstanceOf(isolatedObsidian.TFile);
      expect(await mockVaultState.vault.read(folderSettingsFile)).toContain('"isProject": true');
      expect(await mockVaultState.vault.read(folderSettingsFile)).toContain('"state": "In Progress"');
      expect(await mockVaultState.vault.read(folderSettingsFile)).toContain('"priority": "High"');
      expect(setFileState).toHaveBeenCalledWith(note, null);
      expect(setFilePriority).toHaveBeenCalledWith(note, null);
    });
  });

  test("normalizes legacy stateName and priorityName fields from existing pbs files", async () => {
    await jest.isolateModulesAsync(async () => {
      const isolatedObsidian = require("obsidian") as {
        TFile: typeof TFile;
        TFolder: typeof TFolder;
      };
      const mockVaultState = createMockVault(isolatedObsidian);
      const folder = mockVaultState.ensureFolder("Legacy Project");
      mockVaultState.createMarkdownFile(
        "Legacy Project/folder-settings.pbs",
        JSON.stringify({
          _description: "Obsidian Project Browser folder settings",
          isProject: true,
          stateName: "In Progress",
          priorityName: "High",
        })
      );

      getGlobals.mockReturnValue({
        plugin: {
          app: {
            vault: mockVaultState.vault,
          },
        },
      });

      const { getFolderSettings } = require("./file-manipulation") as typeof import("./file-manipulation");
      const folderSettings = await getFolderSettings(mockVaultState.vault as any, folder);

      expect(folderSettings.state).toBe("In Progress");
      expect(folderSettings.priority).toBe("High");
      expect((folderSettings as { stateName?: string }).stateName).toBeUndefined();
      expect((folderSettings as { priorityName?: string }).priorityName).toBeUndefined();
    });
  });
});

describe("setFolderPriority", () => {
  test("stores a folder priority and toggles it off when selected again", async () => {
    await jest.isolateModulesAsync(async () => {
      const mockVaultState = createMockVault(require("obsidian") as { TFile: typeof TFile; TFolder: typeof TFolder });
      const folder = mockVaultState.ensureFolder("Project A");
      const refreshFileDependants = jest.fn();

      getGlobals.mockReturnValue({
        plugin: {
          app: {
            vault: mockVaultState.vault,
          },
          refreshFileDependants,
        },
      });

      const { getFolderSettings, setFolderPriority } = require("./file-manipulation") as typeof import("./file-manipulation");

      await setFolderPriority(folder, { name: "High" });
      expect((await getFolderSettings(mockVaultState.vault as any, folder)).priority).toBe("High");

      await setFolderPriority(folder, { name: "High" });
      expect((await getFolderSettings(mockVaultState.vault as any, folder)).priority).toBeUndefined();
      expect(refreshFileDependants).toHaveBeenCalledTimes(2);
    });
  });
});
