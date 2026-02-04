import { Route, Switch } from "wouter";
import Experience from "./components/Experience";
import Admin from "./components/Admin";

function App() {
  return (
    <Switch>
      <Route path="/" component={Experience} />
      <Route path="/admin" component={Admin} />
      <Route>404: No such page!</Route>
    </Switch>
  );
}

export default App;
