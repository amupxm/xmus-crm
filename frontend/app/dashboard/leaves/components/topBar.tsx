"use client";
import { Button, useDisclosure } from "@heroui/react";
import React from "react";

import AskForLeaveModal from "./askForLeaveModal";

const TopBar = ({ refreshData }: { refreshData: () => void }): React.ReactNode => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl pl-5 font-bold text-gray-900">Leave Balance</h1>
        <Button
          className="bg-purple-600 text-white hover:bg-purple-700"
          color="secondary"
          size="lg"
          onPress={onOpen}
        >
          Apply Leave
        </Button>
      </div>
      <AskForLeaveModal isOpen={isOpen} onOpenChange={onOpenChange} refreshData={refreshData} />
    </>
  );
};

export default TopBar;
