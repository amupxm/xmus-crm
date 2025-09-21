"use client"
import {
    Input,
    Select,
    SelectItem
} from "@heroui/react";
import { ENUM_ROLES } from "@internal-cms/shared/src/api/general";
import {
    Briefcase,
    Calendar,
    DollarSign,
    EyeOff,
    Lock,
    Mail,
    User
} from "lucide-react";
import { ReactNode, useState } from "react";

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

export default function CreateUserForm(): ReactNode {
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


    return (

        <>
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
                            // onValueChange={(value) => handleInputChange("firstName", value)}
                            // isInvalid={!!errors.firstName}
                            // errorMessage={errors.firstName}
                            startContent={<User className="w-4 h-4 text-gray-400" />}
                            isRequired
                        />

                        <Input
                            label="Last Name"
                            placeholder="Enter last name"
                            value={formData.lastName}
                            // onValueChange={(value) => handleInputChange("lastName", value)}
                            // isInvalid={!!errors.lastName}
                            // errorMessage={errors.lastName}
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
                            // onValueChange={(value) => handleInputChange("email", value)}
                            // isInvalid={!!errors.email}
                            // errorMessage={errors.email}
                            startContent={<Mail className="w-4 h-4 text-gray-400" />}
                            isRequired
                        />

                        <Input
                            label="Username"
                            placeholder="Enter username"
                            value={formData.username}
                            // onValueChange={(value) => handleInputChange("username", value)}
                            // isInvalid={!!errors.username}
                            // errorMessage={errors.username}
                            startContent={<User className="w-4 h-4 text-gray-400" />}
                            isRequired
                        />

                        <Input
                            label={"New Password (leave blank to keep current)"}
                            placeholder="Enter password"
                            // type={showPassword ? "text" : "password"}
                            value={formData.password}
                            // onValueChange={(value) => handleInputChange("password", value)}
                            // isInvalid={!!errors.password}
                            // errorMessage={errors.password}
                            startContent={<Lock className="w-4 h-4 text-gray-400" />}
                            endContent={
                                <button
                                    type="button"
                                    // onClick={() => setShowPassword(!showPassword)}
                                    className="focus:outline-none"
                                >
                                    {/* {showPassword ? */}
                                    <EyeOff className="w-4 h-4 text-gray-400" /> :
                                    {/* <Eye className="w-4 h-4 text-gray-400" /> */}
                                    {/* } */}
                                </button>
                            }
                        // isRequired={!editingUser}
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
                            // onSelectionChange={(keys) => handleInputChange("role", Array.from(keys)[0] || "")}
                            // isInvalid={!!errors.role}
                            // errorMessage={errors.role}
                            isRequired
                        >
                            {Object.values(ENUM_ROLES).map((role) => (
                                <SelectItem key={role} value={role}>
                                    {role}
                                </SelectItem>
                            ))}
                        </Select>

                        {/* <Select
                            label="Supervisor"
                            placeholder="Select supervisor (optional)"
                            selectedKeys={formData.supervisor ? [formData.supervisor] : []}
                        // onSelectionChange={(keys) => handleInputChange("supervisor", Array.from(keys)[0] || "")}
                        >
                            {/* {supervisors.map((supervisor) => (
                                <SelectItem key={supervisor.key} value={supervisor.key}>
                                    {supervisor.label}
                                </SelectItem>
                            ))} */}
                        {/* </Select> */}
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
                            // value={formData.salary}
                            // onValueChange={(value) => handleInputChange("salary", value)}
                            // isInvalid={!!errors.salary}
                            // errorMessage={errors.salary}
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
                            // onValueChange={(value) => handleInputChange("casualLeavesAvailable", parseInt(value) || 0)}
                            // isInvalid={!!errors.casualLeavesAvailable}
                            // errorMessage={errors.casualLeavesAvailable}
                            startContent={<Calendar className="w-4 h-4 text-gray-400" />}
                        />

                        <Input
                            label="Vacation Leaves"
                            placeholder="12"
                            type="number"
                            value={formData.vacationLeavesAvailable.toString()}
                            // onValueChange={(value) => handleInputChange("vacationLeavesAvailable", parseInt(value) || 0)}
                            // isInvalid={!!errors.vacationLeavesAvailable}
                            // errorMessage={errors.vacationLeavesAvailable}
                            startContent={<Calendar className="w-4 h-4 text-gray-400" />}
                        />

                        <Input
                            label="Sick Leaves"
                            placeholder="12"
                            type="number"
                            value={formData.sickLeavesAvailable.toString()}
                            // onValueChange={(value) => handleInputChange("sickLeavesAvailable", parseInt(value) || 0)}
                            // isInvalid={!!errors.sickLeavesAvailable}
                            // errorMessage={errors.sickLeavesAvailable}
                            startContent={<Calendar className="w-4 h-4 text-gray-400" />}
                        />
                    </div>
                </div >
            </div>
        </>
    )
}