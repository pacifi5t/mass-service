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

export function piecewiseChart(
  tauArr: number[],
  intensities: number[],
  classes: number,
  classWidth: number
) {
  try {
    document.getElementById("intensity").replaceChildren("");
  } catch (e) {
    console.error(e);
  }

  const confIntervals: [number, number][] = [];
  for (let i = 0; i < intensities.length; i++) {
    confIntervals.push();
  }

  const tMin = d3.min<number>(tauArr);
  const tMax = d3.max<number>(tauArr);
  const laMax = d3.max<number>(intensities);

  const margin = { x: 40, y: 40 };
  const width = 640 - margin.x * 2;
  const height = 480 - margin.y * 2;

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

  const length = width / (classes - 1);
  const data = [];
  for (let i = 0; i < intensities.length; i++) {
    const x1 = i * length;
    data.push({
      x1: x1,
      x2: x1 + length,
      y: intensities[i]
    });
  }

  svg
    .selectAll("whatever")
    .data(data)
    .join("line")
    .attr("x1", (d) => d.x1)
    .attr("x2", (d) => d.x2)
    .attr("y1", (d) => y(d.y))
    .attr("y2", (d) => y(d.y))
    .attr("stroke", "#4300b0")
    .attr("stroke-width", 5);

  // TODO: add confidence intervals

  svg
    .append("text")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", height + margin.y)
    .text("τ");

  svg
    .append("text")
    .attr("text-anchor", "end")
    .attr("y", 0)
    .attr("x", -margin.x / 2)
    .text("λ");
}
