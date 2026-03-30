import { describe, expect, test, jest } from "@jest/globals";

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
