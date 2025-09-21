import { CommonSingleSelectDropdown } from "@/components/dropdown/commonDropdown";
import CommonTable, { TableConfig } from "@/components/table/commonTable";
import {
  Button,
  Card,
  CardBody,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger
} from "@heroui/react";
import { ILeaveRequest } from "@internal-cms/shared/dist/api/leaves";
import { MoreVertical, RefreshCcw } from "lucide-react";
import React, { useState } from "react";
const LeavesTable = ({
  leaveRequests,
  onRefresh,
  isLoading = false,
}: {
  leaveRequests: ILeaveRequest[];
  isLoading?: boolean;
  onRefresh?: () => void;
}): React.ReactNode => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const filteredRequests = leaveRequests.filter((request) => {
    const statusMatch =
      statusFilter === "all" || request.status.toLowerCase() === statusFilter;
    const typeMatch =
      typeFilter === "all" || request.type.toLowerCase() === typeFilter;

    return statusMatch && typeMatch;
  });
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "success";
      case "pending":
        return "warning";
      case "rejected":
        return "danger";
      case "cancelled":
        return "default";
      default:
        return "default";
    }
  };

  function formatLeaveDatesSmart(startDate: Date, endDate: Date): string {
    const s = new Date(startDate);
    const e = new Date(endDate);

    const sameMonth = s.getMonth() === e.getMonth();
    const sameYear = s.getFullYear() === e.getFullYear();

    const optionsStart: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      ...(sameYear ? {} : { year: "numeric" }),
    };

    const optionsEnd: Intl.DateTimeFormatOptions = {
      day: "numeric",
      ...(sameMonth ? {} : { month: "short" }),
      ...(sameYear ? {} : { year: "numeric" }),
    };

    const startStr = s.toLocaleDateString("en-US", optionsStart);
    const endStr = e.toLocaleDateString("en-US", optionsEnd);

    return `${startStr} - ${endStr}`;
  }

  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };

    return new Date(date).toLocaleDateString("en-US", options);
  };
  const tableConfig: TableConfig<ILeaveRequest> = {
    getRowKey: (row) => row._id,
    data: filteredRequests,

    tableRendererEntities: [
      {
        Header: 'LEAVE TYPE', ColumnRenderer: (rowData) => (
          <span className="font-medium text-gray-900">
            {rowData.type}
          </span>
        ),
      },
      {
        Header: 'DATES REQUESTED', ColumnRenderer: (rowData) => (
          <span className="text-gray-700">
            {formatLeaveDatesSmart(rowData.startDate, rowData.endDate)}
          </span>
        )
      },
      { Header: 'REASON', ColumnRenderer: (rowData) => (<span className="text-gray-700">{rowData.reason}</span>) },
      {
        Header: 'SUBMITTED ON', ColumnRenderer: (rowData) => (
          <span className="text-gray-700">
            {formatDate(rowData.submittedOn)}
          </span>)
      },
      {
        Header: 'STATUS', ColumnRenderer: (rowData) => (
          <Chip
            color={getStatusColor(rowData.status)}
            size="sm"
            variant="flat"
          >
            {rowData.status}
          </Chip>)
      },
      {
        Header: 'ACTIONS', ColumnRenderer: (rowData) => (<Dropdown>
          <DropdownTrigger>
            <Button isIconOnly size="sm" variant="light">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownTrigger>
          <DropdownMenu>
            <DropdownItem key="view">View Details</DropdownItem>
            <DropdownItem key="edit">Edit Request</DropdownItem>
            <DropdownItem key="cancel" className="text-danger">
              Cancel Request
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>)
      },
    ],
  }
  return (
    <Card className="shadow-sm">
      <CardBody className="p-0">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Leave Request History
            </h2>
            <div className="flex space-x-4">
              {/* // refresh btn  :  */}


              <CommonSingleSelectDropdown
                onChange={(selectedKey) => setStatusFilter(selectedKey)}
                label="Leave Status"
                selectedKey={statusFilter}
                options={[
                  { key: "all", label: "All Status" },
                  { key: "pending", label: "Pending" },
                  { key: "approved", label: "Approved" },
                  { key: "rejected", label: "Rejected" },]}
              />

              <CommonSingleSelectDropdown
                onChange={(selectedKey) => setStatusFilter(selectedKey)}
                label="Sort By"
                selectedKey={statusFilter}
                options={[
                  { key: "all", label: "All Requests" },
                  { key: "latest", label: "Latest First" },
                  { key: "oldest", label: "Oldest First" },
                ]}
              />

              <Button
                className="w-10 h-10 bg-purple-600/40 text-white flex items-center justify-center p-0 rounded-md"
                color="secondary"
                onPress={() => onRefresh ? onRefresh() : null}
                variant="ghost"
              >
                <RefreshCcw className="w-5 h-5" />
              </Button>

            </div>
          </div>
        </div>
        <CommonTable
          page={1}
          setPage={() => { }}
          pages={1}
          isLoading={isLoading}
          tableConfig={tableConfig}
        />
      </CardBody>
    </Card>
  );
};

export default LeavesTable;
