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
app.get("/directory/?*", async (req, res) => {
  const {0:dirname}=req.params;
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
app.post("/files/*",(req,res)=>{
  console.log(req.params.filename);
  const writeStream=createWriteStream(`./storage/${req.params[0]}`);
  req.pipe(writeStream);
  req.on("end",()=>{
    res.json({message:"File Uploaded"});
  })
})


app.get("/files/*", (req, res) => {
  const { 0:filePath } = req.params;
  if (req.query.action === "download") {
    res.set("Content-Disposition", "attachment");
  }
  res.sendFile(`${import.meta.dirname}/storage/${filePath}`);
});

//update 
app.patch("/files/*",async(req,res)=>{
  const {0:filePath}=req.params;
  await rename(`./storage/${filePath}`,`./storage/${req.body.newFilename}`);
  res.json({message:"Renamed"});
})

//delete
app.delete("/files/*", async (req, res) => {
  const { 0:filePath } = req.params;
  try {
    await rm(`./storage/${filePath}`,{recursive:true});
    res.json({message:"File Deleted"});
  } catch (error) {
    res.status(404).json({message:"File Not Found"});
  }
});


app.listen(4000, () => {
  console.log(`Server Started`);
});
