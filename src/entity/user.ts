import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { Length, IsEmail, IsJWT } from "class-validator";

import * as bcrypt from "bcryptjs";
import * as jwt from "koa-jwt";
import * as jsonwebtoken from "jsonwebtoken";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        length: 80
    })
    @Length(2, 80)
    userName: string;

    @Column({
        length: 80,
        nullable: true,
    })
    @Length(2, 80)
    firstName: string;

    @Column({
        length: 80,
        nullable: true,
    })
    @Length(2, 80)
    lastName: string;

    @Column({
        length: 80
    })
    @Length(2, 80)
    password: string;

    @Column({
        length: 100
    })
    @Length(10, 100)
    @IsEmail()
    email: string;

    isValidPassword = (password: string): boolean => {
        return bcrypt.compareSync(password, this.password);
    }

    setPassword = (password: string): string => {
        return (this.password = bcrypt.hashSync(password, 8));
    }

    generateJWT = (): string => {
        return jsonwebtoken.sign(
            {
                email: this.email,
            },
            "SECRET",
            { expiresIn: "1h" }
        );
    }
}

export const userSchema = {
    id: { type: "number", required: true, example: 1 },
    userName: { type: "string", required: true, example: "Seb" },
    firstName: { type: "string", required: true, example: "Seb" },
    lastName: { type: "string", required: true, example: "Se" },
    password: { type: "string", required: true, example: "seb" },
    email: { type: "string", required: true, example: "s@s.com" }
};