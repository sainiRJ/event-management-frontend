import EmployeeService from "./EmployeeService";
import ServiceService from "./serviceService";
import BookingService from "./BookingService";
import UserService from "./UserService";
import StatusService from "./statusService";
import AuthService from "./AuthService";
import NotificationService from "./NotificationService";
import OperationsService from "./OperationsService";
import {apiServer} from "./axiosConfig";

const employeeService = EmployeeService(apiServer);
const userService = UserService(apiServer);
const bookingService = BookingService(apiServer);
const serviceService = ServiceService(apiServer);
const statusService = StatusService(apiServer);
const authService = AuthService(apiServer);
const notificationService = NotificationService(apiServer);
const operationsService = OperationsService(apiServer);

export {
	bookingService,
	employeeService,
	userService,
	serviceService,
	statusService,
	authService,
	notificationService,
	operationsService,
};
