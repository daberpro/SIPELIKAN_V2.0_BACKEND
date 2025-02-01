import {PrismaClient} from "@prisma/client";
import { body, param, validationResult } from "express-validator";
import { ErrorHandler } from "./util/error_handler.js";
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import express from "express";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import admin from "./admin/index.js";
import user from "./user/index.js";
import VerifyUser from "./middleware/VerifyUser.js";
import { ROLE } from "./util/role.js";
import cors from 'cors';
dotenv.config();

const SALT_ROUNDS = 10;
const prisma = new PrismaClient();
const server = express();
// view engine setup
server.set('views', './views');
server.set('view engine','ejs');
server.use(cors("*"));
server.use(express.json());
server.use(cookieParser(process.env.COOKIE_SECRET));
server.use("/admin",admin);
server.use("/user",user);

const validateUserReq = [
    body("email").isString().withMessage("email harus diisi"),
    body("password").isString().withMessage("password wajib diisi"),
    (req,res,next) =>{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({
                errors: errors.array().map(d => ({message: d.msg}))
            });
        }
        next();
    }
];

server.get("/",(req,res)=>{
    res.render('index');
});

server.get("/api-v2.0/",(req,res)=>{
    res.json({
        message: "test server v2.0"
    });
});

server.post("/api-v2.0/login-user/",validateUserReq,async (req,res)=>{

    let token;
    
    try{

        const user = await prisma.user.findFirst({
            where:{
                email: req.body.email
            }
        });

        if(!user){
            return res.status(403).json({
                errors: [
                    {
                        message: "email tidak ditemukan"
                    }
                ],
                status: false
            });
        }
    
        if(!bcrypt.compareSync(req.body.password,user.password)){
            return res.status(403).json({
                errors: [
                    {
                        message: "password salah"
                    }
                ],
                status: false
            });
        }
    
        token = jwt.sign(
            {
                email: user.email
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
                    message: ErrorHandler(err)
                }
            ],
            status: false
        });
    }

    res.cookie("sipelikan_token",token);
    res.json({
        token,
        message: "login berhasil",
        status: true
    });
});

server.post("/api-v2.0/add-user/",validateUserReq,async (req,res)=>{
    
    const salt = bcrypt.genSaltSync(SALT_ROUNDS);
    try{
        const user = await prisma.user.create({
            data:{
                email: req.body.email,
                password: bcrypt.hashSync(req.body.password,salt),
                token: "",
                role: ROLE.USER,
                name: req.body.name
            }
        });
    }catch(err){
        return res.json({
            errors: [
                {
                    message: ErrorHandler(err)
                }
            ]
        });
    }

    res.json({
        message: "berhasil mendaftar",
        status: true
    });
});

server.get("/api-v2.0/logout",VerifyUser,async (req,res)=>{

    res.clearCookie('sipelikan_token');
    await prisma.user.update({
        where:{
            email: req.email
        },
        data:{
            token: ''
        }
    });

    res.json({
        message: "Logout berhasil",
        status: true
    });

});

// Only use on development
export const SipelikanServer = server;

// Only use on production
// server.listen(process.env.PORT,_=>{
//     console.log(`Server running on port ${process.env.PORT}`);
// });