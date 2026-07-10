import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css'
import 'leaflet/dist/leaflet.css';
import 'leaflet/dist/leaflet.css';
import './pages/Trip/components/leaflet-icons.js';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <App />
    </StrictMode>,
);
