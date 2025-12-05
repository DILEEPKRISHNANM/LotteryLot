import { getLatestResult } from "@/lib/api/lottery-api";
import { requireAuth } from "@/lib/auth/middleware";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try{
        const user = await requireAuth(request);
        const result = await getLatestResult();
        return NextResponse.json({
            success:true,
            result:result
        },{status:200});
    }catch(error){
        if(error instanceof Response){
            return error;
        }
        console.error('Latest result error:',error);
        return NextResponse.json({
            
           error: 'Failed to fetch latest lottery result',
           message: error instanceof Error ? error.message : 'Unknown error'
        
        },{status:500});
    }
}