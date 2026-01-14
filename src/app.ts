#!user/bin/env node

import express from "express";
import axios from "axios";
import { createClient } from "redis";

const redis = createClient();
await redis.connect();

let port: number | undefined;
let origin: string | undefined;

// Fetching shell comman arguments
const args = process.argv.slice(2);

if (args.includes("--clear-cache")) {
  // clear cache
}

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--port") {
    port = Number(args[i + 1]);
  }

  if (args[i] === "--origin") {
    origin = args[i + 1];
  }
}

const app = express();

app.use(express.json());

app.get("/test", async (req, res, next) => {
  return res.json({ data: "HELLO" });
});

// Proxy
app.use(async (req, res) => {
  // Clear cached

  const cacheKey = `${req.method}:${req.originalUrl}`;

  if (req.method === "GET") {
    const cached = await redis.get(`${req.method}:${req.originalUrl}`);
    if (cached) {
      res.set("X-Cache", "HIT");
      return res.json(JSON.parse(cached));
    }
  }

  const originResponse = await axios({});
});

app.listen(PORT, () => {
  console.log("RUNNING ON PORT " + PORT);
});
