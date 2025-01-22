import {PrismaClient} from "@prisma/client";
import { body, param, validationResult } from "express-validator";
import { ErrorHandler } from "./util/error_handler.js";
import express from "express";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import admin from "./admin/index.js";
dotenv.config();

const prisma = new PrismaClient();
const server = express();
server.use(express.json());
server.use(cookieParser(process.env.COOKIE_SECRET));
server.use("/admin",admin);

server.get("/api-v2.0/",(req,res)=>{
    res.json({
        message: "test server v2.0"
    });
});

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
server.post("/api-v2.0/login-user/",validateUserReq,async (req,res)=>{

    let token;
    
    try{

        const user = await prisma.user.findFirst({
            where:{
                username: req.body.username
            }
        });
    
        if(!bcrypt.compareSync(req.body.password,user.password)){
            return res.status(403).json({
                errors: [
                    {
                        msg: "password salah"
                    }
                ]
            });
        }
    
        token = jwt.sign(
            {
                username: user.username
            },
            process.env.JWT_SECRET, 
            { 
                expiresIn: '1d' 
            }
        );
    
        await prisma.user.update({
            where: {
                id: user.id
            },
            data:{
                token
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
        token,
        message: "login berhasil",
        status: true
    });
});


server.listen(process.env.PORT,_=>{
    console.log(`Server running on port ${process.env.PORT}`);
});