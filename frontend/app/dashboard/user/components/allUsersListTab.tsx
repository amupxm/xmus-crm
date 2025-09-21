"use client";
import PageCard from "@/components/card/pageCard";
import CommonTable, { TableConfig } from "@/components/table/commonTable";
import { useUser } from "@/hooks/useUser";
import { Avatar, Button, Chip, Input, Select, SelectItem, Tooltip } from "@heroui/react";
import { ENUM_ROLES, USER_STATS } from "@internal-cms/shared/dist/api/general";
import { IUserResponseForDashboard } from "@internal-cms/shared/src/api/user";
import {
    Edit2,
    Search,
    Trash2,
    UserPlus,
    Users
} from "lucide-react";
import { ReactNode, useEffect, useMemo, useState } from "react";

export default function AllUsersListTab(): ReactNode {
    const { getAllUsers, isGettingAllUsers, getAllUsersError } = useUser()
    const [searchValue, setSearchValue] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [users, setUsers] = useState<IUserResponseForDashboard[]>([]);
    //     {
    //         _id: "1",
    //         firstName: "John",
    //         lastName: "Doe",
    //         name: "John Doe",
    //         email: "john.doe@company.com",
    //         role: ENUM_ROLES.FULL_ADMIN,
    //         supervisor: undefined,
    //         salary: {
    //             salary: 85000,
    //             salary_payments: [],
    //             reimbursing_history: [],
    //             salary_changes: []
    //         },
    //         casualLeavesAvailable: 10,
    //         vacationLeavesAvailable: 15,
    //         sickLeavesAvailable: 8,
    //         createdAt: new Date("2024-01-15"),
    //         updatedAt: new Date("2024-12-01"),
    //         accountStatus: USER_STATS.ACTIVE,
    //         notifications: [],
    //         division: [],
    //         countries: [],
    //         projects: [],
    //         deletedAt: null
    //     },
    // ]);
    useEffect(() => {
        getAllUsers().then((users) => {
            setUsers(users);
        }).catch((error) => {
            console.error("Failed to fetch users:", error);
        });
    }, [])
    const roles = [
        { key: "EMPLOYEE", label: "Employee" },
        { key: "MANAGER", label: "Manager" },
        { key: "HR", label: "HR" },
        { key: "ADMIN", label: "Admin" },
        { key: "FINANCE", label: "Finance" }
    ];

    const supervisors = [
        { key: "1", label: "John Smith - Manager" },
        { key: "2", label: "Sarah Johnson - HR Director" },
        { key: "3", label: "Mike Wilson - Team Lead" },
        { key: "4", label: "Lisa Brown - Senior Manager" }
    ];

    const statusOptions = [
        { key: "all", label: "All Status" },
        { key: "active", label: "Active" },
        { key: "pending", label: "Pending" },
        { key: "inactive", label: "Inactive" }
    ];

    const roleOptions = [
        { key: "all", label: "All Roles" },
        ...roles
    ];
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch = user.firstName.toLowerCase().includes(searchValue.toLowerCase()) ||
                user.email.toLowerCase().includes(searchValue.toLowerCase())

            const matchesRole = roleFilter === "all" || user.role === roleFilter;
            const matchesStatus = statusFilter === "all" || user.accountStatus === statusFilter;

            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [users, searchValue, roleFilter, statusFilter]);


    const pages = Math.ceil(filteredUsers.length / rowsPerPage);
    const items = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return filteredUsers.slice(start, end);
    }, [page, filteredUsers, rowsPerPage]);


    const getRoleColor = (role: ENUM_ROLES) => {
        switch (role) {
            case ENUM_ROLES.FULL_ADMIN: return "danger";
            case ENUM_ROLES.HR_ADMIN: return "secondary";
            case ENUM_ROLES.ACCOUNTANT_ADMIN: return "warning";
            case ENUM_ROLES.INTERNAL_USER: return "primary";
            case ENUM_ROLES.EXTERNAL_USER: return "default";
            default: return "default";
        }
    };
    const getStatusColor = (status: USER_STATS) => {
        switch (status) {
            case USER_STATS.DE_ACTIVE: return "warning";
            case USER_STATS.ACTIVE: return "success";
            case USER_STATS.SUSPENDED: return "default";
            default: return "default";
        }
    };
    const header = (<div className="w-full flex flex-col space-y-4">
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">All Users</h2>
                    <p className="text-gray-600">Manage and view all user accounts</p>
                </div>
            </div>
            <Button
                color="primary"
                // onPress={openCreateModal}
                startContent={<UserPlus className="w-4 h-4" />}
                className="bg-gradient-to-r from-blue-500 to-purple-600"
            >
                Add New User
            </Button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Input
                    placeholder="Search users..."
                    value={searchValue}
                    onValueChange={setSearchValue}
                    startContent={<Search className="w-4 h-4 text-gray-400" />}
                    className="w-full sm:w-64"
                />
                <Select
                    placeholder="Filter by role"
                    selectedKeys={[roleFilter]}
                    onSelectionChange={(keys) => setRoleFilter(`${Array.from(keys)[0]}`)}
                    className="w-full sm:w-40"
                >
                    {roleOptions.map((role) => (
                        <SelectItem key={role.key}>
                            {role.label}
                        </SelectItem>
                    ))}
                </Select>
                <Select
                    placeholder="Filter by status"
                    selectedKeys={[statusFilter]}
                    onSelectionChange={(keys) => setStatusFilter(`${Array.from(keys)[0]}`)}
                    className="w-full sm:w-40"
                >
                    {statusOptions.map((status) => (
                        <SelectItem key={status.key}>
                            {status.label}
                        </SelectItem>
                    ))}
                </Select>
            </div>
            <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                    {filteredUsers.length} users found
                </span>
            </div>
        </div>
    </div>)

    const tableConfig: TableConfig<IUserResponseForDashboard> = {
        data: users,
        getRowKey: (d) => d._id,
        tableRendererEntities: [
            {
                Header: 'USER',
                ColumnRenderer: (user) => {
                    return (
                        <div className="flex items-center space-x-3">
                            <Avatar
                                name={user.firstName + '-' + user.lastName}
                                size="sm"
                                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                            />
                            <div>
                                <p className="font-semibold text-gray-900">{user.firstName}-{user.lastName}</p>
                            </div>
                        </div>
                    )
                }
            }, {
                Header: "ROEL",
                ColumnRenderer: (user) => {
                    return (
                        <Chip
                            color={getRoleColor(user.role)}
                            variant="flat"
                            size="sm"
                        >
                            {user.role}
                        </Chip>
                    )
                }
            }, {
                Header: "STATUS",
                ColumnRenderer: (user) => {
                    return (
                        <Chip
                            color={getStatusColor(user.accountStatus)}
                            variant="flat"
                            size="sm"
                        >
                            {user.accountStatus.charAt(0).toUpperCase() + user.accountStatus.slice(1)}
                        </Chip>
                    )
                }
            }, {
                Header: "SALARY",
                ColumnRenderer: (user) => {
                    return (
                        <span className="font-semibold text-gray-900">
                            {user.salary.salary.toLocaleString()} IDR
                        </span>
                    )
                }
            }, {
                Header: "CREATED AT",
                ColumnRenderer: (user) => {
                    return (
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">
                                {new Date(user.createdAt).toLocaleDateString()}
                            </span>
                            <span className="text-xs text-gray-500">
                                Updated: {new Date(user.updatedAt).toLocaleDateString()}
                            </span>
                        </div>
                    )
                }
            }, {
                Header: "TOOLBOX",
                ColumnRenderer: (user) => {
                    return (
                        <div className="flex items-center space-x-2">
                            <Tooltip content="Edit user">
                                <Button
                                    isIconOnly
                                    size="sm"
                                    variant="light"
                                    color="primary"
                                    onPress={() => { }}
                                >
                                    <Edit2 className="w-4 h-4" />
                                </Button>
                            </Tooltip>
                            <Tooltip content="deactivate user" color="danger">
                                <Button
                                    isIconOnly
                                    size="sm"
                                    variant="light"
                                    color="danger"
                                    onPress={() => { }}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </Tooltip>
                        </div>
                    )
                }
            }
        ]
    }
    const body = CommonTable<IUserResponseForDashboard>({
        page,
        pages,
        setPage,
        tableConfig,
        isLoading: true,
    })
    const footer = (<></>)

    return (<PageCard header={header} body={body} footer={footer} />)
}