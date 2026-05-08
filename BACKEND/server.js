console.log("Starting server...");

// const express = require("express");
// const cors = require("cors");
// const bodyParser = require("body-parser");
// const { createProxyMiddleware } = require("http-proxy-middleware");

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Middleware
// app.use(cors());
// app.use(bodyParser.json());

// // Proxy API requests to the React development server
// app.use(
//   "/api",
//   createProxyMiddleware({
//     target: "http://localhost:3000",
//     changeOrigin: true,
//   })
// );

// // Start the server
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });