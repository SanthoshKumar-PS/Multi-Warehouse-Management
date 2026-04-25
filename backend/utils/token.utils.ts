import jwt from 'jsonwebtoken'
export const generateToken = (payload:any) => {
    return jwt.sign(payload,"JWT_SECRET",{expiresIn:'7d'})
}