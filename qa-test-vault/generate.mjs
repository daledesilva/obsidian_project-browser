#!/usr/bin/env node
/**
 * Generates the E2E test vault for Project Browser.
 * Run: node qa-test-vault/generate.mjs
 * Or via: npm run test:e2e (runs this automatically)
 *
 * Creates folders, notes with state frontmatter, and .obsidian config.
 * Idempotent — safe to re-run (overwrites existing files).
 */
import { mkdir, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const VAULT_ROOT = __dirname;

async function ensureDir(path) {
  await mkdir(path, { recursive: true });
}

async function write(path, content) {
  await writeFile(join(VAULT_ROOT, path), content, "utf8");
}

async function writeBinary(path, base64Content) {
  const buffer = Buffer.from(base64Content, "base64");
  await writeFile(join(VAULT_ROOT, path), buffer);
}

// Plugin version for pre-seeded data (suppresses onboarding)
const PLUGIN_VERSION = "0.3.2";

// Matches DEFAULT_PLUGIN_SETTINGS_0_3_0 from src/types/plugin-settings_0_3_0.ts
// showFileExtForNonMdFiles is explicitly true (default)
const PLUGIN_DATA_JSON = {
  settingsVersion: "0.3.0",
  onboardingNotices: {
    welcomeNoticeRead: true,
    lastVersionNoticeRead: PLUGIN_VERSION,
  },
  access: {
    replaceNewTab: true,
    enableRibbonIcon: true,
    enableCommand: true,
    launchFolder: "/",
  },
  useAliases: true,
  showFileExtForNonMdFiles: true,
  showStateMenu: true,
  loopStatesWhenCycling: true,
  folders: { defaultView: "Small" },
  states: {
    visible: [
      {
        name: "Idea",
        link: true,
        defaultViewMode: "Small Cards",
        defaultViewOrder: "AliasOrFilename",
        defaultViewPriorityVisibility: true,
        defaultViewPriorityGrouping: true,
      },
      {
        name: "Shortlisted",
        link: true,
        defaultViewMode: "Small Cards",
        defaultViewOrder: "AliasOrFilename",
        defaultViewPriorityVisibility: true,
        defaultViewPriorityGrouping: true,
      },
      {
        name: "Drafting",
        link: true,
        defaultViewMode: "Detailed Cards",
        defaultViewOrder: "AliasOrFilename",
        defaultViewPriorityVisibility: true,
        defaultViewPriorityGrouping: true,
      },
      {
        name: "Focus",
        link: true,
        defaultViewMode: "Simple Cards",
        defaultViewOrder: "AliasOrFilename",
        defaultViewPriorityVisibility: true,
        defaultViewPriorityGrouping: true,
      },
      {
        name: "Final",
        link: true,
        defaultViewMode: "Small Cards",
        defaultViewOrder: "ModifiedDate",
        defaultViewPriorityVisibility: false,
        defaultViewPriorityGrouping: false,
      },
    ],
    hidden: [
      {
        name: "Archived",
        link: true,
        defaultViewMode: "Small Cards",
        defaultViewOrder: "ModifiedDate",
        defaultViewPriorityVisibility: false,
        defaultViewPriorityGrouping: false,
      },
      {
        name: "Cancelled",
        link: true,
        defaultViewMode: "Detailed Cards",
        defaultViewOrder: "ModifiedDate",
        defaultViewPriorityVisibility: false,
        defaultViewPriorityGrouping: false,
      },
    ],
  },
  stateless: {
    name: "",
    defaultViewMode: "List",
    defaultViewOrder: "ModifiedDate",
    defaultViewPriorityVisibility: true,
    defaultViewPriorityGrouping: true,
  },
  defaultState: "Idea",
  priorities: [
    { name: "High", link: false },
    { name: "Low", link: false },
  ],
};

const FOLDER_SETTINGS_PBS = JSON.stringify(
  { description: "Obsidian Project Browser folder settings", isProject: true },
  null,
  2
);

// Minimal valid binary fixtures for file type visibility testing (base64)
const FIXTURE_PNG_1X1 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQHwAABQAGP+OTAAAAAASUVORK5CYII=";
// Minimal WAV: 44-byte header + 2 bytes silence (8-bit mono 8kHz)
const FIXTURE_WAV_MINIMAL =
  "UklGRiIAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAA==";
const FIXTURE_PDF_MINIMAL =
  "JVBERi0xLjQKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPj4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQo+PgplbmRvYmoKdHJhaWxlcgo8PAovU2l6ZSA0Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgoxNDYKJSVFT0YK";
const FIXTURE_MP3_SILENT =
  "SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAAwAAAbAAqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV////////////////////////////////////////////AAAAAExhdmM1OC4xMwAAAAAAAAAAAAAAACQDkAAAAAAAAAGw9wrNaQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/+MYxAAAAANIAAAAAExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+MYxDsAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+MYxHYAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV";
const FIXTURE_GIF_1X1 =
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

async function main() {
  await ensureDir(join(VAULT_ROOT, ".obsidian/plugins/project-browser"));
  await ensureDir(join(VAULT_ROOT, "Project A"));
  await ensureDir(join(VAULT_ROOT, "Project B"));
  await ensureDir(join(VAULT_ROOT, "Cross Type Project"));
  await ensureDir(join(VAULT_ROOT, "Numeric Page Order Project"));
  await ensureDir(join(VAULT_ROOT, "Archive"));
  await ensureDir(join(VAULT_ROOT, "Reference"));
  await ensureDir(join(VAULT_ROOT, "File Types Test"));

  await write(".obsidian/app.json", JSON.stringify({ safeMode: false }));
  await write(
    ".obsidian/community-plugins.json",
    JSON.stringify(["project-browser"])
  );
  await write(
    ".obsidian/plugins/project-browser/data.json",
    JSON.stringify(PLUGIN_DATA_JSON, null, 2)
  );

  // Project A (project with pages)
  await write("Project A/folder-settings.pbs", FOLDER_SETTINGS_PBS);
  await write(
    "Project A/note-1.md",
    `---
state: Idea
---

# Note 1 (Project A)

Sample note for E2E tests.
`
  );
  await write(
    "Project A/note-2.md",
    `---
state: Drafting
---

# Note 2 (Project A)

Second page in Project A.
`
  );
  await write(
    "Project A/note-3.md",
    `---
state: Focus
---

# Note 3 (Project A)

Third page in Project A.
`
  );
  await write(
    "Project A/note-4.md",
    `---
state: Final
---

# Note 4 (Project A)

Fourth page in Project A.
`
  );
  await write(
    "Project A/sample-readme.txt",
    "Sample text file for manual testing of card display names.\n"
  );
  await write(
    "Project A/reference-data.json",
    JSON.stringify({ description: "Sample JSON for card display testing", items: [] })
  );

  // Project B (project with pages)
  await write("Project B/folder-settings.pbs", FOLDER_SETTINGS_PBS);
  await write(
    "Project B/note-1.md",
    `---
state: Drafting
---

# Note 1 (Project B)

Sample note for E2E tests.
`
  );
  await write(
    "Project B/note-2.md",
    `---
state: Idea
---

# Note 2 (Project B)

Second page in Project B.
`
  );
  await write(
    "Project B/note-3.md",
    `---
state: Shortlisted
---

# Note 3 (Project B)

Third page in Project B.
`
  );
  await write(
    "Project B/note-4.md",
    `---
state: Archived
---

# Note 4 (Project B)

Fourth page in Project B.
`
  );
  await write(
    "Project B/notes-export.txt",
    "Exported notes data for manual QA.\n"
  );

  // Numeric Page Order Project (project with enough pages to demonstrate natural page ordering)
  await write("Numeric Page Order Project/folder-settings.pbs", FOLDER_SETTINGS_PBS);
  await write(
    "Numeric Page Order Project/Page 1.md",
    `---
state: Idea
---

# Page 1

Numeric ordering QA fixture.
`
  );
  await write(
    "Numeric Page Order Project/Page 2.md",
    `---
state: Idea
---

# Page 2

Numeric ordering QA fixture.
`
  );
  await write(
    "Numeric Page Order Project/Page 3.md",
    `---
state: Drafting
---

# Page 3

Numeric ordering QA fixture.
`
  );
  await write(
    "Numeric Page Order Project/Page 10.md",
    `---
state: Focus
---

# Page 10

Numeric ordering QA fixture.
`
  );
  await write(
    "Numeric Page Order Project/Page 18.md",
    `---
state: Shortlisted
---

# Page 18

Numeric ordering QA fixture.
`
  );
  await write(
    "Numeric Page Order Project/Page 19.md",
    `---
state: Final
---

# Page 19

Numeric ordering QA fixture.
`
  );
  await write(
    "Numeric Page Order Project/Page 20.md",
    `---
state: Final
---

# Page 20

Numeric ordering QA fixture.
`
  );

  // Cross Type Project (project with 2 markdown, 2 canvas, 2 base pages)
  await write("Cross Type Project/folder-settings.pbs", FOLDER_SETTINGS_PBS);
  await write(
    "Cross Type Project/Markdown Page 1.md",
    `---
state: Idea
---

# Markdown Page 1

Cross-type permutation test fixture.
`
  );
  await write(
    "Cross Type Project/Markdown Page 2.md",
    `---
state: Drafting
---

# Markdown Page 2

Cross-type permutation test fixture.
`
  );
  await write(
    "Cross Type Project/Canvas Page 1.canvas",
    JSON.stringify({
      nodes: [],
      edges: [],
    })
  );
  await write(
    "Cross Type Project/Canvas Page 2.canvas",
    JSON.stringify({
      nodes: [],
      edges: [],
    })
  );
  await write("Cross Type Project/Base Page 1.base", "views: []\n");
  await write("Cross Type Project/Base Page 2.base", "views: []\n");

  // Archive (plain folder with notes)
  await write(
    "Archive/past-project-notes.md",
    `---
state: Archived
---

# Past project notes

Archived reference material.
`
  );
  await write(
    "Archive/old-ideas.md",
    `---
state: Idea
---

# Old ideas

Ideas from previous sessions.
`
  );
  await write(
    "Archive/completed-work.md",
    `---
state: Final
---

# Completed work

Summary of finished projects.
`
  );

  // Reference (plain folder with notes)
  await write(
    "Reference/templates.md",
    `---
state: Idea
---

# Templates

Reusable note templates.
`
  );
  await write(
    "Reference/guidelines.md",
    `---
state: Focus
---

# Guidelines

Project guidelines and standards.
`
  );
  await write(
    "Reference/glossary.md",
    `---
state: Idea
---

# Glossary

Term definitions and references.
`
  );

  // File Types Test — fixtures for file type visibility testing
  await writeBinary("File Types Test/sample.png", FIXTURE_PNG_1X1);
  await writeBinary("File Types Test/sample.pdf", FIXTURE_PDF_MINIMAL);
  await writeBinary("File Types Test/sample.mp3", FIXTURE_MP3_SILENT);
  await writeBinary("File Types Test/sample.wav", FIXTURE_WAV_MINIMAL);
  await writeBinary("File Types Test/sample.gif", FIXTURE_GIF_1X1);
  await write(
    "File Types Test/sample.svg",
    '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"><rect width="1" height="1" fill="#ccc"/></svg>'
  );
  await write(
    "File Types Test/sample.canvas",
    JSON.stringify({
      nodes: [],
      edges: [],
    })
  );
  await write("File Types Test/sample.base", "views: []\n");
  await write(
    "File Types Test/sample.pbs",
    JSON.stringify({ _description: "Sample PBS for visibility test", isProject: false }, null, 2)
  );
  await write("File Types Test/sample.mjs", "#!/usr/bin/env node\nexport default {};\n");
  await write("File Types Test/sample.txt", "Sample text file for file type visibility testing.\n");
  await write(
    "File Types Test/plugin-config.json",
    JSON.stringify({ enabled: true, version: "1.0" })
  );
  await write("File Types Test/settings.yaml", "theme: dark\nfontSize: 14\n");
  await write("File Types Test/debug.log", "[2024-01-01 12:00:00] Application started\n");
  await write(
    "File Types Test/config.toml",
    "[general]\nname = \"test\"\nversion = \"1.0\"\n"
  );
  await write("File Types Test/readme.md", "# File Types Test\n\nFolder for testing file type visibility.\n");

  // Project A — add media files and config formats for project context testing
  await writeBinary("Project A/sample.png", FIXTURE_PNG_1X1);
  await writeBinary("Project A/sample.pdf", FIXTURE_PDF_MINIMAL);
  await writeBinary("Project A/sample.mp3", FIXTURE_MP3_SILENT);
  await writeBinary("Project A/sample.wav", FIXTURE_WAV_MINIMAL);
  await write("Project A/sample.base", "views: []\n");
  await write(
    "Project A/sample.pbs",
    JSON.stringify({ _description: "Sample PBS for visibility test", isProject: false }, null, 2)
  );
  await write("Project A/sample.mjs", "export default {};\n");
  await write("Project A/sample.txt", "Sample text file for file type visibility testing.\n");
  await write("Project A/sample.json", JSON.stringify({ test: true }));
  await write("Project A/sample.yaml", "key: value\n");
  await write("Project A/sample.log", "[2024-01-01 12:00:00] Log entry\n");
  await write("Project A/sample.toml", "[section]\nkey = \"value\"\n");

  console.log("Generated qa-test-vault at", VAULT_ROOT);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
