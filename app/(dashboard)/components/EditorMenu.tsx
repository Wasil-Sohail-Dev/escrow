import { 
    Bold, 
    Italic, 
    Underline as UnderlineIcon, 
    AlignLeft, 
    AlignCenter, 
    AlignRight, 
    List, 
    ListOrdered,
  } from 'lucide-react';
  
  const MenuBar = ({ editor }: { editor: any }) => {
      if (!editor) {
        return null;
      }
      // const fontSizes = Array.from({ length: 100 }, (_, i) => i + 1);
      return (
        <div className="flex items-center border border-[#D1D5DB] dark:border-dark-border dark:bg-dark-input-bg p-2 shadow-[1px_2px_2px_0px_#00000026] rounded-lg gap-6">
           {/* <select
          className="px-2 py-1 bg-white dark:bg-dark-2/20 rounded text-[#64748B] dark:text-dark-text/60 text-sm"
          onChange={(e) => {
            const value = e.target.value;
            if (value === "paragraph") {
              editor.chain().focus().setParagraph().run();
            } else {
              editor.chain().focus().toggleHeading({ level: parseInt(value) }).run();
            }
          }}
        >
          <option value="paragraph">Paragraph</option>
          {[1, 2, 3, 4, 5, 6].map((level) => (
            <option key={level} value={level}>
              Heading {level}
            </option>
          ))}
        </select> */}
  
        {/* Font Size Selector */}
        {/* <select
          className="px-2 py-1 bg-white dark:bg-dark-2/20 rounded text-[#64748B] dark:text-dark-text/60 text-sm"
          onChange={(e) => {
            const fontSize = e.target.value;
            editor.chain().focus().setMark("textStyle", { fontSize: `${fontSize}px` }).run();
          }}
        >
          <option value="">Font Size</option>
          {fontSizes.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select> */}
          <div className="h-4" />
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 hover:bg-gray-100 dark:hover:bg-dark-2/20 rounded ${
              editor.isActive("bold")
                ? "text-primary bg-gray-100 dark:bg-dark-2/20"
                : "text-[#64748B] dark:text-dark-text/60"
            }`}
          >
            <Bold size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 hover:bg-gray-100 dark:hover:bg-dark-2/20 rounded ${
              editor.isActive("italic")
                ? "text-primary bg-gray-100 dark:bg-dark-2/20"
                : "text-[#64748B] dark:text-dark-text/60"
            }`}
          >
            <Italic size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-1.5 hover:bg-gray-100 dark:hover:bg-dark-2/20 rounded ${
              editor.isActive("underline")
                ? "text-primary bg-gray-100 dark:bg-dark-2/20"
                : "text-[#64748B] dark:text-dark-text/60"
            }`}
          >
            <UnderlineIcon size={18} />
          </button>
          <div className="h-4 w-[1px] bg-[#D1D5DB] dark:bg-dark-border mx-1" />
          <button
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={`p-1.5 hover:bg-gray-100 dark:hover:bg-dark-2/20 rounded ${
              editor.isActive({ textAlign: "left" })
                ? "text-primary bg-gray-100 dark:bg-dark-2/20"
                : "text-[#64748B] dark:text-dark-text/60"
            }`}
          >
            <AlignLeft size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={`p-1.5 hover:bg-gray-100 dark:hover:bg-dark-2/20 rounded ${
              editor.isActive({ textAlign: "center" })
                ? "text-primary bg-gray-100 dark:bg-dark-2/20"
                : "text-[#64748B] dark:text-dark-text/60"
            }`}
          >
            <AlignCenter size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={`p-1.5 hover:bg-gray-100 dark:hover:bg-dark-2/20 rounded ${
              editor.isActive({ textAlign: "right" })
                ? "text-primary bg-gray-100 dark:bg-dark-2/20"
                : "text-[#64748B] dark:text-dark-text/60"
            }`}
          >
            <AlignRight size={18} />
          </button>
          <div className="h-4 w-[1px] bg-[#D1D5DB] dark:bg-dark-border mx-1" />
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 hover:bg-gray-100 dark:hover:bg-dark-2/20 rounded ${
              editor.isActive("bulletList")
                ? "text-primary bg-gray-100 dark:bg-dark-2/20"
                : "text-[#64748B] dark:text-dark-text/60"
            }`}
          >
            <List size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 hover:bg-gray-100 dark:hover:bg-dark-2/20 rounded ${
              editor.isActive("orderedList")
                ? "text-primary bg-gray-100 dark:bg-dark-2/20"
                : "text-[#64748B] dark:text-dark-text/60"
            }`}
          >
            <ListOrdered size={18} />
          </button>
        </div>
      );
    };
    export default MenuBar;