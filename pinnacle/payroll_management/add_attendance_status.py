import frappe
from hrms.hr.doctype.shift_type.shift_type import *
from hrms.hr.doctype.employee_checkin import employee_checkin
from hrms.hr.doctype.attendance.attendance import Attendance
from hrms.hr.utils import validate_active_employee


    
def new_get_attendance(self, logs):

    """Return attendance_status, working_hours, late_entry, early_exit, in_time, out_time
    for a set of logs belonging to a single shift.
    Assumptions:
    1. These logs belong to a single shift, single employee and it's not on a holiday date.
    2. Logs are in chronological order.
    """
    
    if not logs or len(logs) == 0:
        return "No logs available", 0, False, False, None, None 
    late_entry = early_exit = False
    
   
    total_working_hours, in_time, out_time = calculate_working_hours(
        logs, self.determine_check_in_and_check_out, self.working_hours_calculation_based_on
    )
    
    if (
        cint(getattr(self, 'enable_late_entry_marking', 0))  
        and in_time
        and in_time > logs[0].shift_start + timedelta(minutes=cint(getattr(self, 'late_entry_grace_period', 0)))
    ):
        late_entry = True
   
    if (
        cint(getattr(self, 'enable_early_exit_marking', 0))
        and out_time
        and out_time < logs[0].shift_end - timedelta(minutes=cint(getattr(self, 'early_exit_grace_period', 0)))
    ):
        early_exit = True
 
    if total_working_hours > 9.5:
        return "Project Deadline Allowance", total_working_hours, late_entry, early_exit, in_time, out_time
    elif 7.88 <= total_working_hours <= 9.5:
        return "Present", total_working_hours, late_entry, early_exit, in_time, out_time
    elif 5.63 <= total_working_hours < 7.88:
        return "Quarter Day", total_working_hours, late_entry, early_exit, in_time, out_time
    elif 3.38 <= total_working_hours < 5.63:
        return "Half Day", total_working_hours, late_entry, early_exit, in_time, out_time
    elif 1.13 <= total_working_hours < 3.38:
        return "3/4 Quarter Day", total_working_hours, late_entry, early_exit, in_time, out_time
    else:
        return "Absent", total_working_hours, late_entry, early_exit, in_time, out_time
    
ShiftType.get_attendance = new_get_attendance

def new_mark_attendance_and_link_log(logs, attendance_status, attendance_date, working_hours=None, late_entry=False, early_exit=False, in_time=None, out_time=None, shift=None):
    """Creates an attendance and links the attendance to the Employee Checkin.
    Note: If attendance is already present for the given date, the logs are marked as skipped and no exception is thrown.

    :param logs: The List of 'Employee Checkin'.
    :param attendance_status: Attendance status to be marked. One of: (Present, Absent, Half Day, Skip). Note: 'On Leave' is not supported by this function.
    :param attendance_date: Date of the attendance to be created.
    :param working_hours: (optional) Number of working hours for the given date.
    """
    log_names = [x.name for x in logs]
    employee = logs[0].employee

    if attendance_status == "Skip":
        employee_checkin.skip_attendance_in_checkins(log_names)
        return None
    
    elif attendance_status in ("Present", "Absent", "Half Day","Quarter Day","3/4 Quarter Day","Project Deadline Allowance"):
        try:
            breakpoint()
            frappe.db.savepoint("attendance_creation")
            attendance = frappe.new_doc("Attendance")
            attendance.update(
                {
                    "doctype": "Attendance",
                    "employee": employee,
                    "attendance_date": attendance_date,
                    "status": attendance_status,
                    "working_hours": working_hours,
                    "shift": shift,
                    "late_entry": late_entry,
                    "early_exit": early_exit,
                    "in_time": in_time,
                    "out_time": out_time,
                }
            ).submit()

            if attendance_status == "Absent":
                attendance.add_comment(
                    text=_("Employee was marked Absent for not meeting the working hours threshold.")
                )

            employee_checkin.update_attendance_in_checkins(log_names, attendance.name)
            return attendance

        except frappe.ValidationError as e:
            employee_checkin.handle_attendance_exception(log_names, e)

    else:
        frappe.throw(("{} is an invalid Attendance Status.").format(attendance_status))

mark_attendance_and_link_log = new_mark_attendance_and_link_log

def new_validatation(self):
		from erpnext.controllers.status_updater import validate_status

		validate_status(self.status, ["Present", "Absent", "On Leave", "Half Day", "Work From Home","Quarter Day","3/4 Quarter Day","Project Deadline Allowance"])
		validate_active_employee(self.employee)
		self.validate_attendance_date()
		self.validate_duplicate_record()
		self.validate_overlapping_shift_attendance()
		self.validate_employee_status()
		self.check_leave_record()
  
Attendance.validate = new_validatation