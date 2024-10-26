from collections import defaultdict
from datetime import datetime
import frappe
from hrms.payroll.doctype.salary_slip.salary_slip import *
from pinnacle.salary_calculation import calculate_monthly_salary


# Corrected version of get_working_days_details to accept 'self'
def new_get_emp_and_working_day_details(self):
    start = self.start_date
    end = self.end_date
    working_days = (datetime.strptime(self.end_date, '%Y-%m-%d') - datetime.strptime(self.start_date, '%Y-%m-%d')).days + 1
    company = self.company

    # Query to get attendance records between the start and end dates
    base_query = """
        SELECT
            e.company,
            e.employee,
            e.employee_name,
            e.personal_email,
            e.designation,
            e.department,
            e.pan_number,
            e.date_of_joining,
            e.grade,
            e.attendance_device_id,
            a.attendance_date,
            a.in_time,
            a.out_time
        FROM
            tabEmployee e
        JOIN
            tabAttendance a ON e.employee = a.employee
        WHERE
            a.attendance_date BETWEEN %s AND %s AND e.company = %s
    """

    filters = [start, end, company]
    records = frappe.db.sql(base_query, filters, as_dict=True)
    
    # Initialize a defaultdict to organize employee records
    emp_records = defaultdict(lambda: {
        "company": "",
        "employee": "",
        "employee_name": "",
        "personal_email": "",
        "designation": "",
        "department": "",
        "pan_number": "",
        "date_of_joining": "",
        "grade": "",
        "attendance_device_id": "",
        "attendance_records": [],
        "salary_information": {}
    })
    
    # Populate employee records from the query results
    for record in records:
        employee_id = record['employee']
        
        if emp_records[employee_id]["employee"]:
            # Employee already exists, append to attendance_records
            emp_records[employee_id]["attendance_records"].append({
                "attendance_date": record['attendance_date'],
                "in_time": record['in_time'],
                "out_time": record['out_time']
            })
        else:
            # Add new employee data
            emp_records[employee_id] = {
                "company": record['company'],
                "employee": record['employee'],
                "employee_name": record['employee_name'],
                "personal_email": record['personal_email'],
                "designation": record['designation'],
                "department": record['department'],
                "pan_number": record['pan_number'],
                "date_of_joining": record['date_of_joining'],
                "basic_salary": frappe.db.get_value('Salary Structure Assignment', {'employee': employee_id, 'grade': record['grade']}, ['base']),
                "attendance_device_id": record['attendance_device_id'],
                "attendance_records": [{
                    "attendance_date": record['attendance_date'],
                    "in_time": record['in_time'],
                    "out_time": record['out_time']
                }],
                "salary_information": {}
            }

    employee_data = calculate_monthly_salary(emp_records, working_days)
    frappe.msgprint(str(dict(employee_data)))
    
def new_calculate_net_pay(self):
    pass

SalarySlip.get_working_days_details = new_get_emp_and_working_day_details
SalarySlip.calculate_net_pay = new_calculate_net_pay

