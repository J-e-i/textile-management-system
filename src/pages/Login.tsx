import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { signIn } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { user } = await signIn(formData.email, formData.password);
      
      if (user) {
        // Get the user's profile to check approval status
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, approval_status')
          .eq('id', user.id)
          .single()

        // Determine role from profile or email
        const userRole = profile?.role === 'admin' ? 'admin' : 'buyer';
        
        // Check if buyer is approved (or if they're admin, which doesn't need approval)
        if (userRole === 'buyer' && profile?.approval_status !== 'APPROVED') {
          toast({
            title: "Account Pending Approval",
            description: "Your account is waiting for admin approval. You'll be able to login once approved.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        const authUser = {
          id: user.id,
          email: user.email!,
          role: userRole,
          full_name: user.user_metadata?.full_name,
          company_name: user.user_metadata?.company_name,
        };

        setUser(authUser);

        toast({
          title: "Login Successful",
          description: `Welcome back! Redirecting to ${userRole} dashboard...`,
        });

        // Use setTimeout to avoid navigation conflicts
        setTimeout(() => {
          if (userRole === 'admin') {
            navigate('/admin');
          } else {
            navigate('/buyer');
          }
        }, 100);
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          {/* Back Link */}
          <Link
            to="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>

          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-bold text-primary-foreground">TX</span>
            </div>
            <span className="text-2xl font-bold text-foreground">TextileB2B</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">Welcome back</h1>
            <p className="text-muted-foreground">
              Sign in to access your dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="label-enterprise">
                Email Address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="label-enterprise">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-border" />
                <span className="text-sm text-muted-foreground">Remember me</span>
              </label>
              <button type="button" className="text-sm text-primary hover:underline">
                Forgot password?
              </button>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Register Link */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Register as Buyer
            </Link>
          </p>
        </div>
      </div>

      {/* Right Panel - Branding */}
      <div className="hidden lg:flex lg:flex-1 bg-primary items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-primary-foreground/20 flex items-center justify-center">
            <span className="text-4xl font-bold text-primary-foreground">TX</span>
          </div>
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            Streamline Your Textile Orders
          </h2>
          <p className="text-primary-foreground/80">
            Access your personalized dashboard to manage bulk orders, track quotations, 
            and monitor order status in real-time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
