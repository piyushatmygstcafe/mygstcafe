import frappe

def after_install(self):
    frappe.db.set_value('DocType', 'Pay Slips', 'default_print_format', 'Pay Slip')