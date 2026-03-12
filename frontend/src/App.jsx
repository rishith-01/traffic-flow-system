import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { SimulationProvider } from "./hooks/SimulationContext.jsx";
import { AppShell } from "./components/layout/AppShell.jsx";

const HomePage = lazy(() => import("./pages/HomePage.jsx").then((module) => ({ default: module.HomePage })));
const SimulationPage = lazy(() =>
  import("./pages/SimulationPage.jsx").then((module) => ({
    default: module.SimulationPage,
  })),
);
const DashboardPage = lazy(() =>
  import("./pages/DashboardPage.jsx").then((module) => ({
    default: module.DashboardPage,
  })),
);
const MultiIntersectionPage = lazy(() =>
  import("./pages/MultiIntersectionPage.jsx").then((module) => ({
    default: module.MultiIntersectionPage,
  })),
);

function App() {
  return (
    <SimulationProvider>
      <BrowserRouter>
        <AppShell>
          <Suspense
            fallback={
              <div className="glass-panel rounded-[28px] p-8 text-center text-slate-300">
                Loading simulation workspace...
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/simulation" element={<SimulationPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/network" element={<MultiIntersectionPage />} />
            </Routes>
          </Suspense>
        </AppShell>
      </BrowserRouter>
    </SimulationProvider>
  );
}

export default App;
