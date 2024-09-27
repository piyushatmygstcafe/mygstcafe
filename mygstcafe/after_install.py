import frappe

def after_install():
    frappe.db.set_value("Print Format", "Pay Slip Format", "standard", 1)
    frappe.db.commit()