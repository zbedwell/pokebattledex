import { Navigate, Route, Routes } from "react-router-dom";
import { Navbar } from "./components/Navbar.jsx";
import { Footer } from "./components/Footer.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import { PokemonDirectoryPage } from "./pages/PokemonDirectoryPage.jsx";
import { PokemonDetailPage } from "./pages/PokemonDetailPage.jsx";
import { MovesDirectoryPage } from "./pages/MovesDirectoryPage.jsx";
import { MoveDetailPage } from "./pages/MoveDetailPage.jsx";
import { AbilitiesDirectoryPage } from "./pages/AbilitiesDirectoryPage.jsx";
import { AbilityDetailPage } from "./pages/AbilityDetailPage.jsx";
import { TypeToolPage } from "./pages/TypeToolPage.jsx";
import { ComparePage } from "./pages/ComparePage.jsx";
import { AboutPage } from "./pages/AboutPage.jsx";
import { NotFoundPage } from "./pages/NotFoundPage.jsx";

function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/pokemon" element={<PokemonDirectoryPage />} />
          <Route path="/pokemon/:id" element={<PokemonDetailPage />} />
          <Route path="/moves" element={<MovesDirectoryPage />} />
          <Route path="/moves/:id" element={<MoveDetailPage />} />
          <Route path="/abilities" element={<AbilitiesDirectoryPage />} />
          <Route path="/abilities/:id" element={<AbilityDetailPage />} />
          <Route path="/types" element={<TypeToolPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
