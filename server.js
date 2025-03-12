const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/api/hello", (req, res) => {
    res.json({ message: "Hello from server!" });
});

if (process.env.NODE_ENV !== "test") {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;