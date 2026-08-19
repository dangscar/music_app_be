import { Router } from "express";
import { register, getUser, getAllUsers, login } from "../controllers/user.controller.js";

const router = Router()

router.post("/login", login);
router.get("/:id", getUser)
router.get("/", getAllUsers)
router.post("/", register)


export default router;