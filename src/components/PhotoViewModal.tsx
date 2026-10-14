import React from 'react';
import { X, Image as ImageIcon } from 'lucide-react';

interface PhotoViewModalProps {
  isOpen: boolean;
  photoUrl: string | null;
  title?: string;
  onClose: () => void;
}

export const PhotoViewModal: React.FC<PhotoViewModalProps> = ({
  isOpen,
  photoUrl,
  title = '점검 사진 확인',
  onClose,
}) => {
  if (!isOpen || !photoUrl) return null;

  return (
    <div
      onClick={onClose}
      className="absolute inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-xs select-none animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[340px] bg-white rounded-[24px] overflow-hidden shadow-2xl flex flex-col border border-slate-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-[#F5F7FB]">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-[#2B6BF3]" />
            <h3 className="text-[15px] font-bold text-[#1B2333] truncate">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#6B7690] hover:text-[#1B2333] active:scale-95 transition rounded-full cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Photo Container */}
        <div className="bg-black flex items-center justify-center min-h-[220px] max-h-[380px] overflow-hidden">
          <img
            src={photoUrl}
            alt={title}
            className="w-full h-full object-contain max-h-[380px]"
          />
        </div>

        {/* Footer */}
        <div className="p-3 bg-white">
          <button
            onClick={onClose}
            className="w-full py-3 bg-[#2B6BF3] hover:bg-[#1F52C9] active:scale-[0.98] text-white font-bold text-[16px] rounded-[14px] transition cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
