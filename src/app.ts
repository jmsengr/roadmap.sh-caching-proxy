#!/usr/bin/env node

import express from "express";
import axios from "axios";
import { createClient } from "redis";
import kleur from "kleur";

const redis = createClient();
await redis.connect();

let port: number | undefined;
let origin: string;

// Fetching shell comman arguments
const args = process.argv.slice(2);

if (args.includes("--clear-cache")) {
	// clear cache
	console.log(kleur.bgGreen("CACHE FLUSHED"));
	redis.flushDb();
	process.exit(0);
}

for (let i = 0; i < args.length; i++) {
	if (args[i] === "--port") {
		port = Number(args[i + 1]);
	}

	if (args[i] === "--origin") {
		origin = args[i + 1]?.toString() as string;
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
			console.log(kleur.bgMagenta("HIT"));
			return res.json(JSON.parse(cached));
		}
	}

	const originResponse = await axios.get(`${origin}${url}`, {
		// Forward Client Headers
		headers: {
			"Content-Type": req.headers["content-type"],
			"Cache-Control": req.headers["cache-control"],
		},
	});

	// Setting Response Headers
	res.set({
		"X-Cache": "MISS",
		"Content-Type": originResponse.headers["Content-Type"],
		"Cache-Control": originResponse.headers["Cache-Control"],
	});

	// Redis Cache
	redis.setEx(`${method}:${url}`, 3600, JSON.stringify(originResponse.data));

	console.log(kleur.bgMagenta("MISS"));
	return res.json({ data: originResponse.data });
});

app.listen(port, () => {
	console.log(kleur.bgWhite("Server Running"));
	console.log(kleur.bgWhite(`Port: ${port}`));
	console.log(kleur.bgWhite(`Origin: ${origin}`));
});
