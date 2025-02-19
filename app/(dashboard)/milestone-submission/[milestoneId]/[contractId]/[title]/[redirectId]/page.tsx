"use client";

import React, { useState } from "react";
import Topbar from "../../../../../../../components/dashboard/Topbar";
import { Button } from "@/components/ui/button";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextStyle from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import MenuBar from "../../../../../../../components/dashboard/EditorMenu";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import { Eye } from "lucide-react";
import FilePreviewModal from "@/components/modals/FilePreviewModal";
import DragDropFile from "@/components/shared/DragDropFile";

const Page = () => {
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [documents, setDocuments] = useState<File[]>([]);
  const [isFilePreviewOpen, setIsFilePreviewOpen] = useState(false);
  const { contractId, milestoneId, title, redirectId } = useParams();
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none min-h-[200px] px-4 py-2 dark:text-dark-text [&_ol]:list-decimal [&_ul]:list-disc [&_ol]:pl-[40px] [&_ul]:pl-[40px]",
      },
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setDocuments(prev => [...prev, ...Array.from(files)]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!editor?.getText().trim()) {
      toast({
        title: "Error",
        description: "Please enter a milestone description",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Create FormData
      const formData = new FormData();
      
      // Add JSON data
      const jsonData = {
        contractId,
        milestoneId,
        action: "vendor_submitted",
        userId: user?._id,
        title: decodeURIComponent(title as string),
        description: editor?.getText(),
        userRole: user?.userType,
      };
      formData.append('data', JSON.stringify(jsonData));

      // Add files if they exist
      if (documents.length > 0) {
        documents.forEach((file) => {
          formData.append('files', file);
        });
      }

      const response = await fetch("/api/manage-milestone-tasks", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Milestone submitted successfully",
        });
        router.push(`/contact-details/${redirectId}`);
      } else {
        throw new Error(data.error || "Failed to submit milestone");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit milestone",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Topbar
        title={`Submit ${decodeURIComponent(title as string)}`}
        description="Submit your milestone work"
      />
      <div className="mt-[85px]">
        <div className="space-y-6">
          {/* Task Details Section */}
          <div>
            <h2 className="text-[24px] font-semibold text-paragraph dark:text-dark-text mb-4 leading-[38.4px]">
              Task Detail
            </h2>
            <p className="text-[16px] font-[400] leading-[25.6px] text-paragraph dark:text-dark-text/60 mb-6">
              Please ensure all tasks are completed as per the project requirements. Submitting a milestone marks the completion of a significant phase in the project.
            </p>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="md:col-span-3 bg-gray-100 dark:bg-dark-input-bg">
              <div
                className={`w-full border ${
                  focusedInput === "title"
                    ? "border-primary"
                    : "border-[#D1D5DB] dark:border-dark-border"
                } rounded-lg text-[#334155] dark:text-dark-text py-2 px-4 transition-colors dark:bg-dark-input-bg`}
              >
                <label className="text-[14px] text-[#334155] dark:text-dark-text font-[400] mb-2 block leading-[21px]">
                  Title
                </label>
                <input
                  value={decodeURIComponent(title as string)}
                  placeholder="Graphic Designing"
                  className="dark:bg-transparent flex items-center justify-center w-full text-[16px] font-[400] leading-[25.6px] placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40"
                  disabled
                />
              </div>
            </div>
            
            <div className="md:col-span-2">
              <label className="text-[14px] text-[#334155] dark:text-dark-text font-[400] mb-2 block leading-[21px]">
                Upload File
              </label>
              <DragDropFile
                onFileSelect={(files: File[]) => {
                  handleFileUpload({ target: { files } } as any);
                }}
                acceptedFileTypes="image/*,.pdf,.doc,.docx,.zip"
                // maxFiles={5}
                // maxSize={10}
              />

              {/* File Preview Button */}
              {documents.length > 0 && (
                <div className="flex justify-end mt-4">
                  <Button
                    type="button"
                    onClick={() => setIsFilePreviewOpen(true)}
                    className="text-primary hover:text-primary/80 hover:bg-primary/10"
                    variant="ghost"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View selected files ({documents.length})
                  </Button>
                </div>
              )}
            </div>
            <div className="md:col-span-1">
              <div className="h-0 sm:h-6"></div>
              <div
                className={`w-full border bg-gray-100 rounded-lg text-[#334155] dark:text-dark-text py-2 px-4 transition-colors dark:bg-dark-input-bg`}
              >
                <label className="text-[14px] text-[#334155] dark:text-dark-text font-[400] mb-2 block leading-[21px]">
                  ID
                </label>
                <input
                  value={milestoneId}
                  placeholder="Graphic Designing"
                  className="dark:bg-transparent flex items-center justify-center w-full text-[16px] font-[400] leading-[25.6px] placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40"
                  disabled
                />
              </div>
            </div>
            <div className="md:col-span-2 relative">
              <label className="text-[14px] text-primary font-[500] mb-2 block leading-[21px]">
                Description
              </label>
              <hr className="absolute top-8 left-0 h-[3px] md:w-[90px] bg-primary" />
              <hr className="border-t border-[#D1D5DB] dark:border-dark-border my-4 mt-3" />
              <MenuBar editor={editor} />
              <div className="border border-[#D1D5DB] dark:border-dark-border rounded-lg mt-4">
                <EditorContent
                  editor={editor}
                  className="min-h-[200px] dark:bg-dark-input-bg"
                />
              </div>
            </div>
            <div className="grid grid-flow-col gap-4 pt-6 md:col-span-1 items-end justify-end">
              <Button
                onClick={() => router.back()}
                className="h-[42px] px-6 md:px-10 border bg-transparent text-[#292929] border-primary hover:text-primary hover:bg-transparent rounded-lg transition-colors dark:text-dark-text dark:hover:text-primary dark:bg-dark-input-bg"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isLoading || !editor?.getText().trim()}
                className="h-[42px] px-6 md:px-10 bg-primary hover:bg-primary/90 text-[16px] font-[700] leading-[19.6px] text-white dark:text-dark-text rounded-lg transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </div>
                ) : (
                  "Submit"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <FilePreviewModal
        isOpen={isFilePreviewOpen}
        onClose={() => setIsFilePreviewOpen(false)}
        files={documents}
        onRemove={handleRemoveFile}
        isDownloadable={false}
      />
    </>
  );
};

export default Page;