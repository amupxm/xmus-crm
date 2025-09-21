import { Card, CardBody } from "@heroui/react";
import {
  ENUM_LEAVE_TYPE,
  LeaveBalanceInterface,
} from "@internal-cms/shared/src/api/leaves";
import { Briefcase, Calendar, Heart, Users } from "lucide-react";
import React from "react";

const leaveBalancesIconMap: Record<ENUM_LEAVE_TYPE, React.ReactNode> = {
  "work from home": <Calendar className="w-6 h-6 text-orange-500" />,
  sick: <Heart className="w-6 h-6 text-orange-500" />,
  casual: <Briefcase className="w-6 h-6 text-orange-500" />,
  vacation: <Users className="w-6 h-6 text-orange-500" />,
};

const getIconForBalanceType = (type: ENUM_LEAVE_TYPE): React.ReactNode => {
  return (
    leaveBalancesIconMap[type] || (
      <Calendar className="w-6 h-6 text-orange-500" />
    )
  );
};
const LeaveBalance = ({
  leaveBalances,
}: {
  leaveBalances: LeaveBalanceInterface[];
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {leaveBalances.map((balance, index) => (
        <Card
          key={index}
          className={`bg-orange-50 border-orange-200 shadow-sm hover:shadow-md transition-shadow`}
        >
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                {getIconForBalanceType(balance.type)}
                <h3 className="font-semibold text-gray-800">{balance.type}</h3>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {balance.used} / {balance.total} Days Used
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div
                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(balance.used / balance.total) * 100}%` }}
              />
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
};

export default LeaveBalance;
