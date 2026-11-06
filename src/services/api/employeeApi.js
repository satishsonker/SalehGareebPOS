import { get, post, put } from '../../utils/api';

const BASE = '/admin/employees';
export const getEmployees = (search = '') => get(`${BASE}${search ? `?search=${encodeURIComponent(search)}` : ''}`);
export const saveEmployeeProfile = (userId, data) => put(`${BASE}/${userId}/profile`, data);
export const getEmployeeAttendance = (year, month) => get(`${BASE}/attendance?year=${year}&month=${month}`);
export const saveEmployeeAttendance = data => put(`${BASE}/attendance`, data);
export const getEmployeeAdvances = () => get(`${BASE}/advances`);
export const addEmployeeAdvance = data => post(`${BASE}/advances`, data);
export const getEmployeeSalaryPayments = year => get(`${BASE}/salary-payments?year=${year}`);
export const addEmployeeSalaryPayment = data => post(`${BASE}/salary-payments`, data);
