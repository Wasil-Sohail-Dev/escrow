import React from "react";
import { Button } from "@/components/ui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "../ui/textarea";
import Image from "next/image";

interface AddMilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddMilestoneModal = ({ isOpen, onClose }: AddMilestoneModalProps) => {
  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent className="w-[95%] max-w-[547px] px-3 sm:px-4 md:px-8 rounded-lg">
        <ModalHeader>
          <ModalTitle className="text-[14px] sm:text-[16px] md:text-[20px] font-[600] dark:text-dark-text border-b border-[#E3E3E3] pb-3 sm:pb-4">
            Add New Milestone
          </ModalTitle>
        </ModalHeader>

        <div className="space-y-3 sm:space-y-4 mt-3 sm:mt-5">
          <div>
            <span></span>
            <p className="text-[13px] sm:text-[15px] md:text-[18px] leading-5 sm:leading-6 font-[500] dark:text-dark-text mb-1.5 sm:mb-2">
              Milestone Name
            </p>
            <Input
              placeholder="Add milestone name"
              className="h-[50px] sm:h-[55px] md:h-[60px] px-3 sm:px-4 rounded-[6px] sm:rounded-[8px] text-[11px] sm:text-[13px] md:text-[14px] border-[#CBCBCB] focus:border-[#CBCBCB] dark:border-dark-border dark:bg-dark-input-bg dark:text-dark-text placeholder:text-[#CACED8] dark:placeholder:text-dark-text/40"
            />
          </div>

          <div>
            <p className="text-[13px] sm:text-[15px] md:text-[18px] leading-5 sm:leading-6 font-[500] dark:text-dark-text mb-1.5 sm:mb-2">
              Milestone Amount
            </p>
            <Input
              placeholder="Add milestone amount"
              className="h-[50px] sm:h-[55px] md:h-[60px] px-3 sm:px-4 rounded-[6px] sm:rounded-[8px] text-[11px] sm:text-[13px] md:text-[14px] border-[#CBCBCB] focus:border-[#CBCBCB] dark:border-dark-border dark:bg-dark-input-bg dark:text-dark-text placeholder:text-[#CACED8] dark:placeholder:text-dark-text/40"
            />
          </div>

          <div>
            <p className="text-[13px] sm:text-[15px] md:text-[18px] leading-5 sm:leading-6 font-[500] dark:text-dark-text mb-1.5 sm:mb-2">
              Milestone Description
            </p>
            <Textarea
              placeholder="Add milestone description"
              className="h-[80px] sm:h-[100px] md:h-[144px] p-3 sm:p-4 rounded-[6px] sm:rounded-[8px] text-[11px] sm:text-[13px] md:text-[14px] border-[#CBCBCB] focus:border-[#CBCBCB] dark:border-dark-border dark:bg-dark-input-bg dark:text-dark-text placeholder:text-[#CACED8] dark:placeholder:text-dark-text/40"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <p className="text-[13px] sm:text-[15px] md:text-[18px] leading-5 sm:leading-6 font-[500] dark:text-dark-text mb-1.5 sm:mb-2">
                Start Date
              </p>
              <Input
                type="date"
                className="h-[50px] sm:h-[55px] md:h-[60px] px-3 sm:px-4 rounded-[6px] sm:rounded-[8px] text-[11px] sm:text-[13px] md:text-[14px] border-[#CBCBCB] focus:border-[#CBCBCB] dark:border-dark-border dark:bg-dark-input-bg dark:text-dark-text placeholder:text-[#CACED8] dark:placeholder:text-dark-text/40"
              />
            </div>
            <div>
              <p className="text-[13px] sm:text-[15px] md:text-[18px] leading-5 sm:leading-6 font-[500] dark:text-dark-text mb-1.5 sm:mb-2">
                End Date
              </p>
              <Input
                type="date"
                className="h-[50px] sm:h-[55px] md:h-[60px] px-3 sm:px-4 rounded-[6px] sm:rounded-[8px] text-[11px] sm:text-[13px] md:text-[14px] border-[#CBCBCB] focus:border-[#CBCBCB] dark:border-dark-border dark:bg-dark-input-bg dark:text-dark-text placeholder:text-[#CACED8] dark:placeholder:text-dark-text/40"
              />
            </div>
          </div>

          <div>
            <p className="text-[13px] sm:text-[15px] md:text-[18px] leading-5 sm:leading-6 font-[500] dark:text-dark-text mb-1.5 sm:mb-2">
              Upload Files
            </p>
            <div className="border-2 border-dashed border-[#E3E3E3] dark:border-dark-text rounded-lg h-[70px] sm:h-[80px] md:h-[132px] flex items-center justify-center p-4 sm:p-6 md:p-8 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-2/10 transition-colors">
              <input type="file" className="hidden" id="milestone-file-upload" multiple />
              <label htmlFor="milestone-file-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-1.5 sm:gap-2">
                  <Image src={"/assets/download2.svg"} alt="upload" width={35} height={25} className="w-[35px] h-[25px] sm:w-[40px] sm:h-[30px] md:w-[47px] md:h-[35px]" />
                  <p className="text-[11px] sm:text-[13px] md:text-[16px] dark:text-dark-text font-[400] leading-[18px] sm:leading-[20px] text-center dark:text-dark-text/60">
                    Drag and drop file here or <span className="font-[700] text-primary">Browse file</span>
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 sm:gap-3 border-t border-[#E3E3E3] pt-3 sm:pt-4">
            <Button 
              onClick={onClose}
              className="bg-white hover:bg-white/90 text-paragraph border dark:bg-dark-input-bg dark:text-dark-text dark:border-dark-border text-[11px] sm:text-[13px] md:text-[16px] font-[400] leading-[16px] h-[32px] sm:h-[38px] md:h-[42px] px-3 sm:px-4 rounded-[6px] sm:rounded-lg"
            >
              Cancel
            </Button>
            <Button 
              className="bg-primary hover:bg-primary/90 text-white dark:bg-primary dark:text-dark-text text-[11px] sm:text-[13px] md:text-[16px] font-[400] leading-[16px] h-[32px] sm:h-[38px] md:h-[42px] px-3 sm:px-4 rounded-[6px] sm:rounded-lg"
            >
              Submit
            </Button>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
};

export default AddMilestoneModal;