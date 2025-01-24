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
const user = express.Router();
user.use(VerifyUser);

const validateUserReq = [
    body("email").isString().withMessage("email harus diisi"),
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
user.post("/api-v2.0/update-user/:id",validateUserUpdateReq,async (req,res)=>{

    let user;
    const salt = await bcrypt.genSaltSync(SALT_ROUNDS);
    const data = {};
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

        if(user.email != req.email){
            return res.status(400).json({
                errors: [
                    {
                        msg: "Akses ditolak"
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

user.get("/api-v2.0/get-user",async (req,res)=>{

    let user;

    try{

        user = await prisma.user.findFirst({
            select:{
                email: true,
                name: true,
                id: true
            },
            where:{
                email: req.email
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
        user
    });
});

export default user;