import { createBrowserRouter } from "react-router-dom";
import CurrentTrip from "../pages/CurrentTrip";
import MyTrips from "../pages/MyTrips";
import Profile from "../pages/Profile";
import MyVehicles from "../pages/MyVehicles";
import Use from "../pages/Use";
import Layout from "../app/Layout";
import Trip from "../pages/Trip";

export const router = createBrowserRouter(
  [
    {
      element: <Layout />,
      children: [
        { path: "/", element: <CurrentTrip /> },
        { path: "/trips", element: <MyTrips /> },
        { path: "/profile", element: <Profile /> },
        { path: "/vehicles", element: <MyVehicles /> },
        { path: "/use", element: <Use /> },
        { path: "/trip/:id", element: <Trip />}
      ],
    },
  ],
  {
    basename: "/driver",
  }
);