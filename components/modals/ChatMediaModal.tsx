import React from 'react';
import { X, Eye } from 'lucide-react';
import { Modal, ModalContent, ModalHeader, ModalTitle } from "@/components/ui/modal";

interface ChatFile {
  fileUrl: string;
  fileName: string;
  fileType: string;
}

interface Message {
  _id: string;
  files?: ChatFile[];
}

interface ChatMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: Message;
  type?: 'images' | 'documents';
  onDownload: (file: ChatFile) => void;
  formatFileSize: (bytes: number) => string;
}

const FileIcon = ({ fileType }: { fileType: string }) => {
  if (fileType.includes('pdf')) return <span className="font-bold text-4xl bg-white dark:bg-transparent">📄</span>;
  if (fileType.includes('doc')) return <span className="font-bold text-4xl bg-white dark:bg-transparent">📝</span>;
  if (fileType.includes('xls')) return <span className="font-bold text-4xl bg-white dark:bg-transparent">📊</span>;
  if (fileType.includes('ppt')) return <span className="font-bold text-4xl bg-white dark:bg-transparent">📑</span>;
  if (fileType.includes('zip') || fileType.includes('rar')) return <span className="font-bold text-4xl bg-white dark:bg-transparent">🗂️</span>;
  return <span className="font-bold text-4xl bg-white dark:bg-transparent">📎</span>;
};

const ChatMediaModal = ({
  isOpen,
  onClose,
  message,
  type,
  onDownload,
  formatFileSize
}: ChatMediaModalProps) => {
  if (!message?.files) return null;

  const files = message.files.filter(file => {
    if (type === 'images') {
      return ['jpg', 'jpeg', 'png', 'gif'].includes(file.fileType.toLowerCase());
    } else {
      return !['jpg', 'jpeg', 'png', 'gif'].includes(file.fileType.toLowerCase());
    }
  });

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent className="w-[95%] max-w-5xl px-4 md:px-6 rounded-lg">
        <ModalHeader>
          <ModalTitle className="text-[20px] sm:text-[24px] font-semibold dark:text-dark-text border-b border-[#E3E3E3] dark:border-dark-border pb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span>{type === 'images' ? 'Images' : 'Files'}</span>
              <span className="text-base font-normal text-gray-500 dark:text-dark-text/60">
                ({files.length} {type === 'images' ? 'images' : 'files'})
              </span>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-dark-2/20 transition-colors"
            >
              <X className="h-5 w-5 text-gray-500 dark:text-dark-text/60" />
            </button>
          </ModalTitle>
        </ModalHeader>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          {type === 'images' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {files.map((file, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-input-bg">
                    <img
                      src={file.fileUrl}
                      alt={file.fileName}
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center gap-2">
                      <button 
                        onClick={() => window.open(file.fileUrl, '_blank')}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </button>
                      <button 
                        onClick={() => onDownload(file)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                  <p className="text-xs mt-1 text-gray-500 dark:text-dark-text/60 truncate px-1">
                    {file.fileName.split('-').pop()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {files.map((file, index) => (
                <div key={index} className="relative group">
                  <div className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-input-bg hover:bg-gray-100 dark:hover:bg-dark-2/20 transition-colors">
                    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                      <FileIcon fileType={file.fileType} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-dark-text truncate">
                        {file.fileName.split('-').pop()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-dark-text/60 mt-1">
                        {file.fileType.toUpperCase()} • {formatFileSize(file.fileUrl.length)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => window.open(file.fileUrl, '_blank')}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-dark-2/20 hover:bg-gray-300 dark:hover:bg-dark-2/40 transition-colors text-gray-700 dark:text-dark-text"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="hidden sm:inline">View</span>
                      </button>
                      <button 
                        onClick={() => onDownload(file)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-dark-2/20 hover:bg-gray-300 dark:hover:bg-dark-2/40 transition-colors text-gray-700 dark:text-dark-text"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span className="hidden sm:inline">Download</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ModalContent>
    </Modal>
  );
};

export default ChatMediaModal; 