import Layout from "./components/Layout.svelte";
import Configuration from "./pages/Configuration.svelte";
import Stats from "./pages/Stats.svelte";

class Route {
  name: string;
  component: unknown;
  layout: typeof Layout;

  constructor(name: string, component: unknown) {
    this.name = name;
    this.component = component;
    this.layout = Layout;
  }
}

export const routes = [
  new Route("/", Configuration),
  new Route("/stats", Stats),
];
