import express from "express";
import cors from "cors";
import { resolve } from "path";
import * as dotenv from "dotenv";
import { exit } from "process";

dotenv.config();
const app = express();
const distPath = resolve("dist") + "/";

app.use(cors());
app.use(express.static(distPath));

app.use("/", (_req, res) => {
  res.status(200).sendFile(distPath + "index.html");
});

async function start() {
  let port = process.env.PORT;

  if (port === undefined) {
    console.error("PORT variable is undefined");
    exit(1);
  }

  try {
    app.listen(port, () =>
      console.log(`App started on http://localhost:${port}/`)
    );
  } catch (err) {
    console.error(err);
  }
}

start();
