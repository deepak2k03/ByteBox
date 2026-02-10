import express from "express";
import { createWriteStream } from "fs";
import { mkdir, stat } from "fs/promises";
import { readdir } from "fs/promises";
import { rm } from "fs/promises";
import { rename } from "fs/promises";
import cors from "cors";
import path from "path";


const app = express();

//json parsing
app.use(express.json())

//enabling cors
app.use(cors())

//Read
app.get("/directory/?*", async (req, res) => {
  const dirname=path.join("/",req.params[0]);
  const fullDirPath=`./storage/${dirname ? dirname : ""}`
  try {
    const filesList = await readdir(fullDirPath);
    const resData=[];
    for(const item of filesList){
      const stats = await stat(`${fullDirPath}/${item}`);
      resData.push({name:item, isDirectory:stats.isDirectory()});
    }
    res.json(resData);
  } catch (error) {
    res.json({error:error.message})
  }
});

//create directory
app.post("/directory/?*", async (req,res)=>{
  const dirname=path.join("/",req.params[0]);
  try {
    await mkdir(`./storage/${dirname}`)
    res.json({message:"Directory Created"});
  } catch (error) {
    res.json({err:err.message})
  }
})


//create file
app.post("/files/*",(req,res)=>{
  const filePath=path.join("/",req.params[0]);
  console.log(req.params.filename);
  const writeStream=createWriteStream(`./storage/${filePath}`);
  req.pipe(writeStream);
  req.on("end",()=>{
    res.json({message:"File Uploaded"});
  })
})


app.get("/files/*", (req, res) => {
  const filePath=path.join("/",req.params[0]);
  if (req.query.action === "download") {
    res.set("Content-Disposition", "attachment");
  }
  res.sendFile(`${import.meta.dirname}/storage/${filePath}`,(err)=>{
    if(err) res.json({err:"File Not Found"})
  });
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
