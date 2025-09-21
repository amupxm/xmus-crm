"use client";
import {
    Avatar,
    Button,
    Card,
    CardBody,
    CardHeader,
    Chip,
    Divider,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Pagination,
    Select,
    SelectItem,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    Tabs,
    Tooltip,
    useDisclosure
} from "@heroui/react";
import { ENUM_REQUEST_STATUS, ENUM_ROLES } from "@internal-cms/shared/dist/api/general";
import {
    Briefcase,
    Calendar,
    DollarSign,
    Edit2,
    Eye,
    EyeOff,
    Lock,
    Mail,
    Save,
    Search,
    Trash2,
    User,
    UserPlus,
    Users,
    X
} from "lucide-react";
import { useMemo, useState } from "react";
export type formDataType = {
    firstName: string
    lastName: string
    email: string
    username: string
    password: string
    role: string
    supervisor: string
    salary: 0
    casualLeavesAvailable: number
    vacationLeavesAvailable: number
    sickLeavesAvailable: number
}

export default function UserRegistrationForm() {
    const [activeTab, setActiveTab] = useState("basic");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [editingUser, setEditingUser] = useState<formDataType | null>(null);
    const [searchValue, setSearchValue] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const [formData, setFormData] = useState<formDataType>({
        firstName: "",
        lastName: "",
        email: "",
        username: "",
        password: "",
        role: "",
        supervisor: "",
        salary: 0,
        casualLeavesAvailable: 12,
        vacationLeavesAvailable: 12,
        sickLeavesAvailable: 12
    });

    const [errors, setErrors] = useState<{ [key: string]: string | number | undefined }>({});

    // Sample users data (in real app, this would come from an API)
    const [users, setUsers] = useState([
        {
            _id: "1",
            firstName: "John",
            lastName: "Doe",
            name: "John Doe",
            email: "john.doe@company.com",
            username: "johndoe",
            role: "MANAGER",
            supervisor: null,
            salary: 85000,
            casualLeavesAvailable: 10,
            vacationLeavesAvailable: 15,
            sickLeavesAvailable: 8,
            createdAt: new Date("2024-01-15"),
            updatedAt: new Date("2024-12-01"),
            status: "active"
        },
        {
            _id: "2",
            firstName: "Sarah",
            lastName: "Johnson",
            name: "Sarah Johnson",
            email: "sarah.johnson@company.com",
            username: "sarahj",
            role: "HR",
            supervisor: "John Doe",
            salary: 78000,
            casualLeavesAvailable: 12,
            vacationLeavesAvailable: 12,
            sickLeavesAvailable: 12,
            createdAt: new Date("2024-02-20"),
            updatedAt: new Date("2024-11-28"),
            status: "active"
        },
        {
            _id: "3",
            firstName: "Mike",
            lastName: "Wilson",
            name: "Mike Wilson",
            email: "mike.wilson@company.com",
            username: "mikew",
            role: "EMPLOYEE",
            supervisor: "John Doe",
            salary: 65000,
            casualLeavesAvailable: 5,
            vacationLeavesAvailable: 8,
            sickLeavesAvailable: 12,
            createdAt: new Date("2024-03-10"),
            updatedAt: new Date("2024-12-02"),
            status: "pending"
        },
        {
            _id: "4",
            firstName: "Lisa",
            lastName: "Brown",
            name: "Lisa Brown",
            email: "lisa.brown@company.com",
            username: "lisab",
            role: "FINANCE",
            supervisor: "Sarah Johnson",
            salary: 72000,
            casualLeavesAvailable: 12,
            vacationLeavesAvailable: 10,
            sickLeavesAvailable: 6,
            createdAt: new Date("2024-04-05"),
            updatedAt: new Date("2024-11-30"),
            status: "inactive"
        },
        {
            _id: "5",
            firstName: "David",
            lastName: "Garcia",
            name: "David Garcia",
            email: "david.garcia@company.com",
            username: "davidg",
            role: "ADMIN",
            supervisor: null,
            salary: 95000,
            casualLeavesAvailable: 15,
            vacationLeavesAvailable: 20,
            sickLeavesAvailable: 10,
            createdAt: new Date("2024-01-08"),
            updatedAt: new Date("2024-12-03"),
            status: "active"
        }
    ]);

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

    // Filter and search users
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch = user.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                user.email.toLowerCase().includes(searchValue.toLowerCase()) ||
                user.username.toLowerCase().includes(searchValue.toLowerCase());

            const matchesRole = roleFilter === "all" || user.role === roleFilter;
            const matchesStatus = statusFilter === "all" || user.status === statusFilter;

            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [users, searchValue, roleFilter, statusFilter]);

    // Pagination
    const pages = Math.ceil(filteredUsers.length / rowsPerPage);
    const items = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return filteredUsers.slice(start, end);
    }, [page, filteredUsers, rowsPerPage]);

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        // Basic validation
        if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
        if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = "Please enter a valid email address";
        }

        // Username validation
        if (!formData.username.trim()) {
            newErrors.username = "Username is required";
        } else if (formData.username.length < 3) {
            newErrors.username = "Username must be at least 3 characters";
        }

        // Password validation (only for new users)
        if (!editingUser && !formData.password.trim()) {
            newErrors.password = "Password is required";
        } else if (!editingUser && formData.password.length < 8) {
            newErrors.password = "Password must be at least 8 characters";
        }

        // Role validation
        if (!formData.role) newErrors.role = "Role is required";

        // Salary validation
        if (!formData.salary) {
            newErrors.salary = "Salary is required";
        } else if (isNaN(Number(formData.salary)) || parseFloat(formData.salary) <= 0) {
            newErrors.salary = "Please enter a valid salary amount";
        }

        // Leave validation
        if (formData.casualLeavesAvailable < 0) {
            newErrors.casualLeavesAvailable = "Casual leaves cannot be negative";
        }
        if (formData.vacationLeavesAvailable < 0) {
            newErrors.vacationLeavesAvailable = "Vacation leaves cannot be negative";
        }
        if (formData.sickLeavesAvailable < 0) {
            newErrors.sickLeavesAvailable = "Sick leaves cannot be negative";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field: string, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear error when user starts typing
        if (errors[field]) {
            const errs = { [field]: undefined, ...errors };
            setErrors(errs);
        }
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            if (editingUser) {
                // Update existing user
                setUsers(prev => prev.map(user => {
                    let c = editingUser
                    user._id === editingUser._id
                        ? {
                            ...user,
                            ...formData,
                            name: `${formData.firstName} ${formData.lastName}`,
                            updatedAt: new Date()
                        }
                        : user
                    return user
                }
                ));
                alert("User updated successfully!");
            } else {
                // Create new user
                const newUser = {
                    _id: String(users.length + 1),
                    ...formData,
                    name: `${formData.firstName} ${formData.lastName}`,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    status: "active"
                };
                setUsers(prev => [...prev, newUser]);
                alert("User created successfully!");
            }

            // Reset form
            handleReset();
            setEditingUser(null);
            onOpenChange();

        } catch (error) {
            console.error("Error saving user:", error);
            alert("Error saving user. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setFormData({
            firstName: "",
            lastName: "",
            email: "",
            username: "",
            password: "",
            role: "",
            supervisor: "",
            salary: 0,
            casualLeavesAvailable: 12,
            vacationLeavesAvailable: 12,
            sickLeavesAvailable: 12
        });
        setErrors({});
    };

    const handleEdit = (user: formDataType) => {
        setEditingUser(user);
        setFormData({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            username: user.username,
            password: "", // Don't pre-fill password
            role: user.role,
            supervisor: user.supervisor || "",
            salary: user.salary,
            casualLeavesAvailable: user.casualLeavesAvailable,
            vacationLeavesAvailable: user.vacationLeavesAvailable,
            sickLeavesAvailable: user.sickLeavesAvailable
        });
        onOpen();
    };

    const handleDelete = (userId: string | number) => {
        if (confirm("Are you sure you want to delete this user?")) {
            setUsers(prev => prev.filter(user => user._id !== userId));
        }
    };

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

    const getStatusColor = (status: ENUM_REQUEST_STATUS) => {
        switch (status) {
            case ENUM_REQUEST_STATUS.PENDING: return "warning";
            case ENUM_REQUEST_STATUS.APPROVED: return "success";
            case ENUM_REQUEST_STATUS.REJECTED: return "danger";
            case ENUM_REQUEST_STATUS.CANCELLED: return "default";
            default: return "default";
        }
    };

    const openCreateModal = () => {
        setEditingUser(null);
        handleReset();
        onOpen();
    };

    const renderUserForm = () => (
        <div className="space-y-6">
            {/* Personal Information */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-600" />
                    Personal Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="First Name"
                        placeholder="Enter first name"
                        value={formData.firstName}
                        onValueChange={(value) => handleInputChange("firstName", value)}
                        isInvalid={!!errors.firstName}
                        errorMessage={errors.firstName}
                        startContent={<User className="w-4 h-4 text-gray-400" />}
                        isRequired
                    />

                    <Input
                        label="Last Name"
                        placeholder="Enter last name"
                        value={formData.lastName}
                        onValueChange={(value) => handleInputChange("lastName", value)}
                        isInvalid={!!errors.lastName}
                        errorMessage={errors.lastName}
                        startContent={<User className="w-4 h-4 text-gray-400" />}
                        isRequired
                    />
                </div>
            </div>

            {/* Account Information */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Mail className="w-5 h-5 mr-2 text-green-600" />
                    Account Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Email Address"
                        placeholder="Enter email address"
                        type="email"
                        value={formData.email}
                        onValueChange={(value) => handleInputChange("email", value)}
                        isInvalid={!!errors.email}
                        errorMessage={errors.email}
                        startContent={<Mail className="w-4 h-4 text-gray-400" />}
                        isRequired
                    />

                    <Input
                        label="Username"
                        placeholder="Enter username"
                        value={formData.username}
                        onValueChange={(value) => handleInputChange("username", value)}
                        isInvalid={!!errors.username}
                        errorMessage={errors.username}
                        startContent={<User className="w-4 h-4 text-gray-400" />}
                        isRequired
                    />

                    <Input
                        label={editingUser ? "New Password (leave blank to keep current)" : "Password"}
                        placeholder="Enter password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onValueChange={(value) => handleInputChange("password", value)}
                        isInvalid={!!errors.password}
                        errorMessage={errors.password}
                        startContent={<Lock className="w-4 h-4 text-gray-400" />}
                        endContent={
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="focus:outline-none"
                            >
                                {showPassword ?
                                    <EyeOff className="w-4 h-4 text-gray-400" /> :
                                    <Eye className="w-4 h-4 text-gray-400" />
                                }
                            </button>
                        }
                        isRequired={!editingUser}
                    />
                </div>
            </div>

            {/* Role & Hierarchy */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Briefcase className="w-5 h-5 mr-2 text-purple-600" />
                    Role & Hierarchy
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                        label="Role"
                        placeholder="Select role"
                        selectedKeys={formData.role ? [formData.role] : []}
                        onSelectionChange={(keys) => handleInputChange("role", Array.from(keys)[0] || "")}
                        isInvalid={!!errors.role}
                        errorMessage={errors.role}
                        isRequired
                    >
                        {roles.map((role) => (
                            <SelectItem key={role.key} value={role.key}>
                                {role.label}
                            </SelectItem>
                        ))}
                    </Select>

                    <Select
                        label="Supervisor"
                        placeholder="Select supervisor (optional)"
                        selectedKeys={formData.supervisor ? [formData.supervisor] : []}
                        onSelectionChange={(keys) => handleInputChange("supervisor", Array.from(keys)[0] || "")}
                    >
                        {supervisors.map((supervisor) => (
                            <SelectItem key={supervisor.key} value={supervisor.key}>
                                {supervisor.label}
                            </SelectItem>
                        ))}
                    </Select>
                </div>
            </div>

            {/* Compensation */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-yellow-600" />
                    Compensation
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Salary"
                        placeholder="Enter salary amount"
                        type="number"
                        value={formData.salary}
                        onValueChange={(value) => handleInputChange("salary", value)}
                        isInvalid={!!errors.salary}
                        errorMessage={errors.salary}
                        startContent={<DollarSign className="w-4 h-4 text-gray-400" />}
                        isRequired
                    />
                </div>
            </div>

            {/* Leave Allocation */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-indigo-600" />
                    Leave Allocation
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                        label="Casual Leaves"
                        placeholder="12"
                        type="number"
                        value={formData.casualLeavesAvailable.toString()}
                        onValueChange={(value) => handleInputChange("casualLeavesAvailable", parseInt(value) || 0)}
                        isInvalid={!!errors.casualLeavesAvailable}
                        errorMessage={errors.casualLeavesAvailable}
                        startContent={<Calendar className="w-4 h-4 text-gray-400" />}
                    />

                    <Input
                        label="Vacation Leaves"
                        placeholder="12"
                        type="number"
                        value={formData.vacationLeavesAvailable.toString()}
                        onValueChange={(value) => handleInputChange("vacationLeavesAvailable", parseInt(value) || 0)}
                        isInvalid={!!errors.vacationLeavesAvailable}
                        errorMessage={errors.vacationLeavesAvailable}
                        startContent={<Calendar className="w-4 h-4 text-gray-400" />}
                    />

                    <Input
                        label="Sick Leaves"
                        placeholder="12"
                        type="number"
                        value={formData.sickLeavesAvailable.toString()}
                        onValueChange={(value) => handleInputChange("sickLeavesAvailable", parseInt(value) || 0)}
                        isInvalid={!!errors.sickLeavesAvailable}
                        errorMessage={errors.sickLeavesAvailable}
                        startContent={<Calendar className="w-4 h-4 text-gray-400" />}
                    />
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex justify-between items-center">
                    <Tabs
                        selectedKey={activeTab}
                        onSelectionChange={(k) => setActiveTab(k.toString())}
                        variant="underlined"
                        classNames={{
                            tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                            cursor: "w-full bg-gradient-to-r from-blue-500 to-purple-600",
                            tab: "max-w-fit px-0 h-12",
                            tabContent: "group-data-[selected=true]:text-blue-600 font-semibold text-lg"
                        }}
                    >
                        <Tab key="basic" title="Add New User" />
                        <Tab key="users" title="All Users" />
                    </Tabs>

                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <Chip color="success" variant="flat" size="sm">Active</Chip>
                            <Chip color="warning" variant="flat" size="sm">Pending</Chip>
                            <Chip color="danger" variant="flat" size="sm">Inactive</Chip>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto">
                {activeTab === "basic" && (
                    <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg">
                        <CardHeader className="pb-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-lg">
                                    <User className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Create New User</h2>
                                    <p className="text-gray-600">Fill in the details to create a new user account</p>
                                </div>
                            </div>
                        </CardHeader>

                        <CardBody>
                            {renderUserForm()}

                            <Divider className="my-6" />

                            {/* Form Actions */}
                            <div className="flex justify-end space-x-4">
                                <Button
                                    variant="bordered"
                                    color="default"
                                    onPress={handleReset}
                                    startContent={<X className="w-4 h-4" />}
                                    className="border-gray-300 hover:border-gray-400"
                                >
                                    Reset Form
                                </Button>

                                <Button
                                    type="button"
                                    color="primary"
                                    isLoading={isLoading}
                                    onPress={handleSubmit}
                                    startContent={!isLoading && <Save className="w-4 h-4" />}
                                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                                >
                                    {isLoading ? "Creating User..." : "Create User"}
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                )}

                {activeTab === "users" && (
                    <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg">
                        <CardHeader className="pb-4">
                            <div className="flex flex-col space-y-4">
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
                                        onPress={openCreateModal}
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
                                            onSelectionChange={(keys) => setRoleFilter(Array.from(keys)[0])}
                                            className="w-full sm:w-40"
                                        >
                                            {roleOptions.map((role) => (
                                                <SelectItem key={role.key} value={role.key}>
                                                    {role.label}
                                                </SelectItem>
                                            ))}
                                        </Select>
                                        <Select
                                            placeholder="Filter by status"
                                            selectedKeys={[statusFilter]}
                                            onSelectionChange={(keys) => setStatusFilter(Array.from(keys)[0])}
                                            className="w-full sm:w-40"
                                        >
                                            {statusOptions.map((status) => (
                                                <SelectItem key={status.key} value={status.key}>
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
                            </div>
                        </CardHeader>

                        <CardBody>
                            <Table
                                aria-label="Users table"
                                bottomContent={
                                    <div className="flex w-full justify-center">
                                        <Pagination
                                            isCompact
                                            showControls
                                            showShadow
                                            color="primary"
                                            page={page}
                                            total={pages}
                                            onChange={(page) => setPage(page)}
                                        />
                                    </div>
                                }
                                classNames={{
                                    wrapper: "min-h-[400px]",
                                }}
                            >
                                <TableHeader>
                                    <TableColumn>USER</TableColumn>
                                    <TableColumn>ROLE</TableColumn>
                                    <TableColumn>STATUS</TableColumn>
                                    <TableColumn>SALARY</TableColumn>
                                    <TableColumn>LEAVES</TableColumn>
                                    <TableColumn>JOINED</TableColumn>
                                    <TableColumn>ACTIONS</TableColumn>
                                </TableHeader>
                                <TableBody>
                                    {items.map((user) => (
                                        <TableRow key={user._id}>
                                            <TableCell>
                                                <div className="flex items-center space-x-3">
                                                    <Avatar
                                                        name={user.name}
                                                        size="sm"
                                                        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                                                    />
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{user.name}</p>
                                                        <p className="text-sm text-gray-500">{user.email}</p>
                                                        <p className="text-xs text-gray-400">@{user.username}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    color={getRoleColor(user.role)}
                                                    variant="flat"
                                                    size="sm"
                                                >
                                                    {user.role}
                                                </Chip>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    color={getStatusColor(user.status)}
                                                    variant="flat"
                                                    size="sm"
                                                >
                                                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                                                </Chip>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-semibold text-gray-900">
                                                    ${user.salary.toLocaleString()}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col space-y-1">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-xs text-gray-500">Casual:</span>
                                                        <span className="text-xs font-medium">{user.casualLeavesAvailable}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-xs text-gray-500">Vacation:</span>
                                                        <span className="text-xs font-medium">{user.vacationLeavesAvailable}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-xs text-gray-500">Sick:</span>
                                                        <span className="text-xs font-medium">{user.sickLeavesAvailable}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {user.createdAt.toLocaleDateString()}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        Updated: {user.updatedAt.toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <Tooltip content="Edit user">
                                                        <Button
                                                            isIconOnly
                                                            size="sm"
                                                            variant="light"
                                                            color="primary"
                                                            onPress={() => handleEdit(user)}
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </Button>
                                                    </Tooltip>
                                                    <Tooltip content="Delete user" color="danger">
                                                        <Button
                                                            isIconOnly
                                                            size="sm"
                                                            variant="light"
                                                            color="danger"
                                                            onPress={() => handleDelete(user._id)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </Tooltip>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardBody>
                    </Card>
                )}
            </div>

            {/* Edit/Create User Modal */}
            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                size="5xl"
                scrollBehavior="inside"
                classNames={{
                    body: "py-6",
                    backdrop: "bg-[#292f46]/50 backdrop-opacity-40",
                    base: "border-[#292f46] bg-[#19172c] dark:bg-[#19172c] text-[#a8b0d3]",
                    header: "border-b-[1px] border-[#292f46]",
                    footer: "border-t-[1px] border-[#292f46]",
                    closeButton: "hover:bg-white/5 active:bg-white/10",
                }}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-lg">
                                        <User className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">
                                            {editingUser ? "Edit User" : "Create New User"}
                                        </h2>
                                        <p className="text-gray-400">
                                            {editingUser ? "Update user information" : "Fill in the details to create a new user account"}
                                        </p>
                                    </div>
                                </div>
                            </ModalHeader>
                            <ModalBody>
                                <div className="text-gray-800">
                                    {renderUserForm()}
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button
                                    variant="bordered"
                                    onPress={onClose}
                                    startContent={<X className="w-4 h-4" />}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    color="primary"
                                    isLoading={isLoading}
                                    onPress={handleSubmit}
                                    startContent={!isLoading && <Save className="w-4 h-4" />}
                                    className="bg-gradient-to-r from-blue-500 to-purple-600"
                                >
                                    {isLoading ?
                                        (editingUser ? "Updating User..." : "Creating User...") :
                                        (editingUser ? "Update User" : "Create User")
                                    }
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}