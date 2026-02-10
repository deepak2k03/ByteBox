import express from "express";
import cors from "cors";
import directoryRoutes from "./routes/directoryRoutes.js"
import fileRoutes from "./routes/fileRoutes.js"
const app = express();

//json parsing
app.use(express.json())

//enabling cors
app.use(cors())

app.use("/directory", directoryRoutes);
app.use("/files", fileRoutes);

app.listen(4000, () => {
  console.log(`Server Started`);
});
