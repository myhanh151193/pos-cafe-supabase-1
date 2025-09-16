import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  BarChart3, 
  Package, 
  Users, 
  FileText,
  Warehouse,
  Settings,
  Coffee,
  Home
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Tổng quan", url: "/admin?tab=overview", icon: BarChart3, tab: "overview" },
  { title: "Báo cáo", url: "/admin?tab=reports", icon: FileText, tab: "reports" },
  { title: "Sản phẩm", url: "/admin?tab=products", icon: Package, tab: "products" },
  { title: "Tồn kho", url: "/admin?tab=inventory", icon: Warehouse, tab: "inventory" },
  { title: "Bàn", url: "/admin?tab=tables", icon: Users, tab: "tables" },
];

const externalLinks = [
  { title: "Trang chính", url: "/", icon: Home },
  { title: "Bếp pha chế", url: "/kitchen", icon: Coffee },
];

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  const { state } = useSidebar();
  const location = useLocation();

  const getNavCls = (isActive: boolean) =>
    isActive ? "bg-coffee-primary/10 text-coffee-primary font-medium border-r-2 border-coffee-primary" : "hover:bg-muted/50";

  return (
    <Sidebar
      className={state === "collapsed" ? "w-14" : "w-64"}
      collapsible="icon"
    >
      <SidebarContent>
        {/* Header */}
          <div className="p-4 border-b">
            <div className="flex items-center space-x-3">
              <Settings className="w-8 h-8 text-coffee-primary" />
              {state !== "collapsed" && (
                <div>
                  <h1 className="text-lg font-bold text-foreground">Admin Panel</h1>
                  <p className="text-xs text-muted-foreground">Quản trị hệ thống</p>
                </div>
              )}
            </div>
          </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Quản lý</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.tab}>
                  <SidebarMenuButton 
                    asChild 
                    className={getNavCls(activeTab === item.tab)}
                    onClick={() => onTabChange(item.tab)}
                  >
                    <button className="w-full justify-start">
                      <item.icon className="h-4 w-4 mr-2" />
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* External Links */}
        <SidebarGroup>
          <SidebarGroupLabel>Điều hướng</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {externalLinks.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={({ isActive }) => getNavCls(isActive)}
                    >
                      <item.icon className="h-4 w-4 mr-2" />
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}