import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import FoodDatabase from './pages/FoodDatabase';
import Workouts from './pages/Workouts';
import WorkoutDetail from './pages/WorkoutDetail';
import Recipes from './pages/Recipes';
import RecipeDetail from './pages/RecipeDetail';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="hrani" element={<FoodDatabase />} />
        <Route path="trenirovki" element={<Workouts />} />
        <Route path="trenirovki/:id" element={<WorkoutDetail />} />
        <Route path="recepti" element={<Recipes />} />
        <Route path="recepti/:id" element={<RecipeDetail />} />
        <Route path="profil" element={<Profile />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <AppRoutes />
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
