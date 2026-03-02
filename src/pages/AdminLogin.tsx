import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

// Hardcoded admin credentials (in production, use a backend)
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin@123";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate authentication delay
    setTimeout(() => {
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        // Store authentication token
        localStorage.setItem("adminAuth", "true");
        localStorage.setItem("adminLoginTime", new Date().toISOString());
        toast.success("Login successful! Welcome Admin.");
        navigate("/admin-dashboard");
      } else {
        toast.error("Invalid username or password");
        setPassword("");
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 flex flex-col">
      <Header />

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md border-2 border-secondary/50 shadow-2xl">
          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-secondary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Lock className="h-8 w-8 text-secondary" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900">Admin Portal</h1>
              <p className="text-slate-600 text-sm mt-2">Secure Access for System Administrators</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Username
                </label>
                <Input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="border-2 border-slate-200 focus:border-secondary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-2 border-slate-200 focus:border-secondary"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-secondary hover:bg-secondary/80 text-primary font-bold py-2 h-auto"
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs font-semibold text-blue-900 mb-2">Demo Credentials:</p>
              <p className="text-xs text-blue-800">Username: <span className="font-mono">admin</span></p>
              <p className="text-xs text-blue-800">Password: <span className="font-mono">admin@123</span></p>
            </div>

            {/* Back Button */}
            <button
              onClick={() => navigate("/")}
              className="w-full mt-6 flex items-center justify-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </button>
          </div>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default AdminLogin;
