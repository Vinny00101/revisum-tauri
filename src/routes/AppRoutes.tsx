import ProtectedRoutes from "@/components/ProtectedRoute";
import Context from "@/pages/content/Content";
import DashboardLayout from "@/pages/DashboardLayout";
import Discipline from "@/pages/disciplines/Discipline";
import DisciplineDetail from "@/pages/disciplines/DisciplineDetail";
import Login from "@/pages/Login";
import DashboardMain from "@/pages/painel/DashboardMain";
import Profile from "@/pages/profile/Profile";
import Register from "@/pages/Register";
import Review from "@/pages/reviews/Review";
import ReviewSession from "@/pages/reviews/ReviewSession";
import { Navigate, Route, Routes } from "react-router-dom";


export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoutes />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardMain />} />

          <Route path="/disciplines">
            <Route index element={<Discipline />}/>
            <Route path=":id">
              <Route index element={<DisciplineDetail/>}/>
              <Route path=":contentid" element={<Context/>}/>
            </Route>
          </Route>

          <Route path="/reviews">
            <Route index element={<Review/> }/>
            <Route path=":id">
              <Route index element={<ReviewSession/>}/>
            </Route>
          </Route>
          <Route path="/questions" element={<DashboardMain />} />
          <Route path="/categories" element={<DashboardMain />} />
          <Route path="/analysis" element={<DashboardMain />} />
          <Route path="/config" element={<DashboardMain />} />
          <Route path="/profile" element={<Profile/>} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}