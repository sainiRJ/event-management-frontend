import React, {useEffect, useRef, useState} from "react";
import {Camera, Lock, User, Mail, Save} from "lucide-react";
import {toast} from "sonner";

import {useAppDispatch, useAppSelector} from "@/store/Hooks";
import {RootState} from "@/store";
import {
	fetchProfile,
	updateProfile,
	uploadProfilePhoto,
	changePassword,
} from "@/store/user/ThunkActions";
import Input from "../ui/Input";
import Button from "../ui/Button";

const ProfilePage: React.FC = () => {
	const dispatch = useAppDispatch();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const {profile} = useAppSelector((state: RootState) => state.userReducer);
	const {user: authUser} = useAppSelector(
		(state: RootState) => state.authReducer,
	);

	const [profileForm, setProfileForm] = useState({name: "", email: ""});
	const [profileErrors, setProfileErrors] = useState<Record<string, string>>(
		{},
	);
	const [savingProfile, setSavingProfile] = useState(false);
	const [uploadingPhoto, setUploadingPhoto] = useState(false);

	const [passwordForm, setPasswordForm] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});
	const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>(
		{},
	);
	const [savingPassword, setSavingPassword] = useState(false);

	useEffect(() => {
		dispatch(fetchProfile());
	}, [dispatch]);

	useEffect(() => {
		const source = profile || authUser;
		if (source) {
			setProfileForm({
				name: source.name || "",
				email: source.email || "",
			});
		}
	}, [profile, authUser]);

	const handlePhotoClick = () => fileInputRef.current?.click();

	const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (file.size > 5 * 1024 * 1024) {
			toast.error("Photo must be smaller than 5MB");
			return;
		}
		if (!file.type.startsWith("image/")) {
			toast.error("Please select an image file");
			return;
		}

		setUploadingPhoto(true);
		try {
			const response: any = await dispatch(uploadProfilePhoto(file));
			if (response?.meta?.requestStatus === "fulfilled") {
				toast.success("Profile photo updated");
			} else {
				toast.error(
					response?.payload?.message?.error?.message ||
						"Failed to upload photo",
				);
			}
		} catch (err) {
			toast.error("Failed to upload photo");
		} finally {
			setUploadingPhoto(false);
			if (fileInputRef.current) fileInputRef.current.value = "";
		}
	};

	const validateProfile = () => {
		const errors: Record<string, string> = {};
		if (!profileForm.name.trim()) errors.name = "Name is required";
		if (!profileForm.email.trim()) {
			errors.email = "Email is required";
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email)) {
			errors.email = "Enter a valid email address";
		}
		setProfileErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleProfileSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!validateProfile()) return;

		setSavingProfile(true);
		try {
			const response: any = await dispatch(updateProfile(profileForm));
			if (response?.meta?.requestStatus === "fulfilled") {
				toast.success("Profile updated successfully");
				setProfileErrors({});
			} else {
				toast.error(
					response?.payload?.message?.error?.message ||
						"Failed to update profile",
				);
			}
		} catch (err) {
			toast.error("Failed to update profile");
		} finally {
			setSavingProfile(false);
		}
	};

	const validatePassword = () => {
		const errors: Record<string, string> = {};
		if (!passwordForm.currentPassword)
			errors.currentPassword = "Current password is required";
		if (!passwordForm.newPassword) {
			errors.newPassword = "New password is required";
		} else if (passwordForm.newPassword.length < 8) {
			errors.newPassword = "Password must be at least 8 characters";
		}
		if (passwordForm.confirmPassword !== passwordForm.newPassword) {
			errors.confirmPassword = "Passwords do not match";
		}
		setPasswordErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handlePasswordSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!validatePassword()) return;

		setSavingPassword(true);
		try {
			const response: any = await dispatch(
				changePassword({
					currentPassword: passwordForm.currentPassword,
					newPassword: passwordForm.newPassword,
				}),
			);
			if (response?.meta?.requestStatus === "fulfilled") {
				toast.success("Password changed successfully");
				setPasswordForm({
					currentPassword: "",
					newPassword: "",
					confirmPassword: "",
				});
				setPasswordErrors({});
			} else {
				toast.error(
					response?.payload?.message?.error?.message ||
						"Failed to change password. Check your current password.",
				);
			}
		} catch (err) {
			toast.error("Failed to change password");
		} finally {
			setSavingPassword(false);
		}
	};

	const initials = (profileForm.name || "A")
		.split(" ")
		.map((p) => p[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();

	return (
		<div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
			<div>
				<h1 className="text-3xl font-display font-semibold text-[#2B2129]">
					Account Settings
				</h1>
				<p className="text-sm text-gray-500 mt-1">
					Manage your profile photo, details, and password
				</p>
			</div>

			{/* Photo + basic info */}
			<div className="glass-card p-8">
				<div className="flex items-center gap-6 mb-8">
					<div className="relative shrink-0">
						{profile?.photoUrl ? (
							<img
								src={profile.photoUrl}
								alt="Profile"
								className="w-20 h-20 rounded-2xl object-cover border border-brand-100"
							/>
						) : (
							<div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center text-xl font-black">
								{initials}
							</div>
						)}
						<button
							type="button"
							onClick={handlePhotoClick}
							disabled={uploadingPhoto}
							aria-label="Change profile photo"
							className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-white border border-brand-100 shadow-sm flex items-center justify-center text-brand-600 hover:bg-brand-50 transition-colors disabled:opacity-50"
						>
							<Camera className="w-4 h-4" />
						</button>
						<input
							ref={fileInputRef}
							type="file"
							accept="image/*"
							className="hidden"
							onChange={handlePhotoChange}
						/>
					</div>
					<div>
						<p className="font-black text-lg text-[#2B2129]">
							{profileForm.name || "Admin"}
						</p>
						<p className="text-sm text-gray-500">{profileForm.email}</p>
						{uploadingPhoto && (
							<p className="text-xs text-brand-600 mt-1 font-bold">
								Uploading photo...
							</p>
						)}
					</div>
				</div>

				<form onSubmit={handleProfileSubmit} className="space-y-5">
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
						<Input
							label="Full Name"
							icon={<User className="w-4 h-4" />}
							value={profileForm.name}
							onChange={(e) =>
								setProfileForm((p) => ({...p, name: e.target.value}))
							}
							error={profileErrors.name}
						/>
						<Input
							label="Email Address"
							type="email"
							icon={<Mail className="w-4 h-4" />}
							value={profileForm.email}
							onChange={(e) =>
								setProfileForm((p) => ({...p, email: e.target.value}))
							}
							error={profileErrors.email}
						/>
					</div>
					<div className="flex justify-end">
						<Button type="submit" variant="primary" disabled={savingProfile}>
							<Save className="w-4 h-4" />
							{savingProfile ? "Saving..." : "Save Changes"}
						</Button>
					</div>
				</form>
			</div>

			{/* Password change */}
			<div className="glass-card p-8">
				<div className="flex items-center gap-2 mb-6">
					<Lock className="w-4 h-4 text-brand-600" />
					<h2 className="text-lg font-display font-semibold text-[#2B2129]">
						Change Password
					</h2>
				</div>
				<form onSubmit={handlePasswordSubmit} className="space-y-5">
					<Input
						label="Current Password"
						type="password"
						value={passwordForm.currentPassword}
						onChange={(e) =>
							setPasswordForm((p) => ({
								...p,
								currentPassword: e.target.value,
							}))
						}
						error={passwordErrors.currentPassword}
					/>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
						<Input
							label="New Password"
							type="password"
							value={passwordForm.newPassword}
							onChange={(e) =>
								setPasswordForm((p) => ({
									...p,
									newPassword: e.target.value,
								}))
							}
							error={passwordErrors.newPassword}
						/>
						<Input
							label="Confirm New Password"
							type="password"
							value={passwordForm.confirmPassword}
							onChange={(e) =>
								setPasswordForm((p) => ({
									...p,
									confirmPassword: e.target.value,
								}))
							}
							error={passwordErrors.confirmPassword}
						/>
					</div>
					<div className="flex justify-end">
						<Button type="submit" variant="primary" disabled={savingPassword}>
							{savingPassword ? "Updating..." : "Update Password"}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default ProfilePage;
