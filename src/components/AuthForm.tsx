"use client";

import { useState, type FormEvent } from "react";
import { isAxiosError } from "axios";
import api from "@/lib/api";
import styles from "./RegistrationForm.module.css";

interface AuthFormProps {
	notice?: string;
	onAuthenticated: (token: string) => void;
}

export default function AuthForm({ notice, onAuthenticated }: AuthFormProps) {
	const [isRegistering, setIsRegistering] = useState(false);
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError("");
		setIsLoading(true);

		try {
			if (isRegistering) {
				await api.post("/auth/register", {
					first_name: firstName,
					last_name: lastName,
					email,
					password,
				});
			}

			const response = await api.post<{ token?: unknown }>("/auth/login", { email, password });
			if (typeof response.data.token !== "string") {
				throw new Error("The server did not return a sign-in token.");
			}
			onAuthenticated(response.data.token);
		} catch (caughtError) {
			const responseMessage = isAxiosError(caughtError) &&
				typeof caughtError.response?.data?.message === "string"
				? caughtError.response.data.message
				: null;
			setError(responseMessage ?? (caughtError instanceof Error ? caughtError.message : "Could not sign in. Please try again."));
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<form className={styles.form} onSubmit={handleSubmit}>
			<h2>{isRegistering ? "Create account" : "Sign in to book"}</h2>
			{notice && <p role="status">{notice}</p>}
			{error && <p role="alert" className={styles.error}>{error}</p>}

			{isRegistering && (
				<>
					<div className={styles.field}>
						<label htmlFor="auth-first-name">First name</label>
						<input id="auth-first-name" autoComplete="given-name" required maxLength={100} value={firstName} onChange={(event) => setFirstName(event.currentTarget.value)} disabled={isLoading} />
					</div>
					<div className={styles.field}>
						<label htmlFor="auth-last-name">Last name</label>
						<input id="auth-last-name" autoComplete="family-name" required maxLength={100} value={lastName} onChange={(event) => setLastName(event.currentTarget.value)} disabled={isLoading} />
					</div>
				</>
			)}

			<div className={styles.field}>
				<label htmlFor="auth-email">Email</label>
				<input id="auth-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.currentTarget.value)} disabled={isLoading} />
			</div>
			<div className={styles.field}>
				<label htmlFor="auth-password">Password</label>
				<input id="auth-password" type="password" autoComplete={isRegistering ? "new-password" : "current-password"} minLength={isRegistering ? 8 : undefined} required value={password} onChange={(event) => setPassword(event.currentTarget.value)} disabled={isLoading} />
			</div>

			<button type="submit" disabled={isLoading}>
				{isLoading ? "Please wait..." : isRegistering ? "Create account" : "Sign in"}
			</button>
			<button
				type="button"
				className={styles.switchMode}
				disabled={isLoading}
				onClick={() => {
					setIsRegistering((current) => !current);
					setError("");
				}}
			>
				{isRegistering ? "Already have an account? Sign in" : "New to CoSpace? Create an account"}
			</button>
		</form>
	);
}