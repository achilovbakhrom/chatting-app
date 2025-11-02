import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
