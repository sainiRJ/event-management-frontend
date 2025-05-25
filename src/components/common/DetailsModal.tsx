import React, {useState, useEffect} from "react";

interface DetailsModalProps {
	open: boolean;
	onClose: () => void;
	data: any;
	onSave: (updated: any) => void;
	title: string;
	fields: {
		name: string;
		label: string;
		type: "text" | "number" | "date" | "select" | "textarea";
		options?: {label: string; value: string}[];
		render?: (value: any) => React.ReactNode;
	}[];
	editMode?: boolean;
	externalEdit?: boolean;
}

const DetailsModal: React.FC<DetailsModalProps> = ({
	open,
	onClose,
	data,
	onSave,
	title,
	fields,
	editMode: editModeProp,
	externalEdit = false,
}) => {
	const [editMode, setEditMode] = useState(false);
	const [form, setForm] = useState(data || {});

	useEffect(() => {
		if (open) {
			document.body.classList.add("overflow-hidden");
		} else {
			document.body.classList.remove("overflow-hidden");
		}
		return () => {
			document.body.classList.remove("overflow-hidden");
		};
	}, [open]);

	useEffect(() => {
		setForm(data || {});
		setEditMode(!!editModeProp);
	}, [data, open, editModeProp]);

	if (!open || !data) return null;

	const handleChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>,
	) => {
		const {name, value} = e.target;
		setForm((prev: any) => ({...prev, [name]: value}));
	};

	const handleSave = () => {
		onSave(form);
		setEditMode(false);
	};

	const renderField = (field: DetailsModalProps["fields"][0]) => {
		if (editMode && !externalEdit) {
			switch (field.type) {
				case "select":
					return (
						<select
							name={field.name}
							value={form[field.name] || ""}
							onChange={handleChange}
							className="w-full border rounded px-3 py-2 mt-1"
						>
							<option value="">Select {field.label}</option>
							{field.options?.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
					);
				case "textarea":
					return (
						<textarea
							name={field.name}
							value={form[field.name] || ""}
							onChange={handleChange}
							className="w-full border rounded px-3 py-2 mt-1"
							rows={4}
						/>
					);
				default:
					return (
						<input
							type={field.type}
							name={field.name}
							value={form[field.name] || ""}
							onChange={handleChange}
							className="w-full border rounded px-3 py-2 mt-1"
						/>
					);
			}
		}
		if (field.render) {
			return (
				<div className="text-gray-800">{field.render(data[field.name])}</div>
			);
		}
		return <div className="text-gray-800">{data[field.name]}</div>;
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
			<div className="bg-white rounded-lg shadow-lg w-full max-w-lg mx-2 p-6 relative">
				<button
					className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
					onClick={onClose}
				>
					&times;
				</button>
				<h2 className="text-xl font-bold mb-4 text-indigo-700">{title}</h2>
				<div className="space-y-3">
					{fields.map((field) => (
						<div key={field.name}>
							<label className="block text-sm font-semibold text-gray-600">
								{field.label}
							</label>
							{renderField(field)}
						</div>
					))}
				</div>
				<div className="flex justify-end gap-2 mt-6">
					{externalEdit ? (
						<button
							className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
							onClick={() => onSave(data)}
						>
							Edit
						</button>
					) : editMode ? (
						<>
							<button
								className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
								onClick={handleSave}
							>
								Save
							</button>
							<button
								className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
								onClick={() => {
									if (editModeProp) {
										onClose();
									} else {
										setEditMode(false);
									}
								}}
							>
								Cancel
							</button>
						</>
					) : (
						<button
							className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
							onClick={() => setEditMode(true)}
						>
							Edit
						</button>
					)}
				</div>
			</div>
		</div>
	);
};

export default DetailsModal;
