"use client"
import { Button } from "@heroui/button";
import {
    Save,
    User, X
} from "lucide-react";
import { ReactNode } from "react";
import PageCard from "../../../../components/card/pageCard";
import CreateUserForm from "./createUserForm";
export default function CreateUserTab(): ReactNode {
    const header = (
        <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-lg">
                <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Create New User</h2>
                <p className="text-gray-600">Fill in the details to create a new user account</p>
            </div>
        </div>
    )
    const body = CreateUserForm()
    const footer = (
        <div className="flex justify-end space-x-4">
            <Button
                variant="bordered"
                color="default"
                // onPress={handleReset}
                startContent={<X className="w-4 h-4" />}
                className="border-gray-300 hover:border-gray-400"
            >
                Reset Form
            </Button>
            <Button
                type="button"
                color="primary"
                startContent={<Save className="w-4 h-4" />}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
            </Button>
        </div>
    )
    return (<PageCard
        header={header}
        body={body}
        footer={footer}
    />)

}