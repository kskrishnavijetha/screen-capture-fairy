import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const SignIn = () => {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Log in to ScreenCraft</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button variant="outline" className="w-full justify-start gap-3 h-12">
          <img src="/lovable-uploads/0adef7de-6f89-43de-9fe2-563afd4dbf3c.png" alt="Google" className="w-5 h-5" />
          Sign in with Google
        </Button>
        <Button variant="outline" className="w-full justify-start gap-3 h-12">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.633 7.997c.013.175.013.349.013.523 0 5.325-4.053 11.461-11.46 11.461-2.282 0-4.402-.661-6.186-1.809.324.037.636.05.973.05a8.07 8.07 0 0 0 5.001-1.721 4.036 4.036 0 0 1-3.767-2.793c.249.037.499.062.761.062.361 0 .724-.05 1.061-.137a4.027 4.027 0 0 1-3.23-3.953v-.05c.537.299 1.16.486 1.82.511a4.022 4.022 0 0 1-1.796-3.354c0-.748.199-1.434.548-2.032a11.457 11.457 0 0 0 8.306 4.215c-.062-.3-.1-.611-.1-.923a4.026 4.026 0 0 1 4.028-4.028c1.16 0 2.207.486 2.943 1.272a7.957 7.957 0 0 0 2.556-.973 4.02 4.02 0 0 1-1.771 2.22 8.073 8.073 0 0 0 2.319-.624 8.645 8.645 0 0 1-2.019 2.083z"/>
          </svg>
          Sign in with Slack
        </Button>
        <Button variant="outline" className="w-full justify-start gap-3 h-12">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>
          </svg>
          Sign in with Apple
        </Button>
        <Button variant="outline" className="w-full justify-start gap-3 h-12">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21.996 11.025a1 1 0 0 0-.974-.81h-9.866L13.797 2.2a1 1 0 0 0-1.795-.9L2.002 11.3a1 1 0 0 0 .295 1.604l9.857 4.484a1 1 0 0 0 1.393-.52l8.449-4.843a1 1 0 0 0 0-1z"/>
          </svg>
          Sign in with Outlook
        </Button>
        <Button variant="outline" className="w-full justify-start gap-3 h-12">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
          </svg>
          Sign in with SSO
        </Button>
      </CardContent>
    </Card>
  );
};