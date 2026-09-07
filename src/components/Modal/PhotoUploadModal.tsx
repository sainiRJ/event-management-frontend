import React, {useEffect, useMemo, useRef, useState} from "react";
import {useSelector} from "react-redux";
import {toast} from "sonner";
import {ImagePlus, UploadCloud, X} from "lucide-react";

import {RootState} from "@/store/RootReducer";
import {iService} from "@/store/services/Types";
import {operationsService} from "@/services/api/eventManagementServer";
import {httpStatusCodes} from "@/customTypes/NetworkTypes";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Select from "../ui/Select";

interface iPhotoUploadModalProps {
	open: boolean;
	onClose: () => void;
	/** Called after at least one photo landed, so the gallery can refresh. */
	onUploaded?: () => void;
}

interface iQueued {
	id: string;
	file: File;
	preview: string;
	serviceId: string;
	/** True when the service came from the filename, not a click. */
	isGuessed: boolean;
}

const MAX_BYTES = 5 * 1024 * 1024;
const MAX_FILES = 10;

/**
 * Best-effort service from a filename: "mandap_03.jpg" -> Mandap. Matches
 * the longest service name that appears in the name, so "car" does not
 * steal "carnival stage" if such a service ever exists.
 */
function guessService(fileName: string, services: iService[]): string {
	const haystack = fileName.toLowerCase().replace(/[^a-z0-9]+/g, " ");
	const ranked = [...services].sort((a, b) => {
		return b.serviceName.length - a.serviceName.length;
	});
	for (const service of ranked) {
		const needle = service.serviceName
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, " ");
		if (needle && haystack.includes(needle)) {
			return service.id;
		}
	}
	return "";
}

/**
 * Drop a folder of photos, sort them into services, upload. Files are
 * grouped by service and sent in batches of up to ten, which is what the
 * API accepts per request.
 */
