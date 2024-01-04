import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class UpdateUserDto {
    @ApiProperty()
    headPic: string;

    @ApiProperty()
    nickName: string;
    
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
