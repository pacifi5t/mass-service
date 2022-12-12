import DataUpload from "./pages/DataUpload.svelte";
import Layout from "./components/Layout.svelte";
import StreamTests from "./pages/StreamTests.svelte";

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
  new Route("/", DataUpload),
  new Route("/tests", StreamTests)
];
