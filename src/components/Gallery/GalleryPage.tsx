import React, {useCallback, useEffect, useState} from "react";
import {toast} from "sonner";
import {Images, RefreshCw, Trash2, Upload} from "lucide-react";

import {operationsService} from "@/services/api/eventManagementServer";
import {iGalleryPhoto} from "@/customTypes/appDataTypes/operationsTypes";
import {httpStatusCodes, iPagination} from "@/customTypes/NetworkTypes";
import PageHeader from "@/components/common/PageHeader";
import Pagination from "@/components/common/Pagination";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import PhotoUploadModal from "@/components/Modal/PhotoUploadModal";

/**
 * Gallery management.
 *
 * Photos could be uploaded and shown on the public site, but there was no way
 * to see what was already there or take anything down — so a photo published
 * by mistake stayed published.
 */
const GalleryPage: React.FC = () => {
	const [photos, setPhotos] = useState<iGalleryPhoto[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isUploadOpen, setIsUploadOpen] = useState(false);
	const [pendingDelete, setPendingDelete] = useState<iGalleryPhoto | null>(
		null,
	);
	const [isDeleting, setIsDeleting] = useState(false);
	const [pagination, setPagination] = useState<iPagination | null>(null);

	/**
	 * Paged. This asked for 100 and rendered whatever came back, but the API
	 * caps a page at 100 - so a vendor with more photos than that simply
	 * could not see or delete the rest.
	 */
	const load = useCallback(async (page = 1) => {
		setIsLoading(true);

		const response = await operationsService.listMyPhotos({page, limit: 24});

		if (response?.httpStatusCode === httpStatusCodes.SUCCESS_OK) {
			setPhotos(response.data?.data?.items ?? []);
			setPagination(response.data?.data?.pagination ?? null);
		} else {
			toast.error("Couldn't load your gallery");
		}

		setIsLoading(false);
	}, []);

	useEffect(() => {
		load();
	}, [load]);

	const confirmDelete = async () => {
		if (!pendingDelete) return;

		setIsDeleting(true);

		const response = await operationsService.deletePhoto(pendingDelete.photoId);

		setIsDeleting(false);

		if (response?.httpStatusCode === httpStatusCodes.SUCCESS_OK) {
			toast.success("Photo removed from the gallery");
			setPendingDelete(null);
			load();
			return;
		}

		toast.error("Couldn't remove that photo");
	};

	// Group by service so the vendor sees the gallery the way visitors do.
	const grouped = photos.reduce<Record<string, iGalleryPhoto[]>>(
		(acc, photo) => {
			const key = photo.serviceName || "Uncategorised";
			acc[key] = [...(acc[key] ?? []), photo];
			return acc;
		},
		{},
	);

	return (
		<div>
			<PageHeader
				title="Gallery"
				subtitle={`${photos.length} photo${
					photos.length === 1 ? "" : "s"
				} on your public site`}
				actions={
					<>
						<Button
							variant="secondary"
							onClick={() => {
								void load(pagination?.page ?? 1);
							}}
							disabled={isLoading}
						>
							<RefreshCw
								className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
							/>
							Refresh
						</Button>
						<Button onClick={() => setIsUploadOpen(true)}>
							<Upload className="mr-2 h-4 w-4" />
							Add photos
						</Button>
					</>
				}
			/>

			{isLoading && photos.length === 0 && (
				<p className="py-12 text-center text-sm text-ink-500">
					Loading gallery…
				</p>
			)}

			{!isLoading && photos.length === 0 && (
				<div className="rounded-3xl border border-ink-200/70 bg-white py-16 text-center">
					<Images className="mx-auto mb-3 h-10 w-10 text-brand-300" />
					<h2 className="font-display text-lg font-semibold text-ink-900">
						No photos yet
					</h2>
					<p className="mx-auto mt-1 max-w-sm text-sm text-ink-500">
						Photos you add here appear in the gallery on your customer website.
					</p>
				</div>
			)}

			<div className="space-y-8">
				{Object.entries(grouped).map(([serviceName, items]) => (
					<section key={serviceName}>
						<h2 className="mb-3 font-display text-lg font-semibold text-ink-900">
							{serviceName}
							<span className="ml-2 text-sm font-normal text-ink-400">
								{items.length}
							</span>
						</h2>

						<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
							{items.map((photo) => (
								<figure
									key={photo.photoId}
									className="group relative overflow-hidden rounded-2xl border border-ink-200/70 bg-white shadow-sm"
								>
									<img
										src={photo.photoUrl}
										alt={`${serviceName} decoration`}
										loading="lazy"
										className="aspect-square w-full object-cover"
									/>

									<button
										type="button"
										onClick={() => setPendingDelete(photo)}
										aria-label={`Remove this ${serviceName} photo`}
										className="absolute right-2 top-2 rounded-xl bg-white/90 p-2 text-rose-600 opacity-0 shadow-sm transition-opacity focus-visible:opacity-100 group-hover:opacity-100 max-sm:opacity-100"
									>
										<Trash2 className="h-4 w-4" />
									</button>
								</figure>
							))}
						</div>
					</section>
				))}
			</div>

			{isUploadOpen && (
				<PhotoUploadModal
					open={isUploadOpen}
					onClose={() => {
						setIsUploadOpen(false);
						load();
					}}
				/>
			)}

			{pagination && (
				<Pagination
					page={pagination.page}
					totalPages={pagination.totalPages}
					total={pagination.total}
					limit={pagination.limit}
					isLoading={isLoading}
					onPageChange={(nextPage) => {
						void load(nextPage);
					}}
				/>
			)}

			<Modal
				isOpen={Boolean(pendingDelete)}
				onClose={() => setPendingDelete(null)}
				title="Remove this photo?"
				size="sm"
			>
				<div className="space-y-4">
					<p className="text-sm text-ink-600">
						It will stop appearing in the gallery on your customer website. The
						file itself is kept in storage.
					</p>

					{pendingDelete && (
						<img
							src={pendingDelete.photoUrl}
							alt=""
							className="max-h-48 w-full rounded-2xl object-cover"
						/>
					)}

					<div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
						<Button
							variant="secondary"
							className="w-full sm:w-auto"
							onClick={() => setPendingDelete(null)}
						>
							Keep it
						</Button>
						<Button
							variant="danger"
							className="w-full sm:w-auto"
							onClick={confirmDelete}
							disabled={isDeleting}
						>
							{isDeleting ? "Removing…" : "Remove photo"}
						</Button>
					</div>
				</div>
			</Modal>
		</div>
	);
};

export default GalleryPage;
