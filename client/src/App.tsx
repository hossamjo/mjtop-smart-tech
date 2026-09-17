import ErrorBoundary from "./components/ErrorBoundary";
import Admin from "./pages/Admin";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import ServiceDetail from "./pages/ServiceDetail";
import { Route, Switch } from "wouter";

export default function App() {
  return (
    <ErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/services/:slug" component={ServiceDetail} />
        <Route path="/admin" component={Admin} />
        <Route component={NotFound} />
      </Switch>
    </ErrorBoundary>
  );
}
