"use client";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Progress,
  Tab,
  Tabs
} from "@heroui/react";
import {
  Briefcase,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  DollarSign,
  Filter,
  MoreVertical,
  Plane,
  X
} from "lucide-react";
import { useState } from "react";

export default function RequestsDashboard() {
  const [activeTab, secantActiveTab] = useState("requests");
  const [statusFilter, setStatusFilter] = useState("all");
  const [leaveTypeFilter, setLeaveTypeFilter] = useState("all");
  const [pendingFromFilter, setPendingFromFilter] = useState("all");

  const requests = [
    {
      id: 1,
      type: "Sick leave request",
      user: {
        name: "John Doe",
        avatar: "https://i.pravatar.cc/150?u=john",
        appliedAgo: "2 days ago"
      },
      duration: "2 Days",
      dateRange: "March 27 - March 29 2018",
      timeRemaining: "12 sick leaves remaining",
      progress: 60,
      reason: "Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil",
      status: "pending",
      approvalProcess: ["Manager", "HR", "Finance"],
      currentStep: 1
    },
    {
      id: 2,
      type: "Excuse request",
      user: {
        name: "Jane Smith",
        avatar: "https://i.pravatar.cc/150?u=jane",
        appliedAgo: "3 days ago"
      },
      duration: "2.5 Hours",
      dateRange: "March 27, 2018",
      timeRange: "9 am - 10 pm",
      timeRemaining: "10 Hrs",
      availableHours: "60 Hrs",
      reason: "Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil",
      status: "approved",
      approvalProcess: ["Manager", "HR"],
      currentStep: 2
    },
    {
      id: 3,
      type: "Leave request",
      user: {
        name: "Mike Johnson",
        avatar: "https://i.pravatar.cc/150?u=mike",
        appliedAgo: "1 day ago"
      },
      duration: "5000.00",
      dateRange: "March 31 2018",
      reason: "Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil",
      status: "rejected",
      approvalProcess: ["Manager"],
      currentStep: 0
    },
    {
      id: 4,
      type: "Business Trip Request",
      user: {
        name: "Sarah Wilson",
        avatar: "https://i.pravatar.cc/150?u=sarah",
        appliedAgo: "5 days ago"
      },
      duration: "3 Days in Jeddah",
      dateRange: "March 27 - March 29 2018",
      cost: "$5100 Total bill",
      reason: "Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil",
      status: "pending",
      approvalProcess: ["Manager", "Finance", "CEO"],
      currentStep: 1
    },
    {
      id: 5,
      type: "Loan request",
      user: {
        name: "David Brown",
        avatar: "https://i.pravatar.cc/150?u=david",
        appliedAgo: "2 days ago"
      },
      duration: "25,000",
      dateRange: "March 31 2018",
      details: "$1718.75 Deduction from salary monthly",
      reason: "Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil",
      status: "approved",
      approvalProcess: ["Manager", "Finance", "HR"],
      currentStep: 3
    },
    {
      id: 6,
      type: "Ticket Request",
      user: {
        name: "Lisa Garcia",
        avatar: "https://i.pravatar.cc/150?u=lisa",
        appliedAgo: "3 days ago"
      },
      duration: "2 Tickets",
      dateRange: "March 27 - March 28 2018",
      details: "View Timeline",
      reason: "Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil",
      status: "pending",
      approvalProcess: ["Manager", "Admin"],
      currentStep: 1,
      isNew: true
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "success";
      case "pending":
        return "warning";
      case "rejected":
        return "danger";
      default:
        return "default";
    }
  };

  const getTypeIcon = (type) => {
    if (type.includes("Sick")) return <Calendar className="w-5 h-5" />;
    if (type.includes("Business")) return <Briefcase className="w-5 h-5" />;
    if (type.includes("Loan")) return <DollarSign className="w-5 h-5" />;
    if (type.includes("Ticket")) return <Plane className="w-5 h-5" />;
    return <Clock className="w-5 h-5" />;
  };

  const renderApprovalProcess = (process, currentStep, status) => {
    return (
      <div className="flex items-center space-x-2 mt-2">
        {process.map((step: string, index: number) => (
          <div key={index} className="flex items-center">
            <Chip
              size="sm"
              variant={index < currentStep ? "solid" : index === currentStep ? "bordered" : "light"}
              color={
                index < currentStep ? "success" :
                  index === currentStep ? "warning" :
                    "default"
              }
              className="text-xs"
            >
              {step}
            </Chip>
            {index < process.length - 1 && (
              <div className="w-4 h-px bg-gray-300 mx-1" />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <Tabs
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(key as string)}
            variant="underlined"
            classNames={{
              tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
              cursor: "w-full bg-gradient-to-r from-blue-500 to-purple-600",
              tab: "max-w-fit px-0 h-12",
              tabContent: "group-data-[selected=true]:text-blue-600 font-semibold text-lg"
            }}
          >
            <Tab key="requests" title="Requests" />
            <Tab key="my-tasks" title="My Tasks" />
          </Tabs>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Chip color="success" variant="flat" size="sm">Approved</Chip>
              <Chip color="warning" variant="flat" size="sm">Pending</Chip>
              <Chip color="danger" variant="flat" size="sm">Rejected</Chip>
            </div>

            <Badge content="4" color="primary" size="sm">
              <Button
                variant="bordered"
                startContent={<Filter className="w-4 h-4" />}
                endContent={<ChevronDown className="w-4 h-4" />}
                className="border-blue-200 hover:border-blue-400"
              >
                Filter Cards
              </Button>
            </Badge>
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center space-x-4 mt-6">
          <Dropdown>
            <DropdownTrigger>
              <Button variant="bordered" endContent={<ChevronDown className="w-4 h-4" />}>
                Leave Type
              </Button>
            </DropdownTrigger>
            <DropdownMenu>
              <DropdownItem key="all">All Types</DropdownItem>
              <DropdownItem key="sick">Sick Leave</DropdownItem>
              <DropdownItem key="business">Business Trip</DropdownItem>
              <DropdownItem key="loan">Loan</DropdownItem>
            </DropdownMenu>
          </Dropdown>

          <Dropdown>
            <DropdownTrigger>
              <Button variant="bordered" endContent={<ChevronDown className="w-4 h-4" />}>
                Pending From
              </Button>
            </DropdownTrigger>
            <DropdownMenu>
              <DropdownItem key="all">All</DropdownItem>
              <DropdownItem key="manager">Manager</DropdownItem>
              <DropdownItem key="hr">HR</DropdownItem>
              <DropdownItem key="finance">Finance</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>

      {/* Request Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {requests.map((request) => (
          <Card
            key={request.id}
            className="relative bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            {request.isNew && (
              <div className="absolute top-4 right-4 z-10">
                <Chip color="primary" size="sm" className="animate-pulse">
                  NEW
                </Chip>
              </div>
            )}

            <CardHeader className="pb-2">
              <div className="flex items-start justify-between w-full">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-lg">
                    {getTypeIcon(request.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{request.type}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <Avatar size="sm" src={request.user.avatar} />
                      <span className="text-sm text-gray-600">{request.user.name}</span>
                      <span className="text-xs text-gray-400">Applied {request.user.appliedAgo}</span>
                    </div>
                  </div>
                </div>

                <Dropdown>
                  <DropdownTrigger>
                    <Button isIconOnly size="sm" variant="light">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu>
                    <DropdownItem key="view">View Details</DropdownItem>
                    <DropdownItem key="edit">Edit Request</DropdownItem>
                    <DropdownItem key="delete" className="text-danger">Delete</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </CardHeader>

            <CardBody className="pt-0">
              {/* Duration/Amount Section */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {request.duration}
                  </div>
                  <div className="text-sm text-gray-600">{request.dateRange}</div>
                  {request.timeRange && (
                    <div className="text-xs text-gray-500 mt-1">{request.timeRange}</div>
                  )}
                </div>

                {request.progress && (
                  <div className="mt-3">
                    <Progress
                      value={request.progress}
                      color="primary"
                      size="sm"
                      className="mb-1"
                    />
                    <div className="text-xs text-gray-500 text-center">
                      {request.timeRemaining}
                    </div>
                  </div>
                )}

                {request.availableHours && (
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>{request.timeRemaining}</span>
                    <span>{request.availableHours}</span>
                  </div>
                )}

                {request.cost && (
                  <div className="text-center text-sm text-gray-600 mt-2">
                    {request.cost}
                  </div>
                )}

                {request.details && (
                  <div className="text-center text-sm text-gray-600 mt-2">
                    {request.details}
                  </div>
                )}
              </div>

              {/* Reason */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Reason</h4>
                <p className="text-sm text-gray-600 line-clamp-2">{request.reason}</p>
              </div>

              {/* Approval Process */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Approval Process</h4>
                {renderApprovalProcess(request.approvalProcess, request.currentStep, request.status)}
              </div>

              <Divider className="my-4" />

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Avatar size="sm" src={request.user.avatar} />
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      color="success"
                      variant="flat"
                      startContent={<Check className="w-4 h-4" />}
                      className="min-w-unit-20"
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      color="danger"
                      variant="flat"
                      startContent={<X className="w-4 h-4" />}
                      className="min-w-unit-20"
                    >
                      Reject
                    </Button>
                  </div>
                </div>

                <Chip
                  color={getStatusColor(request.status)}
                  variant="flat"
                  size="sm"
                  className="capitalize"
                >
                  {request.status}
                </Chip>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
