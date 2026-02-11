import express from "express";
import { createWriteStream } from "fs";
import { rm, writeFile } from "fs/promises";
import { rename } from "fs/promises";
import path from "path";
import filesData from "../filesDB.json" with { type: "json" };
import directoriesData from "../directoriesDB.json" with { type: "json" };
const router = express.Router();

//create file
router.post("/:filename", (req, res) => {
  const { filename } = req.params;
  const parentDirId = req.headers.parentdirid || directoriesData[0].id;
  const id = crypto.randomUUID();
  const extension = path.extname(filename);
  const fullFilename = `${id}${extension}`;
  const writeStream = createWriteStream(`./storage/${fullFilename}`);
  req.pipe(writeStream);
  req.on("end", async () => {
    filesData.push({
      id,
      extension,
      name: filename,
      parentDirId,
    });
    const parentDirData=directoriesData.find((directoryData)=>directoryData.id === parentDirId);
    parentDirData.files.push(id);
    await writeFile("./filesDB.json", JSON.stringify(filesData));
    await writeFile("./directoriesDB.json", JSON.stringify(directoriesData));
    res.json({ message: "File Uploaded" });
  });
});

//read
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const fileData = filesData.find((file) => file.id === id);
  console.log(fileData);
  if (req.query.action === "download") {
    res.set("Content-Disposition", "attachment");
  }
  res.sendFile(`${process.cwd()}/storage/${id}${fileData.extension}`, (err) => {
    if (err) res.json({ err: "File Not Found" });
  });
});

// update
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const fileData = filesData.find((file) => file.id === id);
  fileData.name = req.body.newFilename;
  await writeFile("./filesDB.json", JSON.stringify(filesData));
  res.json({ message: "Renamed" });
});

//delete
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const fileIndex = filesData.findIndex((file) => file.id === id);
  const fileData = filesData[fileIndex];
  try {
    await rm(`${process.cwd()}/storage/${id}${fileData.extension}`, {
      recursive: true,
    });
    filesData.splice(fileIndex, 1);
    const parentDirData = directoriesData.find(
      (directoryData) => directoryData.id === fileData.parentDirId,
    );
    parentDirData.files = parentDirData.files.filter((fileId) => fileId !== id);
    await writeFile("./filesDB.json", JSON.stringify(filesData));
    await writeFile("./directoriesDB.json", JSON.stringify(directoriesData));
    res.json({ message: "File Deleted" });
  } catch (error) {
    res.status(404).json({ message: "File Not Found" });
  }
});

export default router;
