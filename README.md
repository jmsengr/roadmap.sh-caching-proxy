# Caching Proxy

Build a caching proxy server that forwards requests to an origin server, caches the responses, and serves cached responses for repeated requests.

---

## 📌 Overview

This project requires building a **CLI tool** that starts a caching proxy server. The proxy forwards incoming HTTP requests to an actual (origin) server and caches the responses.

If the same request is made again, the proxy should return the cached response instead of forwarding the request to the origin server.

---

## ⚙️ Requirements

### Start the caching proxy server

The user should be able to start the caching proxy server by running the following command:

```shell
caching-proxy --port <number> --origin <url>
```

Command-line options

--port
The port on which the caching proxy server will run.

--origin
The base URL of the server to which requests will be forwarded.

Example

```shell
caching-proxy --port 3000 --origin http://dummyjson.com
```
This command starts the caching proxy server on port 3000 and forwards requests to:
```text
http://dummyjson.com
```

🔁 Request Forwarding & Caching Behavior

Given the example above, if the user makes a request to:
```text
http://localhost:3000/products
```

The caching proxy server should:

1. Forward the request to:
```text
http://dummyjson.com/products
```

2. Return the response along with the original headers
3. Cache the response for future requests

🧠 Cache Status Headers

Each response must include a custom header indicating whether the response was served from the cache or fetched from the origin server.
```text
# If the response is served from the cache
X-Cache: HIT
```
```text
# If the response is served from the origin server
X-Cache: MISS
```

If the same request is made again, the cached response should be returned without forwarding the request to the origin server.

🧹 Clear Cache

The user should also be able to clear the cache by running the following command:
```shell
caching-proxy --clear-cache
```
