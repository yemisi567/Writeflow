import React, { useMemo, useState, useCallback, useEffect } from "react";
import TipTapEditor from "./TipTapEditor";

interface Block {
  id: string;
  type: string;
  content: string;
  htmlContent?: string; // Store the HTML content to preserve formatting
  level?: number;
  language?: string;
  src?: string;
  alt?: string;
  metadata?: any;
}

interface TipTapWrapperProps {
  initialContent?: Block[];
  onContentChange?: (content: Block[]) => void;
  onSave?: (content: Block[]) => void;
  isReadOnly?: boolean;
  showPreview?: boolean;
  onTogglePreview?: () => void;
}

const TipTapWrapper: React.FC<TipTapWrapperProps> = ({
  initialContent = [],
  onContentChange,
  onSave,
  isReadOnly = false,
  showPreview = false,
  onTogglePreview,
}) => {
  const [currentHtmlContent, setCurrentHtmlContent] = useState<string>("");

  const htmlContent = useMemo(() => {
    if (!initialContent || initialContent.length === 0) {
      return "<p></p>";
    }

    return initialContent
      .map((block) => {
        // If we have stored HTML content, use it directly to preserve formatting
        if (block.htmlContent) {
          return block.htmlContent;
        }

        switch (block.type) {
          case "heading":
            const level = block.level || 1;
            return `<h${level}>${block.content || ""}</h${level}>`;
          case "quote":
            return `<blockquote>${block.content || ""}</blockquote>`;
          case "code":
            return `<pre><code>${block.content || ""}</code></pre>`;
          case "divider":
            return "<hr>";
          case "image":
            return `<img src="${block.src || ""}" alt="${block.alt || ""}" />`;
          case "text":
          default:
            return `<p>${block.content || ""}</p>`;
        }
      })
      .join("");
  }, [initialContent]);

  // Update currentHtmlContent when initialContent changes
  useEffect(() => {
    const newHtmlContent = htmlContent;
    setCurrentHtmlContent(newHtmlContent);
  }, [htmlContent]);

  const handleContentChange = useCallback(
    (html: string) => {
      setCurrentHtmlContent(html);
      const blocks = convertHtmlToBlocks(html);
      onContentChange?.(blocks);
    },
    [onContentChange]
  );

  const convertHtmlToBlocks = (html: string): Block[] => {
    const tempDiv = document.createElement("div");
    // Preserve whitespace when parsing HTML
    tempDiv.style.whiteSpace = "pre-wrap";
    tempDiv.innerHTML = html;

    const blocks: Block[] = [];
    let blockId = 0;

    const processNode = (node: Node): void => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        const tagName = element.tagName.toLowerCase();
        const content = element.textContent || "";
        const htmlContent = element.outerHTML;

        switch (tagName) {
          case "h1":
          case "h2":
          case "h3":
          case "h4":
          case "h5":
          case "h6":
            const level = parseInt(tagName.charAt(1));
            if (content && content.trim().length > 0) {
              blocks.push({
                id: `block-${blockId++}`,
                type: "heading",
                content,
                htmlContent,
                level,
              });
            }
            break;
          case "blockquote":
            if (content && content.trim().length > 0) {
              blocks.push({
                id: `block-${blockId++}`,
                type: "quote",
                content,
                htmlContent,
              });
            }
            break;
          case "pre":
            const codeElement = element.querySelector("code");
            const codeContent = codeElement?.textContent || content;
            if (codeContent && codeContent.trim().length > 0) {
              blocks.push({
                id: `block-${blockId++}`,
                type: "code",
                content: codeContent,
                htmlContent,
                language: "typescript",
              });
            }
            break;
          case "hr":
            blocks.push({
              id: `block-${blockId++}`,
              type: "divider",
              content: "---",
              htmlContent: "<hr>",
            });
            break;
          case "img":
            const img = element as HTMLImageElement;
            blocks.push({
              id: `block-${blockId++}`,
              type: "image",
              content: "",
              htmlContent,
              src: img.src,
              alt: img.alt,
            });
            break;
          case "p":
            // Always preserve paragraph blocks, even if empty (for proper newline handling)
            blocks.push({
              id: `block-${blockId++}`,
              type: "text",
              content: content || "",
              htmlContent,
            });
            break;
          default:
            // For other elements, only process if they have meaningful content
            // and don't process their children to avoid duplication
            if (
              content &&
              content.trim().length > 0 &&
              !element.querySelector(
                "p, h1, h2, h3, h4, h5, h6, blockquote, pre, hr, img"
              )
            ) {
              blocks.push({
                id: `block-${blockId++}`,
                type: "text",
                content,
                htmlContent,
              });
            } else {
              node.childNodes.forEach(processNode);
            }
            return;
        }
      } else if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent;
        if (text && text.trim().length > 0 && node.parentNode === tempDiv) {
          blocks.push({
            id: `block-${blockId++}`,
            type: "text",
            content: text,
            htmlContent: `<p>${text}</p>`,
          });
        }
      } else {
        node.childNodes.forEach(processNode);
      }
    };

    tempDiv.childNodes.forEach(processNode);

    if (blocks.length === 0) {
      blocks.push({
        id: "block-0",
        type: "text",
        content: "",
        htmlContent: "<p></p>",
      });
    }

    return blocks;
  };

  const handleSave = () => {
    const currentHtml = currentHtmlContent || htmlContent;
    const blocks = convertHtmlToBlocks(currentHtml);
    onSave?.(blocks);
  };

  return (
    <div className="h-full flex flex-col">
      {showPreview ? (
        <div className="flex-1 overflow-auto pt-4 sm:pt-8 pl-4 sm:pl-8 pr-2 pb-4">
          <div
            className="prose max-w-none dark:prose-invert prose-sm sm:prose-base"
            dangerouslySetInnerHTML={{
              __html: currentHtmlContent || htmlContent,
            }}
          />
        </div>
      ) : (
        <TipTapEditor
          initialContent={htmlContent}
          onContentChange={handleContentChange}
          onSave={handleSave}
          isReadOnly={isReadOnly}
          placeholder="Start writing your document..."
        />
      )}
    </div>
  );
};

export default TipTapWrapper;
