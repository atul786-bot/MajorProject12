import express from "express";
import db from "../database.js";

const router = express.Router();

router.get("/", (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 100;
    const history = db.prepare("SELECT * FROM execution_history ORDER BY id DESC LIMIT ?").all(limit);

    res.json({
      message: "Execution history fetched successfully",
      history
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch execution history",
      error: err.message
    });
  }
});

export default router;
