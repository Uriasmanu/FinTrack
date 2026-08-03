import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div className="p-8"><h1 className="text-2xl font-bold">FinTrack</h1><p className="text-muted-foreground">Dashboard em construção...</p></div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
