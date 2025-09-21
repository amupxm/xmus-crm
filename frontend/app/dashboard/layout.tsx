"use client";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Spinner,
} from "@heroui/react";
import {
  Activity,
  Bell,
  Calendar,
  Home,
  LogOut,
  Settings,
  Shield,
  User,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

import { useAuth } from "@/hooks/useAuth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const { user } = useAuth();

  const navigationItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <Home className="w-5 h-5" />,
      badge: null,
    },
    {
      label: "Leaves",
      href: "/dashboard/leaves",
      icon: <Calendar className="w-5 h-5" />,
      badge: "3",
    },
    {
      label: "User management",
      href: "/dashboard/user",
      icon: <User className="w-5 h-5" />,
      badge: null,
    },
    {
      label: "Settings",
      href: "/dashboard/settings",
      icon: <Settings className="w-5 h-5" />,
      badge: null,
    },
    {
      label: "Activity",
      href: "/dashboard/activity",
      icon: <Activity className="w-5 h-5" />,
      badge: "12",
    },
  ];

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Handle route change loading
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Sidebar */}
      <aside className="w-80 relative">
        {/* Glassmorphism Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-xl border-r border-white/20">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-purple-600/10" />
        </div>

        <div className="relative z-10 h-full p-6 flex flex-col">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">NexaCRM</h2>
              <p className="text-sm text-gray-300">Internal Portal</p>
            </div>
          </div>

          {/* User Profile Card */}
          <Card className="mb-6 bg-white/10 backdrop-blur-md border border-white/20">
            <CardBody className="p-4">
              <div className="flex items-center space-x-3">
                <Badge
                  color="success"
                  content="●"
                  placement="bottom-right"
                  size="sm"
                >
                  <Avatar
                    className="ring-2 ring-blue-400/50"
                    size="md"
                    src="https://i.pravatar.cc/150?u=user"
                  />
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">
                    {user?.firstName || "User"}
                  </p>
                  <p className="text-gray-300 text-sm">Online</p>
                </div>
                <Dropdown>
                  <DropdownTrigger>
                    <Button
                      isIconOnly
                      className="text-white/70 hover:text-white"
                      size="sm"
                      variant="light"
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu>
                    <DropdownItem key="profile">View Profile</DropdownItem>
                    <DropdownItem key="settings">Account Settings</DropdownItem>
                    <DropdownItem key="logout" className="text-danger">
                      Sign Out
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </CardBody>
          </Card>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <div key={item.href} className="relative">
                  <Link
                    href={item.href}
                    className={`
                      flex items-center space-x-3 p-3 rounded-xl transition-all duration-200
                      ${isActive
                        ? "bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-white border border-blue-400/30 shadow-lg shadow-blue-500/25"
                        : "text-gray-300 hover:text-white hover:bg-white/10"
                      }
                    `}
                  >
                    <div className={`${isActive ? "text-blue-400" : ""}`}>
                      {item.icon}
                    </div>
                    <span className="font-medium flex-1">{item.label}</span>
                    {item.badge && (
                      <Badge
                        className="animate-pulse"
                        color="danger"
                        content={item.badge}
                        size="sm"
                      > </Badge>
                    )}
                  </Link>
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-400 to-purple-500 rounded-r-full" />
                  )}
                </div>
              );
            })}
          </nav>

          <Divider className="my-6 bg-white/20" />

          {/* Bottom Actions */}
          <div className="space-y-2">
            <Button
              className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10"
              startContent={<Bell className="w-5 h-5" />}
              variant="ghost"
            >
              Notifications
              <Badge
                className="ml-auto"
                color="warning"
                content="2"
                size="sm"
              > </Badge>

            </Button>

            <Button
              className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10"
              startContent={<Shield className="w-5 h-5" />}
              variant="ghost"
            >
              Security
            </Button>

            <Link href="/logout">
              <Button
                className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
                startContent={<LogOut className="w-5 h-5" />}
                variant="ghost"
              >
                Logout
              </Button>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-transparent to-purple-500/20" />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
              backgroundSize: "20px 20px",
            }}
          />
        </div>

        {/* Content Area */}
        <div className="relative z-10 h-full">
          <div className="h-full bg-gradient-to-br from-gray-50/95 to-white/95 backdrop-blur-sm">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Spinner
                    size="lg"
                    color="primary"
                    className="mb-4"
                  />
                  <p className="text-gray-600">Loading...</p>
                </div>
              </div>
            ) : (
              children
            )}
          </div>
        </div>
      </main>
    </div>
  );
}