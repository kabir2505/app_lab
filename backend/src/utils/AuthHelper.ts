import jsonwebtoken from "jsonwebtoken";
import { UserRole } from "./Enums";
import { json } from "body-parser";

export class AuthHelper {
    static generateJWTToken(
        userId: number,
        userEmail: string,
        userRole: UserRole
    ): string{

        return jsonwebtoken.sign(
            {
                id: userId,
                email: userEmail,
                role: userRole
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "10d",
            }
        )
    }
}


// const payload = jsonwebtoken.verify(token, JWT_SECRET);
// req.user = payload; //contains id, email, role

// if (req.user.role!= UserRole.ADMIN) throw Forbidded