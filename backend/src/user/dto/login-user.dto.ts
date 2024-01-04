import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class LoginUserDto {

    @IsNotEmpty({
        message: "username cannot be empty"
    })
    @ApiProperty()
    username: string;
    
    @IsNotEmpty({
        message: 'password cannot be empty'
    })
    @ApiProperty()
    password: string;    
}
