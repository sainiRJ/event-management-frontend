import {OutputBlockData, OutputData} from "@editorjs/editorjs";

import {
	editorJSBockTypes,
	FileObjectMapType,
	iCleanedEditorJSContent,
	iEditorJSAttachmentFileInfo,
	iLocalEditorJSFileUploadResponse,
	iMultiFileAttachmentDetailsWithIds,
} from "@/customTypes/appDataTypes/editorJSTypes";
import SecurityUtil from "@/utils/SecurityUtil";
import {attachmentService} from "@/services/api/eventManagementServer";
import {httpStatusCodes} from "@/customTypes/NetworkTypes";

/**
 * Cleans the editor content for saving by processing the blocks and generating file attachment details.
 *
 * @param editorContent - The editor content to be cleaned
 * @returns An object containing the cleaned content and the file attachment details
 */
function cleanEditorContentForSaving(
	editorContent: OutputData,
): iCleanedEditorJSContent {
	const cleanedContent: OutputData = structuredClone(editorContent);

	const multiFileAttachmentDetails: iMultiFileAttachmentDetailsWithIds = {
		ids: [],
		items: {},
	};

	const fileObjectMap: FileObjectMapType = {};

	/**
	 * Helper closure function to build the file attachment details for upload
	 *
	 * @param block - The block data to process
	 * @returns The generated attachment id
	 */
	const buildFileAttachmentDetails = (block: OutputBlockData): void => {
		const attachmentFileInfo: iEditorJSAttachmentFileInfo = block.data.file;

		if (attachmentFileInfo.isFromLocal && attachmentFileInfo.fileObject) {
			const attachmentId = attachmentFileInfo.id;

			multiFileAttachmentDetails.ids.push(attachmentId);

			multiFileAttachmentDetails.items[attachmentId] = {
				id: attachmentId,
				name: attachmentFileInfo.name,
				title: attachmentFileInfo.title,
				size: attachmentFileInfo.size,
				type: attachmentFileInfo.type,
				url: attachmentFileInfo.url,
			};

			fileObjectMap[attachmentId] = attachmentFileInfo.fileObject;
		}
	};

	/**
	 * Helper closure function to clean the attachment file info for saving
	 * by setting the URL to the generated attachment id and clearing the file object
	 * and setting the isFromLocal flag to false
	 *
	 * @param generatedAttachmentId - The generated attachment id
	 * @param blockIndex - The index of the block in the editor content
	 */
	const cleanAttachmentFileInfo = (blockIndex: number) => {
		const attachmentFileInfo: iEditorJSAttachmentFileInfo =
			cleanedContent.blocks[blockIndex].data.file;

		const attachmentId = attachmentFileInfo.id;

		const cleanedAttachmentFileInfo: iEditorJSAttachmentFileInfo = {
			...attachmentFileInfo,
			url: attachmentId,
			isFromLocal: false,
			fileObject: null,
		};

		cleanedContent.blocks[blockIndex].data.file = cleanedAttachmentFileInfo;
	};

	if (
		editorContent &&
		editorContent.blocks &&
		editorContent.blocks.length > 0
	) {
		editorContent.blocks.forEach((block, blockIndex) => {
			if (
				(block.type === editorJSBockTypes.ATTACHMENT ||
					block.type === editorJSBockTypes.IMAGE) &&
				block.data &&
				block.data.file
			) {
				/**
				 * Build the file attachment details for upload
				 */
				buildFileAttachmentDetails(block);

				/**
				 * Clean the attachment file info for saving
				 */
				cleanAttachmentFileInfo(blockIndex);
			}
		});
	}

	return {
		cleanedContent,
		filesToUpload: multiFileAttachmentDetails,
		fileObjectMap: fileObjectMap,
	};
}

/**
 * Handles the upload of a local file to the editor.
 * This function is used as a callback for the editor's file upload handler.
 * This is actually not uploading the file to a server, but just creating a Blob URL
 * for the file to be displayed in the editor.
 *
 * @param file - The file to be uploaded
 * @returns A promise that resolves to an object containing the file details with
 * a Blob URL for the file
 */
function handleLocalFileUpload(
	file: File,
): Promise<iLocalEditorJSFileUploadResponse> {
	return new Promise((resolve) => {
		const attachmentId = SecurityUtil.generateUUID();

		resolve({
			success: 1,
			file: {
				id: attachmentId,
				/**
				 * Create a Blob URL for the file to be displayed in the editor
				 */
				url: URL.createObjectURL(file),
				name: file.name,
				title: file.name,
				type: file.type,
				size: file.size,
				isFromLocal: true,
				fileObject: file,
			},
		});
	});
}

/**
 * Checks if the file info object is for a local file
 * (i.e. the file is not uploaded to a server)
 * @param fileInfo - The file info object to check
 * @returns True if the file is a local file, false otherwise
 */
function isLocalFile(fileInfo: iEditorJSAttachmentFileInfo): boolean {
	return fileInfo.isFromLocal;
}

async function prepareEditorContentForRendering(
	projectId: string,
	editorContent: OutputData,
): Promise<OutputData> {
	const renderingReadyEditorContent: OutputData =
		structuredClone(editorContent);

	if (
		editorContent &&
		editorContent.blocks &&
		editorContent.blocks.length > 0
	) {
		await Promise.all(
			editorContent.blocks.map(async (block, blockIndex) => {
				if (
					block.type === editorJSBockTypes.IMAGE &&
					block.data &&
					block.data.file
				) {
					const attachmentFileInfo: iEditorJSAttachmentFileInfo =
						block.data.file;

					if (!attachmentFileInfo.isFromLocal) {
						const attachmentId = attachmentFileInfo.id;

						const response =
							await attachmentService.issueBulkPresignedFetchUrls(projectId, {
								ids: [attachmentId],
								items: {
									[attachmentId]: {
										id: attachmentId,
										name: attachmentFileInfo.name,
										type: attachmentFileInfo.type,
									},
								},
							});

						if (response) {
							const {httpStatusCode, data} = response;

							if (
								httpStatusCode === httpStatusCodes.SUCCESS_OK &&
								data &&
								data.data
							) {
								const {files} = data.data;

								const attachment = files.items[attachmentId];

								const {preSignedFetchURL} = attachment;

								renderingReadyEditorContent.blocks[blockIndex].data.file.url =
									preSignedFetchURL;
							}
						}
					}
				}
			}),
		);
	}

	return renderingReadyEditorContent;
}

const EditorJSUtil = {
	cleanEditorContentForSaving,
	handleLocalFileUpload,
	isLocalFile,
	prepareEditorContentForRendering,
};

export default EditorJSUtil;
