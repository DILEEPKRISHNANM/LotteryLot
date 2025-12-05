import { decodeAccessToken } from "@/lib/auth/jwt";


//Helper function to get authenticated user from request
export async function getAuthUser(request:Request){
    const authHeader = request.headers.get('authorization');
    if(!authHeader || !authHeader.startsWith('Bearer ')){
        return null;
    }
    const token = authHeader.substring(7);
    return decodeAccessToken(token);
}

// Helper to require Authntication

export async function requireAuth(request:Request){
    const user = await getAuthUser(request);
    if(!user){
        throw new Response(
            JSON.stringify({error:'Unauthorized'}),
            {status:401}
        )
    }
    return user;
}