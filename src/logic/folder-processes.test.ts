import { describe, expect, test, jest } from "@jest/globals";

/**
 * Unit tests for folder-processes (0.1.3: folder settings file excluded from Project Browser).
 */
describe("folder-processes", () => {
  describe("getSortedSectionsInFolder", () => {
    test("excludes .pbs files from all sections (0.1.3 regression)", () => {
      jest.isolateModules(() => {
        const { TFile, TFolder } = require("obsidian");

        const mdFile = new TFile("note-1.md");
        const pbsFile = new TFile("folder-settings.pbs");

        const folder = new TFolder("");
        folder.path = "Project A";
        folder.children = [mdFile, pbsFile];
        folder.vault = { getAbstractFileByPath: () => null };

        const mockGetFileStateName = jest.fn((file: { name: string }) =>
          file.name === "note-1.md" ? "Idea" : null
        );

        jest.doMock("./frontmatter-processes", () => ({
          getFileStateName: mockGetFileStateName,
        }));

        jest.doMock("./stores", () => ({
          getGlobals: () => ({
            plugin: {
              settings: {
                states: {
                  visible: [{ name: "Idea" }],
                  hidden: [],
                },
                folders: { defaultView: "Small" as const },
                stateless: { name: "", defaultView: "List" as const },
                fileTypes: {
                  projectBrowser: {
                    visible: ["md", "canvas", "pdf"],
                    hidden: ["pbs"],
                  },
                  pageMenu: {
                    visible: ["md", "canvas", "pdf"],
                    hidden: ["pbs"],
                  },
                },
              },
            },
          }),
        }));

        jest.doMock("./section-processes", () => {
          const actual = jest.requireActual("./section-processes");
          return {
            ...actual,
            getStateSettings: () => ({ name: "", defaultView: "List" }),
          };
        });

        const { getSortedSectionsInFolder } = require("./folder-processes");
        const sections = getSortedSectionsInFolder(folder);

        const allItems = sections.flatMap((s) => s.items);
        const pbsFiles = allItems.filter(
          (item: { name?: string; extension?: string }) =>
            item.extension?.toLowerCase() === "pbs" ||
            (typeof item.name === "string" && item.name.endsWith(".pbs"))
        );
        expect(pbsFiles).toHaveLength(0);
      });
    });
  });

  describe("filterSectionByString", () => {
    test("filters items by name (case-insensitive)", () => {
      const { filterSectionByString } = require("./folder-processes");
      const section = {
        type: "state" as const,
        title: "Idea",
        items: [
          { name: "Alpha Note" },
          { name: "Beta Document" },
          { name: "Alpha Project" },
        ] as { name: string }[],
        settings: {} as unknown,
      };
      filterSectionByString(section, "alpha");
      expect(section.items).toHaveLength(2);
      expect(section.items.map((i) => i.name)).toEqual(["Alpha Note", "Alpha Project"]);
    });

    test("keeps all items when search string is empty", () => {
      const { filterSectionByString } = require("./folder-processes");
      const section = {
        type: "state" as const,
        title: "Idea",
        items: [{ name: "Note1" }, { name: "Note2" }] as { name: string }[],
        settings: {} as unknown,
      };
      filterSectionByString(section, "");
      expect(section.items).toHaveLength(2);
    });
  });

  describe("filterSectionsByString", () => {
    test("filters non-folder sections only", () => {
      const { filterSectionsByString } = require("./folder-processes");
      const stateSection = {
        type: "state" as const,
        title: "Idea",
        items: [{ name: "Alpha Note" }, { name: "Beta Document" }] as { name: string }[],
        settings: {} as unknown,
      };
      const folderSection = {
        type: "folders" as const,
        title: "folders",
        items: [{ name: "FolderA" }] as { name: string }[],
        settings: {} as unknown,
      };
      filterSectionsByString([stateSection, folderSection], "alpha");
      expect(stateSection.items).toHaveLength(1);
      expect(stateSection.items[0].name).toBe("Alpha Note");
      expect(folderSection.items).toHaveLength(1);
    });
  });
});
