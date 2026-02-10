import express from "express";
import { createWriteStream } from "fs";
import { rm, writeFile } from "fs/promises";
import { rename } from "fs/promises";
import path from "path";
import filesData from "../filesDB.json" with {type:"json"}

const router=express.Router();

//create file
router.post("/:filename",(req,res)=>{
  const {filename} = req.params;
  const id=crypto.randomUUID();
  const extension=path.extname(filename);
  const fullFilename=`${id}${extension}`;
  const writeStream=createWriteStream(`./storage/${fullFilename}`);
  req.pipe(writeStream);
  req.on("end",async ()=>{
    filesData.push({
        id,
        extension,
        name:filename
    })
    await writeFile('./filesDB.json',JSON.stringify(filesData));
    res.json({message:"File Uploaded"});
  })
})


router.get("/:id", (req, res) => {
  const {id} = req.params;
  const fileData=filesData.find((file)=>file.id===id);
  console.log(fileData)
  if (req.query.action === "download") {
    res.set("Content-Disposition", "attachment");
  }
  res.sendFile(`${process.cwd()}/storage/${id}${fileData.extension}`,(err)=>{
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