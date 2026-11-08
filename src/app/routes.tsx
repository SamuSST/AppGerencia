import { createBrowserRouter } from "react-router";
import { Login } from "./components/Login";
import { AdminCDAList } from "./components/AdminCDAList";
import { CDAVendedoresList } from "./components/CDAVendedoresList";
import { VendorDashboard } from "./components/VendorDashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Login,
  },
  {
    path: "/admin",
    Component: AdminCDAList,
  },
  {
    path: "/cda/:cdaId",
    Component: CDAVendedoresList,
  },
  {
    path: "/cda/:cdaId/vendedor/:vendedorId",
    Component: VendorDashboard,
  },
]);