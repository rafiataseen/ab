import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import LandingPage from "@/pages/LandingPage";
import ThankYou from "@/pages/ThankYou";
import Leaderboard from "@/pages/Leaderboard";
import ProjectMatcher from "@/pages/ProjectMatcher";
import Admin from "@/pages/Admin";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/thank-you" element={<ThankYou />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/project-matcher" element={<ProjectMatcher />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
      <Toaster position="top-center" richColors />
    </BrowserRouter>
  );
}
