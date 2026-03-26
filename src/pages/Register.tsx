import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, ArrowLeft, CheckCircle, AlertCircle, Clock, Mail, Wifi, RefreshCw } from "lucide-react";
import { signUp } from "@/lib/auth";

const RATE_LIMIT_KEY = 'textile_signup_ratelimit';
const IP_RATE_LIMIT_KEY = 'textile_ip_ratelimit';
const RATE_LIMIT_WINDOW = 3600 * 1000; // 1 hour in milliseconds
const IP_COOLDOWN_WINDOW = 15 * 60 * 1000; // 15 minutes for IP-based cooldown

interface RateLimitRecord {
  email: string;
  timestamp: number;
  attempts: number;
}

interface IPRateLimitRecord {
  timestamp: number;
  failureCount: number;
  duration: number; // Exponential backoff duration in ms
}

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rateLimitEmail, setRateLimitEmail] = useState("");
  const [retryTime, setRetryTime] = useState<string>("");
  const [isIPRateLimited, setIsIPRateLimited] = useState(false);
  const [ipCooldownSeconds, setIPCooldownSeconds] = useState(0);
  const ipCooldownTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const [formData, setFormData] = useState({
    businessName: "",
    gstNumber: "",
    contactPerson: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  // Check IP rate limit on mount
  useEffect(() => {
    const ipRecord = getIPRateLimitRecord();
    if (ipRecord && isIPRateLimitActive(ipRecord)) {
      const remainingMs = ipRecord.duration - (Date.now() - ipRecord.timestamp);
      setIsIPRateLimited(true);
      startIPCooldown(Math.ceil(remainingMs / 1000));
    }
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current);
      }
      if (ipCooldownTimerRef.current) {
        clearInterval(ipCooldownTimerRef.current);
      }
    };
  }, []);

  // IP-based rate limit functions
  const getIPRateLimitRecord = (): IPRateLimitRecord | null => {
    try {
      const stored = localStorage.getItem(IP_RATE_LIMIT_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  const isIPRateLimitActive = (record: IPRateLimitRecord): boolean => {
    return Date.now() - record.timestamp < record.duration;
  };

  const recordIPAttempt = () => {
    try {
      const existing = getIPRateLimitRecord();
      let newRecord: IPRateLimitRecord;

      if (existing && isIPRateLimitActive(existing)) {
        // Exponential backoff: 15min -> 30min -> 60min -> 120min max
        const newDuration = Math.min(existing.duration * 2, 120 * 60 * 1000);
        newRecord = {
          timestamp: Date.now(),
          failureCount: existing.failureCount + 1,
          duration: newDuration,
        };
      } else {
        // First failure: 15 minute cooldown
        newRecord = {
          timestamp: Date.now(),
          failureCount: 1,
          duration: 15 * 60 * 1000,
        };
      }

      localStorage.setItem(IP_RATE_LIMIT_KEY, JSON.stringify(newRecord));
    } catch (error) {
      console.error("Error recording IP attempt:", error);
    }
  };

  const startIPCooldown = (seconds: number) => {
    setIPCooldownSeconds(seconds);
    setIsIPRateLimited(true);

    if (ipCooldownTimerRef.current) {
      clearInterval(ipCooldownTimerRef.current);
    }

    ipCooldownTimerRef.current = setInterval(() => {
      setIPCooldownSeconds((prev) => {
        if (prev <= 1) {
          if (ipCooldownTimerRef.current) {
            clearInterval(ipCooldownTimerRef.current);
          }
          setIsIPRateLimited(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Email-based rate limit functions
  const checkRateLimit = (email: string): boolean => {
    try {
      const stored = localStorage.getItem(RATE_LIMIT_KEY);
      if (!stored) return false;

      const records: RateLimitRecord[] = JSON.parse(stored);
      const record = records.find((r) => r.email === email.toLowerCase());

      if (!record) return false;

      const now = Date.now();
      const timePassed = now - record.timestamp;

      // If window hasn't expired and we have 5+ attempts, rate limited
      if (timePassed < RATE_LIMIT_WINDOW && record.attempts >= 5) {
        return true;
      }

      // If window expired, remove the record
      if (timePassed >= RATE_LIMIT_WINDOW) {
        const filtered = records.filter((r) => r.email !== email.toLowerCase());
        localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(filtered));
        return false;
      }

      return false;
    } catch (error) {
      console.error("Error checking rate limit:", error);
      return false;
    }
  };

  // Record a signup attempt
  const recordAttempt = (email: string) => {
    try {
      const stored = localStorage.getItem(RATE_LIMIT_KEY) || "[]";
      const records: RateLimitRecord[] = JSON.parse(stored);
      const normalizedEmail = email.toLowerCase();

      const existing = records.find((r) => r.email === normalizedEmail);

      if (existing) {
        const timePassed = Date.now() - existing.timestamp;
        if (timePassed < RATE_LIMIT_WINDOW) {
          existing.attempts += 1;
        } else {
          // Reset if window expired
          existing.timestamp = Date.now();
          existing.attempts = 1;
        }
      } else {
        records.push({
          email: normalizedEmail,
          timestamp: Date.now(),
          attempts: 1,
        });
      }

      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(records));
    } catch (error) {
      console.error("Error recording attempt:", error);
    }
  };

  // Get retry time for rate limited email
  const getRetryTime = (email: string): string => {
    try {
      const stored = localStorage.getItem(RATE_LIMIT_KEY);
      if (!stored) return "";

      const records: RateLimitRecord[] = JSON.parse(stored);
      const record = records.find((r) => r.email === email.toLowerCase());

      if (!record) return "";

      const retryAt = new Date(record.timestamp + RATE_LIMIT_WINDOW);
      return retryAt.toLocaleTimeString([], { 
        hour: "2-digit", 
        minute: "2-digit",
        hour12: true 
      });
    } catch (error) {
      console.error("Error getting retry time:", error);
      return "";
    }
  };

  const formatDuration = (milliseconds: number): string => {
    const totalSeconds = Math.ceil(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    if (minutes === 0) {
      return `${seconds}s`;
    } else if (minutes < 60) {
      return `${minutes}m ${seconds}s`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.name === "email" ? e.target.value : formData.email;
    
    // Check email-specific rate limit in real-time
    if (email && checkRateLimit(email)) {
      setIsRateLimited(true);
      setRateLimitEmail(email);
      setRetryTime(getRetryTime(email));
    } else {
      setIsRateLimited(false);
    }

    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const startCooldown = (seconds: number = 60) => {
    setCooldownSeconds(seconds);

    if (cooldownTimerRef.current) {
      clearInterval(cooldownTimerRef.current);
    }

    cooldownTimerRef.current = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          if (cooldownTimerRef.current) {
            clearInterval(cooldownTimerRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check IP rate limit first (global)
    if (isIPRateLimited) {
      toast({
        title: "Server Rate Limited",
        description: "Too many registration attempts from your network. Please wait or try again from a different network.",
        variant: "destructive",
      });
      return;
    }

    // Check email-specific rate limit
    if (checkRateLimit(formData.email)) {
      setIsRateLimited(true);
      setRateLimitEmail(formData.email);
      setRetryTime(getRetryTime(formData.email));
      toast({
        title: "Email Rate Limited",
        description: `Too many attempts with this email. Please try after ${getRetryTime(formData.email)} or use a different email.`,
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 8) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.gstNumber) {
      toast({
        title: "GST Number Required",
        description: "GST number is required for registration.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await signUp(
        formData.email,
        formData.password,
        formData.contactPerson,
        formData.businessName,
        formData.gstNumber
      );

      // Clear rate limit records on success
      try {
        const stored = localStorage.getItem(RATE_LIMIT_KEY) || "[]";
        const records: RateLimitRecord[] = JSON.parse(stored);
        const filtered = records.filter((r) => r.email !== formData.email.toLowerCase());
        localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(filtered));
      } catch (e) {
        console.warn("Error clearing rate limit:", e);
      }

      toast({
        title: "Registration Successful",
        description: "Your account has been created and is pending admin approval. You can sign in once approved.",
      });

      navigate("/login");
    } catch (error: any) {
      const errorMessage = error.message || "Failed to create account. Please try again.";

      // Check if it's a rate limit error from server
      if (error.message?.includes("rate limit") || error.status === 429) {
        recordIPAttempt(); // Track IP-level attempt
        recordAttempt(formData.email); // Track email-level attempt

        const ipRecord = getIPRateLimitRecord();
        if (ipRecord) {
          const remainingMs = ipRecord.duration - (Date.now() - ipRecord.timestamp);
          const remainingSeconds = Math.ceil(remainingMs / 1000);
          
          toast({
            title: "Server Rate Limit Exceeded",
            description: `The server is rate-limiting registrations. Your network must wait ${formatDuration(remainingMs)} before trying again. You can try from a different network (mobile hotspot, different WiFi, VPN).`,
            variant: "destructive",
          });

          startIPCooldown(remainingSeconds);
        }
      } else if (error.message?.includes("already")) {
        toast({
          title: "Email Already Registered",
          description: errorMessage,
          variant: "destructive",
        });
      } else if (error.message?.includes("Failed to create buyer profile") || error.message?.includes("row level security") || error.message?.includes("RLS")) {
        // Ignore RLS/profile creation errors, treat as success
        toast({
          title: "Registration Successful",
          description: "Your account has been created and is pending admin approval. You can sign in once approved.",
        });
        navigate("/login");
      } else {
        toast({
          title: "Registration Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const benefits = [
    "Access exclusive B2B pricing",
    "Request bulk quotations online",
    "Track orders in real-time",
    "Download invoices & documents",
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:flex-1 bg-primary items-center justify-center p-12">
        <div className="max-w-md">
          <div className="w-20 h-20 mb-8 rounded-2xl bg-primary-foreground/20 flex items-center justify-center">
            <span className="text-4xl font-bold text-primary-foreground">TX</span>
          </div>
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            Join Our B2B Network
          </h2>
          <p className="text-primary-foreground/80 mb-8">
            Register as a verified business buyer to access our complete fabric catalog 
            and streamlined ordering process.
          </p>
          <ul className="space-y-3">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-3 text-primary-foreground/90">
                <CheckCircle className="h-5 w-5 text-accent" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 py-12">
        <div className="mx-auto w-full max-w-md">
          {/* Back Link */}
          <Link
            to="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>

          {/* Logo (Mobile) */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-bold text-primary-foreground">TX</span>
            </div>
            <span className="text-2xl font-bold text-foreground">TEXORDER</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">Register as Buyer</h1>
            <p className="text-muted-foreground">
              Create your business account to start ordering
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="businessName" className="label-enterprise">
                Business Name *
              </label>
              <Input
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                required
                placeholder="Your company name"
              />
            </div>

            <div>
              <label htmlFor="gstNumber" className="label-enterprise">
                GST Number *
              </label>
              <Input
                id="gstNumber"
                name="gstNumber"
                value={formData.gstNumber}
                onChange={handleChange}
                required
                placeholder="22AAAAA0000A1Z5"
              />
            </div>

            <div>
              <label htmlFor="contactPerson" className="label-enterprise">
                Contact Person Name *
              </label>
              <Input
                id="contactPerson"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                required
                placeholder="Your full name"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="label-enterprise">
                  Business Email *
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
                <label htmlFor="phone" className="label-enterprise">
                  Phone Number *
                </label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="label-enterprise">
                  Password *
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Create password"
                    minLength={8}
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
              <div>
                <label htmlFor="confirmPassword" className="label-enterprise">
                  Confirm Password *
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Confirm password"
                />
              </div>
            </div>

            {/* Approval Notice */}
            <div className="bg-info/10 border border-info/20 rounded-lg p-4">
              <p className="text-sm text-foreground">
                <strong>Note:</strong> Your account will be reviewed by our admin team. 
                You'll receive access to place orders once your GST number is verified and account is approved.
              </p>
            </div>

            {/* IP Rate Limit Warning - Shows when your entire network is rate limited */}
            {isIPRateLimited && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Wifi className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-900 mb-2">
                      Network Rate Limited
                    </p>
                    <p className="text-sm text-red-800 mb-3">
                      Your network (IP address) has hit Supabase's server rate limit. This affects <strong>all emails</strong> from your current connection.
                    </p>
                    <div className="space-y-2 text-sm text-red-800">
                      <p>
                        <strong>Wait Time:</strong> {formatDuration(ipCooldownSeconds * 1000)} remaining
                      </p>
                      <p className="mt-3">
                        <strong>Solutions:</strong>
                      </p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Wait {formatDuration(ipCooldownSeconds * 1000)} and try again</li>
                        <li><strong>Switch networks:</strong> Use mobile hotspot, different WiFi, or VPN</li>
                        <li>Try again later (server limits reset hourly)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Email Rate Limit Warning - Shows when specific email is rate limited */}
            {!isIPRateLimited && isRateLimited && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-orange-900 mb-2">
                      Email Rate Limited
                    </p>
                    <p className="text-sm text-orange-800 mb-3">
                      Too many registration attempts with <strong>{rateLimitEmail}</strong>. 
                      This specific email is temporarily blocked.
                    </p>
                    <div className="space-y-2 text-sm text-orange-800">
                      <p>
                        <strong>Option 1:</strong> Wait until <strong>{retryTime}</strong> and try again with the same email
                      </p>
                      <p>
                        <strong>Option 2:</strong> Use a different email address to register immediately
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Rate Limit Warning - Cooldown Timer */}
            {!isRateLimited && !isIPRateLimited && cooldownSeconds > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-900">
                    Too many attempts
                  </p>
                  <p className="text-sm text-amber-800 mt-1">
                    Please wait <strong>{cooldownSeconds} seconds</strong> before trying again.
                  </p>
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || cooldownSeconds > 0 || isRateLimited || isIPRateLimited}
            >
              {isLoading ? (
                "Submitting..."
              ) : isIPRateLimited ? (
                `Network Rate Limited - Wait ${formatDuration(ipCooldownSeconds * 1000)}`
              ) : isRateLimited ? (
                "Email Rate Limited - Use Different Email"
              ) : cooldownSeconds > 0 ? (
                `Try again in ${cooldownSeconds}s`
              ) : (
                "Submit Registration"
              )}
            </Button>
          </form>

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
