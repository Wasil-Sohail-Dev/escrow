'use client'
import React, { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/modal";
import Image from "next/image";
import AddMilestoneModal from "./AddMilestoneModal";

interface WorkSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  setIsRevisionModalOpen: () => void;
}

const WorkSubmissionModal = ({ isOpen, onClose, setIsRevisionModalOpen }: WorkSubmissionModalProps) => {
  const [isAddMilestoneOpen, setIsAddMilestoneOpen] = useState(false);

  return (
    <>
      <Modal open={isOpen} onOpenChange={onClose}>
        <ModalContent className="w-[95%] max-w-[547px] px-4 md:px-6 rounded-lg">
          <ModalHeader>
            <ModalTitle className="text-[16px] sm:text-[20px] md:text-[20px] font-[600] dark:text-dark-text border-b border-[#E3E3E3] pb-4">
              Work Submitted By Vendor
            </ModalTitle>
          </ModalHeader>
          <div className="space-y-4  mt-5">
              <div>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[12px] sm:text-[14px] md:text-[16px] font-[500] dark:text-dark-text">Progress Status:</span>
                <span className="text-[12px] sm:text-[14px] md:text-[16px] font-[400] text-paragraph dark:text-dark-text/60">On Going</span>
                <Image src="/assets/worksubmition.svg" alt="info" width={15} height={15} className="mt-1" />
              </div>
              <Button 
                className="bg-[#CACED8] mt-2 hover:bg-[#CACED8]/90 dark:bg-dark-input-bg text-white dark:text-dark-text text-[12px] sm:text-[13px] md:text-[14px] font-[700] leading-[19px] h-[36px] sm:h-[38px] md:h-[42px]"
              >
                Release Payment
              </Button>
            </div>
            <div className="flex items-start gap-2 -mt-2">
              <span className="text-[12px] sm:text-[14px] md:text-[16px] font-[500] dark:text-dark-text">Payment Status:</span>
              <span className="text-[12px] sm:text-[14px] md:text-[16px] font-[400] text-paragraph dark:text-dark-text/60">Withheld</span>
              <Image src="/assets/worksubmition.svg" alt="info" width={15} height={15} className="mt-1 ml-1" />
            </div>

              </div>

            <div className="pt-4 pb-14">
              <h3 className="text-[16px] sm:text-[18px] md:text-[19px] font-[700] leading-[27px] mb-4 dark:text-dark-text">
                Work Submitted by Vendor (2)
              </h3>
              <div className="space-y-3">
                {[1, 2].map((_, i) => (
                  <div
                  key={i}
                  className="flex items-center h-[56px] sm:h-[64px] md:h-[74px] justify-between px-4 rounded-lg border dark:border-dark-border dark:bg-dark-input-bg"
                >
                  <div className="flex items-center gap-3">
                    <Image
                      src="/assets/PDF.svg"
                      alt="pdf"
                      width={31}
                      height={36}
                    />
                    <div>
                      <p className="text-[12px] sm:text-[13px] md:text-[14px] font-[500] leading-[19px] text-paragraph dark:text-dark-text">
                        {"file.name"}
                      </p>
                      <p className="text-[10px] sm:text-[11px] md:text-[12px] font-[400] leading-[16px] text-[#8A8F9B] dark:text-dark-2">
                        {0.8} MB
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="dark:hover:bg-dark-2/20">
                    <Download
                      className="dark:text-dark-icon"
                      style={{ width: "20px", height: "20px" }}
                    />
                  </Button>
                </div>
                ))}
              </div>
            </div>

            <div className="flex items-end justify-end gap-3 mt-6 border-t border-[#E3E3E3] pt-6">
              <Button
                onClick={() => setIsAddMilestoneOpen(true)}
                className="bg-white hover:bg-white/90 text-black border-2 border-primary dark:bg-dark-input-bg dark:text-dark-text dark:border-primary text-[12px] sm:text-[13px] md:text-[14px] font-[600] leading-[16px] h-[36px] sm:h-[38px] md:h-[42px] rounded-lg"
              >
                Add New Milestone
              </Button>
              <Button 
              onClick={()=>{
                  onClose();
                  setIsRevisionModalOpen()
              }}
                className="bg-white hover:bg-white/90 text-black border-2 border-primary dark:bg-dark-input-bg dark:text-dark-text dark:border-primary text-[12px] sm:text-[13px] md:text-[14px] font-[600] leading-[16px] h-[36px] sm:h-[38px] md:h-[42px] rounded-lg"
              >
                Request revision
              </Button>
            </div>
          </div>
        </ModalContent>
      </Modal>

      <AddMilestoneModal 
        isOpen={isAddMilestoneOpen}
        onClose={() => setIsAddMilestoneOpen(false)}
      />
    </>
  );
};

export default WorkSubmissionModal; 