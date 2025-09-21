"use client";
import { useRequest } from "@/hooks/useRequests";
import { Avatar, Button, Card, CardBody, CardHeader, Chip, Divider, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Tooltip } from "@heroui/react";
import { ENUM_REQUEST_TYPE, IRequest, IRequestUnion } from "@internal-cms/shared/dist/api/requests";
import { ENUM_REQUEST_STATUS } from "@internal-cms/shared/src/api/general";
import { ILeaveRequest } from "@internal-cms/shared/src/api/leaves";
import { IUserResponseFull } from "@internal-cms/shared/src/api/user";
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import { Briefcase, Calendar, Check, Clock, DollarSign, MoreVertical, Plane, X } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";


const getTypeIcon = (type: ENUM_REQUEST_TYPE) => {
    if (type.includes("Sick")) return <Calendar className="w-5 h-5" />;
    if (type.includes("Business")) return <Briefcase className="w-5 h-5" />;
    if (type.includes("Loan")) return <DollarSign className="w-5 h-5" />;
    if (type.includes("Ticket")) return <Plane className="w-5 h-5" />;
    return <Clock className="w-5 h-5" />;
};

const getStatusColor = (status: ENUM_REQUEST_STATUS) => {
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

const readableDateRange = (startDate: Date, endDate: Date) => {
    //March 27 - March 29 2018
    return `${startDate.toLocaleString('default', { month: 'long' })} ${startDate.getDate()} - ${endDate.toLocaleString('default', { month: 'long' })} ${endDate.getDate()} ${startDate.getFullYear()}`;
}

export const renderLeaveRequestCard = (request: IRequest<string, ILeaveRequest>) => {
    console.log("renderLeaveRequestCard", request);
    if (!request) return null;
    TimeAgo.addDefaultLocale(en)
    const timeAgo = new TimeAgo('en-US');

    const renderApprovalProcess = (isLongHoliday: boolean, leaveRequest: ILeaveRequest, user?: IUserResponseFull) => {
        if (!user) {
            return (<></>)
        }
        let process = ["hr"]
        if (user.supervisor) {
            process = ['supervisor', ...process]
        }
        if (leaveRequest.isLongLeave) {
            process = [...process, 'manager']
        }

        let currentStep = 0;



        return (
            <div className="flex items-center space-x-2 mt-2">
                {process.map((step: string, index: number) => (
                    <div key={index} className="flex items-center">
                        <Chip
                            size="sm"
                            variant={index < currentStep ? "solid" : index === currentStep ? "bordered" : "bordered"}
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
        <Card
            key={request._id}
            className="relative bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
            {new Date(request.createdAt).toISOString() === new Date(request.createdAt).toISOString() && (
                <div className="absolute top-4 right-4 z-10 mr-6">
                    <Chip color="primary" size="sm" className="animate-pulse">
                        NEW
                    </Chip>
                </div>
            )}
            <CardHeader className="pb-2">
                <div className="flex items-start justify-between w-full">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-lg">
                            {getTypeIcon(ENUM_REQUEST_TYPE.LEAVE_REQUEST)}
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">{request.type}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                                <Avatar size="sm" src="https://i.pravatar.cc/150?u=john" />
                                <Tooltip content={
                                    <>
                                        <span className="font-semibold">{request.user?.email}</span>
                                        <br />
                                        <span className="text-xs text-gray-500">{request.user?.firstName} {request.user?.lastName}</span>
                                    </>
                                } placement="top">
                                    <span className="text-sm text-gray-600 overflow-hidden text-ellipsis whitespace-nowrap w-[100px] inline-block">
                                        {request.user?.email.split('@')[0]}
                                    </span>
                                </Tooltip>

                                <span className="text-xs text-gray-400">{timeAgo.format(new Date(request.createdAt))}</span>
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
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-4">
                    <div className="text-center">
                        <div className="text-sm text-gray-600">{readableDateRange(new Date(request.data.startDate), new Date(request.data.endDate))}</div>
                    </div>
                </div>

                {/* Reason */}
                <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Reason</h4>
                    <p className="text-sm text-gray-600 line-clamp-2">{request.data.reason}</p>
                </div>

                {/* Approval Process */}
                <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Approval Process</h4>
                    {renderApprovalProcess(request.data.isLongLeave, request.data, request?.user)}
                </div>

                <Divider className="my-4" />

                {/* Actions */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
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
    )
}
export const RequestCard = (request: IRequestUnion) => {
    console.log("request", request);
    switch (request.type) {
        case ENUM_REQUEST_TYPE.LEAVE_REQUEST:
            return renderLeaveRequestCard(request as unknown as IRequest<string, ILeaveRequest>);
    }
    // return (

    //     <Card
    //         key={request._id}
    //         className="relative bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    //     >
    //         {new Date(request.createdAt).toISOString() === new Date(request.createdAt).toISOString() && (
    //             <div className="absolute top-4 right-4 z-10">
    //                 <Chip color="primary" size="sm" className="animate-pulse">
    //                     NEW
    //                 </Chip>
    //             </div>
    //         )}
    //         <CardHeader className="pb-2">
    //             <div className="flex items-start justify-between w-full">
    //                 <div className="flex items-center space-x-3">
    //                     <div className="p-2 bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-lg">
    //                         {getTypeIcon(request.type)}
    //                     </div>
    //                     <div>
    //                         <h3 className="font-semibold text-gray-900">{request.type}</h3>
    //                         <div className="flex items-center space-x-2 mt-1">
    //                             <Avatar size="sm" src="https://i.pravatar.cc/150?u=john" />
    //                             {request.type == ENUM_REQUEST_TYPE.LEAVE_REQUEST && (<><span className="text-sm text-gray-600">{1}</span>
    //                                 <span className="text-xs text-gray-400">Applied {request.data.createdAt.toDateString()}</span></>)}
    //                         </div>
    //                     </div>
    //                 </div>

    //                 {/* <Dropdown>
    //                     <DropdownTrigger>
    //                         <Button isIconOnly size="sm" variant="light">
    //                             <MoreVertical className="w-4 h-4" />
    //                         </Button>
    //                     </DropdownTrigger>
    //                     <DropdownMenu>
    //                         <DropdownItem key="view">View Details</DropdownItem>
    //                         <DropdownItem key="edit">Edit Request</DropdownItem>
    //                         <DropdownItem key="delete" className="text-danger">Delete</DropdownItem>
    //                     </DropdownMenu>
    //                 </Dropdown> */}
    //             </div>
    //         </CardHeader>
    //     </Card>
    // )
}
export default function requestsTab(): ReactNode {
    const { getAllRequests, isGetAllRequestsSuccess, getAllRequestsError } = useRequest();
    const [requests, setRequests] = useState([]);
    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const data = await getAllRequests();
                setRequests(data);
                console.log("requests", data)
            } catch (error) {
                console.error("Error fetching requests:", error);
            }
        };
        fetchRequests();
    }, [getAllRequests]);
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {requests.map((request: any) => RequestCard(request))}
        </div>
    )
}