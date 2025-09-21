"use client";
import TabComponent, { TabsType } from "@/components/tab/tabComponent";
import requestsTab from "./component/requestsTab";


export default function DashboardPage() {
    const tabs: TabsType = [
        {
            tabName: "Requests",
            tabKey: "requests",
            tabComponent: requestsTab(),
        },

    ]
    return (
        <TabComponent tabs={tabs} />
    )
}