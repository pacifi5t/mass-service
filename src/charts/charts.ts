import * as d3 from "d3";
import * as mymath from "../math";
import {
  clearChildOf,
  PlotSettings,
  createCanvas,
  addLabels,
  addAxes
} from ".";

export function createDataChart(id: string, inputData: number[]) {
  clearChildOf(id);

  const dataMin = d3.min<number>(inputData);
  const dataMax = d3.max<number>(inputData);
  const padding = (dataMax - dataMin) / 40;

  const data = [];
  for (let i = 0; i < inputData.length; i++) {
    const y = inputData[i];
    data.push({ x: i, y: y });
  }

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
  classifiedTau: number[][],
  intensities: number[],
  classWidth: number
) {
  clearChildOf(id);
  const s = new PlotSettings(640, 480, { x: 40, y: 40 });

  const tMin = d3.min<number>(tauArr);
  const tMax = d3.max<number>(tauArr);

  const length = s.width / (classifiedTau.length - 1);
  const dataI = [];
  for (let i = 0; i < intensities.length; i++) {
    const x1 = i * length;
    dataI.push({
      x1: x1,
      x2: x1 + length,
      y: intensities[i]
    });
  }

  const confIntervals = [];
  for (let i = 0; i < intensities.length; i++) {
    const interval = mymath.intensityConfInterval(
      intensities[i],
      classifiedTau[i].length
    );
    confIntervals.push({
      high: interval[1],
      low: interval[0],
      x: i * length,
      width: i * length + length
    });
  }

  const sortedTau = [...tauArr].sort((a, b) => a - b);
  const dataIA = [];
  for (let i = 0; sortedTau[i] < tMax - classWidth; i++) {
    const tau = sortedTau[i];
    const res = mymath.intensityFn(
      tau,
      mymath.approxP1(intensities, classWidth, tMin),
      mymath.approxP2(intensities, classWidth, tMin)
    );
    dataIA.push([tau, res]);
  }

  const laMax = d3.max([
    ...intensities,
    ...confIntervals.flatMap((e) => [e.high, e.low]).flat()
  ]);

  const svg = createCanvas(id, s);

  const x = d3
    .scaleLinear()
    .domain([tMin, tMax - classWidth])
    .range([0, s.width]);

  const y = d3.scaleLinear().domain([0, laMax]).range([s.height, 0]);

  addAxes(svg, s, x, y);

  // Ticks
  svg
    .selectAll()
    .data(dataI)
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
    .data(confIntervals)
    .join("rect")
    .attr("x", (d) => d.x)
    .attr("y", (d) => y(d.high))
    .attr("height", (d) => y(d.low) - y(d.high))
    .attr("width", (d) => length)
    .attr("fill", "#ccbce5");

  // Intensities
  svg
    .selectAll("whatever")
    .data(dataI)
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
    .datum(dataIA)
    .attr("fill", "none")
    .attr("stroke", "rgba(31, 41, 55, 100)")
    .attr("stroke-width", 3)
    .attr("stroke-linejoin", "round")
    .attr("d", line);

  addLabels(svg, s, "τ", "λ");
}

export function approxFuncChart(
  id: string,
  tauArr: number[],
  params: { a: number; b: number }
) {
  clearChildOf(id);

  const sorted = [...tauArr].sort((a, b) => a - b);
  const data = [];
  for (let i = 0; i < sorted.length; i++) {
    const elem = sorted[i];
    data.push([elem, mymath.approxIntensity(elem, params.a, params.b)]);
  }

  const s = new PlotSettings(640, 480, { x: 40, y: 40 });
  const svg = createCanvas(id, s);

  const x = d3
    .scaleLinear()
    .domain([d3.min<number>(tauArr), d3.max<number>(tauArr)])
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