const PhotoUploadModal: React.FC<iPhotoUploadModalProps> = ({
	open,
	onClose,
	onUploaded,
}) => {
	const services = useSelector((state: RootState) => {
		return state.serviceReducer.serviceList;
	});
	const [queue, setQueue] = useState<iQueued[]>([]);
	const [defaultService, setDefaultService] = useState("");
	const [isDragging, setIsDragging] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [progress, setProgress] = useState({done: 0, total: 0});
	const inputRef = useRef<HTMLInputElement>(null);

	const serviceOptions = useMemo(() => {
		return [
			{value: "", label: "Choose a service"},
			...services.map((service: iService) => {
				return {value: service.id, label: service.serviceName};
			}),
		];
	}, [services]);

	/* Previews are object URLs; release them when the modal unmounts. */
	const queueRef = useRef<iQueued[]>([]);
	queueRef.current = queue;
	useEffect(() => {
		return () => {
			queueRef.current.forEach((item) => {
				URL.revokeObjectURL(item.preview);
			});
		};
	}, []);

	const addFiles = (list: FileList | File[] | null) => {
		if (!list) return;
		const incoming = Array.from(list).filter((file) => {
			if (!file.type.startsWith("image/")) {
				toast.error(`${file.name} is not an image`);
				return false;
			}
			if (file.size > MAX_BYTES) {
				toast.error(`${file.name} is over 5 MB`);
				return false;
			}
			return true;
		});
		setQueue((current) => {
			const room = Math.max(0, 50 - current.length);
			return [
				...current,
				...incoming.slice(0, room).map((file) => {
					const guessed = guessService(file.name, services);
					return {
						id: `${file.name}-${file.size}-${Math.random()
							.toString(36)
							.slice(2)}`,
						file,
						preview: URL.createObjectURL(file),
						serviceId: guessed || defaultService,
						isGuessed: Boolean(guessed),
					};
				}),
			];
		});
	};

	const applyDefault = (serviceId: string) => {
		setDefaultService(serviceId);
		setQueue((current) => {
			return current.map((item) => {
				return item.serviceId && item.isGuessed
					? item
					: {...item, serviceId, isGuessed: false};
			});
		});
	};

	const setItemService = (id: string, serviceId: string) => {
		setQueue((current) => {
			return current.map((item) => {
				return item.id === id ? {...item, serviceId, isGuessed: false} : item;
			});
		});
	};

	const remove = (id: string) => {
		setQueue((current) => {
			const target = current.find((item) => {
				return item.id === id;
			});
			if (target) URL.revokeObjectURL(target.preview);
			return current.filter((item) => {
				return item.id !== id;
			});
		});
	};

	const reset = () => {
		queue.forEach((item) => {
			URL.revokeObjectURL(item.preview);
		});
		setQueue([]);
		setDefaultService("");
		setProgress({done: 0, total: 0});
		if (inputRef.current) inputRef.current.value = "";
	};

	const unassigned = queue.filter((item) => {
		return !item.serviceId;
	}).length;

	const upload = async () => {
		if (queue.length === 0) {
			toast.error("Add some photos first");
			return;
		}
		if (unassigned > 0) {
			toast.error(
				`${unassigned} photo${
					unassigned === 1 ? "" : "s"
				} still need a service`,
			);
			return;
		}

		const groups = new Map<string, iQueued[]>();
		queue.forEach((item) => {
			groups.set(item.serviceId, [...(groups.get(item.serviceId) ?? []), item]);
		});

		setIsUploading(true);
		setProgress({done: 0, total: queue.length});
		let uploaded = 0;
		let failed = 0;

		for (const [serviceId, items] of groups) {
			for (let start = 0; start < items.length; start += MAX_FILES) {
				const batch = items.slice(start, start + MAX_FILES);
				const response = await operationsService.uploadPhotos(
					serviceId,
					batch.map((item) => {
						return item.file;
					}),
				);
				if (response?.httpStatusCode === httpStatusCodes.SUCCESS_OK) {
					uploaded += batch.length;
				} else {
					failed += batch.length;
				}
				setProgress({done: uploaded + failed, total: queue.length});
			}
		}

		setIsUploading(false);

		if (uploaded > 0) {
			toast.success(
				`${uploaded} photo${uploaded === 1 ? "" : "s"} uploaded and resized`,
			);
			onUploaded?.();
		}
		if (failed > 0) {
			// Leave the queue in place so the same selection can be retried.
			toast.error(
				`${failed} photo${failed === 1 ? "" : "s"} failed. Try again.`,
			);
			return;
		}
		reset();
		onClose();
	};

	const serviceName = (serviceId: string): string => {
		return (
			services.find((service: iService) => {
				return service.id === serviceId;
			})?.serviceName ?? ""
		);
	};

	return (
		<Modal
			isOpen={open}
			onClose={() => {
				if (isUploading) return;
				onClose();
			}}
			title="Add photos"
			size="lg"
			footer={
				<>
					<Button variant="ghost" onClick={onClose} disabled={isUploading}>
						Cancel
					</Button>
					<Button
						onClick={() => void upload()}
						isLoading={isUploading}
						disabled={queue.length === 0 || unassigned > 0}
					>
						{isUploading
							? `Uploading ${progress.done}/${progress.total}`
							: `Upload ${queue.length || ""}`.trim()}
					</Button>
				</>
			}
		>
			<div className="space-y-5">
				<div
					onDragOver={(e) => {
						e.preventDefault();
						setIsDragging(true);
					}}
					onDragLeave={() => setIsDragging(false)}
					onDrop={(e) => {
						e.preventDefault();
						setIsDragging(false);
						addFiles(e.dataTransfer.files);
					}}
					onClick={() => inputRef.current?.click()}
					role="button"
					tabIndex={0}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
					}}
					className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
						isDragging
							? "border-brand-600 bg-brand-50"
							: "border-ink-300 bg-gray-50 hover:border-brand-400"
					}`}
				>
					<UploadCloud className="h-8 w-8 text-brand-600" />
					<p className="text-sm font-semibold text-ink-900">
						Drop photos here, or tap to choose
					</p>
					<p className="text-xs text-ink-500">
						JPG, PNG or WebP up to 5 MB each. Name files after the service
						(&quot;mandap-01.jpg&quot;) and they sort themselves.
					</p>
					<input
						ref={inputRef}
						type="file"
						accept="image/*"
						multiple
						className="hidden"
						onChange={(e) => {
							addFiles(e.target.files);
							e.target.value = "";
						}}
					/>
				</div>

				{queue.length > 0 && (
					<>
						<Select
							label="Service for photos that didn't sort themselves"
							options={serviceOptions}
							value={defaultService}
							onChange={(e) => applyDefault(e.target.value)}
						/>

						<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
							{queue.map((item) => (
								<div
									key={item.id}
									className={`overflow-hidden rounded-xl border ${
										item.serviceId ? "border-ink-200" : "border-amber-400"
									}`}
								>
									<div className="relative aspect-square bg-ink-100">
										<img
											src={item.preview}
											alt=""
											className="h-full w-full object-cover"
										/>
										<button
											type="button"
											aria-label="Remove"
											onClick={() => remove(item.id)}
											disabled={isUploading}
											className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-ink-900/70 text-white hover:bg-ink-900"
										>
											<X className="h-3 w-3" />
										</button>
										{item.isGuessed && item.serviceId && (
											<span className="absolute bottom-1.5 left-1.5 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold text-white">
												{serviceName(item.serviceId)}
											</span>
										)}
									</div>
									<select
										value={item.serviceId}
										onChange={(e) => setItemService(item.id, e.target.value)}
										disabled={isUploading}
										aria-label={`Service for ${item.file.name}`}
										className="h-9 w-full border-t border-ink-200 bg-white px-2 text-xs outline-none"
									>
										{serviceOptions.map((option) => (
											<option key={option.value} value={option.value}>
												{option.label}
											</option>
										))}
									</select>
								</div>
							))}
						</div>

						{unassigned > 0 && (
							<p className="flex items-center gap-2 text-xs text-amber-700">
								<ImagePlus className="h-3.5 w-3.5" />
								{unassigned} photo{unassigned === 1 ? "" : "s"} still need a
								service before upload.
							</p>
						)}
					</>
				)}
			</div>
		</Modal>
	);
};

export default PhotoUploadModal;
