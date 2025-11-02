import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    register(registerDto: RegisterDto): Promise<{
        access_token: string;
        user: {
            id: unknown;
            email: string;
            name: string;
            role: import("../common/enums").UserRole;
            language: string;
            company: string;
            avatar: string;
        };
    }>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: unknown;
            email: string;
            name: string;
            role: import("../common/enums").UserRole;
            language: string;
            company: string;
            avatar: string;
        };
    }>;
}
