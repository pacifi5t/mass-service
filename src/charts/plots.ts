import * as d3 from "d3";
import { max } from "d3";
import {
  clearChildOf,
  PlotSettings,
  createCanvas,
  addLabels,
  addAxes,
  plotLine
} from ".";
import type { AnalysisItem } from "../service-system";

export function idleLoadedTimePlot(id: string, items: AnalysisItem[]) {
  clearChildOf(id);
  const s = new PlotSettings(600, 450, { x: 40, y: 40 });
  const svg = createCanvas(id, s);

  const sorted = items.sort((a, b) => a.time - b.time);
  const idleData: [number, number][] = sorted.map((e) => [e.time, e.idleTime]);
  const loadData: [number, number][] = sorted.map((e) => [
    e.time,
    e.loadedTime
  ]);

  const xMax = max(idleData.map((e) => e[0]));
  const yArr = [idleData.map((e) => e[1]), loadData.map((e) => e[1])];
  const yMax = max(yArr.flat());

  const x = d3.scaleLinear().domain([0, xMax]).range([0, s.width]);
  const y = d3.scaleLinear().domain([0, yMax]).range([s.height, 0]);

  addAxes(svg, s, x, y);
  addLabels(svg, s, "t", "v");
  plotLine(svg, x, y, idleData, "rgb(230, 25, 75)");
  plotLine(svg, x, y, loadData, "rgb(60, 180, 75)");
}

export function idleLoadedProbPlot(id: string, items: AnalysisItem[]) {
  clearChildOf(id);
  const s = new PlotSettings(600, 450, { x: 40, y: 40 });
  const svg = createCanvas(id, s);

  const sorted = items.sort((a, b) => a.time - b.time);
  const idleData: [number, number][] = sorted.map((e) => [e.time, e.idleP]);
  const loadData: [number, number][] = sorted.map((e) => [e.time, e.loadedP]);

  const xMax = max(idleData.map((e) => e[0]));
  const x = d3.scaleLinear().domain([0, xMax]).range([0, s.width]);
  const y = d3.scaleLinear().domain([0, 1]).range([s.height, 0]);

  addAxes(svg, s, x, y);
  addLabels(svg, s, "t", "p");
  plotLine(svg, x, y, idleData, "rgb(230, 25, 75)");
  plotLine(svg, x, y, loadData, "rgb(60, 180, 75)");
}

export function demandsPlot(id: string, items: AnalysisItem[]) {
  clearChildOf(id);
  const s = new PlotSettings(600, 450, { x: 40, y: 40 });
  const svg = createCanvas(id, s);

  const sorted = items.sort((a, b) => a.time - b.time);
  const inSystem: [number, number][] = sorted.map((e) => [e.time, e.inSystem]);
  const serviced: [number, number][] = sorted.map((e) => [e.time, e.serviced]);
  const notServiced: [number, number][] = sorted.map((e) => [
    e.time,
    e.notServiced
  ]);

  const yArr = [
    serviced.map((e) => e[1]),
    notServiced.map((e) => e[1]),
    inSystem.map((e) => e[1])
  ];
  const xMax = max(serviced.map((e) => e[0]));
  const yMax = max(yArr.flat());

  const x = d3.scaleLinear().domain([0, xMax]).range([0, s.width]);
  const y = d3.scaleLinear().domain([0, yMax]).range([s.height, 0]);

  addAxes(svg, s, x, y);
  addLabels(svg, s, "t", "N");
  plotLine(svg, x, y, serviced, "rgb(0, 130, 200)");
  plotLine(svg, x, y, notServiced, "rgb(245, 130, 48)");
  plotLine(svg, x, y, inSystem, "rgb(145, 30, 180)");
}

export function averageTimePlot(id: string, items: AnalysisItem[]) {
  clearChildOf(id);
  const s = new PlotSettings(600, 450, { x: 40, y: 40 });
  const svg = createCanvas(id, s);

  const sorted = items.sort((a, b) => a.time - b.time);
  const queue: [number, number][] = sorted.map((e) => [e.time, e.avgQueue]);
  const service: [number, number][] = sorted.map((e) => [e.time, e.avgService]);
  const system: [number, number][] = sorted.map((e) => [e.time, e.avgSystem]);

  const yArr = [
    queue.map((e) => e[1]),
    service.map((e) => e[1]),
    system.map((e) => e[1])
  ];
  const xMax = max(queue.map((e) => e[0]));
  const yMax = max(yArr.flat());

  const x = d3.scaleLinear().domain([0, xMax]).range([0, s.width]);
  const y = d3.scaleLinear().domain([0, yMax]).range([s.height, 0]);

  addAxes(svg, s, x, y);
  addLabels(svg, s, "t", "v");
  plotLine(svg, x, y, queue, "rgb(0, 130, 200)");
  plotLine(svg, x, y, service, "rgb(245, 130, 48)");
  plotLine(svg, x, y, system, "rgb(145, 30, 180)");
}
