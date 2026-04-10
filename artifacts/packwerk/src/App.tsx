import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";

// Pages
import Home from "@/pages/home";
import Products from "@/pages/products";
import ProductDetail from "@/pages/product-detail";
import Quote from "@/pages/quote";
import Design from "@/pages/design";
import Samples from "@/pages/samples";
import Login from "@/pages/login";

// Dashboard Pages
import DashboardOverview from "@/pages/dashboard/overview";
import DashboardOrders from "@/pages/dashboard/orders";
import DashboardDesigns from "@/pages/dashboard/designs";
import DashboardPayments from "@/pages/dashboard/payments";
import DashboardProfile from "@/pages/dashboard/profile";

// Admin Pages
import AdminQuotes from "@/pages/admin/quotes";
import AdminOrders from "@/pages/admin/orders";
import AdminDesigns from "@/pages/admin/designs";
import AdminSamples from "@/pages/admin/samples";

const queryClient = new QueryClient();

// Auth guards
const ProtectedRoute = ({ component: Component, layout: Layout, ...rest }: any) => {
  return (
    <Route
      {...rest}
      component={(props: any) => {
        const token = localStorage.getItem("packwerk_access_token");
        if (!token) return <Redirect to="/login" />;
        return Layout ? <Layout><Component {...props} /></Layout> : <Component {...props} />;
      }}
    />
  );
};

const AdminRoute = ({ component: Component, layout: Layout, ...rest }: any) => {
  return (
    <Route
      {...rest}
      component={(props: any) => {
        const adminKey = localStorage.getItem("packwerk_admin_key");
        // In a real app we'd verify the key. Here we just check presence or env var
        if (!adminKey && !import.meta.env.VITE_ADMIN_KEY) return <Redirect to="/" />;
        return Layout ? <Layout><Component {...props} /></Layout> : <Component {...props} />;
      }}
    />
  );
};

const PublicRoute = ({ component: Component, layout: Layout, ...rest }: any) => {
  return (
    <Route
      {...rest}
      component={(props: any) => {
        return Layout ? <Layout><Component {...props} /></Layout> : <Component {...props} />;
      }}
    />
  );
};


function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <PublicRoute path="/" component={Home} layout={PublicLayout} />
      <PublicRoute path="/products" component={Products} layout={PublicLayout} />
      <PublicRoute path="/products/:slug" component={ProductDetail} layout={PublicLayout} />
      <PublicRoute path="/quote" component={Quote} layout={PublicLayout} />
      <PublicRoute path="/quote/step/:step" component={Quote} layout={PublicLayout} />
      <PublicRoute path="/quote/confirmed/:id" component={Quote} layout={PublicLayout} />
      <PublicRoute path="/design" component={Design} layout={PublicLayout} />
      <PublicRoute path="/samples" component={Samples} layout={PublicLayout} />
      <PublicRoute path="/login" component={Login} layout={PublicLayout} />

      {/* Dashboard Routes */}
      <ProtectedRoute path="/dashboard" component={DashboardOverview} layout={DashboardLayout} />
      <ProtectedRoute path="/dashboard/orders" component={DashboardOrders} layout={DashboardLayout} />
      <ProtectedRoute path="/dashboard/designs" component={DashboardDesigns} layout={DashboardLayout} />
      <ProtectedRoute path="/dashboard/payments" component={DashboardPayments} layout={DashboardLayout} />
      <ProtectedRoute path="/dashboard/profile" component={DashboardProfile} layout={DashboardLayout} />

      {/* Admin Routes */}
      <AdminRoute path="/admin" component={() => <Redirect to="/admin/quotes" />} />
      <AdminRoute path="/admin/quotes" component={AdminQuotes} layout={AdminLayout} />
      <AdminRoute path="/admin/orders" component={AdminOrders} layout={AdminLayout} />
      <AdminRoute path="/admin/designs" component={AdminDesigns} layout={AdminLayout} />
      <AdminRoute path="/admin/samples" component={AdminSamples} layout={AdminLayout} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
