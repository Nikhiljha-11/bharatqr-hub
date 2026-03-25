import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useSearchParams, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Scan from "./pages/Scan";
import Dashboard from "./pages/Dashboard";
import Services from "./pages/Services";
import Departments from "./pages/Departments";
import DepartmentDetail from "./pages/DepartmentDetail";
import Schemes from "./pages/Schemes";
import Documents from "./pages/Documents";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const HomeWithDeepLink = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  if (id) return <Navigate to={`/citizen/${id}`} replace />;
  return <Index />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeWithDeepLink />} />
          <Route path="/scan" element={<Scan />} />
          <Route path="/services" element={<Services />} />
          <Route path="/departments" element={<Departments />} />
          <Route path="/departments/:departmentId" element={<DepartmentDetail />} />
          <Route path="/schemes" element={<Schemes />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/dashboard/:qrId" element={<Dashboard />} />
          <Route path="/citizen/:qrId" element={<Dashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
