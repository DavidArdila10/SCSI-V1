import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useCookies } from 'react-cookie'; // Para manejar cookies

// Layouts
import LayoutLogin from "./layouts/LayoutLogin";
import LayoutAdmin from "./layouts/LayoutAdmin";
import LayoutWriter from './layouts/LayoutWriter';
import LayoutReader from './layouts/LayoutReader';
import LayoutPM from './layouts/LayoutPM'; // 🔹 Nuevo Layout para PM

// Public
import Login from "./pageauth/Login";
import ResetRequest from './pageauth/PasswordReset';

// Admin
import PanelAdmin from "./pageadmin/PanelAdmin";
import UserAll from "./pageadmin/UserAll";
import UserUpdate from "./pageadmin/UserUpdate";
import UserCreate from "./pageadmin/UserCreate";
import SowAll from "./pageadmin/SowAll";
import SowCreate from "./pageadmin/SowCreate";
import SowDetails from "./pageadmin/SowDetails";
import ResetRequests from './pageadmin/ResetRequests';
import KanbanBoard from "./pageadmin/KanbanBoard"; // Tablero Kanban

// Cronómetro
import CronometroAll from "./pageadmin/CronometroAll";
import CronometroCreate from "./pageadmin/CronometroCreate";
import CronometroDetails from "./pageadmin/CronometroDetails";

// Importación
import ImportData from "./pageadmin/ImportData";

// Writer
import PanelWriter from './pagewriter/PanelWriter';
import SowsAll from './pagewriter/SowAll';
import SowsCreate from './pagewriter/SowCreate';
import SowsDetails from './pagewriter/SowDetails';

// Reader
import PanelReader from './pagereader/PanelReader';
import SowsAlls from './pagereader/SowAll';
import SowsDetailis from './pagereader/SowDetails';

// PM 
import CronometroAllPM from "./pagepm/CronometroAll"; 
import CronometroCreatePM from "./pagepm/CronometroCreate";
import CronometroDetailsPM from "./pagepm/CronometroDetails"; 



// Protected Routes
import ProtectedRoutes from "./pageauth/ProtectedRoutes";

const App = () => {
    const [cookies, setCookie, removeCookie] = useCookies(['user']); // Manejo de cookies

    const isAuthenticated = cookies.user !== undefined;

    return (
      <Router>
        <Routes>
          <Route path="/" element={<LayoutLogin />} />
          <Route path="/login" element={<Login setCookie={setCookie} />} />
          <Route path="/reset-password" element={<ResetRequest />} />

          {/* Rutas protegidas */}
          <Route element={<ProtectedRoutes isAuthenticated={isAuthenticated} />}>

            {/* 🔹 Rutas para Admin */}
            <Route path="/admin" element={<LayoutAdmin />}>
              <Route index element={<PanelAdmin />} />
              <Route path="user" element={<UserAll />} />
              <Route path="user/edit/:id" element={<UserUpdate />} />
              <Route path="user/create" element={<UserCreate />} />
              <Route path="user/password" element={<ResetRequests />} />
              <Route path="sow" element={<SowAll />} />
              <Route path="sow/kanban" element={<KanbanBoard />} /> 
              <Route path="sow/create" element={<SowCreate />} />
              <Route path="sow/details/:id" element={<SowDetails />} />
              <Route path="sow/edit/:id" element={<SowDetails />} />

              {/* Rutas para Cronómetros */}
              <Route path="cronometros" element={<CronometroAll />} />
              <Route path="cronometros/create" element={<CronometroCreate />} />
              <Route path="cronometros/details/:id" element={<CronometroDetails />} />

              {/* Nueva Ruta de Importación */}
              <Route path="import" element={<ImportData />} />
            </Route>

            {/* 🔹 Rutas para Writer */}
            <Route path="/writer" element={<LayoutWriter />}>
              <Route index element={<PanelWriter />} />
              <Route path="sow" element={<SowsAll />} />
              <Route path="sow/create" element={<SowsCreate />} />
              <Route path="sow/details/:id" element={<SowsDetails />} />
              <Route path="sow/edit/:id" element={<SowsDetails />} />
              <Route path="sow/kanban" element={<KanbanBoard />} />
            </Route>

            {/* 🔹 Rutas para Reader */}
            <Route path="/reader" element={<LayoutReader />}>
              <Route index element={<PanelReader />} />
              <Route path="sow" element={<SowsAlls />} />
              <Route path="sow/details/:id" element={<SowsDetailis />} />
            </Route>

            {/* 🔹 Rutas para PM  */}
            <Route path="/pm" element={<LayoutPM />}>
              <Route path="cronometros" element={<CronometroAllPM />} />
              <Route path="cronometros/create" element={<CronometroCreatePM />} /> 
              <Route path="cronometros/details/:id" element={<CronometroDetailsPM />} /> 


              
              
            </Route>

          </Route>
        </Routes>
      </Router>
    );
};

export default App;
