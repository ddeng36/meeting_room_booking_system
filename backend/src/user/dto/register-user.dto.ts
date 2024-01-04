import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

export class RegisterUserDto {

    @IsNotEmpty({
        message: "username cannot be empty"
    })
    @ApiProperty()
    username: string;
    
    @IsNotEmpty({
        message: 'nickname cannot be empty'
    })
    @ApiProperty()
    nickName: string;
    
    @IsNotEmpty({
        message: 'password cannot be empty'
    })
    @MinLength(6, {
        message: 'password cannot be less than 6 characters'
    })
    @ApiProperty({
        minLength: 6
    })
    password: string;
    
    @IsNotEmpty({
        message: 'email cannot be empty'
    })
    @IsEmail({}, {
        message: 'invalid email format'
    })
    @ApiProperty()
    email: string;
    
    @IsNotEmpty({
        message: 'captcha cannot be empty'
    })
    @ApiProperty()
    captcha: string;
}
