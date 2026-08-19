import express from "express"
import cors from "cors"
import userRouter from "./routes/user.route.js"
import artistRouter from "./routes/artist.routes.js"
import albumRoute from "./routes/album.route.js";
import songRoute from "./routes/song.route.js";

const app = express()
app.use(cors())
app.use(express.json())
app.use("/api/users", userRouter);
app.use("/api/artists", artistRouter);
app.use("/api/albums", albumRoute);
app.use("/api/songs", songRoute);



export default app