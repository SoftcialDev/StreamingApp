import { BrowserRouter, Routes, Route } from "react-router-dom";
import {DashboardPage} from "./dashboard/pages/Dashboard";
import {PublisherPage} from "./cameras/pages/PublisherPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/publisher" element={<PublisherPage/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
