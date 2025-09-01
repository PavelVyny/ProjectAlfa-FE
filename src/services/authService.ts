import axios from "axios";
import { RegisterDto, LoginDto, AuthResponseDto } from "../types/auth";

// Создаем экземпляр axios с базовым URL
const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_URL || "https://project-alfa-backend-[hash]-[region].run.app";

const authApi = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

// Добавляем перехватчик для добавления токена к запросам
authApi.interceptors.request.use((config) => {
	const token = localStorage.getItem("auth_token");
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

export const authService = {
	// Регистрация пользователя
	async register(data: RegisterDto): Promise<AuthResponseDto> {
		const response = await authApi.post("/auth/register", data);
		return response.data;
	},

	// Вход пользователя
	async login(data: LoginDto): Promise<AuthResponseDto> {
		const response = await authApi.post("/auth/login", data);
		return response.data;
	},

	// Выход пользователя
	logout(): void {
		localStorage.removeItem("auth_token");
		localStorage.removeItem("user_data");
	},

	// Сохранение данных аутентификации
	saveAuthData(data: AuthResponseDto): void {
		localStorage.setItem("auth_token", data.access_token);
		localStorage.setItem("user_data", JSON.stringify(data.user));
	},

	// Получение сохраненного токена
	getToken(): string | null {
		return localStorage.getItem("auth_token");
	},

	// Get user data
	getUser(): {
		id: string;
		email: string;
		firstName?: string;
		lastName?: string;
		firebaseUid?: string;
	} | null {
		const userData = localStorage.getItem("user_data");
		return userData ? JSON.parse(userData) : null;
	},

	// Проверка аутентификации
	isAuthenticated(): boolean {
		return !!this.getToken();
	},
};
