import { deleteAuthCookie } from "@/lib/auth/cookies";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try{
        await deleteAuthCookie();
        return NextResponse.json({message:'Logged out successfully'},{status:200});
    }catch(error){
        console.error('Logout error:',error);
        return NextResponse.json({error:'Internal server error'},{status:500});
    }
}