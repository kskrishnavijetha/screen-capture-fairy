import { SignInDialog } from "@/components/auth/SignInDialog";

const Signup = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1A1F2C]">
      <div className="w-full max-w-md">
        <SignInDialog open={true} onOpenChange={() => {}} defaultIsLogin={false} />
      </div>
    </div>
  );
};

export default Signup;