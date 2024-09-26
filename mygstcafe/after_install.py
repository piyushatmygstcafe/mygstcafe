import frappe

def after_install():
    frappe.db.set_value('DocType', 'Pay Slips', 'default_print_format', 'pay_slip')