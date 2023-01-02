import * as d3 from "d3";
import { max } from "d3";
import {
  clearChildOf,
  PlotSettings,
  createCanvas,
  addLabels,
  addAxes
} from ".";
import type { AnalysisItem } from "../service-system";

export function idleLoadedTimeChart(id: string, items: AnalysisItem[]) {
  clearChildOf(id);

  const idleData: [number, number][] = items.map((e) => [e.time, e.idleTime]);
  const loadData: [number, number][] = items.map((e) => [e.time, e.loadedTime]);
  const idleSorted = idleData.sort((a, b) => a[0] - b[0]);
  const loadSorted = loadData.sort((a, b) => a[0] - b[0]);

  const s = new PlotSettings(600, 450, { x: 40, y: 40 });
  const svg = createCanvas(id, s);

  const xArr = [idleSorted.map((e) => e[0]), loadSorted.map((e) => e[0])];
  const yArr = [idleSorted.map((e) => e[1]), loadSorted.map((e) => e[1])];
  const xMax = d3.max(xArr.flat());
  const yMax = d3.max(yArr.flat());

  const x = d3.scaleLinear().domain([0, xMax]).range([0, s.width]);
  const y = d3.scaleLinear().domain([0, yMax]).range([s.height, 0]);

  addAxes(svg, s, x, y);

  const line = d3
    .line()
    .curve(d3.curveBasis)
    .x((d) => x(d[0]))
    .y((d) => y(d[1]));

  svg
    .append("path")
    .datum(idleSorted)
    .attr("fill", "none")
    .attr("stroke", "rgb(230, 25, 75)")
    .attr("stroke-width", 3)
    .attr("stroke-linejoin", "round")
    .attr("d", line);

  svg
    .append("path")
    .datum(loadSorted)
    .attr("fill", "none")
    .attr("stroke", "rgb(60, 180, 75)")
    .attr("stroke-width", 3)
    .attr("stroke-linejoin", "round")
    .attr("d", line);

  addLabels(svg, s, "t", "v");
}

export function idleLoadedProbChart(id: string, items: AnalysisItem[]) {
  clearChildOf(id);

  const idleData: [number, number][] = items.map((e) => [e.time, e.idleP]);
  const loadData: [number, number][] = items.map((e) => [e.time, e.loadedP]);
  const idleSorted = idleData.sort((a, b) => a[0] - b[0]);
  const loadSorted = loadData.sort((a, b) => a[0] - b[0]);

  const s = new PlotSettings(600, 450, { x: 40, y: 40 });
  const svg = createCanvas(id, s);

  const xArr = [idleSorted.map((e) => e[0]), loadSorted.map((e) => e[0])];
  const xMax = d3.max(xArr.flat());

  const x = d3.scaleLinear().domain([0, xMax]).range([0, s.width]);
  const y = d3.scaleLinear().domain([0, 1]).range([s.height, 0]);

  addAxes(svg, s, x, y);

  const line = d3
    .line()
    .curve(d3.curveBasis)
    .x((d) => x(d[0]))
    .y((d) => y(d[1]));

  svg
    .append("path")
    .datum(idleSorted)
    .attr("fill", "none")
    .attr("stroke", "rgb(230, 25, 75)")
    .attr("stroke-width", 3)
    .attr("stroke-linejoin", "round")
    .attr("d", line);

  svg
    .append("path")
    .datum(loadSorted)
    .attr("fill", "none")
    .attr("stroke", "rgb(60, 180, 75)")
    .attr("stroke-width", 3)
    .attr("stroke-linejoin", "round")
    .attr("d", line);

  addLabels(svg, s, "t", "v");
}
