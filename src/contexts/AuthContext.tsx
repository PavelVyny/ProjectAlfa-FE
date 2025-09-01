"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthState } from "../types/auth";
import { authService } from "../services/authService";

interface AuthContextType extends AuthState {
	login: (email: string, password: string) => Promise<void>;
	register: (
		email: string,
		password: string,
		firstName?: string,
		lastName?: string,
	) => Promise<void>;
	logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [authState, setAuthState] = useState<AuthState>({
		user: null,
		token: null,
		isAuthenticated: false,
	});

	// Initialize state on load
	useEffect(() => {
		const token = authService.getToken();
		const user = authService.getUser();

		if (token && user) {
			setAuthState({
				user,
				token,
				isAuthenticated: true,
			});
		}
	}, []);

	const login = async (email: string, password: string) => {
		try {
			const response = await authService.login({ email, password });
			authService.saveAuthData(response);

			setAuthState({
				user: response.user,
				token: response.access_token,
				isAuthenticated: true,
			});
		} catch (error) {
			console.error("Login error:", error);
			throw error;
		}
	};

	const register = async (
		email: string,
		password: string,
		firstName?: string,
		lastName?: string,
	) => {
		try {
			const response = await authService.register({ email, password, firstName, lastName });
			authService.saveAuthData(response);

			setAuthState({
				user: response.user,
				token: response.access_token,
				isAuthenticated: true,
			});
		} catch (error) {
			console.error("Register error:", error);
			throw error;
		}
	};

	const logout = () => {
		authService.logout();
		setAuthState({
			user: null,
			token: null,
			isAuthenticated: false,
		});
	};

	const value: AuthContextType = {
		...authState,
		login,
		register,
		logout,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
