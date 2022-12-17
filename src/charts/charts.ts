import * as d3 from "d3";
import * as math from "../math";
import {
  clearChildOf,
  PlotSettings,
  createCanvas,
  addLabels,
  addAxes
} from ".";
import type { ClassifiedTau } from "../math";

export function createDataChart(id: string, inputData: number[]) {
  clearChildOf(id);

  const dataMin = d3.min<number>(inputData);
  const dataMax = d3.max<number>(inputData);
  const padding = (dataMax - dataMin) / 40;

  const data = inputData.map((e, i) => Object({ x: i, y: e }));

  const s = new PlotSettings(640, 480, { x: 40, y: 40 });
  const svg = createCanvas(id, s);

  const x = d3
    .scaleLinear()
    .domain([0, data.length - 1])
    .range([0, s.width]);

  const y = d3
    .scaleLinear()
    .domain([dataMin - padding, dataMax + padding])
    .range([s.height, 0]);

  addAxes(svg, s, x, y);

  svg
    .selectAll("whatever")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", (d) => x(d.x))
    .attr("cy", (d) => y(d.y))
    .attr("fill", () => "#4300b0")
    .attr("r", 4);

  addLabels(svg, s, "№", "e");
}

export function piecewiseIntensityChart(
  id: string,
  tauArr: number[],
  classified: math.ClassifiedTau,
  params: { a: number; b: number }
) {
  clearChildOf(id);
  const s = new PlotSettings(640, 480, { x: 40, y: 40 });

  const tMin = d3.min<number>(tauArr);
  const tMax = d3.max<number>(tauArr);

  const length = s.width / (classified.classCount() - 1);
  const indensityD = classified.intensities.map((e, i) => {
    const x1 = i * length;
    return { x1, x2: x1 + length, y: e.value };
  });

  const confIntervalD = classified.intenConfIntervals.map((e, i) =>
    Object({ high: e[1], low: e[0], x: i * length, width: (i + 1) * length })
  );

  const sortedTau = [...tauArr].sort((a, b) => a - b);
  const intenApproxD: [number, number][] = sortedTau.map((e) => [
    e,
    math.intensityFn(e, params.a, params.b)
  ]);

  const laMax = d3.max([
    ...classified.intensities.map((e) => e.value),
    ...confIntervalD.flatMap((e) => [e.high, e.low]).flat()
  ]);

  const svg = createCanvas(id, s);

  const x = d3
    .scaleLinear()
    .domain([
      tMin,
      d3.max(tauArr.filter((e) => e <= tMax - classified.classWidth))
    ])
    .range([0, s.width]);

  const y = d3.scaleLinear().domain([0, laMax]).range([s.height, 0]);

  addAxes(svg, s, x, y);

  // Ticks
  svg
    .selectAll()
    .data(indensityD)
    .join("line")
    .attr("x1", (d) => d.x2)
    .attr("x2", (d) => d.x2)
    .attr("y1", (_) => 0)
    .attr("y2", (_) => s.height)
    .attr("stroke", "lightgrey")
    .attr("stroke-width", 1);

  // Conf intervals
  svg
    .selectAll("rect")
    .data(confIntervalD)
    .join("rect")
    .attr("x", (d) => d.x)
    .attr("y", (d) => y(d.high))
    .attr("height", (d) => y(d.low) - y(d.high))
    .attr("width", (d) => length)
    .attr("fill", "#ccbce5");

  // Intensities
  svg
    .selectAll("whatever")
    .data(indensityD)
    .join("line")
    .attr("x1", (d) => d.x1)
    .attr("x2", (d) => d.x2)
    .attr("y1", (d) => y(d.y))
    .attr("y2", (d) => y(d.y))
    .attr("stroke", "#4300b0")
    .attr("stroke-width", 5);

  // Intensity approximation
  const line = d3
    .line()
    .curve(d3.curveBasis)
    .x((d) => x(d[0]))
    .y((d) => y(d[1]));

  svg
    .append("path")
    .datum(intenApproxD.filter((e) => e[0] <= tMax - classified.classWidth))
    .attr("fill", "none")
    .attr("stroke", "rgba(31, 41, 55, 100)")
    .attr("stroke-width", 3)
    .attr("stroke-linejoin", "round")
    .attr("d", line);

  addLabels(svg, s, "τ", "λ");
}

export function approxFuncChart(
  id: string,
  classified: ClassifiedTau,
  params: { a: number; b: number }
) {
  clearChildOf(id);

  const sorted = classified.taus.flat().sort((a, b) => a - b);
  const tMax = sorted[sorted.length - 1];
  const clamped = sorted.filter((e) => e <= tMax - classified.classWidth);

  const data: [number, number][] = clamped.map((e) => [
    e,
    math.approxIntensity(e, params.a, params.b)
  ]);

  const s = new PlotSettings(640, 480, { x: 40, y: 40 });
  const svg = createCanvas(id, s);

  const x = d3
    .scaleLinear()
    .domain([clamped[0], d3.max(clamped)])
    .range([0, s.width]);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max<number>(data.map((e) => e[1]))])
    .range([s.height, 0]);

  addAxes(svg, s, x, y);

  const line = d3
    .line()
    .curve(d3.curveBasis)
    .x((d) => x(d[0]))
    .y((d) => y(d[1]));

  svg
    .append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "rgba(31, 41, 55, 100)")
    .attr("stroke-width", 3)
    .attr("stroke-linejoin", "round")
    .attr("d", line);

  addLabels(svg, s, "τ", "λ");
}
