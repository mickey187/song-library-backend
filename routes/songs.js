var express = require("express");
const multer = require("multer");
const {
  createSong,
  fetchSongById,
  fetchAllSongs,
  updateSong,
  deleteSong,
  fetchStats,
} = require("../controllers/SongController");
const { validateSongData } = require("../middlewares/SongValidator");
var router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/", upload.single("artwork"), createSong);
router.get("/", fetchAllSongs);
router.get("/:songId", fetchSongById);
router.put("/:songId", upload.single("artwork"), updateSong);
router.delete("/:songId", deleteSong);

router.get("/stats/all", fetchStats);

module.exports = router;
