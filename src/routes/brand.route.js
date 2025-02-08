import express from "express"
import {Brand} from "../models/brand.model.js"
import {Post} from "../models/post.model.js"
import { Creator } from "../models/creator.model.js";
import { postRequest } from "../models/postRequest.model.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

const router = express.Router();
router
    .post('/signin', async (req, res)=>{
        console.log(req.body);
        const {name, email, officialUrl, category, password,} = req.body;

        const brand = await Brand.create({
            name,
            email,
            officialUrl,
            category,
            password
        })
        const token = jwt.sign({
            brandId: brand.id,
        }, process.env.JWT_SECRET)

        res.status(201).json({token});
    })
router
    .post('/newpost', upload.single('ImageUrl'), async(req,res)=>{
        let imageLocalPath;
        try {
            imageLocalPath = req.file.path;
        } catch (error) {
            console.error("no image found in req - ",error);
        }
        const brandId = '66c8994b3b20e9b74da374dc';
        const cloudinaryLink = await uploadOnCloudinary(imageLocalPath);
        
        const {title, category ,productUrl, creatorType, contentType, description, price, totalPromotions, accept} = req.body;
        const ImageUrl = cloudinaryLink.url;
    
        const post = await Post.create({
            title,
            ImageUrl,
            productUrl,
            category,
            creatorType,
            contentType,
            description,
            createdBy: brandId,
            price,
            totalPromotions,
            accept,
        })
        res.status(201).json({post});
    })
router
    .get('/profile', async(req,res)=>{
        console.log("reached /profile");
        
        const brandId = '66c8994b3b20e9b74da374dc';
        const brandDetails = await Brand.find({
            _id: brandId
        })
        const allPost = await Post.find({
            createdBy: brandId
        })
        if(!brandDetails){
            res.status(401).send("No Brand Exists With This ID.")
        }
        if(!allPost){
            res.status(401).send("No POST Associated With This Brand.")
        }
        res.status(201).json({brandDetails, allPost})
    })
router
    .get('/post/:postId', async(req, res)=>{
        const postId = req.params.postId;
        const postDetails = await Post.find({_id: postId});
        if(!postDetails){
            res.status(401).send("Dont have access to this POST ! !")
        }
        const allRequest = await postRequest.find({
            requestdOn: postId
        });
        if(!postDetails){
            res.status(401).send("Dont have access to this No POST ! !")
        }
        if(!allRequest){
            res.status(401).send("Dont have access to All Request ! !")
        }
        res.status(201).json({postDetails, allRequest});
    }) 
router
    .post('/approve/:postId', async(req, res)=> {
        console.log(req.query.creatorId);
        console.log(req.params.postId);

        const creator = await Creator.find({_id: req.query.creatorId});
        const post = await Post.find({_id: req.params.postId});
        if(!creator){
            res.status(401),send("Creator not Found");
        }
        if(!post){
            res.status(401),send("postId not valid");
        }
        
        res.status(201).json({
            message: "Pocessing",
        });
    })    
export default router; 
