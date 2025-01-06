import {
  FileText,
  Video,
  MonitorPlay,
  Calendar,
  ChartBar,
  DollarSign,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const MENU_ITEMS = [
  { id: 'content', label: 'AI Content Generator', icon: FileText },
  { id: 'video', label: 'AI Short Video Generator', icon: Video },
  { id: 'recorder', label: 'Screen Recorder', icon: MonitorPlay },
  { id: 'calendar', label: 'Content Calendar', icon: Calendar },
  { id: 'analytics', label: 'Social Media Analytics', icon: ChartBar },
  { id: 'monetization', label: 'Monetization Hub', icon: DollarSign },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {MENU_ITEMS.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton>
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}