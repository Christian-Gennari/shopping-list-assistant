import { marked } from "marked";

marked.setOptions({
  breaks: true,
  gfm: true,
});

/**
 * Convert markdown to HTML.
 * (Marked may return either string or Promise<string> depending on internal config)
 */
export async function markdownToHtml(md: string): Promise<string> {
  const result = await marked(md);
  return result as string;
}
