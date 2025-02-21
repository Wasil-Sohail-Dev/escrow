const FileIcon = ({ fileType }: { fileType: string }) => {
  if (fileType.includes("pdf")) return <span className="font-bold text-4xl bg-white dark:bg-transparent">📄</span>;
  if (fileType.includes("doc")) return <span className="font-bold text-4xl bg-white dark:bg-transparent">📝</span>;
  if (fileType.includes("xls")) return <span className="font-bold text-4xl bg-white dark:bg-transparent">📊</span>;
  if (fileType.includes("ppt")) return <span className="font-bold text-4xl bg-white dark:bg-transparent">📑</span>;
  if (fileType.includes("zip") || fileType.includes("rar"))
    return <span className="font-bold text-4xl bg-white dark:bg-transparent">🗂️</span>;
  return <span className="font-bold text-4xl bg-white dark:bg-transparent">📎</span>;
};

export default FileIcon;
