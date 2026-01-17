#!/usr/bin/env node

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

	const method: string = req.method;
	const url: string = req.originalUrl;

	const cacheKey: string = `${method}:${url}`;

	if (method === "GET") {
		const cached = await redis.get(cacheKey);
		if (cached) {
			res.set("X-Cache", "HIT");
			return res.json(JSON.parse(cached));
		}
	}

	const originResponse = await axios.get(`${origin}/${url}`);

	const content_type = originResponse.headers["Content-Type"] as string;
	const cache_control = originResponse.headers["Cache-Control"] as string;

	// Setting Headers
	res.set({
		"Content-Type": content_type,
		"Cache-Control": cache_control,
	});

	// Redis Cache
	redis.setEx(`${method}:${url}`, 3600, JSON.stringify(originResponse.data));

	return res.json({ data: originResponse });
});

app.listen(port, () => {
	console.log("Server Running");
	console.log("Port: ", port);
	console.log("Origin ", origin);
});
