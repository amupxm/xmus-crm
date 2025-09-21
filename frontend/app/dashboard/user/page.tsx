import TabComponent from "@/components/tab/tabComponent";
import { ReactNode } from "react";
import AllUsersListTab from "./components/allUsersListTab";
import CreateUserTab from "./components/createUserTab";
export default function UserRegistrationForm(): ReactNode {

    const tabs = [
        {

            tabName: "All Users",
            tabKey: "users",
            tabComponent: <AllUsersListTab />
        },
        {
            tabName: "Add New User",
            tabKey: "newUser",
            tabComponent: <CreateUserTab />
        }
    ]
    return (<>
        <TabComponent tabs={
            tabs
        } />
    </>)
}