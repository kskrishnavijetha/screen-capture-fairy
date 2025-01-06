import { Calendar, FileText, Video, BarChart2, DollarSign } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Content Calendar",
    icon: Calendar,
    component: "calendar"
  },
  {
    title: "AI Content Generator",
    icon: FileText,
    component: "generator"
  },
  {
    title: "Screen Recorder",
    icon: Video,
    component: "recorder"
  },
  {
    title: "Social Media Analytics",
    icon: BarChart2,
    component: "analytics"
  },
  {
    title: "Monetization Hub",
    icon: DollarSign,
    component: "monetization"
  }
];

interface AppSidebarProps {
  onSelectComponent: (component: string) => void;
}

export const AppSidebar = ({ onSelectComponent }: AppSidebarProps) => {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    onClick={() => onSelectComponent(item.component)}
                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-accent rounded-md transition-colors"
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};