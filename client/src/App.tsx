import ErrorBoundary from "./components/ErrorBoundary";
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
        <Route component={NotFound} />
      </Switch>
    </ErrorBoundary>
  );
}
