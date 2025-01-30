import {PrismaClient} from "@prisma/client";
import { ErrorHandler } from "../util/error_handler.js";
import { body, param, validationResult } from "express-validator";
import express from "express";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import VerifyUser from "../middleware/VerifyUser.js";
import { ROLE } from "../util/role.js";

dotenv.config();

const SALT_ROUNDS = 10;
const prisma = new PrismaClient();
const admin = express.Router();
admin.use(VerifyUser);

admin.use(async (req,res,next)=>{
    try{
        const user = await prisma.user.findFirst({
            where:{
                email: req.email
            }
        });

        if(user.role === ROLE.ADMIN){
            next();
            return;
        }

        return res.status(403).json({
            status: false,
            errors: [
                {
                    message: "Akses ditolak"
                }
            ],
            status: false
        });

    }catch(err){
        return res.json({
            status: false,
            errors: [
                {
                    message: ErrorHandler(err)
                }
            ]
        });
    }
});

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
admin.post("/api-v2.0/add-user/",validateUserReq,async (req,res)=>{
    
    const salt = bcrypt.genSaltSync(SALT_ROUNDS);
    try{
        const user = await prisma.user.create({
            data:{
                email: req.body.email,
                password: bcrypt.hashSync(req.body.password,salt),
                token: "",
                name: req.body.name
            }
        });
    }catch(err){
        return res.json({
            status: false,
            errors: [
                {
                    message: ErrorHandler(err)
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
                errors: errors.array().map(d => ({message: d.msg}))
            });
        }
        next();
    }
];
admin.post("/api-v2.0/update-user/:id",validateUserUpdateReq,async (req,res)=>{

    let user;
    const salt = await bcrypt.genSaltSync(SALT_ROUNDS);
    const data = {};
    
    try{
        user = await prisma.user.findUnique({
            where: {
                id: parseInt(req.params.id)
            }
        });
        
        if(user.email === req.email){
        
            (req.body?.password)? data['password'] = bcrypt.hashSync(req.body?.password,salt) : null;
            (req.body?.name)? data['name'] = req.body?.name : null;
        
        }else{

            (req.body?.role)? data['role'] = req.body?.role : null;
            if(!(data['role'] in ROLE)){
                return res.status(400).json({
                    status: false,
                    errors: [
                        {
                            message: "role yang dimasukan invalid"
                        }
                    ]
                });    
            }

        }

        
        if(!user){
            return res.status(400).json({
                status: false,
                errors: [
                    {
                        message: "id user tidak ditemukan"
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
            status: false,
            errors: [
                {
                    message: ErrorHandler(err)
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
                email: true,
                name: true,
                role: true,
                id: true
            }
        });

    }catch(err){
        return res.json({
            status: false,
            errors: [
                {
                    message: ErrorHandler(err)
                }
            ]
        });
    }

    return res.json({
        users,
        email: req.email
    });
});

export default admin;