import dotenv from "dotenv";
dotenv.config();
import app from "./app.js"
import { connectDB } from "./config/db.js";


const PORT = process.env.PORT;

async function startServer() {
    await connectDB()
    app.listen(PORT, () => {
        console.log(`Server is running on port at http://localhost:${PORT}/`);
    })

}

startServer()










































