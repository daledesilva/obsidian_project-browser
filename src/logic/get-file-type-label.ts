//////////////////
//////////////////

const FILE_TYPE_LABELS: Record<string, string> = {
    canvas: 'CANVAS',
    base: 'BASE',
    pdf: 'PDF',
    png: 'PNG',
    jpg: 'JPEG',
    jpeg: 'JPEG',
    gif: 'GIF',
    svg: 'SVG',
    webp: 'WEBP',
    avif: 'AVIF',
    bmp: 'BMP',
    flac: 'FLAC',
    m4a: 'M4A',
    mp3: 'MP3',
    ogg: 'OGG',
    wav: 'WAV',
    webm: 'WEBM',
    '3gp': '3GP',
    mkv: 'MKV',
    mov: 'MOV',
    mp4: 'MP4',
    ogv: 'OGV',
};

const TYPE_TAG_EXTENSIONS = new Set(['canvas', 'base']);

const FRONTMATTER_EXTENSIONS = new Set(['md']);

/** Returns true if the file type supports YAML frontmatter (state, priority, etc.). Only markdown notes do. */
export function hasFrontmatterSupport(extension: string): boolean {
    return FRONTMATTER_EXTENSIONS.has((extension ?? '').toLowerCase());
}

/** Returns a display label for the file type, or null. Only base and canvas show a type tag. */
export function getFileTypeLabel(extension: string): string | null {
    const ext = (extension ?? '').toLowerCase();
    if (!TYPE_TAG_EXTENSIONS.has(ext)) return null;
    return FILE_TYPE_LABELS[ext] ?? ext.toUpperCase();
}
