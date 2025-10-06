import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import heroImage from "@/assets/coming-soon-hero.png";
const emailSchema = z.object({
  email: z.string().trim().email({
    message: "Please enter a valid email address"
  }).max(255, {
    message: "Email must be less than 255 characters"
  })
});
type EmailFormData = z.infer<typeof emailSchema>;
export default function ComingSoon() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: {
      errors
    },
    reset
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema)
  });
  const onSubmit = async (data: EmailFormData) => {
    setIsLoading(true);
    try {
      const {
        error
      } = await supabase.from("beta_signups").insert({
        email: data.email.toLowerCase()
      });
      if (error) {
        if (error.code === "23505") {
          // Duplicate email
          toast.error("You're already on the list!");
        } else {
          throw error;
        }
      } else {
        setIsSubmitted(true);
        toast.success("You're on the list! We'll notify you when we launch.");
        reset();
      }
    } catch (error) {
      console.error("Error signing up:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  return <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-secondary/20 p-4">
      <main className="flex flex-col items-center justify-center text-center max-w-4xl mx-auto space-y-8 animate-fade-in">
        {/* Hero Image */}
        <div className="relative w-full max-w-6xl animate-scale-in rounded-lg overflow-hidden shadow-2xl">
          <img src={heroImage} alt="Person relaxing with cat on sofa" className="w-full h-auto object-cover" />
        </div>

        {/* Headline */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent animate-fade-in">
            MiCat.Online
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl">Create your own A.I. cat companions
Sign-up to become a beta tester</p>
        </div>

        {/* Email Signup Form */}
        {!isSubmitted ? <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input {...register("email")} type="email" placeholder="Enter your email" className="h-12 text-lg" disabled={isLoading} />
                {errors.email && <p className="text-sm text-destructive mt-1 text-left">
                    {errors.email.message}
                  </p>}
              </div>
              <Button type="submit" size="lg" disabled={isLoading} className="h-12 px-8">
                {isLoading ? "Joining..." : "Notify Me"}
              </Button>
            </div>
          </form> : <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 max-w-md animate-scale-in">
            <p className="text-lg font-medium text-primary">
              🎉 You're on the list!
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              We'll send you an email as soon as CatBot launches.
            </p>
          </div>}

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full max-w-3xl">
          <div className="space-y-2">
            
            
            
          </div>
          <div className="space-y-2">
            
            
            
          </div>
          <div className="space-y-2">
            
            
            
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 text-sm text-muted-foreground">
        <p>&copy; 2025 CatBot. All rights reserved.</p>
      </footer>
    </div>;
}