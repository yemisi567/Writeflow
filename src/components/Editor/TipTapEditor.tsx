import React, { useCallback, useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { toast } from "react-hot-toast";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlock from "@tiptap/extension-code-block";
import ImageExtension from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import { Youtube } from "@tiptap/extension-youtube";
import { Underline } from "@tiptap/extension-underline";
import { TextAlign } from "@tiptap/extension-text-align";
import CodeBlockComponent from "./CodeBlockComponent";
import YouTubeModal from "./YouTubeModal";
import {
  Bold,
  Italic,
  Strikethrough,
  Quote,
  Code,
  Undo,
  Redo,
  Type,
  Table as TableIcon,
  Plus,
  Minus,
  Video,
  Play,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from "lucide-react";

interface TipTapEditorProps {
  initialContent?: string;
  onContentChange?: (content: string) => void;
  onSave?: (content: string) => void;
  isReadOnly?: boolean;
  placeholder?: string;
}

const TipTapEditor: React.FC<TipTapEditorProps> = ({
  initialContent = "",
  onContentChange,
  onSave,
  isReadOnly = false,
  placeholder = "Start writing...",
}) => {
  const [showYouTubeModal, setShowYouTubeModal] = useState(false);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        codeBlock: false,
        blockquote: {
          HTMLAttributes: {
            class:
              "border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic",
          },
        },
        paragraph: {
          HTMLAttributes: {
            class: "min-h-[1em]",
          },
        },
      }),
      CodeBlock.configure({
        HTMLAttributes: {
          class: "code-block",
        },
        languageClassPrefix: "language-",
      }).extend({
        addNodeView() {
          return (props: any) => {
            return React.createElement(CodeBlockComponent, {
              node: props.node,
              updateAttributes: props.updateAttributes,
            });
          };
        },
      }),
      ImageExtension.configure({
        HTMLAttributes: {
          class: "w-72 h-72 rounded-lg my-4 object-cover",
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Youtube.configure({
        controls: false,
        nocookie: true,
        width: 640,
        height: 480,
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: initialContent,
    editable: !isReadOnly,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onContentChange?.(html);
    },
    editorProps: {
      attributes: {
        class:
          "prose max-w-none focus:outline-none min-h-[200px] pt-4 sm:pt-8 pl-4 sm:pl-8 pr-2 pb-4 m-0 prose-sm sm:prose-base",
      },
      handleKeyDown: (view, event) => {
        // Keyboard shortcuts
        if (event.ctrlKey || event.metaKey) {
          switch (event.key) {
            case "b":
              event.preventDefault();
              editor?.chain().focus().toggleBold().run();
              return true;
            case "i":
              event.preventDefault();
              editor?.chain().focus().toggleItalic().run();
              return true;
            case "u":
              event.preventDefault();
              editor?.chain().focus().toggleUnderline().run();
              return true;
            case "k":
              event.preventDefault();
              editor?.chain().focus().toggleStrike().run();
              return true;
            case "h":
              event.preventDefault();
              editor?.chain().focus().toggleHeading({ level: 1 }).run();
              return true;
            case "q":
              event.preventDefault();
              editor?.chain().focus().toggleBlockquote().run();
              return true;
            case "c":
              event.preventDefault();
              editor?.chain().focus().toggleCodeBlock().run();
              return true;
            case "t":
              event.preventDefault();
              editor
                ?.chain()
                .focus()
                .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                .run();
              return true;
            case "s":
              event.preventDefault();
              onSave?.(editor?.getHTML() || "");
              return true;
          }
        }
        return false;
      },
    },
  });

  // Update editor content when initialContent changes
  useEffect(() => {
    if (!editor) return;
    const incomingContent = initialContent ?? "";
    if (editor.getHTML() === incomingContent) return;
    editor.commands.setContent(incomingContent);
  }, [editor, initialContent]);

  const formatText = useCallback(
    (command: string, value?: string) => {
      if (!editor) return;

      switch (command) {
        case "bold":
          editor.chain().focus().toggleBold().run();
          break;
        case "italic":
          editor.chain().focus().toggleItalic().run();
          break;
        case "underline":
          editor.chain().focus().toggleUnderline().run();
          break;
        case "strikethrough":
          editor.chain().focus().toggleStrike().run();
          break;
        case "textAlign":
          if (value) {
            editor
              .chain()
              .focus()
              .setTextAlign(value as any)
              .run();
          }
          break;
        case "code":
          editor.chain().focus().toggleCodeBlock().run();
          break;
        case "quote":
          editor.chain().focus().toggleBlockquote().run();
          break;
        case "heading1":
          editor.chain().focus().toggleHeading({ level: 1 }).run();
          break;
        case "heading2":
          editor.chain().focus().toggleHeading({ level: 2 }).run();
          break;
        case "heading3":
          editor.chain().focus().toggleHeading({ level: 3 }).run();
          break;
      }
    },
    [editor]
  );

  const addImageFromFile = useCallback(() => {
    if (!editor) return;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        if (file.size > 1024 * 1024) {
          alert("Image too large. Please choose an image smaller than 1MB.");
          return;
        }
        const url = URL.createObjectURL(file);
        editor.chain().focus().setImage({ src: url }).run();
      }
    };
    input.click();
  }, [editor]);

  const addTable = useCallback(() => {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  }, [editor]);

  const addColumnBefore = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().addColumnBefore().run();
  }, [editor]);

  const addColumnAfter = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().addColumnAfter().run();
  }, [editor]);

  const deleteColumn = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().deleteColumn().run();
  }, [editor]);

  const addRowBefore = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().addRowBefore().run();
  }, [editor]);

  const addRowAfter = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().addRowAfter().run();
  }, [editor]);

  const deleteRow = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().deleteRow().run();
  }, [editor]);

  const deleteTable = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().deleteTable().run();
  }, [editor]);

  const addVideo = useCallback(() => {
    if (!editor) return;
    setShowYouTubeModal(true);
  }, [editor]);

  const handleYouTubeConfirm = useCallback(
    (url: string) => {
      if (editor) {
        editor.chain().focus().setYoutubeVideo({ src: url }).run();
        toast.success("YouTube video added successfully!");
      }
    },
    [editor]
  );

  const addVideoFromFile = useCallback(() => {
    if (!editor) {
      console.error("Editor not available");
      return;
    }

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "video/*";
    input.multiple = false;
    input.style.display = "none";

    // Add to DOM temporarily
    document.body.appendChild(input);

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];

      if (file) {
        // Check if the file is actually a video
        if (!file.type.startsWith("video/")) {
          toast.error("Please select a valid video file.");
          return;
        }

        if (file.size > 50 * 1024 * 1024) {
          // 50MB limit
          alert("Video too large. Please choose a video smaller than 50MB.");
          return;
        }

        const url = URL.createObjectURL(file);

        // Test if the URL is accessible
        fetch(url, { method: "HEAD" })
          .then((response) => {
            console.log("Video URL accessible:");
            if (!response.ok) {
              console.warn("Video URL might not be accessible");
            }
          })
          .catch((error) => {
            console.warn("Could not test video URL accessibility:", error);
          });

        // Create a proper video element with better attributes
        const videoHtml = `
          <div class="video-container" style="margin: 16px 0; text-align: center; max-width: 100%;">
            <video 
              controls 
              width="640" 
              height="480" 
              style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); background: #000;"
              preload="metadata"
              playsinline
            >
              <source src="${url}" type="${file.type}">
              <p style="color: #666; padding: 20px;">Your browser does not support the video tag.</p>
            </video>
            <p style="margin-top: 8px; font-size: 12px; color: #666; word-break: break-all;">${file.name}</p>
          </div>
        `;

        console.log("Inserting video HTML:");

        try {
          editor.chain().focus().insertContent(videoHtml).run();

          console.log("Video inserted successfully");

          // Show success message
          toast.success(`Video "${file.name}" uploaded successfully!`);
        } catch (error) {
          console.error("Failed to insert video:", error);

          // Fallback: try inserting just the video element
          try {
            const simpleVideoHtml = `<video controls width="640" height="480" style="max-width: 100%; height: auto; background: #000;" playsinline><source src="${url}" type="${file.type}"><p>Your browser does not support the video tag.</p></video>`;
            editor.chain().focus().insertContent(simpleVideoHtml).run();
            toast.success(`Video "${file.name}" uploaded successfully!`);
          } catch (fallbackError) {
            console.error("Fallback method also failed:", fallbackError);
            toast.error("Failed to upload video. Please try again.");
          }
        }
      } else {
        console.log("No file selected");
      }

      // Clean up the input element
      if (document.body.contains(input)) {
        document.body.removeChild(input);
      }
    };

    input.click();
  }, [editor]);

  const undo = useCallback(() => {
    if (editor) {
      editor.chain().focus().undo().run();
    }
  }, [editor]);

  const redo = useCallback(() => {
    if (editor) {
      editor.chain().focus().redo().run();
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-col h-full">
      {!isReadOnly && (
        <div className="flex items-center space-x-1 p-2 sm:p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-x-auto">
          <div className="flex items-center space-x-1 mr-2 sm:mr-4 flex-shrink-0">
            <button
              onClick={undo}
              disabled={!editor.can().undo()}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Undo"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={redo}
              disabled={!editor.can().redo()}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Redo"
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center space-x-1 flex-shrink-0">
            <button
              onClick={() => formatText("bold")}
              className={`p-1.5 sm:p-2 rounded-lg ${
                editor.isActive("bold")
                  ? "bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              title="Bold"
            >
              <Bold className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={() => formatText("italic")}
              className={`p-1.5 sm:p-2 rounded-lg ${
                editor.isActive("italic")
                  ? "bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              title="Italic"
            >
              <Italic className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={() => formatText("strikethrough")}
              className={`p-1.5 sm:p-2 rounded-lg ${
                editor.isActive("strike")
                  ? "bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              title="Strikethrough"
            >
              <Strikethrough className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={() => formatText("underline")}
              className={`p-1.5 sm:p-2 rounded-lg ${
                editor.isActive("underline")
                  ? "bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              title="Underline"
            >
              <UnderlineIcon className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>

          <div className="flex items-center space-x-1 ml-2 sm:ml-4 flex-shrink-0">
            <button
              onClick={() => formatText("textAlign", "left")}
              className={`p-1.5 sm:p-2 rounded-lg ${
                editor.isActive({ textAlign: "left" })
                  ? "bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              title="Align Left"
            >
              <AlignLeft className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={() => formatText("textAlign", "center")}
              className={`p-1.5 sm:p-2 rounded-lg ${
                editor.isActive({ textAlign: "center" })
                  ? "bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              title="Align Center"
            >
              <AlignCenter className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={() => formatText("textAlign", "right")}
              className={`p-1.5 sm:p-2 rounded-lg ${
                editor.isActive({ textAlign: "right" })
                  ? "bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              title="Align Right"
            >
              <AlignRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={() => formatText("textAlign", "justify")}
              className={`p-1.5 sm:p-2 rounded-lg ${
                editor.isActive({ textAlign: "justify" })
                  ? "bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              title="Justify"
            >
              <AlignJustify className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>

          <div className="flex items-center space-x-1 ml-2 sm:ml-4 flex-shrink-0">
            <button
              onClick={() => formatText("heading1")}
              className={`p-1.5 sm:p-2 rounded-lg ${
                editor.isActive("heading", { level: 1 })
                  ? "bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              title="Heading 1"
            >
              <Type className="w-3 h-3 sm:w-4 sm:h-4 font-bold" />
            </button>
            <button
              onClick={() => formatText("quote")}
              className={`p-1.5 sm:p-2 rounded-lg ${
                editor.isActive("blockquote")
                  ? "bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              title="Quote"
            >
              <Quote className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={`p-1.5 sm:p-2 rounded-lg ${
                editor.isActive("codeBlock")
                  ? "bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              title="Code Block"
            >
              <Code className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>

          <div className="flex items-center space-x-1 ml-2 sm:ml-4 flex-shrink-0">
            <button
              onClick={addImageFromFile}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              title="Upload Image from Computer"
            >
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </button>
            <button
              onClick={addVideo}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              title="Add YouTube Video"
            >
              <Play className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={addVideoFromFile}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              title="Upload Video from Computer"
            >
              <Video className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>

          <div className="flex items-center space-x-1 ml-2 sm:ml-4 flex-shrink-0">
            <button
              onClick={addTable}
              className={`p-1.5 sm:p-2 rounded-lg ${
                editor.isActive("table")
                  ? "bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              title="Insert Table"
            >
              <TableIcon className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            {editor.isActive("table") && (
              <>
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
                <button
                  onClick={addColumnBefore}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                  title="Add Column Before"
                >
                  <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
                <button
                  onClick={addColumnAfter}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                  title="Add Column After"
                >
                  <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
                <button
                  onClick={deleteColumn}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                  title="Delete Column"
                >
                  <Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
                <div className="w-px h-4 sm:h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
                <button
                  onClick={addRowBefore}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                  title="Add Row Before"
                >
                  <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
                <button
                  onClick={addRowAfter}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                  title="Add Row After"
                >
                  <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
                <button
                  onClick={deleteRow}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                  title="Delete Row"
                >
                  <Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
                <div className="w-px h-4 sm:h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
                <button
                  onClick={deleteTable}
                  className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                  title="Delete Table"
                >
                  <Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto h-full">
        <div className="w-full pt-4 sm:pt-8 pl-4 sm:pl-8 pr-2 pb-4 m-0 h-full">
          <EditorContent
            editor={editor}
            className="h-full focus-within:outline-none w-full overflow-y-auto"
          />
        </div>
      </div>

      {/* YouTube Modal */}
      <YouTubeModal
        isOpen={showYouTubeModal}
        onClose={() => setShowYouTubeModal(false)}
        onConfirm={handleYouTubeConfirm}
      />
    </div>
  );
};

export default TipTapEditor;
