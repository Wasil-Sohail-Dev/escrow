"use client";

import React, { useState } from "react";
import Topbar from "../components/Topbar";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextStyle from "@tiptap/extension-text-style";
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import MenuBar from "../components/EditorMenu";

  

const Page = () => {
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

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
        class: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none min-h-[200px] px-4 py-2 dark:text-dark-text",
      },
    },
  });
  return (
    <>
      <Topbar
        title="Milestone submission"
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
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat.
            </p>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="md:col-span-2">
              <div className={`w-full border ${focusedInput === 'milestone' ? 'border-primary' : 'border-[#D1D5DB] dark:border-dark-border'} rounded-lg text-[#334155] dark:text-dark-text py-2 px-4 transition-colors dark:bg-dark-input-bg`}>
                <label className="text-[14px] text-[#334155] dark:text-dark-text font-[400] mb-2 block leading-[21px]">
                  Milestone Name
                </label>
                <input
                  placeholder="Graphic Designing"
                  className="dark:bg-transparent flex items-center justify-center w-full text-[16px] font-[400] leading-[25.6px] placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40"
                  onFocus={() => setFocusedInput('milestone')}
                  onBlur={() => setFocusedInput(null)}
                />
              </div>
            </div>

            <div className="md:col-span-1">
              <div className={`w-full border ${focusedInput === 'title' ? 'border-primary' : 'border-[#D1D5DB] dark:border-dark-border'} rounded-lg text-[#334155] dark:text-dark-text py-2 px-4 transition-colors dark:bg-dark-input-bg`}>
                <label className="text-[14px] text-[#334155] dark:text-dark-text font-[400] mb-2 block leading-[21px]">
                  Title
                </label>
                <input
                  placeholder="Graphic Designing"
                  className="dark:bg-transparent flex items-center justify-center w-full text-[16px] font-[400] leading-[25.6px] placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40"
                  onFocus={() => setFocusedInput('title')}
                  onBlur={() => setFocusedInput(null)}
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="text-[14px] text-[#334155] dark:text-dark-text font-[400] mb-2 block leading-[21px]">
                Upload File
              </label>
              <div className="border-2 border-dashed border-[#CACED8] dark:border-dark-border rounded-lg flex items-center justify-center h-[200px] text-center cursor-pointer dark:bg-dark-input-bg hover:border-primary dark:hover:border-primary transition-colors ">
                <div>
                  <input
                    type="file"
                    className="hidden"
                    id="file-upload"
                    multiple
                  />
                  <label
                    htmlFor="file-upload"
                    className="w-full h-full cursor-pointer"
                  >
                    <div className="flex justify-center mb-2">
                      <Image
                        src={"/assets/download2.svg"}
                        alt="upload"
                        width={40}
                        height={30}
                      />
                    </div>
                    <p className="text-[18px] font-[600] leading-[28.8px] text-[#64748B] dark:text-dark-text/60">
                      Drag and drop file here or{" "}
                      <span className="text-primary">browse file</span>
                    </p>
                  </label>
                </div>
              </div>
            </div>
            <div className="md:col-span-1">
              <div className={`w-full border ${focusedInput === 'id' ? 'border-primary' : 'border-[#D1D5DB] dark:border-dark-border'} rounded-lg text-[#334155] dark:text-dark-text py-2 px-4 transition-colors dark:bg-dark-input-bg`}>
                <label className="text-[14px] text-[#334155] dark:text-dark-text font-[400] mb-2 block leading-[21px]">
                  ID
                </label>
                <input
                  placeholder="Graphic Designing"
                  className="dark:bg-transparent flex items-center justify-center w-full text-[16px] font-[400] leading-[25.6px] placeholder:text-[#ABB1BB] dark:placeholder:text-dark-text/40"
                  onFocus={() => setFocusedInput('id')}
                  onBlur={() => setFocusedInput(null)}
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
                  <EditorContent editor={editor} className="min-h-[200px] dark:bg-dark-input-bg" />
                </div>
            </div>
            <div className="grid grid-flow-col gap-4 pt-6 md:col-span-1 items-end justify-end">
            <Button className="h-[42px] px-6 md:px-10 border bg-transparent text-[#292929] border-primary hover:text-primary hover:bg-transparent rounded-lg transition-colors dark:text-dark-text dark:hover:text-primary dark:bg-dark-input-bg">
              Cancel
            </Button>
            <Button className="h-[42px] px-6 md:px-10 bg-primary hover:bg-primary/90 text-[16px] font-[700] leading-[19.6px] text-white dark:text-dark-text rounded-lg transition-colors">
              Save
            </Button>
          </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
