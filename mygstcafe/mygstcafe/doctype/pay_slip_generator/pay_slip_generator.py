# Copyright (c) 2024, mygstcafe and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from collections import defaultdict
from mygstcafe.salary_calculation import calculate_monthly_salary
from datetime import datetime
import json

class PaySlipGenerator(Document):

    def get_emp_records(self):
        company = self.select_company
        year = self.year
        month = self.month

        # Calculate the total working days
        total_working_days = self.working_days
        if company:
            records = frappe.db.sql("""
                SELECT
                    e.employee,
                    e.employee_name,
                    e.personal_email,
                    e.designation,
                    e.department,
                    e.pan_number,
                    e.date_of_joining,
                    e.basic_salary,
                    e.attendance_device_id,
                    a.attendance_date,
                    a.in_time,
                    a.out_time
                FROM
                    tabEmployee e
                JOIN
                    tabAttendance a
                ON
                    e.employee = a.employee
                WHERE YEAR(attendance_date) = %s AND MONTH(attendance_date) = %s
            """, (company,year,month), as_dict=False)
        else:
            records = frappe.db.sql("""
                SELECT
                    e.employee,
                    e.employee_name,
                    e.personal_email,
                    e.designation,
                    e.department,
                    e.pan_number,
                    e.date_of_joining,
                    e.basic_salary,
                    e.attendance_device_id,
                    a.attendance_date,
                    a.in_time,
                    a.out_time
                FROM
                    tabEmployee e
                JOIN
                    tabAttendance a
                ON
                    e.employee = a.employee
                WHERE YEAR(attendance_date) = %s AND MONTH(attendance_date) = %s
            """,(year,month),as_dict=False)
            
        
        emp_records = defaultdict(lambda: {
            "employee": "",
            "employee_name": "",
            "personal_email": "",
            "designation": "",
            "department": "",
            "pan_number": "",
            "date_of_joining": "",
            "basic_salary": 0,
            "attendance_device_id": "",
            "attendance_records": [],
            "salary_information": {}
        })
        
        for record in records:
            (employee_id, employee_name, personal_email, designation, department, pan_number, 
            date_of_joining, basic_salary, attendance_device_id, attendance_date, in_time, out_time) = record
            
            if emp_records[employee_id]["employee"]:
                # Employee already exists, just append to attendance_records
                emp_records[employee_id]["attendance_records"].append({
                    "attendance_date": attendance_date,
                    "in_time": in_time,
                    "out_time": out_time
                })
            else:
                # Add new employee data
                emp_records[employee_id]["employee"] = employee_id
                emp_records[employee_id]["employee_name"] = employee_name
                emp_records[employee_id]["personal_email"] = personal_email
                emp_records[employee_id]["designation"] = designation
                emp_records[employee_id]["department"] = department
                emp_records[employee_id]["pan_number"] = pan_number
                emp_records[employee_id]["date_of_joining"] = date_of_joining
                emp_records[employee_id]["basic_salary"] = basic_salary
                emp_records[employee_id]["attendance_device_id"] = attendance_device_id
                emp_records[employee_id]["attendance_records"].append({
                    "attendance_date": attendance_date,
                    "in_time": in_time,
                    "out_time": out_time
                })
                
        employee_data = calculate_monthly_salary(emp_records,total_working_days)
        
        
        def create_pay_slips(employee_data):
            for emp_id, data in employee_data.items():
                employee_id = data.get("employee")
                employee_name = data.get("employee_name")
                personal_email = data.get("personal_email")
                designation = data.get("designation")
                department = data.get("department")
                pan_number = data.get("pan_number")
                date_of_joining = data.get("date_of_joining")
                basic_salary = data.get("basic_salary")
                attendance_device_id = data.get("attendance_device_id")
                salary_info = data.get("salary_information")
                standard_working_days = salary_info.get("standard_working_days")
                per_day_salary = salary_info.get("per_day_salary")
                full_days = salary_info.get("full_days")
                three_quarter_days = salary_info.get("three_quarter_days")
                half_days = salary_info.get("half_days")
                quarter_days = salary_info.get("quarter_days")
                lates = salary_info.get("lates")
                absent = salary_info.get("absent")
                overtime = salary_info.get("overtime")
                total_salary = salary_info.get("total_salary")
                actual_working_days = salary_info.get("actual_working_days")
                
                new_doc = frappe.get_doc({
                    'doctype':'Pay Slips',
                    'docstatus': 0,
                    'employee_id':employee_id,
                    'employee_name':employee_name,
                    'personal_email':personal_email,
                    'designation':designation,
                    'department':department,
                    'pan_number':pan_number,
                    'date_of_joining':date_of_joining,
                    'attendance_device_id':attendance_device_id,
                    'basic_salary':basic_salary,
                    'per_day_salary':per_day_salary,
                    'standard_working_days':standard_working_days,
                    'full_day_workings':full_days,
                    'three_quarter_days_workings':three_quarter_days,
                    'half_days_workings':half_days,
                    'quarter_days_workings':quarter_days,
                    'lates':lates,
                    'absent':absent,
                    'actual_working_days':actual_working_days,
                    'total_monthly_salary':total_salary,
                    'overtime':overtime,
                })
                
                new_doc.insert()
                frappe.db.commit()
                frappe.msgprint(f"Pay Slip created for {employee_id} ")
        frappe.msgprint(str(dict(employee_data)))
        create_pay_slips(employee_data)

    def db_insert(self, *args, **kwargs):
        frappe.throw(_("Cannot insert or save a Virtual DocType"))

    def db_update(self):
        frappe.throw(_("Cannot update a Virtual DocType"))

    def insert(self):
        frappe.throw(_("Cannot insert a Virtual DocType"))

    def save(self):
        self.get_emp_records()

    def validate(self):
        # Add any additional validations if needed
        pass
