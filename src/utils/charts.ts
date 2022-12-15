import * as d3 from "d3";
import * as mymath from "../math";

export function createDataChart(inputData: number[]) {
  try {
    document.getElementById("data").replaceChildren("");
  } catch (e) {
    console.error(e);
  }

  const sMin = d3.min<number>(inputData);
  const sMax = d3.max<number>(inputData);
  const padding = (sMax - sMin) / 40;

  const data = [];
  for (let i = 0; i < inputData.length; i++) {
    const y = inputData[i];
    data.push({ x: i, y: y });
  }

  const margin = { x: 40, y: 40 },
    width = 640 - margin.x * 2,
    height = 480 - margin.y * 2;

  const svg = d3
    .select("#data")
    .append("svg")
    .attr("width", width + margin.x * 2)
    .attr("height", height + margin.y * 2)
    .append("g")
    .attr("transform", `translate(${margin.x}, ${margin.y})`);

  const x = d3
    .scaleLinear()
    .domain([0, data.length - 1])
    .range([0, width]);

  const y = d3
    .scaleLinear()
    .domain([sMin - padding, sMax + padding])
    .range([height, 0]);

  svg
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x));

  svg.append("g").call(d3.axisLeft(y));

  svg
    .selectAll("whatever")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", (d) => x(d.x))
    .attr("cy", (d) => y(d.y))
    .attr("fill", () => "#4300b0")
    .attr("r", 4);

  svg
    .append("text")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", height + margin.y)
    .text("№");

  svg
    .append("text")
    .attr("text-anchor", "end")
    .attr("y", 0)
    .attr("x", -margin.x / 2)
    .text("e");
}

export function piecewiseIntensityChart(
  tauArr: number[],
  classifiedTau: number[][],
  intensities: number[],
  classWidth: number
) {
  try {
    document.getElementById("intensity").replaceChildren("");
  } catch (e) {
    console.error(e);
  }

  const tMin = d3.min<number>(tauArr);
  const tMax = d3.max<number>(tauArr);

  const margin = { x: 40, y: 40 };
  const width = 640 - margin.x * 2;
  const height = 480 - margin.y * 2;

  const length = width / (classifiedTau.length - 1);
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
  const laMin = d3.min([
    ...intensities,
    ...confIntervals.flatMap((e) => [e.high, e.low]).flat()
  ]);

  const svg = d3
    .select("#intensity")
    .append("svg")
    .attr("width", width + margin.x * 2)
    .attr("height", height + margin.y * 2)
    .append("g")
    .attr("transform", `translate(${margin.x}, ${margin.y})`);

  const x = d3
    .scaleLinear()
    .domain([tMin, tMax - classWidth])
    .range([0, width]);

  const y = d3.scaleLinear().domain([0, laMax]).range([height, 0]);

  svg
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x));

  svg.append("g").call(d3.axisLeft(y));

  // Ticks
  svg
    .selectAll()
    .data(dataI)
    .join("line")
    .attr("x1", (d) => d.x2)
    .attr("x2", (d) => d.x2)
    .attr("y1", (_) => 0)
    .attr("y2", (_) => height)
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

  // x label
  svg
    .append("text")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", height + margin.y)
    .text("τ");
  // y label
  svg
    .append("text")
    .attr("text-anchor", "end")
    .attr("y", -20)
    .attr("x", -margin.x / 2)
    .text("λ");
}
