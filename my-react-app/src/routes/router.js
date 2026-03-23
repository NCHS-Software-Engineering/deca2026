import { createBrowserRouter } from "react-router-dom";
import Root from "../components/root";
import ErrorPage from "../error-page";
import About from "../pages/not-implemented/about";
import Services from "../pages/not-implemented/services";
import Stats from "../pages/stats/Stats";
import WebDev from "../pages/WebDev";
import Frontend from "../pages/not-implemented/frontend";
import Php from "../pages/not-implemented/php";
import NodeJs from "../pages/not-implemented/node";
import SEO from "../pages/not-implemented/seo";
import Profile from "../pages/profile/profile";
import Practice from "../pages/PracticeMode/PracticeMode";
import MyChapter from "../pages/not-implemented/myChapter";
import Home from "../pages/Home/Home";
import Tests from "../pages/Tests/Tests";
import Edit from "../pages/Edit/Edit";
import ProtectedRoute from "../components/ProtectedRoute";
import ProtectedRouteEdit from "../components/ProtectedRouteEdit";


const router = createBrowserRouter([
  {
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      { path: "/", element: <Home /> },
      { path: "profile", element: <Profile /> },
      {
        path: "Practice",
        element: (
          <ProtectedRoute>
            <Practice />
          </ProtectedRoute>
        ),
      },
      {
        path: "edit",
        element: (
          <ProtectedRouteEdit>
            <Edit />
          </ProtectedRouteEdit>
        ),
      },
      {
        path: "Stats",
        element: (
          <ProtectedRoute>
            <Stats />
          </ProtectedRoute>
        ),
      },
      {
        path: "Tests",
        element: (
          <ProtectedRoute>
            <Tests />
          </ProtectedRoute>
        ),
      },
      {
        path: "services",
        element: (
          <ProtectedRoute>
            <Services />
          </ProtectedRoute>
        ),
      },
      {
        path: "about",
        element: (
          <ProtectedRoute>
            <About />
          </ProtectedRoute>
        ),
      },
      {
        path: "MyChapter",
        element: (
          <ProtectedRoute>
            <MyChapter />
          </ProtectedRoute>
        ),
      },
      {
        path: "web-dev",
        element: (
          <ProtectedRoute>
            <WebDev />
          </ProtectedRoute>
        ),
      },
      {
        path: "frontend",
        element: (
          <ProtectedRoute>
            <Frontend />
          </ProtectedRoute>
        ),
      },
      {
        path: "php",
        element: (
          <ProtectedRoute>
            <Php />
          </ProtectedRoute>
        ),
      },
      {
        path: "node",
        element: (
          <ProtectedRoute>
            <NodeJs />
          </ProtectedRoute>
        ),
      },
      {
        path: "seo",
        element: (
          <ProtectedRoute>
            <SEO />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

export default router;
