import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, Mail, Lock, User, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    displayName: ""
  });
  const [error, setError] = useState("");
  const {
    user,
    signIn,
    signUp
  } = useAuth();
  const {
    toast
  } = useToast();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError(""); // Clear error when user types
  };
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    const {
      error
    } = await signIn(formData.email, formData.password);
    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        setError("Invalid email or password. Please check your credentials.");
      } else if (error.message.includes("Email not confirmed")) {
        setError("Please check your email and click the confirmation link before signing in.");
      } else {
        setError(error.message);
      }
    } else {
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in."
      });
    }
    setIsLoading(false);
  };
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    const {
      error
    } = await signUp(formData.email, formData.password, formData.displayName);
    if (error) {
      if (error.message.includes("User already registered")) {
        setError("An account with this email already exists. Please sign in instead.");
      } else if (error.message.includes("Password should be at least")) {
        setError("Password should be at least 6 characters long.");
      } else {
        setError(error.message);
      }
    } else {
      toast({
        title: "Account created!",
        description: "Please check your email for a confirmation link."
      });
    }
    setIsLoading(false);
  };
  return <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity">
            <div className="h-10 w-10 gradient-primary rounded-lg flex items-center justify-center">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold">MiCatbot</span>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Welcome</h1>
          <p className="text-muted-foreground">
            Sign in to your account or create a new one
          </p>
        </div>

        {/* Auth Form */}
        <Card className="shadow-card">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Authentication</CardTitle>
            <CardDescription className="text-center">
              Choose your preferred method to continue
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-4 mt-6">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="signin-email" name="email" type="email" placeholder="Enter your email" className="pl-10" value={formData.email} onChange={handleInputChange} required />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="signin-password" name="password" type="password" placeholder="Enter your password" className="pl-10" value={formData.password} onChange={handleInputChange} required />
                    </div>
                  </div>

                  {error && <div className="flex items-center gap-2 text-destructive text-sm">
                      <AlertCircle className="h-4 w-4" />
                      {error}
                    </div>}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4 mt-6">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Display Name (Optional)</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="signup-name" name="displayName" type="text" placeholder="Enter your display name" className="pl-10" value={formData.displayName} onChange={handleInputChange} />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="signup-email" name="email" type="email" placeholder="Enter your email" className="pl-10" value={formData.email} onChange={handleInputChange} required />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="signup-password" name="password" type="password" placeholder="Enter your password (min. 6 characters)" className="pl-10" value={formData.password} onChange={handleInputChange} required minLength={6} />
                    </div>
                  </div>

                  {error && <div className="flex items-center gap-2 text-destructive text-sm">
                      <AlertCircle className="h-4 w-4" />
                      {error}
                    </div>}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Back to home
          </Link>
        </div>
      </div>
    </div>;
};
export default Auth;