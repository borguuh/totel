const express = require("express");
const router = express.Router();
const {
  getAllRooms,
  addRoom,
  updateRoom,
  deleteRoom,
} = require("../../controllers/User/room_controller");

router.get("/get_all_rooms", getAllRooms);
router.post("/add_room", addRoom);
router.put("/update_room", updateRoom);
router.delete("/perm_del_room", deleteRoom);

module.exports = router;