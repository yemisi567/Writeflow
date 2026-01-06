import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { ThemeProvider } from "./context/ThemeContext";
import Header from "./components/Header/Header";
import Sidebar from "./components/Sidebar/Sidebar";
import TipTapWrapper from "./components/Editor/TipTapWrapper";
import StatusBar from "./components/StatusBar/StatusBar";
import LandingPage from "./components/LandingPage/LandingPage";
import Alert from "./components/Alert/Alert";
import { v4 as uuidv4 } from "uuid";
import { Document, Packer, Paragraph, HeadingLevel } from "docx";
import { useDocuments } from "./hooks/useDocuments";

interface WriteFlowDocument {
  id: string;
  title: string;
  content: any[];
  lastModified: Date;
  isStarred: boolean;
  isArchived: boolean;
  tags: string[];
  wordCount: number;
  collaborators?: string[];
}

const App: React.FC = () => {
  const {
    documents: supabaseDocuments,
    createDocument: createSupabaseDocument,
    updateDocument: updateSupabaseDocument,
    deleteDocument: deleteSupabaseDocument,
    searchDocuments: searchSupabaseDocuments,
  } = useDocuments();

  const documents = supabaseDocuments.map((doc) => ({
    id: doc.id,
    title: doc.title,
    content: doc.content,
    lastModified: new Date(doc.last_modified),
    isStarred: doc.is_starred,
    isArchived: doc.is_archived,
    tags: doc.tags,
    wordCount: doc.word_count,
  }));

  const [currentDocument, setCurrentDocument] =
    useState<WriteFlowDocument | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isAutoSave, setIsAutoSave] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | undefined>();
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [autoSavePending, setAutoSavePending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<WriteFlowDocument[]>([]);
  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "warning" | "info" | "confirm";
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const showAlert = (
    title: string,
    message: string,
    type: "success" | "error" | "warning" | "info" | "confirm" = "info",
    onConfirm?: () => void
  ) => {
    setAlertState({
      isOpen: true,
      title,
      message,
      type,
      onConfirm,
    });
  };

  const closeAlert = () => {
    setAlertState((prev) => ({ ...prev, isOpen: false }));
  };

  const syncPendingChanges = useCallback(() => {
    if (pendingChanges.length > 0) {
      setPendingChanges([]);
      toast.success("Changes synced successfully!");
    }
  }, [pendingChanges]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncPendingChanges();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {})
        .catch((registrationError) => {});
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [syncPendingChanges]);

  const updateDocument = useCallback(
    async (updates: Partial<WriteFlowDocument>) => {
      if (!currentDocument) {
        return;
      }

      const updatedDoc = {
        ...currentDocument,
        ...updates,
        lastModified: new Date(),
      };

      setCurrentDocument(updatedDoc);
      setHasUnsavedChanges(true);

      // Update in Supabase
      try {
        const result = await updateSupabaseDocument(currentDocument.id, {
          title: updatedDoc.title,
          content: updatedDoc.content,
          last_modified: updatedDoc.lastModified.toISOString(),
          is_starred: updatedDoc.isStarred,
          is_archived: updatedDoc.isArchived,
          tags: updatedDoc.tags,
          word_count: updatedDoc.wordCount,
        });
        console.log("result", result.word_count);
        console.log("Document updated in Supabase successfully:");
      } catch (error) {
        console.error("Failed to update document in Supabase:", error);
        toast.error("Failed to save document");
      }
    },
    [currentDocument, updateSupabaseDocument]
  );

  const handleSave = useCallback(
    (isAutoSave = false) => {
      if (!currentDocument) return;

      if (isAutoSave) {
        setIsAutoSaving(true);
      }

      updateDocument({});
      setLastSaved(new Date());
      setHasUnsavedChanges(false);

      if (isAutoSave) {
        setIsAutoSaving(false);
      } else {
        toast.success("Document saved!");
      }
    },
    [currentDocument, updateDocument]
  );

  useEffect(() => {
    if (isAutoSave && hasUnsavedChanges && currentDocument) {
      setAutoSavePending(true);

      const timer = setTimeout(() => {
        handleSave(true);
        setAutoSavePending(false);
      }, 3000);

      return () => {
        clearTimeout(timer);
        setAutoSavePending(false);
      };
    }
  }, [hasUnsavedChanges, isAutoSave, currentDocument, handleSave]);

  const createDocument = async () => {
    try {
      const newDoc = await createSupabaseDocument({
        id: uuidv4(),
        title: "Untitled Document",
        content: [],
        last_modified: new Date().toISOString(),
        is_starred: false,
        is_archived: false,
        tags: [],
        word_count: 0,
      });

      // Convert to WriteFlowDocument format
      const writeFlowDoc: WriteFlowDocument = {
        id: newDoc.id,
        title: newDoc.title,
        content: newDoc.content,
        lastModified: new Date(newDoc.last_modified),
        isStarred: newDoc.is_starred,
        isArchived: newDoc.is_archived,
        tags: newDoc.tags,
        wordCount: newDoc.word_count,
      };

      setCurrentDocument(writeFlowDoc);
      setHasUnsavedChanges(false);
      console.log("App: Document created successfully:");
    } catch (error) {
      console.error("App: Failed to create document:", error);
    }
  };

  const selectDocument = (doc: WriteFlowDocument) => {
    setCurrentDocument(doc);
    setHasUnsavedChanges(false);
  };

  const calculateWordCount = (content: any): number => {
    if (!content) return 0;

    // If content is a string (HTML), extract text and count words
    if (typeof content === "string") {
      // Create a temporary DOM element to extract text from HTML
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = content;
      const text = tempDiv.textContent || tempDiv.innerText || "";
      return text.split(/\s+/).filter((word: string) => word.length > 0).length;
    }

    // If content is an array (JSON structure), process it
    if (Array.isArray(content)) {
      return content.reduce((count, block) => {
        // Handle different block types
        if (block.type === "paragraph" && block.content) {
          return (
            count +
            block.content.reduce((blockCount: number, text: any) => {
              if (text.type === "text" && text.text) {
                return (
                  blockCount +
                  text.text
                    .split(/\s+/)
                    .filter((word: string) => word.length > 0).length
                );
              }
              return blockCount;
            }, 0)
          );
        }

        if (block.type === "heading" && block.content) {
          return (
            count +
            block.content.reduce((blockCount: number, text: any) => {
              if (text.type === "text" && text.text) {
                return (
                  blockCount +
                  text.text
                    .split(/\s+/)
                    .filter((word: string) => word.length > 0).length
                );
              }
              return blockCount;
            }, 0)
          );
        }

        // Handle other block types that might have text content
        if (block.content && typeof block.content === "string") {
          return (
            count +
            block.content.split(/\s+/).filter((word: string) => word.length > 0)
              .length
          );
        }

        // Handle blocks with nested content array
        if (block.content && Array.isArray(block.content)) {
          return (
            count +
            block.content.reduce((blockCount: number, text: any) => {
              if (text && typeof text === "object") {
                if (text.type === "text" && text.text) {
                  return (
                    blockCount +
                    text.text
                      .split(/\s+/)
                      .filter((word: string) => word.length > 0).length
                  );
                }
                // Handle other text-like objects
                if (text.text && typeof text.text === "string") {
                  return (
                    blockCount +
                    text.text
                      .split(/\s+/)
                      .filter((word: string) => word.length > 0).length
                  );
                }
              }
              return blockCount;
            }, 0)
          );
        }

        return count;
      }, 0);
    }

    // Fallback: try to extract text from any content by stringifying and parsing
    try {
      const contentStr = JSON.stringify(content);
      // Remove JSON syntax and count words
      const text = contentStr
        .replace(/[{}[\]",:]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      return text.split(/\s+/).filter((word: string) => word.length > 0).length;
    } catch (error) {
      console.log("Error in fallback word count:");
      return 0;
    }
  };

  const handleContentChange = useCallback(
    (content: any) => {
      if (!currentDocument) return;
      const newWordCount = calculateWordCount(content);
      console.log("Calculated word count:");

      setCurrentDocument((prev) =>
        prev ? { ...prev, content, wordCount: newWordCount } : null
      );
      setHasUnsavedChanges(true);
    },
    [currentDocument]
  );

  // Auto-save effect
  useEffect(() => {
    if (isAutoSave && hasUnsavedChanges && currentDocument) {
      const timer = setTimeout(() => {
        handleSave(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [hasUnsavedChanges, isAutoSave, currentDocument, handleSave]);

  const handleExport = async () => {
    if (!currentDocument) return;

    try {
      // Convert blocks to Word document paragraphs
      const paragraphs = currentDocument.content.map((block) => {
        switch (block.type) {
          case "heading":
            return new Paragraph({
              text: block.content || "",
              heading:
                block.level === 1
                  ? HeadingLevel.HEADING_1
                  : block.level === 2
                  ? HeadingLevel.HEADING_2
                  : block.level === 3
                  ? HeadingLevel.HEADING_3
                  : HeadingLevel.HEADING_1,
            });
          case "quote":
            return new Paragraph({
              text: `"${block.content || ""}"`,
              indent: { left: 720 }, // 0.5 inch indent
            });
          case "code":
            return new Paragraph({
              text: block.content || "",
            });
          case "divider":
            return new Paragraph({
              text: "────────────────────────────────────────",
              alignment: "center",
            });
          case "image":
            return new Paragraph({
              text: `[Image: ${block.alt || "Untitled"}]`,
              alignment: "center",
            });
          default: // text
            return new Paragraph({
              text: block.content || "",
            });
        }
      });

      // Create Word document
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              new Paragraph({
                text: currentDocument.title,
                heading: HeadingLevel.TITLE,
              }),
              new Paragraph({ text: "" }),
              ...paragraphs,
            ],
          },
        ],
      });

      // Generate and download the document
      const buffer = await Packer.toBuffer(doc);
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${currentDocument.title}.docx`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success("Document exported successfully!");
    } catch (error) {
      console.error("Export error:", error);
      // Fallback to simple text export
      try {
        const textContent = currentDocument.content
          .map((block) => {
            switch (block.type) {
              case "heading":
                return `# ${block.content || ""}`;
              case "quote":
                return `> ${block.content || ""}`;
              case "code":
                return `\`\`\`\n${block.content || ""}\n\`\`\``;
              case "divider":
                return "---";
              case "image":
                return `[Image: ${block.alt || "Untitled"}]`;
              default:
                return block.content || "";
            }
          })
          .join("\n\n");

        const blob = new Blob([textContent], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${currentDocument.title}.txt`;
        link.click();
        URL.revokeObjectURL(url);

        toast.success("Document exported as text file!");
      } catch (fallbackError) {
        console.error("Fallback export error:", fallbackError);
        toast.error("Failed to export document");
      }
    }
  };

  const handleShare = async () => {
    if (!currentDocument) return;

    try {
      // Create a preview of the document content
      const contentPreview = currentDocument.content
        .slice(0, 3) // Take first 3 blocks
        .map((block) => {
          switch (block.type) {
            case "heading":
              return `# ${block.content || ""}`;
            case "quote":
              return `> ${block.content || ""}`;
            case "code":
              return `\`${block.content || ""}\``;
            case "divider":
              return "---";
            case "image":
              return `[Image: ${block.alt || "Untitled"}]`;
            default:
              return block.content || "";
          }
        })
        .filter(Boolean)
        .join(" ")
        .substring(0, 200);

      const shareText = `📝 ${currentDocument.title}\n\n${contentPreview}${
        contentPreview.length === 200 ? "..." : ""
      }\n\nCreated with WriteFlow - A modern text editor for writers`;

      if (navigator.share) {
        await navigator.share({
          title: currentDocument.title,
          text: shareText,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        toast.success("Document preview copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
      toast.error("Failed to share document");
    }
  };

  const deleteDocument = async (id: string) => {
    const document = documents.find((doc) => doc.id === id);
    showAlert(
      "Delete Document",
      `Are you sure you want to delete "${
        document?.title || "this document"
      }"? This action cannot be undone.`,
      "confirm",
      async () => {
        try {
          await deleteSupabaseDocument(id);
          if (currentDocument?.id === id) {
            setCurrentDocument(null);
          }
          toast.success("Document deleted!");
        } catch (error) {
          console.error("Failed to delete document:", error);
          toast.error("Failed to delete document");
        }
      }
    );
  };

  const starDocument = async (id: string) => {
    const document = documents.find((doc) => doc.id === id);
    if (!document) return;

    const newStarredState = !document.isStarred;
    try {
      await updateSupabaseDocument(id, { is_starred: newStarredState });
      if (currentDocument?.id === id) {
        setCurrentDocument((prev) =>
          prev ? { ...prev, isStarred: newStarredState } : null
        );
      }
    } catch (error) {
      console.error("Failed to star/unstar document:", error);
      toast.error("Failed to update document");
    }
  };

  const archiveDocument = async (id: string) => {
    const document = documents.find((doc) => doc.id === id);
    if (!document) return;

    const newArchivedState = !document.isArchived;
    try {
      await updateSupabaseDocument(id, { is_archived: newArchivedState });
      if (currentDocument?.id === id) {
        setCurrentDocument((prev) =>
          prev ? { ...prev, isArchived: newArchivedState } : null
        );
      }
    } catch (error) {
      console.error("Failed to archive/unarchive document:", error);
      toast.error("Failed to update document");
    }
  };

  const searchDocuments = async (query: string) => {
    if (!query.trim()) {
      // If query is empty, show all documents
      return;
    }

    try {
      const results = await searchSupabaseDocuments(query);
      const searchResults = results.map((doc) => ({
        id: doc.id,
        title: doc.title,
        content: doc.content,
        lastModified: new Date(doc.last_modified),
        isStarred: doc.is_starred,
        isArchived: doc.is_archived,
        tags: doc.tags,
        wordCount: doc.word_count,
      }));
      console.log(
        `Found ${searchResults.length} documents matching "${query}"`
      );
      return searchResults;
    } catch (error) {
      console.error("Failed to search documents:", error);
      return [];
    }
  };

  const updateDocumentTitle = async (id: string, newTitle: string) => {
    try {
      await updateSupabaseDocument(id, { title: newTitle });
      if (currentDocument?.id === id) {
        setCurrentDocument((prev) =>
          prev ? { ...prev, title: newTitle, lastModified: new Date() } : null
        );
      }
    } catch (error) {
      console.error("Failed to update document title:", error);
      toast.error("Failed to update document title");
    }
  };

  const wordCount = currentDocument?.wordCount || 0;

  const calculateCharacterCount = (content: any): number => {
    if (!content) return 0;

    if (typeof content === "string") {
      // For HTML content, extract text and count characters
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = content;
      const text = tempDiv.textContent || tempDiv.innerText || "";
      return text.length;
    }

    if (Array.isArray(content)) {
      return content.reduce(
        (count, block) => count + (block.content || "").length,
        0
      );
    }

    return 0;
  };

  const characterCount = currentDocument
    ? calculateCharacterCount(currentDocument.content)
    : 0;
  const readingTime = Math.ceil(wordCount / 200);

  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "var(--toast-bg, #363636)",
                color: "var(--toast-color, #fff)",
              },
              success: {
                iconTheme: {
                  primary: "#10b981",
                  secondary: "#fff",
                },
              },
              error: {
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#fff",
                },
              },
            }}
          />
          <Alert
            isOpen={alertState.isOpen}
            onClose={closeAlert}
            title={alertState.title}
            message={alertState.message}
            type={alertState.type}
            onConfirm={alertState.onConfirm}
            confirmText={alertState.type === "confirm" ? "Delete" : "OK"}
            cancelText="Cancel"
          />

          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/editor"
              element={
                <div className="flex h-screen relative w-full">
                  {/* Mobile Overlay */}
                  {isMobileMenuOpen && (
                    <div
                      className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                      onClick={() => setIsMobileMenuOpen(false)}
                    />
                  )}

                  {/* Sidebar */}
                  <div
                    className={`${
                      isMobileMenuOpen
                        ? "fixed inset-y-0 left-0 z-50 w-80"
                        : "hidden lg:block"
                    } ${
                      isSidebarCollapsed ? "lg:w-16" : "lg:w-80"
                    } transition-all duration-300`}
                  >
                    <Sidebar
                      documents={documents}
                      currentDocument={currentDocument}
                      onSelectDocument={(doc) => {
                        selectDocument(doc);
                        setIsMobileMenuOpen(false);
                      }}
                      onCreateDocument={createDocument}
                      onDeleteDocument={deleteDocument}
                      onStarDocument={starDocument}
                      onArchiveDocument={archiveDocument}
                      onSearchDocuments={searchDocuments}
                      onUpdateDocumentTitle={updateDocumentTitle}
                      isCollapsed={isSidebarCollapsed}
                      onToggleCollapse={() =>
                        setIsSidebarCollapsed(!isSidebarCollapsed)
                      }
                    />
                  </div>

                  <div className="flex-1 flex flex-col min-w-0 w-full">
                    <Header
                      onSave={handleSave}
                      onExport={handleExport}
                      onShare={handleShare}
                      onUpdateTitle={(newTitle) =>
                        currentDocument &&
                        updateDocumentTitle(currentDocument.id, newTitle)
                      }
                      currentDocumentTitle={currentDocument?.title}
                      wordCount={wordCount}
                      isCollaborating={false}
                      collaborators={0}
                      onToggleMobileMenu={() =>
                        setIsMobileMenuOpen(!isMobileMenuOpen)
                      }
                      isMobileMenuOpen={isMobileMenuOpen}
                    />

                    <div className="flex-1 flex flex-col">
                      {currentDocument ? (
                        <div className="h-full overflow-hidden">
                          <TipTapWrapper
                            initialContent={currentDocument.content}
                            onContentChange={handleContentChange}
                            onSave={() => handleSave(false)}
                            showPreview={showPreview}
                            onTogglePreview={() => setShowPreview(!showPreview)}
                          />
                        </div>
                      ) : (
                        <div className="flex-1 flex items-center justify-center px-4">
                          <div className="text-center max-w-4xl">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
                              Welcome to WriteFlow
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm sm:text-base">
                              Create a new document to get started
                            </p>
                            <button
                              onClick={createDocument}
                              className="px-4 sm:px-6 py-2 sm:py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors text-sm sm:text-base"
                            >
                              Create Document
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <StatusBar
                      wordCount={wordCount}
                      characterCount={characterCount}
                      readingTime={readingTime}
                      lastSaved={lastSaved}
                      isOnline={isOnline}
                      isCollaborating={false}
                      collaborators={0}
                      isAutoSave={isAutoSave}
                      isAutoSaving={isAutoSaving}
                      autoSavePending={autoSavePending}
                      hasUnsavedChanges={hasUnsavedChanges}
                      onToggleAutoSave={() => setIsAutoSave(!isAutoSave)}
                      onSave={() => handleSave(false)}
                    />
                  </div>
                </div>
              }
            />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
};

export default App;
