import React, {useState, useRef} from "react";
import {useSelector} from "react-redux";
import {RootState} from "@/store/RootReducer";
import {iService} from "@/store/services/Types";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Select from "../ui/Select";
import { toast } from "sonner";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";

interface PhotoUploadModalProps {
	open: boolean;
	onClose: () => void;
}

const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({open, onClose}) => {
	const [selectedService, setSelectedService] = useState<string>("");
	const [file, setFile] = useState<File | null>(null);
	const [preview, setPreview] = useState<string | null>(null);
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
		const selectedFile = e.target.files?.[0];
		if (selectedFile) {
			if (selectedFile.size > 5 * 1024 * 1024) {
				toast.error("File size must be less than 5MB");
				return;
			}
			setFile(selectedFile);
			const reader = new FileReader();
			reader.onloadend = () => {
				setPreview(reader.result as string);
			};
			reader.readAsDataURL(selectedFile);
		}
	};

	const removeFile = () => {
		setFile(null);
		setPreview(null);
		if (fileInputRef.current) fileInputRef.current.value = "";
	};

	const handleUpload = async () => {
		if (!selectedService) {
			toast.error("Please select a service");
			return;
		}

		if (!file) {
			toast.error("Please select a photo to upload");
			return;
		}

		setIsUploading(true);
		const formData = new FormData();
		formData.append("serviceId", selectedService);
		formData.append("photo", file);

		try {
			const response = await fetch(
				`${process.env.REACT_APP_EVENT_MANAGEMENT_BACKEND_BASEURL}/photo/upload`,
				{
					method: "POST",
					body: formData,
				},
			);

			if (response.ok) {
				toast.success("Photo uploaded successfully");
				removeFile();
				setSelectedService("");
				onClose();
			} else {
				throw new Error("Upload failed");
			}
		} catch (error) {
			toast.error("Failed to upload photo. Please try again.");
		} finally {
			setIsUploading(false);
		}
	};

	return (
		<Modal 
			isOpen={open} 
			onClose={onClose} 
			title="Upload Service Photo"
			footer={
				<>
					<Button variant="ghost" onClick={onClose} disabled={isUploading}>Cancel</Button>
					<Button onClick={handleUpload} isLoading={isUploading} disabled={!file || !selectedService}>
						Start Upload
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

				<div className="space-y-2">
					<label className="block text-sm font-medium text-gray-700">Photo Attachment</label>
					
					{!preview ? (
						<div 
							onClick={() => fileInputRef.current?.click()}
							className="border-2 border-dashed border-gray-200 rounded-[2rem] p-12 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-indigo-50/30 hover:border-indigo-200 transition-all cursor-pointer group"
						>
							<div className="p-4 bg-white rounded-2xl shadow-sm text-gray-400 group-hover:text-indigo-600 group-hover:scale-110 transition-all mb-4">
								<Upload className="w-8 h-8" />
							</div>
							<p className="text-sm font-bold text-gray-900 mb-1">Click to select photo</p>
							<p className="text-xs text-gray-400 font-medium">PNG, JPG or WEBP (Max 5MB)</p>
							<input 
								ref={fileInputRef}
								type="file" 
								className="hidden" 
								accept="image/*" 
								onChange={handleFileChange} 
							/>
						</div>
					) : (
						<div className="relative group rounded-[2rem] overflow-hidden border border-gray-100 shadow-xl">
							<img src={preview} alt="Preview" className="w-full h-64 object-cover" />
							<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
								<button 
									onClick={removeFile}
									className="p-3 bg-rose-600 text-white rounded-2xl shadow-lg hover:bg-rose-700 active:scale-95 transition-all"
								>
									<X className="w-6 h-6" />
								</button>
							</div>
							<div className="absolute bottom-4 left-4 right-4 p-3 bg-white/90 backdrop-blur-md rounded-xl flex items-center gap-3">
								<ImageIcon className="w-4 h-4 text-indigo-600" />
								<span className="text-xs font-bold text-gray-900 truncate">{file?.name}</span>
								<span className="text-[10px] font-black text-gray-400 ml-auto">{(file!.size / 1024 / 1024).toFixed(2)} MB</span>
							</div>
						</div>
					)}
				</div>

				<div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex gap-3">
					<div className="p-1 bg-white rounded-lg text-amber-600 h-fit shadow-sm">
						<Upload className="w-4 h-4" />
					</div>
					<p className="text-xs font-medium text-amber-800 leading-relaxed">
						Ensure the photo is high quality and clearly shows the decoration setup. These photos will be visible to potential clients.
					</p>
				</div>
			</div>
		</Modal>
	);
};

export default PhotoUploadModal;
