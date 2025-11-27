import bcrypt from "bcryptjs";

//For doing hashing 
export async function hashPassword(password:string) : Promise<string>{
    return bcrypt.hash(password,10)
}
// To retrieving hashing
export async function verifyPassword(password:string,hash:string) : Promise<boolean> {
    return bcrypt.compare(password,hash)
}