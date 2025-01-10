import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MENU_ITEMS } from "./MainMenu";

interface HomePageProps {
  setSelectedComponent: (id: string) => void;
}

export const HomePage = ({ setSelectedComponent }: HomePageProps) => {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold tracking-tight leading-tight">
          A Single Recording Can Tell the Whole Story
        </h1>
        <p className="text-lg text-muted-foreground">
          Easily create and share AI-enhanced video messages that tell the whole story and drive seamless collaboration
        </p>
      </div>
    </div>
  );
};