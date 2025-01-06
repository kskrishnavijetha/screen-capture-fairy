import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MENU_ITEMS } from "./MainMenu";

interface HomePageProps {
  setSelectedComponent: (id: string) => void;
}

export const HomePage = ({ setSelectedComponent }: HomePageProps) => {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        A Single Recording Can Tell the Whole Story
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {MENU_ITEMS.filter(item => item.id !== 'home').map((item) => (
          <Card 
            key={item.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedComponent(item.id)}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <item.icon className="h-5 w-5" />
                {item.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                {getFeatureDescription(item.id)}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const getFeatureDescription = (id: string): string => {
  switch (id) {
    case 'content':
      return 'Generate engaging content with AI assistance';
    case 'video':
      return 'Create short-form videos with AI-powered tools';
    case 'recorder':
      return 'Record your screen with professional quality';
    case 'calendar':
      return 'Plan and schedule your content effectively';
    case 'analytics':
      return 'Track and analyze your social media performance';
    case 'monetization':
      return 'Explore ways to monetize your content';
    default:
      return '';
  }
};