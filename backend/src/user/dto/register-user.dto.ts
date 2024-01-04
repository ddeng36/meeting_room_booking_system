import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

export class RegisterUserDto {

    @IsNotEmpty({
        message: "username cannot be empty"
    })
    username: string;
    
    @IsNotEmpty({
        message: 'nickname cannot be empty'
    })
    nickName: string;
    
    @IsNotEmpty({
        message: 'password cannot be empty'
    })
    @MinLength(6, {
        message: 'password cannot be less than 6 characters'
    })
    password: string;
    
    @IsNotEmpty({
        message: 'email cannot be empty'
    })
    @IsEmail({}, {
        message: 'invalid email format'
    })
    email: string;
    
    @IsNotEmpty({
        message: 'captcha cannot be empty'
    })
    captcha: string;
}
