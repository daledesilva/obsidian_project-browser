import { describe, expect, test, jest } from "@jest/globals";

/**
 * Unit tests for frontmatter-processes (0.3.1: timestamp preservation when changing state/priority).
 */

describe("processFrontMatterPreserveTimestamp", () => {
  test("restores mtime after processFrontMatter (0.3.1 regression)", async () => {
    jest.isolateModules(() => {
      const origMtime = 1000000;
      const mockFile = {
        path: "Project A/note-1.md",
        stat: { mtime: origMtime },
      };

      const modifyCalls: Array<{ content: string; options?: { mtime: number } }> = [];
      const processFrontMatterCalls: Array<(processor: (fm: unknown) => void) => void> = [];

      const mockProcessFrontMatter = jest.fn().mockImplementation(async (file: unknown, processor: (fm: unknown) => void) => {
        processFrontMatterCalls.push(processor);
        processor({ state: "Idea" });
      });

      const mockVault = {
        getAbstractFileByPath: jest.fn().mockReturnValue(mockFile),
        read: jest.fn().mockResolvedValue("---\nstate: Idea\n---\n\nContent"),
        modify: jest.fn().mockImplementation((_file: unknown, content: string, options?: { mtime: number }) => {
          modifyCalls.push({ content, options });
        }),
      };

      jest.doMock("src/logic/stores", () => ({
        getGlobals: () => ({
          plugin: {
            app: {
              fileManager: {
                processFrontMatter: mockProcessFrontMatter,
              },
              vault: mockVault,
            },
            refreshFileDependants: jest.fn(),
          },
        }),
      }));

      const { processFrontMatterPreserveTimestamp } = require("./frontmatter-processes");

      return processFrontMatterPreserveTimestamp(mockFile, (frontmatter: unknown) => {
        frontmatter.state = "Drafting";
      }).then(() => {
        expect(mockVault.modify).toHaveBeenCalled();
        const modifyCall = modifyCalls[modifyCalls.length - 1];
        expect(modifyCall?.options?.mtime).toBe(origMtime);
      });
    });
  });
});
