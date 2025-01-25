import EmployeeService from "./EmployeeService";
import BookingService from "./BookingService";
import UserService from "./UserService";
import {apiServer} from "./axiosConfig";
const employeeService = EmployeeService(apiServer);
const userService = UserService(apiServer);
const bookingService = BookingService(apiServer);

export {bookingService, employeeService, userService};
