"use client";
import { Tab, Tabs } from "@heroui/react";
import { ReactNode, useState } from "react";
export type TabsType = {
    tabName: string;
    tabKey: string;
    tabComponent: ReactNode;
}[]
export default function TabComponent({ tabs, headerComponent = undefined }: { tabs: TabsType, headerComponent?: ReactNode }): ReactNode {
    const [activeTab, setActiveTab] = useState(tabs[0].tabKey);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
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
                        {tabs.map((tab) => (
                            <Tab key={tab.tabKey} title={tab.tabName} />
                        ))}
                    </Tabs>
                </div>
            </div>
            <div className="max-w-7xl mx-auto">
                {tabs.find((tab) => tab.tabKey === activeTab)?.tabComponent || <div className="p-4">No content available for this tab.</div>}
            </div>
        </div>
    )
}