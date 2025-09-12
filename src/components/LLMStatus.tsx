import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, Download, AlertCircle, CheckCircle } from "lucide-react";
import { localLLM } from "@/services/localLLM";
import { useToast } from "@/hooks/use-toast";
const LLMStatus = () => {
  const [status, setStatus] = useState<string>("not_initialized");
  const [isInitializing, setIsInitializing] = useState(false);
  const {
    toast
  } = useToast();
  useEffect(() => {
    const checkStatus = () => {
      setStatus(localLLM.getStatus());
    };

    // Auto-initialize AI on component mount
    const initializeAI = async () => {
      if (localLLM.getStatus() === "not_initialized") {
        try {
          await localLLM.initialize();
          toast({
            title: "AI Loaded! 🧠",
            description: "Your catbots now have AI powers!"
          });
        } catch (error) {
          toast({
            title: "Failed to Load AI",
            description: "Will use fallback responses instead.",
            variant: "destructive"
          });
        }
      }
    };

    // Check status every second while initializing
    const interval = setInterval(checkStatus, 1000);
    checkStatus();
    initializeAI();
    return () => clearInterval(interval);
  }, [toast]);
  const handleInitialize = async () => {
    setIsInitializing(true);
    try {
      await localLLM.initialize();
      toast({
        title: "LLM Loaded! 🧠",
        description: "Your catbots now have AI powers!"
      });
    } catch (error) {
      toast({
        title: "Failed to Load LLM",
        description: "Will use fallback responses instead.",
        variant: "destructive"
      });
    } finally {
      setIsInitializing(false);
    }
  };
  const getStatusConfig = () => {
    switch (status) {
      case "ready":
        return {
          icon: <CheckCircle className="h-3 w-3" />,
          text: "AI Ready",
          variant: "default" as const,
          color: "text-green-600"
        };
      case "loading":
        return {
          icon: <Download className="h-3 w-3 animate-spin" />,
          text: "Loading AI...",
          variant: "secondary" as const,
          color: "text-blue-600"
        };
      default:
        return {
          icon: <AlertCircle className="h-3 w-3" />,
          text: "AI Not Loaded",
          variant: "outline" as const,
          color: "text-orange-600"
        };
    }
  };
  const statusConfig = getStatusConfig();
  if (status === "ready") {
    return;
  }
  return <div className="flex items-center gap-2">
      <Badge variant={statusConfig.variant} className="flex items-center gap-1">
        {statusConfig.icon}
        {statusConfig.text}
      </Badge>
      
      {status === "not_initialized" && <Button size="sm" variant="outline" onClick={handleInitialize} disabled={isInitializing} className="flex items-center gap-1">
          <Brain className="h-3 w-3" />
          Load AI
        </Button>}
    </div>;
};
export default LLMStatus;