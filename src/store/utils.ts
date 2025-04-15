import { marked } from "marked";

export const truncateText = (text: string, length: number) => {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let visibleTextLength = 0;
  let result = "";
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    const beforeLinkText = text.substring(lastIndex, match.index);
    const linkText = match[0];

    if (visibleTextLength + beforeLinkText.length > length) {
      result += beforeLinkText.substring(0, length - visibleTextLength) + "...";
      return result;
    }

    visibleTextLength += beforeLinkText.length;
    result += beforeLinkText + linkText;
    lastIndex = linkRegex.lastIndex;
  }

  result += text.substring(lastIndex);

  if (visibleTextLength + result.length > length) {
    return result.substring(0, length - visibleTextLength) + "...";
  }

  return result;
};

export const parseMarkdown = (text: string | undefined): string => {
  const renderer = new marked.Renderer();
  renderer.link = (href, title, text) => {
    const safeTitle = title || href;
    return `<a href="${href}" title="${safeTitle}" target="_blank" rel="noopener noreferrer" class="custom-link">${text}</a>`;
  };
  return (marked(text || "", { renderer }) as string) || "";
};
