import axiosInstance from './axiosInstance';
import { 
  Employee, 
  EmployeesResponse, 
  EmployeeResponse, 
  DeleteEmployeeResponse,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  GetEmployeesParams
} from '@/types/employee-types';

export class EmployeeService {
  /**
   * Get all employees with pagination and search
   */
  static async getEmployees(params: GetEmployeesParams = {}): Promise<EmployeesResponse> {
    try {
      const { page = 1, limit = 10, search = '', filter = {} } = params;

      const response = await axiosInstance.get('/admin/employees', {
        params: {
          page,
          limit,
          search,
          filter: JSON.stringify(filter),
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  }

  /**
   * Get employee by ID
   */
  static async getEmployeeById(id: string): Promise<EmployeeResponse> {
    try {
      const response = await axiosInstance.get(`/admin/employees/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching employee:', error);
      throw error;
    }
  }

  /**
   * Create new employee
   */
  static async createEmployee(employeeData: CreateEmployeeRequest): Promise<EmployeeResponse> {
    try {
      const formData = new FormData();

      formData.append('name', employeeData.name);
      formData.append('email', employeeData.email);
      formData.append('phoneNumber', employeeData.phoneNumber);
      formData.append('designation', employeeData.designation);

      if (employeeData.dateOfJoining) formData.append('dateOfJoining', employeeData.dateOfJoining);
      if (employeeData.address) formData.append('address', employeeData.address);
      if (employeeData.status !== undefined) formData.append('status', employeeData.status.toString());
      if (employeeData.profilePicture) formData.append('profilePicture', employeeData.profilePicture);

      const response = await axiosInstance.post('/admin/employees', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      return response.data;
    } catch (error) {
      console.error('Error creating employee:', error);
      throw error;
    }
  }

  /**
   * Update employee
   */
  static async updateEmployee(id: string, employeeData: UpdateEmployeeRequest): Promise<EmployeeResponse> {
    try {
      const formData = new FormData();

      if (employeeData.employeeId !== undefined) formData.append('employeeId', employeeData.employeeId);
      if (employeeData.name !== undefined) formData.append('name', employeeData.name);
      if (employeeData.email !== undefined) formData.append('email', employeeData.email);
      if (employeeData.phoneNumber !== undefined) formData.append('phoneNumber', employeeData.phoneNumber);
      if (employeeData.designation !== undefined) formData.append('designation', employeeData.designation);
      if (employeeData.dateOfJoining !== undefined) formData.append('dateOfJoining', employeeData.dateOfJoining);
      if (employeeData.address !== undefined) formData.append('address', employeeData.address);
      if (employeeData.status !== undefined) formData.append('status', employeeData.status.toString());
      if (employeeData.profilePicture) formData.append('profilePicture', employeeData.profilePicture);

      const response = await axiosInstance.put(`/admin/employees/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      return response.data;
    } catch (error) {
      console.error('Error updating employee:', error);
      throw error;
    }
  }

  /**
   * Delete employee
   */
  static async deleteEmployee(id: string): Promise<DeleteEmployeeResponse> {
    try {
      const response = await axiosInstance.delete(`/admin/employees/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting employee:', error);
      throw error;
    }
  }

  /**
   * Get all active employees (for dropdowns)
   */
  static async getActiveEmployees(): Promise<EmployeeResponse[]> {
    try {
      const response = await axiosInstance.get('/admin/employees/active');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching active employees:', error);
      throw error;
    }
  }
}

export default EmployeeService;