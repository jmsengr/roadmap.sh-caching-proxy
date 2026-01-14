import express from "express";
import axios from "axios";
import { createClient } from "redis";
const redis = createClient();
await redis.connect();
const PORT = 3000;
const app = express();
app.use(express.json());
app.get("/test", async (req, res, next) => {
    return res.json({ data: "HELLO" });
});
// Proxy
app.use(async (req, res) => {
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
