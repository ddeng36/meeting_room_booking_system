import { IsEmail, IsNotEmpty } from "class-validator";

export class UpdateUserDto {

    headPic: string;

    nickName: string;
    
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
