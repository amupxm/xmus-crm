"use client";
import {
  ILeaveRequest,
  LeaveBalanceInterface,
} from "@internal-cms/shared/dist/api/leaves";
import { useRouter } from "next/navigation";
import React from "react";

import LeaveBalances from "./components/leaveBalance";
import LeavesTable from "./components/leavesTable";

import TopBar from "@/app/dashboard/leaves/components/topBar";
import TabComponent, { TabsType } from "@/components/tab/tabComponent";
import { useAuth } from "@/hooks/useAuth";
import { useLeave } from "@/hooks/useLeave";
import { ENUM_LEAVE_TYPE } from "@internal-cms/shared/src/api/leaves";

const LeaveBalanceDashboard = () => {
  const { user, getMe, isGettingMe } = useAuth();
  const router = useRouter();
  const [leaveRequests, setLeaveRequests] = React.useState<ILeaveRequest[]>([])
  const [leavesBalance, setLeavesBalance] = React.useState<
    LeaveBalanceInterface[]
  >([]);

  const { getAllLeaveRequests, isGettingLeaveRequests } = useLeave();

  React.useEffect(() => {
    if (!user) {
      getMe().catch(() => {
        router.push("/login");
      });
    } else {
      getAllLeaveRequests().then((data) => {
        setLeaveRequests(data.reverse() || []);
        setLeavesBalance([
          {
            type: ENUM_LEAVE_TYPE.WFH,
            total: 365,
            used: data.filter(e => e.type == ENUM_LEAVE_TYPE.WFH).length,
          },
          {
            type: ENUM_LEAVE_TYPE.SICK,
            total: user.sickLeavesAvailable,
            used: data.filter(e => e.type == ENUM_LEAVE_TYPE.SICK).length,
          },
          {
            type: ENUM_LEAVE_TYPE.CASUAL,
            total: user.casualLeavesAvailable,
            used: data.filter(e => e.type == ENUM_LEAVE_TYPE.CASUAL).length,
          },
          {
            type: ENUM_LEAVE_TYPE.VACATION,
            total: user.vacationLeavesAvailable,
            used: data.filter(e => e.type == ENUM_LEAVE_TYPE.VACATION).length,
          },
        ])
      }).catch(() => {
        router.push("/login");
      });
    }
  }, [user, getMe, getAllLeaveRequests, router]);
  const refreshData = () => {
    getMe().then(() => {
      getAllLeaveRequests().then((data) => {
        setLeaveRequests(data.reverse() || []);
      }).catch(() => {
        router.push("/login");
      });
    }).catch(() => {
      router.push("/login");
    });
  }
  const tabs: TabsType = [
    {
      tabName: "Leaves",
      tabKey: "primary",
      tabComponent: (
        <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
          <TopBar refreshData={refreshData} />
          <LeaveBalances leaveBalances={leavesBalance} />
          <LeavesTable leaveRequests={leaveRequests} isLoading={isGettingMe} onRefresh={() => getMe()} />
        </div>
      )
    }
  ]
  return (
    <TabComponent tabs={tabs} />
  );
};

export default LeaveBalanceDashboard;
