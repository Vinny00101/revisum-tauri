import ProtectedRoutes from "@/components/ProtectedRoute";
import { Login, Register } from "@/features/auth";
import { Context, Discipline, DisciplineDetail } from "@/features/discipline";
import { Profile } from "@/features/profile";
import { Review, ReviewSession } from "@/features/reviews";
import DashboardLayout from "@/layouts/DashboardLayout";
import DashboardMain from "@/layouts/DashboardMain";
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