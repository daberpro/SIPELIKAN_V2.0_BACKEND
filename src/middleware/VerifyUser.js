import jwt from "jsonwebtoken";
import { ErrorHandler } from "../util/error_handler.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function VerifyUser(req,res,next){

    const raw = req.get("Authorization");
    if(!raw){
        return res.status(401).json({
            errors: [
                {
                    msg: "Autentikasi gagal"
                }
            ]
        });
    }

    let data = {};
    const token = (raw || "Bearer ").split(" ")[1];
    try{

        data = jwt.decode(
            token,
            process.env.JWT_SECRET
        );

    }catch(err){
        
        return res.status(401).json({
            errors: [
                {
                    msg: err.message()
                }
            ]
        });

    }

    if(!data){
        return res.status(401).json({
            errors: [
                {
                    msg: "Invalid token data"
                }
            ]
        });
    }

    try{

        const user = await prisma.user.findFirst({
            where:{
                username: data.username
            }
        });

        if(!user){
            return res.status(401).json({
                errors: [
                    {
                        msg: "Invalid token data"
                    }
                ]
            });
        }

        req.username = user.username;

    }catch(err){
        return res.status(401).json({
            errors: [
                {
                    msg: ErrorHandler(err)
                }
            ]
        });
    }

    next();
}