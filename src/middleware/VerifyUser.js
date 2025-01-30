import jwt from "jsonwebtoken";
import { ErrorHandler } from "../util/error_handler.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function VerifyUser(req,res,next){

    let token = '';

    if('sipelikan_token' in req.cookies){

        token = req.cookies['sipelikan_token'];

    }else{

        const raw = req.get("Authorization");
        if(!raw){
            return res.status(401).json({
                status: false,
                errors: [
                    {
                        message: "Autentikasi gagal"
                    }
                ]
            });
        }
        token = (raw || "Bearer ").split(" ")[1];
        
    }

    let data = {};

    try{

        data = jwt.decode(
            token,
            process.env.JWT_SECRET
        );

    }catch(err){
        
        return res.status(401).json({
            status: false,
            errors: [
                {
                    message: err.message()
                }
            ]
        });

    }

    if(!data){
        return res.status(401).json({
            status: false,
            errors: [
                {
                    message: "Invalid token data"
                }
            ]
        });
    }

    try{

        const user = await prisma.user.findFirst({
            where:{
                email: data.email
            }
        });

        if(!user){
            return res.status(401).json({
                status: false,
                errors: [
                    {
                        message: "Invalid token data"
                    }
                ]
            });
        }

        req.email = user.email;

    }catch(err){
        return res.status(401).json({
            status: false,
            errors: [
                {
                    message: ErrorHandler(err)
                }
            ]
        });
    }

    next();
}