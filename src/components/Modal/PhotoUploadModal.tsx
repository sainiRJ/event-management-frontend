import React, {useState} from "react";
import {
	Modal,
	Button,
	SelectPicker,
	Uploader,
	Message,
	useToaster,
	UploaderProps,
} from "rsuite";
import {useSelector} from "react-redux";
import {RootState} from "@/store/RootReducer";
import {iService} from "@/store/services/Types";

interface PhotoUploadModalProps {
	open: boolean;
	onClose: () => void;
}

const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({open, onClose}) => {
	const [selectedService, setSelectedService] = useState<string | null>(null);
	const [fileList, setFileList] = useState<UploaderProps["fileList"]>([]);
	const toaster = useToaster();

	const services = useSelector(
		(state: RootState) => state.serviceReducer.serviceList,
	);
	const serviceOptions = services.map((service: iService) => ({
		value: service.id,
		label: service.serviceName,
	}));

	const handleUpload = async () => {
		if (!selectedService) {
			toaster.push(
				<Message type="error" showIcon>
					Please select a service
				</Message>,
			);
			return;
		}

		if (!fileList || fileList.length === 0) {
			toaster.push(
				<Message type="error" showIcon>
					Please select a photo to upload
				</Message>,
			);
			return;
		}

		const formData = new FormData();
		formData.append("serviceId", selectedService);
		const file = fileList[0].blobFile;
		if (!file) {
			toaster.push(
				<Message type="error" showIcon>
					Invalid file format
				</Message>,
			);
			return;
		}
		formData.append("photo", file);

		try {
			// TODO: Replace with actual API endpoint
			const response = await fetch(
				`${process.env.REACT_APP_EVENT_MANAGEMENT_BACKEND_BASEURL}/photo/upload`,
				{
					method: "POST",
					body: formData,
				},
			);

			if (response.ok) {
				toaster.push(
					<Message type="success" showIcon>
						Photo uploaded successfully
					</Message>,
				);
				onClose();
			} else {
				throw new Error("Upload failed");
			}
		} catch (error) {
			toaster.push(
				<Message type="error" showIcon>
					Failed to upload photo
				</Message>,
			);
		}
	};

	return (
		<Modal open={open} onClose={onClose}>
			<Modal.Header>
				<Modal.Title>Upload Photo</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<div style={{marginBottom: "20px"}}>
					<label style={{display: "block", marginBottom: "8px"}}>
						Select Service:
					</label>
					<SelectPicker
						data={serviceOptions}
						searchable={false}
						block
						placeholder="Select a service"
						value={selectedService}
						onChange={setSelectedService}
					/>
				</div>
				<div>
					<label style={{display: "block", marginBottom: "8px"}}>
						Upload Photo:
					</label>
					<Uploader
						autoUpload={false}
						fileList={fileList}
						action="/api/upload-photo"
						onChange={(fileList) => setFileList(fileList)}
						draggable
						accept="image/*"
					>
						<div
							style={{
								height: 200,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
							}}
						>
							<span>Click or Drag files to this area to upload</span>
						</div>
					</Uploader>
				</div>
			</Modal.Body>
			<Modal.Footer>
				<Button onClick={handleUpload} appearance="primary">
					Upload
				</Button>
				<Button onClick={onClose} appearance="subtle">
					Cancel
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default PhotoUploadModal;
