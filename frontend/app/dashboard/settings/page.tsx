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
    Select,
    SelectItem,
    Switch,
    Tab,
    Tabs,
    Textarea
} from "@heroui/react";
import {
    Bell,
    Calendar,
    Camera,
    Globe,
    Lock,
    Mail,
    Moon,
    Palette,
    Save,
    Settings,
    Shield,
    Sun,
    User,
    Zap
} from "lucide-react";
import { useState } from "react";

export default function FuturisticSettingsPage() {
    const [activeTab, setActiveTab] = useState("general");
    const [isLoading, setIsLoading] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [notifications, setNotifications] = useState(true);
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [autoApprove, setAutoApprove] = useState(false);

    const [generalSettings, setGeneralSettings] = useState({
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@company.com",
        phone: "+1 (555) 123-4567",
        bio: "Software Engineer passionate about creating innovative solutions.",
        timezone: "UTC-5",
        language: "en",
        theme: "system"
    });

    const [leaveSettings, setLeaveSettings] = useState({
        casualLeavesPerYear: 12,
        vacationLeavesPerYear: 15,
        sickLeavesPerYear: 10,
        maxConsecutiveDays: 7,
        advanceBookingDays: 30,
        carryForwardLimit: 5
    });

    const timezones = [
        { key: "UTC-12", label: "UTC-12:00 (Baker Island)" },
        { key: "UTC-8", label: "UTC-08:00 (Pacific Time)" },
        { key: "UTC-5", label: "UTC-05:00 (Eastern Time)" },
        { key: "UTC", label: "UTC+00:00 (Greenwich Mean Time)" },
        { key: "UTC+1", label: "UTC+01:00 (Central European Time)" },
        { key: "UTC+8", label: "UTC+08:00 (China Standard Time)" }
    ];

    const languages = [
        { key: "en", label: "English" },
        { key: "es", label: "Spanish" },
        { key: "fr", label: "French" },
        { key: "de", label: "German" },
        { key: "zh", label: "Chinese" },
        { key: "ja", label: "Japanese" }
    ];

    const themes = [
        { key: "light", label: "Light Mode" },
        { key: "dark", label: "Dark Mode" },
        { key: "system", label: "System Default" }
    ];

    const handleGeneralChange = (field, value) => {
        setGeneralSettings(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleLeaveChange = (field, value) => {
        setLeaveSettings(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            console.log("Settings saved:", { generalSettings, leaveSettings });
            alert("Settings saved successfully!");
        } catch (error) {
            console.error("Error saving settings:", error);
            alert("Error saving settings. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
            </div>

            {/* Header */}
            <div className="relative z-10 mb-8">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-xl backdrop-blur-sm border border-white/10">
                            <Settings className="w-8 h-8 text-purple-300" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-300 to-cyan-300 bg-clip-text text-transparent">
                                Settings
                            </h1>
                            <p className="text-gray-400">Customize your experience</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <Chip
                            color="success"
                            variant="dot"
                            className="bg-green-500/20 text-green-300 border-green-500/30"
                        >
                            Online
                        </Chip>
                        <Button
                            color="primary"
                            variant="shadow"
                            className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600"
                            startContent={<Zap className="w-4 h-4" />}
                        >
                            Quick Setup
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 max-w-6xl mx-auto">
                <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
                    <CardHeader className="pb-4">
                        <Tabs
                            selectedKey={activeTab}
                            onSelectionChange={setActiveTab}
                            variant="underlined"
                            classNames={{
                                tabList: "gap-8 w-full relative rounded-none p-0 border-b border-white/10",
                                cursor: "w-full bg-gradient-to-r from-purple-500 to-cyan-500",
                                tab: "max-w-fit px-0 h-14",
                                tabContent: "group-data-[selected=true]:text-purple-300 font-semibold text-lg text-gray-300"
                            }}
                        >
                            <Tab
                                key="general"
                                title={
                                    <div className="flex items-center space-x-2">
                                        <User className="w-5 h-5" />
                                        <span>General</span>
                                    </div>
                                }
                            />
                            <Tab
                                key="leaves"
                                title={
                                    <div className="flex items-center space-x-2">
                                        <Calendar className="w-5 h-5" />
                                        <span>Leaves</span>
                                    </div>
                                }
                            />
                        </Tabs>
                    </CardHeader>

                    <CardBody className="p-8">
                        {activeTab === "general" && (
                            <div className="space-y-8">
                                {/* Profile Section */}
                                <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-2xl p-8 border border-white/10">
                                    <div className="flex items-center space-x-6 mb-6">
                                        <div className="relative">
                                            <Avatar
                                                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
                                                className="w-20 h-20 border-4 border-purple-500/30"
                                            />
                                            <Button
                                                isIconOnly
                                                size="sm"
                                                className="absolute -bottom-2 -right-2 bg-gradient-to-r from-purple-500 to-cyan-500 min-w-8 h-8"
                                            >
                                                <Camera className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white">Profile Information</h3>
                                            <p className="text-gray-400">Update your personal details</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input
                                            label="First Name"
                                            value={generalSettings.firstName}
                                            onValueChange={(value) => handleGeneralChange("firstName", value)}
                                            startContent={<User className="w-4 h-4 text-purple-400" />}
                                            classNames={{
                                                input: "text-white",
                                                label: "text-gray-300"
                                            }}
                                        />
                                        <Input
                                            label="Last Name"
                                            value={generalSettings.lastName}
                                            onValueChange={(value) => handleGeneralChange("lastName", value)}
                                            startContent={<User className="w-4 h-4 text-purple-400" />}
                                            classNames={{
                                                input: "text-white",
                                                label: "text-gray-300"
                                            }}
                                        />
                                        <Input
                                            label="Email"
                                            value={generalSettings.email}
                                            onValueChange={(value) => handleGeneralChange("email", value)}
                                            startContent={<Mail className="w-4 h-4 text-purple-400" />}
                                            classNames={{
                                                input: "text-white",
                                                label: "text-gray-300"
                                            }}
                                        />
                                        <Input
                                            label="Phone"
                                            value={generalSettings.phone}
                                            onValueChange={(value) => handleGeneralChange("phone", value)}
                                            classNames={{
                                                input: "text-white",
                                                label: "text-gray-300"
                                            }}
                                        />
                                    </div>

                                    <div className="mt-6">
                                        <Textarea
                                            label="Bio"
                                            value={generalSettings.bio}
                                            onValueChange={(value) => handleGeneralChange("bio", value)}
                                            placeholder="Tell us about yourself..."
                                            classNames={{
                                                input: "text-white",
                                                label: "text-gray-300"
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Preferences Section */}
                                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl p-8 border border-white/10">
                                    <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                                        <Palette className="w-6 h-6 mr-3 text-blue-400" />
                                        Preferences
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Select
                                            label="Timezone"
                                            selectedKeys={generalSettings.timezone ? [generalSettings.timezone] : []}
                                            onSelectionChange={(keys) => handleGeneralChange("timezone", Array.from(keys)[0] || "")}
                                            startContent={<Globe className="w-4 h-4 text-blue-400" />}
                                            classNames={{
                                                label: "text-gray-300",
                                                value: "text-white"
                                            }}
                                        >
                                            {timezones.map((tz) => (
                                                <SelectItem key={tz.key} value={tz.key}>
                                                    {tz.label}
                                                </SelectItem>
                                            ))}
                                        </Select>

                                        <Select
                                            label="Language"
                                            selectedKeys={generalSettings.language ? [generalSettings.language] : []}
                                            onSelectionChange={(keys) => handleGeneralChange("language", Array.from(keys)[0] || "")}
                                            classNames={{
                                                label: "text-gray-300",
                                                value: "text-white"
                                            }}
                                        >
                                            {languages.map((lang) => (
                                                <SelectItem key={lang.key} value={lang.key}>
                                                    {lang.label}
                                                </SelectItem>
                                            ))}
                                        </Select>

                                        <Select
                                            label="Theme"
                                            selectedKeys={generalSettings.theme ? [generalSettings.theme] : []}
                                            onSelectionChange={(keys) => handleGeneralChange("theme", Array.from(keys)[0] || "")}
                                            startContent={isDarkMode ? <Moon className="w-4 h-4 text-blue-400" /> : <Sun className="w-4 h-4 text-blue-400" />}
                                            classNames={{
                                                label: "text-gray-300",
                                                value: "text-white"
                                            }}
                                        >
                                            {themes.map((theme) => (
                                                <SelectItem key={theme.key} value={theme.key}>
                                                    {theme.label}
                                                </SelectItem>
                                            ))}
                                        </Select>
                                    </div>
                                </div>

                                {/* Notifications Section */}
                                <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-2xl p-8 border border-white/10">
                                    <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                                        <Bell className="w-6 h-6 mr-3 text-green-400" />
                                        Notifications
                                    </h3>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                                            <div>
                                                <p className="text-white font-medium">Push Notifications</p>
                                                <p className="text-gray-400 text-sm">Receive notifications on your device</p>
                                            </div>
                                            <Switch
                                                isSelected={notifications}
                                                onValueChange={setNotifications}
                                                classNames={{
                                                    wrapper: "bg-white/10"
                                                }}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                                            <div>
                                                <p className="text-white font-medium">Email Notifications</p>
                                                <p className="text-gray-400 text-sm">Receive email updates</p>
                                            </div>
                                            <Switch
                                                isSelected={emailNotifications}
                                                onValueChange={setEmailNotifications}
                                                classNames={{
                                                    wrapper: "bg-white/10"
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Security Section */}
                                <div className="bg-gradient-to-r from-red-500/10 to-purple-500/10 rounded-2xl p-8 border border-white/10">
                                    <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                                        <Shield className="w-6 h-6 mr-3 text-red-400" />
                                        Security
                                    </h3>

                                    <div className="space-y-4">
                                        <Button
                                            variant="bordered"
                                            startContent={<Lock className="w-4 h-4" />}
                                            className="border-white/20 text-white hover:bg-white/10"
                                        >
                                            Change Password
                                        </Button>
                                        <Button
                                            variant="bordered"
                                            startContent={<Shield className="w-4 h-4" />}
                                            className="border-white/20 text-white hover:bg-white/10"
                                        >
                                            Two-Factor Authentication
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "leaves" && (
                            <div className="space-y-8">
                                {/* Leave Allocation */}
                                <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-2xl p-8 border border-white/10">
                                    <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                                        <Calendar className="w-6 h-6 mr-3 text-cyan-400" />
                                        Annual Leave Allocation
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <Input
                                            label="Casual Leaves"
                                            type="number"
                                            value={leaveSettings.casualLeavesPerYear.toString()}
                                            onValueChange={(value) => handleLeaveChange("casualLeavesPerYear", parseInt(value) || 0)}
                                            startContent={<Calendar className="w-4 h-4 text-cyan-400" />}
                                            classNames={{
                                                input: "text-white",
                                                label: "text-gray-300"
                                            }}
                                        />
                                        <Input
                                            label="Vacation Leaves"
                                            type="number"
                                            value={leaveSettings.vacationLeavesPerYear.toString()}
                                            onValueChange={(value) => handleLeaveChange("vacationLeavesPerYear", parseInt(value) || 0)}
                                            startContent={<Calendar className="w-4 h-4 text-cyan-400" />}
                                            classNames={{
                                                input: "text-white",
                                                label: "text-gray-300"
                                            }}
                                        />
                                        <Input
                                            label="Sick Leaves"
                                            type="number"
                                            value={leaveSettings.sickLeavesPerYear.toString()}
                                            onValueChange={(value) => handleLeaveChange("sickLeavesPerYear", parseInt(value) || 0)}
                                            startContent={<Calendar className="w-4 h-4 text-cyan-400" />}
                                            classNames={{
                                                input: "text-white",
                                                label: "text-gray-300"
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Leave Rules */}
                                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl p-8 border border-white/10">
                                    <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                                        <Settings className="w-6 h-6 mr-3 text-purple-400" />
                                        Leave Rules & Policies
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input
                                            label="Max Consecutive Days"
                                            type="number"
                                            value={leaveSettings.maxConsecutiveDays.toString()}
                                            onValueChange={(value) => handleLeaveChange("maxConsecutiveDays", parseInt(value) || 0)}
                                            description="Maximum consecutive days for a single leave request"
                                            classNames={{
                                                input: "text-white",
                                                label: "text-gray-300",
                                                description: "text-gray-400"
                                            }}
                                        />
                                        <Input
                                            label="Advance Booking (Days)"
                                            type="number"
                                            value={leaveSettings.advanceBookingDays.toString()}
                                            onValueChange={(value) => handleLeaveChange("advanceBookingDays", parseInt(value) || 0)}
                                            description="Minimum days in advance for leave booking"
                                            classNames={{
                                                input: "text-white",
                                                label: "text-gray-300",
                                                description: "text-gray-400"
                                            }}
                                        />
                                        <Input
                                            label="Carry Forward Limit"
                                            type="number"
                                            value={leaveSettings.carryForwardLimit.toString()}
                                            onValueChange={(value) => handleLeaveChange("carryForwardLimit", parseInt(value) || 0)}
                                            description="Maximum leaves that can be carried forward"
                                            classNames={{
                                                input: "text-white",
                                                label: "text-gray-300",
                                                description: "text-gray-400"
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Leave Management */}
                                <div className="bg-gradient-to-r from-green-500/10 to-teal-500/10 rounded-2xl p-8 border border-white/10">
                                    <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                                        <Zap className="w-6 h-6 mr-3 text-green-400" />
                                        Leave Management
                                    </h3>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                                            <div>
                                                <p className="text-white font-medium">Auto-approve Leaves</p>
                                                <p className="text-gray-400 text-sm">Automatically approve leaves within policy</p>
                                            </div>
                                            <Switch
                                                isSelected={autoApprove}
                                                onValueChange={setAutoApprove}
                                                classNames={{
                                                    wrapper: "bg-white/10"
                                                }}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-white font-medium">Remaining This Year</span>
                                                    <Chip color="success" variant="flat" size="sm">
                                                        Active
                                                    </Chip>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-300">Casual</span>
                                                        <span className="text-cyan-300">8/12</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-300">Vacation</span>
                                                        <span className="text-cyan-300">12/15</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-300">Sick</span>
                                                        <span className="text-cyan-300">10/10</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-white font-medium">Pending Requests</span>
                                                    <Chip color="warning" variant="flat" size="sm">
                                                        2 Pending
                                                    </Chip>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="text-sm text-gray-300">
                                                        Dec 25-27: Holiday Break
                                                    </div>
                                                    <div className="text-sm text-gray-300">
                                                        Jan 15: Personal Day
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <Divider className="my-8 bg-white/10" />

                        {/* Actions */}
                        <div className="flex justify-end space-x-4">
                            <Button
                                variant="bordered"
                                className="border-white/20 text-white hover:bg-white/10"
                            >
                                Reset to Default
                            </Button>
                            <Button
                                color="primary"
                                isLoading={isLoading}
                                onPress={handleSave}
                                startContent={!isLoading && <Save className="w-4 h-4" />}
                                className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 shadow-lg"
                            >
                                {isLoading ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}