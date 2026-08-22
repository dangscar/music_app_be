import { Router } from "express";
import { register, getUser, getAllUsers, login, getMe } from "../controllers/user.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/login", login);
router.post("/", register);

router.get("/me", verifyToken, getMe);
router.get("/:id", getUser);
router.get("/", getAllUsers);

export default router;