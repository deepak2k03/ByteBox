import express from "express";
import { createWriteStream } from "fs";
import { stat } from "fs/promises";
import { readdir } from "fs/promises";
import { rm } from "fs/promises";
import { rename } from "fs/promises";
import cors from "cors";


const app = express();

//json parsing
app.use(express.json())

//enabling cors
app.use(cors())

//Read
app.get("/directory/:dirname?", async (req, res) => {
  const {dirname}=req.params;
  const fullDirPath=`./storage/${dirname ? dirname : ""}`
  const filesList = await readdir(fullDirPath);
  const resData=[];
  for(const item of filesList){
    const stats = await stat(`${fullDirPath}/${item}`);
    resData.push({name:item, isDirectory:stats.isDirectory()});
  }
  res.json(resData);
});


//create 
app.post("/files/:filename",(req,res)=>{
  console.log(req.params.filename);
  const writeStream=createWriteStream(`./storage/${req.params.filename}`);
  req.pipe(writeStream);
  req.on("end",()=>{
    res.json({message:"File Uploaded"});
  })
})


app.get("/files/:filename", (req, res) => {
  const { filename } = req.params;
  if (req.query.action === "download") {
    res.set("Content-Disposition", "attachment");
  }
  res.sendFile(`${import.meta.dirname}/storage/${filename}`);
});

//update 
app.patch("/files/:filename",async(req,res)=>{
  const {filename}=req.params;
  await rename(`./storage/${filename}`,`./storage/${req.body.newFilename}`);
  res.json({message:"Renamed"});
})

//delete
app.delete("/files/:filename", async (req, res) => {
  const { filename } = req.params;
  const filePath=`./storage/${filename}`;
  try {
    await rm(filePath);
    res.json({message:"File Deleted"});
  } catch (error) {
    res.status(404).json({message:"File Not Found"});
  }
});


app.listen(4000, () => {
  console.log(`Server Started`);
});
