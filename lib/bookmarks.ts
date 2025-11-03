/**
 * Browser Bookmarks Export
 *
 * Generates HTML bookmarks file in Netscape bookmark format
 * compatible with all major browsers.
 */

export interface Bookmark {
  title: string;
  url: string;
  description?: string;
  tags?: string[];
}

/**
 * Export bookmarks as HTML file (Netscape bookmark format)
 */
export function exportBrowserBookmarks(
  bookmarks: Bookmark[],
  filename: string = 'bookmarks'
): void {
  if (typeof window === 'undefined') return;

  const html = [
    '<!DOCTYPE NETSCAPE-Bookmark-file-1>',
    '<!-- This is an automatically generated file.',
    '     It will be read and overwritten.',
    '     DO NOT EDIT! -->',
    '<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">',
    '<TITLE>Bookmarks</TITLE>',
    '<H1>Bookmarks</H1>',
    '<DL><p>',
    ...bookmarks.map((bookmark) => {
      const tags = bookmark.tags ? bookmark.tags.join(',') : '';
      const description = bookmark.description || '';
      return `    <DT><A HREF="${escapeHtml(bookmark.url)}" ADD_DATE="${Math.floor(Date.now() / 1000)}" TAGS="${escapeHtml(tags)}">${escapeHtml(bookmark.title)}</A>${description ? `\n    <DD>${escapeHtml(description)}</DD>` : ''}`;
    }),
    '</DL><p>',
  ].join('\n');

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Export a single bookmark
 */
export function exportSingleBookmark(bookmark: Bookmark, filename?: string): void {
  exportBrowserBookmarks([bookmark], filename || bookmark.title);
}

