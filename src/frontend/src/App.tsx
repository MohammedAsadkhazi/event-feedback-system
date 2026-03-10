import { Layout } from "@/components/Layout";
import { Toaster } from "@/components/ui/sonner";
import AdminPage from "@/pages/AdminPage";
import EventDetailPage from "@/pages/EventDetailPage";
import EventsPage from "@/pages/EventsPage";
import HomePage from "@/pages/HomePage";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
      <Toaster position="bottom-right" theme="dark" />
    </Layout>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const eventsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/events",
  component: EventsPage,
});

const eventDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/events/$id",
  component: EventDetailPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  eventsRoute,
  eventDetailRoute,
  adminRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
