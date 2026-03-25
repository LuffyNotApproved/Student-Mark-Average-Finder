import { Switch, Route, Router as WouterRouter } from "wouter";
import MarksAnalyzer from "@/pages/MarksAnalyzer";

function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Switch>
        <Route path="/" component={MarksAnalyzer} />
        <Route>
          <div className="min-h-screen flex items-center justify-center">
            <p className="text-muted-foreground">Page not found</p>
          </div>
        </Route>
      </Switch>
    </WouterRouter>
  );
}

export default App;
