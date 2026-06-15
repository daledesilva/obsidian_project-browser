import { describe, expect, test, jest } from "@jest/globals";

describe("getFileDisplayName", () => {
  test("returns first alias when useAliases enabled and aliases exist", () => {
    jest.isolateModules(() => {
      jest.doMock("./stores", () => ({
        getGlobals: () => ({ plugin: { settings: { useAliases: true } } }),
      }));
      jest.doMock("./frontmatter-processes", () => ({
        getFileAliases: () => ["Alias Name"],
      }));
      const { getFileDisplayName } = require("./get-file-display-name");
      const file = { basename: "Base" } as unknown;
      expect(getFileDisplayName(file)).toBe("Alias Name");
    });
  });

  test("returns basename when useAliases disabled", () => {
    jest.isolateModules(() => {
      jest.doMock("./stores", () => ({
        getGlobals: () => ({ plugin: { settings: { useAliases: false } } }),
      }));
      jest.doMock("./frontmatter-processes", () => ({
        getFileAliases: () => ["Alias Name"],
      }));
      const { getFileDisplayName } = require("./get-file-display-name");
      const file = { basename: "Base" } as unknown;
      expect(getFileDisplayName(file)).toBe("Base");
    });
  });

  test("returns basename when no aliases", () => {
    jest.isolateModules(() => {
      jest.doMock("./stores", () => ({
        getGlobals: () => ({ plugin: { settings: { useAliases: true } } }),
      }));
      jest.doMock("./frontmatter-processes", () => ({
        getFileAliases: () => null,
      }));
      const { getFileDisplayName } = require("./get-file-display-name");
      const file = { basename: "Base" } as unknown;
      expect(getFileDisplayName(file)).toBe("Base");
    });
  });

  test("returns file.name for non-md file when showFileExtForNonMdFiles enabled", () => {
    jest.isolateModules(() => {
      jest.doMock("./stores", () => ({
        getGlobals: () => ({
          plugin: { settings: { useAliases: false, showFileExtForNonMdFiles: true } },
        }),
      }));
      jest.doMock("./frontmatter-processes", () => ({
        getFileAliases: () => null,
      }));
      const { getFileDisplayName } = require("./get-file-display-name");
      const file = { basename: "document", name: "document.pdf", extension: "pdf" } as unknown;
      expect(getFileDisplayName(file)).toBe("document.pdf");
    });
  });

  test("returns basename for non-md file when showFileExtForNonMdFiles disabled", () => {
    jest.isolateModules(() => {
      jest.doMock("./stores", () => ({
        getGlobals: () => ({
          plugin: { settings: { useAliases: false, showFileExtForNonMdFiles: false } },
        }),
      }));
      jest.doMock("./frontmatter-processes", () => ({
        getFileAliases: () => null,
      }));
      const { getFileDisplayName } = require("./get-file-display-name");
      const file = { basename: "document", name: "document.pdf", extension: "pdf" } as unknown;
      expect(getFileDisplayName(file)).toBe("document");
    });
  });

  test("returns basename for canvas file regardless of showFileExtForNonMdFiles", () => {
    jest.isolateModules(() => {
      jest.doMock("./stores", () => ({
        getGlobals: () => ({
          plugin: { settings: { useAliases: false, showFileExtForNonMdFiles: true } },
        }),
      }));
      jest.doMock("./frontmatter-processes", () => ({
        getFileAliases: () => null,
      }));
      const { getFileDisplayName } = require("./get-file-display-name");
      const file = { basename: "my-canvas", name: "my-canvas.canvas", extension: "canvas" } as unknown;
      expect(getFileDisplayName(file)).toBe("my-canvas");
    });
  });

  test("returns basename for base file regardless of showFileExtForNonMdFiles", () => {
    jest.isolateModules(() => {
      jest.doMock("./stores", () => ({
        getGlobals: () => ({
          plugin: { settings: { useAliases: false, showFileExtForNonMdFiles: true } },
        }),
      }));
      jest.doMock("./frontmatter-processes", () => ({
        getFileAliases: () => null,
      }));
      const { getFileDisplayName } = require("./get-file-display-name");
      const file = { basename: "my-base", name: "my-base.base", extension: "base" } as unknown;
      expect(getFileDisplayName(file)).toBe("my-base");
    });
  });
});

describe("getFileDisplayNameParts", () => {
  test("returns basename and extension for non-document when showFileExtForNonMdFiles enabled", () => {
    jest.isolateModules(() => {
      jest.doMock("./stores", () => ({
        getGlobals: () => ({
          plugin: { settings: { useAliases: false, showFileExtForNonMdFiles: true } },
        }),
      }));
      jest.doMock("./frontmatter-processes", () => ({
        getFileAliases: () => null,
      }));
      const { getFileDisplayNameParts } = require("./get-file-display-name");
      const file = { basename: "document", name: "document.pdf", extension: "pdf" } as unknown;
      const result = getFileDisplayNameParts(file);
      expect(result).toEqual({ basename: "document", extension: ".pdf" });
    });
  });

  test("returns basename and null extension for document type", () => {
    jest.isolateModules(() => {
      jest.doMock("./stores", () => ({
        getGlobals: () => ({
          plugin: { settings: { useAliases: false, showFileExtForNonMdFiles: true } },
        }),
      }));
      jest.doMock("./frontmatter-processes", () => ({
        getFileAliases: () => null,
      }));
      const { getFileDisplayNameParts } = require("./get-file-display-name");
      const file = { basename: "my-canvas", name: "my-canvas.canvas", extension: "canvas" } as unknown;
      const result = getFileDisplayNameParts(file);
      expect(result).toEqual({ basename: "my-canvas", extension: null });
    });
  });

  test("returns basename and null extension when showFileExtForNonMdFiles disabled", () => {
    jest.isolateModules(() => {
      jest.doMock("./stores", () => ({
        getGlobals: () => ({
          plugin: { settings: { useAliases: false, showFileExtForNonMdFiles: false } },
        }),
      }));
      jest.doMock("./frontmatter-processes", () => ({
        getFileAliases: () => null,
      }));
      const { getFileDisplayNameParts } = require("./get-file-display-name");
      const file = { basename: "document", name: "document.pdf", extension: "pdf" } as unknown;
      const result = getFileDisplayNameParts(file);
      expect(result).toEqual({ basename: "document", extension: null });
    });
  });

  test("returns alias and null extension when useAliases enabled", () => {
    jest.isolateModules(() => {
      jest.doMock("./stores", () => ({
        getGlobals: () => ({ plugin: { settings: { useAliases: true } } }),
      }));
      jest.doMock("./frontmatter-processes", () => ({
        getFileAliases: () => ["Alias Name"],
      }));
      const { getFileDisplayNameParts } = require("./get-file-display-name");
      const file = { basename: "Base", extension: "md" } as unknown;
      const result = getFileDisplayNameParts(file);
      expect(result).toEqual({ basename: "Alias Name", extension: null });
    });
  });
});


