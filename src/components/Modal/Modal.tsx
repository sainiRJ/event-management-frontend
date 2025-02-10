import React from "react";
import {Modal, Button} from "rsuite";

interface ModalComponentProps {
	open: boolean;
	onClose: () => void;
	onSubmit: () => void;
	title: string;
	children: React.ReactNode;
}

const ModalComponent: React.FC<ModalComponentProps> = ({
	open,
	onClose,
	onSubmit,
	title,
	children,
}) => {
	return (
		<Modal size="xl" open={open} onClose={onClose}>
			<Modal.Header>
				<Modal.Title>{title}</Modal.Title>
			</Modal.Header>
			<Modal.Body>{children}</Modal.Body>
			<Modal.Footer>
				<Button onClick={onSubmit} appearance="primary">
					Submit
				</Button>
				<Button onClick={onClose} appearance="subtle">
					Cancel
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default ModalComponent;
