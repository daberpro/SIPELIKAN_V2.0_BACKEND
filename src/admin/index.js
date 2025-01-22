import {PrismaClient} from "@prisma/client";
import { ErrorHandler } from "../util/error_handler.js";
import { body, param, validationResult } from "express-validator";
import express from "express";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import VerifyUser from "../middleware/VerifyUser.js";

dotenv.config();

const SALT_ROUNDS = 10;
const prisma = new PrismaClient();
const admin = express.Router();
admin.use(VerifyUser);

const validateUserReq = [
    body("username").isString().withMessage("username harus diisi"),
    body("password").isString().withMessage("password wajib diisi"),
    (req,res,next) =>{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({
                errors: errors.array()
            });
        }
        next();
    }
];
admin.post("/api-v2.0/add-user/",validateUserReq,async (req,res)=>{
    
    const salt = bcrypt.genSaltSync(SALT_ROUNDS);
    try{
        const user = await prisma.user.create({
            data:{
                username: req.body.username,
                password: bcrypt.hashSync(req.body.password,salt),
                token: ""
            }
        });
    }catch(err){
        return res.json({
            errors: [
                {
                    msg: ErrorHandler(err)
                }
            ]
        });
    }

    res.json({
        message: "user berhasil ditambahkan",
        status: true
    });
});

const validateUserUpdateReq = [
    param("id").isNumeric().withMessage("Id user tidak ditemukan"),
    (req,res,next)=>{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({
                errors: errors.array()
            });
        }
        next();
    }
];
admin.post("/api-v2.0/update-user/:id",validateUserUpdateReq,async (req,res)=>{

    let user;
    const salt = await bcrypt.genSaltSync(SALT_ROUNDS);
    const data = {};
    (req.body?.username)? data['username'] = req.body?.username : null;
    (req.body?.password)? data['password'] = bcrypt.hashSync(req.body?.password,salt) : null;

    try{
        user = await prisma.user.findUnique({
            where: {
                id: parseInt(req.params.id)
            }
        });
    
        if(!user){
            return res.status(400).json({
                errors: [
                    {
                        msg: "id user tidak ditemukan"
                    }
                ]
            });
        }
    
        await prisma.user.update({
            where: {
                id: user.id
            },
            data
        });

    }catch(err){
        return res.json({
            errors: [
                {
                    msg: ErrorHandler(err)
                }
            ]
        });
    }

    res.json({
        message: "akun berhasil diupdate",
        status: true
    });
});

admin.get("/api-v2.0/get-users",async (req,res)=>{

    let users;

    try{

        users = await prisma.user.findMany({
            select:{
                username: true
            }
        });

    }catch(err){
        return res.json({
            errors: [
                {
                    msg: ErrorHandler(err)
                }
            ]
        });
    }

    return res.json({
        users,
        username: req.username
    });
});

export default admin;