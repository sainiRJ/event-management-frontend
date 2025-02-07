import EmployeeService from "./EmployeeService";
import ServiceService from "./serviceService";
import BookingService from "./BookingService";
import UserService from "./UserService";
import StatusService from "./statusService";
import {apiServer} from "./axiosConfig";

const employeeService = EmployeeService(apiServer);
const userService = UserService(apiServer);
const bookingService = BookingService(apiServer);
const serviceService = ServiceService(apiServer);
const statusService = StatusService(apiServer);

export {
	bookingService,
	employeeService,
	userService,
	serviceService,
	statusService,
};
