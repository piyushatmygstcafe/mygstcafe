import frappe
from collections import defaultdict
from mygstcafe.salary_calculation import calculate_monthly_salary

@frappe.whitelist(allow_guest=True)
def regenerate_pay_slip(selected_year, selected_month, selected_emp=None, selected_company=None):
    month = int(selected_month)
    year = int(selected_year)
    company = selected_company
    emplyee = selected_emp
    
    # Determine the number of working days in the month
    if month == 2:
        # Check for leap year
        if (year % 4 == 0 and year % 100 != 0) or (year % 400 == 0):
            working_days = 29
        else:
            working_days = 28
    elif month in [4, 6, 9, 11]:
        working_days = 30
    else:
        working_days = 31

    # Construct the base query
    base_query = """
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
        tabAttendance a ON e.employee = a.employee
    WHERE
        YEAR(a.attendance_date) = %s AND MONTH(a.attendance_date) = %s
    """
    
    # Add the company filter if provided
    filters = [year, month]
    if company:
        base_query += " AND a.company = %s"
        filters.append(company)
    if emplyee:
        base_query += " AND e.employee = %s"
        filters.append(emplyee)

    # Execute the query
    records = frappe.db.sql(base_query, filters, as_dict=True)

    # Initialize a defaultdict to organize employee records
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

    # Populate employee records from the query results
    for record in records:
        employee_id = record.get('employee')
        attendance_date = record.get('attendance_date')
        in_time = record.get('in_time')
        out_time = record.get('out_time')

        if emp_records[employee_id]["employee"]:
            # Employee already exists, append to attendance_records
            emp_records[employee_id]["attendance_records"].append({
                "attendance_date": attendance_date,
                "in_time": in_time,
                "out_time": out_time
            })
        else:
            # Add new employee data
            emp_records[employee_id] = {
                "employee": employee_id,
                "employee_name": record.get('employee_name'),
                "personal_email": record.get('personal_email'),
                "designation": record.get('designation'),
                "department": record.get('department'),
                "pan_number": record.get('pan_number'),
                "date_of_joining": record.get('date_of_joining'),
                "basic_salary": record.get('basic_salary'),
                "attendance_device_id": record.get('attendance_device_id'),
                "attendance_records": [{
                    "attendance_date": attendance_date,
                    "in_time": in_time,
                    "out_time": out_time
                }],
                "salary_information": {}
            }

    # Calculate monthly salary for each employee
    employee_data = calculate_monthly_salary(emp_records, working_days)

    for emp_id, data in employee_data.items():
        salary_info = data.get("salary_information", {})
        
        # Check if a Pay Slip already exists for the employee
        existing_doc = frappe.get_all('Pay Slips', filters={
            'employee_id': data.get("employee"),
            'docstatus': 0  # Check for open or draft status
        }, fields=['name'])

        if existing_doc:
            # If a Pay Slip exists, update it
            pay_slip = frappe.get_doc('Pay Slips', existing_doc[0]['name'])
        else:
            # If no Pay Slip exists, create a new one
            pay_slip = frappe.new_doc('Pay Slips')
        
        # Update the fields
        pay_slip.update({
            'employee_id': data.get("employee"),
            'employee_name': data.get("employee_name"),
            'personal_email': data.get("personal_email"),
            'designation': data.get("designation"),
            'department': data.get("department"),
            'pan_number': data.get("pan_number"),
            'date_of_joining': data.get("date_of_joining"),
            'attendance_device_id': data.get("attendance_device_id"),
            'basic_salary': data.get("basic_salary"),
            'per_day_salary': salary_info.get("per_day_salary"),
            'standard_working_days': salary_info.get("standard_working_days"),
            'full_day_workings': salary_info.get("full_days"),
            'three_quarter_days_workings': salary_info.get("three_quarter_days"),
            'half_days_workings': salary_info.get("half_days"),
            'quarter_days_workings': salary_info.get("quarter_days"),
            'lates': salary_info.get("lates"),
            'absent': salary_info.get("absent"),
            'actual_working_days': salary_info.get("actual_working_days"),
            'total_monthly_salary': salary_info.get("total_salary"),
            'overtime': salary_info.get("overtime")
        })
        
        # Save or submit the document
        pay_slip.save()
        
        frappe.msgprint(f"Pay Slip created for {data.get('employee')}")
