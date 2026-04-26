import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Landing";
import Dashboard from "./pages/Dashboard/index.jsx";
import AnalyticsPage from "./pages/analytics/index.jsx";
import Detection from "./pages/detection/index.jsx";
import Logs from "./pages/system-logs";
import Settings from "./pages/settings";

export default function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="detection" element={<Detection />} />
              <Route path="system-logs" element={<Logs />} />
              <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
  )
}