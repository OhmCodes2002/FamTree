import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ImportScreen } from './components/ImportScreen';
import { TreeScreen } from './components/TreeScreen';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ImportScreen />} />
        <Route path="/tree" element={<TreeScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
