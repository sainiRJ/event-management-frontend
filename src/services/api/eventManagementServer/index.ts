import {apiServer, injectStore} from "./axiosConfig";
import ProjectService from "./ProjectService";
import ModifyProjectValueService from "./ModifyProjectValueService";
import ModifyStartDateValueService from "./ModifyStartDateValueService";
import EmployeeService from "./EmployeeService";
import TimeLogService from "./TimeLogService";
import UserService from "./UserService";
import ExportReportService from "./ExportReportService";
import AttachmentService from "./AttachmentService";
import OptimizedProjectService from "./OptimizedProjectService";

const optimizedProjectService = OptimizedProjectService(apiServer);
const projectService = ProjectService(apiServer);
const employeeService = EmployeeService(apiServer);
const modifyProjectValueSlice = ModifyProjectValueService(apiServer);
const modifyStartDateValueSlice = ModifyStartDateValueService(apiServer);
const timeLogService = TimeLogService(apiServer);
const userService = UserService(apiServer);
const exportReportService = ExportReportService(apiServer);
const attachmentService = AttachmentService(apiServer);

export {
	injectStore,
	optimizedProjectService,
	projectService,
	employeeService,
	modifyProjectValueSlice,
	modifyStartDateValueSlice,
	timeLogService,
	userService,
	exportReportService,
	attachmentService,
};
