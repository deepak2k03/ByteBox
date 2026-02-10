import express from "express";
import { createWriteStream } from "fs";
import { rm } from "fs/promises";
import { rename } from "fs/promises";
import path from "path";


const router=express.Router();

//create file
router.post("/*",(req,res)=>{
  const filePath=path.join("/",req.params[0]);
  console.log(req.params.filename);
  const writeStream=createWriteStream(`./storage/${filePath}`);
  req.pipe(writeStream);
  req.on("end",()=>{
    res.json({message:"File Uploaded"});
  })
})


router.get("/*", (req, res) => {
  const filePath=path.join("/",req.params[0]);
  if (req.query.action === "download") {
    res.set("Content-Disposition", "attachment");
  }
  res.sendFile(`${process.cwd()}/storage/${filePath}`,(err)=>{
    if(err) res.json({err:"File Not Found"})
  });
});

//update 
router.patch("/*",async(req,res)=>{
  const {0:filePath}=req.params;
  await rename(`./storage/${filePath}`,`./storage/${req.body.newFilename}`);
  res.json({message:"Renamed"});
})

//delete
router.delete("/*", async (req, res) => {
  const { 0:filePath } = req.params;
  try {
    await rm(`./storage/${filePath}`,{recursive:true});
    res.json({message:"File Deleted"});
  } catch (error) {
    res.status(404).json({message:"File Not Found"});
  }
});

export default router;