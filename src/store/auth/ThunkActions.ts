import {createAsyncThunk} from "@reduxjs/toolkit";
import {iGoogleUserData, iLoginCredentials, iAuthResponse} from "./Types";
import Cookies from "js-cookie";

const setTokens = (accessToken: string, refreshToken: string) => {
	localStorage.setItem("access_token", accessToken);
	Cookies.set("refresh_token", refreshToken, {expires: 7}); // Cookie expires in 7 days
};

export const login = createAsyncThunk(
	"auth/login",
	async (credentials: iLoginCredentials) => {
		const response = await fetch("http://localhost:3080/api/auth/login", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(credentials),
		});

		if (!response.ok) {
			throw new Error("Failed to login");
		}

		const data: iAuthResponse = await response.json();
		setTokens(data.data.token.accessToken, data.data.token.refreshToken);
		return data;
	},
);

export const handleGoogleCallback = createAsyncThunk(
	"auth/handleGoogleCallback",
	async (userData: iGoogleUserData) => {
		const response = await fetch(
			"http://localhost:3080/api/auth/google/callback",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(userData),
			},
		);

		if (!response.ok) {
			throw new Error("Failed to authenticate");
		}

		const data: iAuthResponse = await response.json();
		setTokens(data.data.token.accessToken, data.data.token.refreshToken);
		return data;
	},
);
