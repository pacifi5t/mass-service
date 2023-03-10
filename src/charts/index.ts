import * as d3 from "d3";

export * from "./plots";

export type SVG = d3.Selection<SVGGElement, unknown, HTMLElement, unknown>;

export class PlotSettings {
  width: number;
  height: number;
  margin: { x: number; y: number };

  constructor(w: number, h: number, m: { x: number; y: number }) {
    const width = w - m.x * 2;
    const height = h - m.y * 2;

    this.width = width;
    this.height = height;
    this.margin = m;
  }
}

export function clearChildOf(id: string) {
  try {
    document.getElementById(id).replaceChildren("");
  } catch (e) {
    console.error(e);
  }
}

export function addLabels(
  svg: SVG,
  s: PlotSettings,
  xLabel: string,
  yLabel: string
) {
  svg
    .append("text")
    .attr("text-anchor", "end")
    .attr("x", s.width)
    .attr("y", s.height + s.margin.y)
    .text(xLabel);

  svg
    .append("text")
    .attr("text-anchor", "end")
    .attr("y", -10)
    .attr("x", -10)
    .text(yLabel);
}

export function createCanvas(id: string, s: PlotSettings) {
  return d3
    .select(`#${id}`)
    .append("svg")
    .attr("width", s.width + s.margin.x * 2)
    .attr("height", s.height + s.margin.y * 2)
    .append("g")
    .attr("transform", `translate(${s.margin.x}, ${s.margin.y})`);
}

export function addAxes(
  svg: SVG,
  s: PlotSettings,
  x: d3.ScaleLinear<number, number, never>,
  y: d3.ScaleLinear<number, number, never>
) {
  svg
    .append("g")
    .attr("transform", `translate(0, ${s.height})`)
    .call(d3.axisBottom(x));

  svg.append("g").call(d3.axisLeft(y));

  svg
    .append("line")
    .attr("x1", () => s.width + 0.5)
    .attr("x2", () => s.width + 0.5)
    .attr("y1", (_) => 0)
    .attr("y2", (_) => s.height)
    .attr("stroke", "black")
    .attr("stroke-width", 1);

  svg
    .append("line")
    .attr("x1", () => 0)
    .attr("x2", () => s.width)
    .attr("y1", (_) => 0.5)
    .attr("y2", (_) => 0.5)
    .attr("stroke", "black")
    .attr("stroke-width", 1);
}

export function plotLine(
  svg: SVG,
  x: d3.ScaleLinear<number, number, never>,
  y: d3.ScaleLinear<number, number, never>,
  data: [number, number][],
  color: string
) {
  const line = d3
    .line()
    .curve(d3.curveBasis)
    .x((d) => x(d[0]))
    .y((d) => y(d[1]));

  svg
    .append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", color)
    .attr("stroke-width", 3)
    .attr("stroke-linejoin", "round")
    .attr("d", line);
}
