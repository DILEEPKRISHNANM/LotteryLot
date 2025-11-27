import { cookies } from 'next/headers';

export const COOKIE_NAME = 'lotterylot_token';
export const MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

export async function setAuthCookie(token:string){
    (await cookies()).set(COOKIE_NAME,token,{
        httpOnly:true,
        secure:process.env.NODE_ENV === 'production',
        sameSite:'lax',
        maxAge:MAX_AGE,
        path:'/',
    })
}


export async function getAuthCookie(): Promise<string | undefined> {
    return (await cookies()).get(COOKIE_NAME)?.value;
}

export async function deleteAuthCookie(){
    (await cookies()).delete(COOKIE_NAME);
}