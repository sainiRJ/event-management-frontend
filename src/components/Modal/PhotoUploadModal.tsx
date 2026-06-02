import React, {useState, useRef} from "react";
import {useSelector} from "react-redux";
import {RootState} from "@/store/RootReducer";
import {iService} from "@/store/services/Types";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Select from "../ui/Select";
import {toast} from "sonner";
import {Upload, X, Image as ImageIcon} from "lucide-react";

interface PhotoUploadModalProps {
	open: boolean;
	onClose: () => void;
}

const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({open, onClose}) => {
	const [selectedService, setSelectedService] = useState<string>("");
	const [files, setFiles] = useState<File[]>([]);
	const [previews, setPreviews] = useState<string[]>([]);
	const [isUploading, setIsUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const services = useSelector(
		(state: RootState) => state.serviceReducer.serviceList,
	);
	const serviceOptions = services.map((service: iService) => ({
		value: service.id,
		label: service.serviceName,
	}));

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFiles = Array.from(e.target.files || []);
		const validFiles: File[] = [];
		const newPreviews: string[] = [];

		selectedFiles.forEach((file) => {
			// if (file.size > 5 * 1024 * 1024) {
			// 	toast.error(`${file.name} is too large (max 5MB)`);
			// 	return;
			// }
			validFiles.push(file);
			const reader = new FileReader();
			reader.onloadend = () => {
				setPreviews((prev) => [...prev, reader.result as string]);
			};
			reader.readAsDataURL(file);
		});

		setFiles((prev) => [...prev, ...validFiles]);
	};

	const removeFile = (index: number) => {
		setFiles((prev) => prev.filter((_, i) => i !== index));
		setPreviews((prev) => prev.filter((_, i) => i !== index));
		if (fileInputRef.current) fileInputRef.current.value = "";
	};

	const resetForm = () => {
		setFiles([]);
		setPreviews([]);
		setSelectedService("");
		if (fileInputRef.current) fileInputRef.current.value = "";
	};

	const handleUpload = async () => {
		if (!selectedService) {
			toast.error("Please select a service");
			return;
		}

		if (files.length === 0) {
			toast.error("Please select at least one photo to upload");
			return;
		}

		setIsUploading(true);
		const formData = new FormData();
		formData.append("serviceId", selectedService);
		files.forEach((file) => {
			formData.append("photos", file);
		});

		try {
			const response = await fetch(
				`${process.env.REACT_APP_EVENT_MANAGEMENT_BACKEND_BASEURL}/photo/upload`,
				{
					method: "POST",
					body: formData,
				},
			);

			if (response.ok) {
				toast.success("Photos uploaded successfully");
				resetForm();
				onClose();
			} else {
				throw new Error("Upload failed");
			}
		} catch (error) {
			toast.error("Failed to upload photos. Please try again.");
		} finally {
			setIsUploading(false);
		}
	};

	return (
		<Modal
			isOpen={open}
			onClose={onClose}
			title="Upload Service Photos"
			footer={
				<>
					<Button variant="ghost" onClick={onClose} disabled={isUploading}>
						Cancel
					</Button>
					<Button
						onClick={handleUpload}
						isLoading={isUploading}
						disabled={files.length === 0 || !selectedService}
					>
						Start Upload ({files.length})
					</Button>
				</>
			}
		>
			<div className="space-y-6">
				<Select
					label="Target Service"
					options={serviceOptions}
					value={selectedService}
					onChange={(e) => setSelectedService(e.target.value)}
					placeholder="Which service is this for?"
				/>

				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<label className="block text-sm font-medium text-gray-700">
							Photo Attachments
						</label>
						{files.length > 0 && (
							<button
								onClick={() => fileInputRef.current?.click()}
								className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
							>
								Add More
							</button>
						)}
					</div>

					{previews.length === 0 ? (
						<div
							onClick={() => fileInputRef.current?.click()}
							className="border-2 border-dashed border-gray-200 rounded-[2rem] p-12 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-indigo-50/30 hover:border-indigo-200 transition-all cursor-pointer group"
						>
							<div className="p-4 bg-white rounded-2xl shadow-sm text-gray-400 group-hover:text-indigo-600 group-hover:scale-110 transition-all mb-4">
								<Upload className="w-8 h-8" />
							</div>
							<p className="text-sm font-bold text-gray-900 mb-1">
								Click to select photos
							</p>
							<p className="text-xs text-gray-400 font-medium">
								PNG, JPG or WEBP (Max 5MB each)
							</p>
							<input
								ref={fileInputRef}
								type="file"
								className="hidden"
								accept="image/*"
								multiple
								onChange={handleFileChange}
							/>
						</div>
					) : (
						<div className="grid grid-cols-2 gap-4">
							{previews.map((preview, index) => (
								<div key={index} className="relative group rounded-2xl overflow-hidden border border-gray-100 shadow-sm h-40">
									<img
										src={preview}
										alt={`Preview ${index}`}
										className="w-full h-full object-cover"
									/>
									<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
										<button
											onClick={() => removeFile(index)}
											className="p-2 bg-rose-600 text-white rounded-xl shadow-lg hover:bg-rose-700 active:scale-95 transition-all"
										>
											<X className="w-4 h-4" />
										</button>
									</div>
									<div className="absolute bottom-2 left-2 right-2 p-2 bg-white/90 backdrop-blur-md rounded-lg flex items-center gap-2">
										<span className="text-[10px] font-bold text-gray-900 truncate flex-1">
											{files[index]?.name}
										</span>
									</div>
								</div>
							))}
							<div
								onClick={() => fileInputRef.current?.click()}
								className="border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center bg-gray-50/50 hover:bg-indigo-50/30 hover:border-indigo-200 transition-all cursor-pointer group h-40"
							>
								<Upload className="w-6 h-6 text-gray-400 group-hover:text-indigo-600 transition-colors" />
								<span className="text-[10px] font-bold text-gray-500 mt-2">Add More</span>
								<input
									ref={fileInputRef}
									type="file"
									className="hidden"
									accept="image/*"
									multiple
									onChange={handleFileChange}
								/>
							</div>
						</div>
					)}
				</div>

				<div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex gap-3">
					<div className="p-1 bg-white rounded-lg text-amber-600 h-fit shadow-sm">
						<Upload className="w-4 h-4" />
					</div>
					<p className="text-xs font-medium text-amber-800 leading-relaxed">
						Ensure the photo is high quality and clearly shows the decoration
						setup. These photos will be visible to potential clients.
					</p>
				</div>
			</div>
		</Modal>
	);
};

export default PhotoUploadModal;
