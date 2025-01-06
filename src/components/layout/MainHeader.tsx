import { SidebarTrigger } from "@/components/ui/sidebar";

export const MainHeader = () => {
  return (
    <div className="absolute top-4 left-4 flex items-center gap-4">
      <SidebarTrigger />
      <img 
        src="/lovable-uploads/54cd55ec-2ab7-464a-a5c9-7388b5f53a05.png" 
        alt="ScreenCraft Logo" 
        className="w-12 h-12 object-contain"
      />
    </div>
  );
};