import frappe

def add_custom_fields(doc=None, method=None):
#    add_field("Employee","employee_id","Employee Id","Int","employee_name")
   add_field("Employee","basic_salary","Basic Salary","Int","ctc")
#    add_field("Attendance","employee_id","Employee Id","Int","employee_name",)
#    update_field_properties("Employee", "first_name", new_fieldtype="Link", new_options="User")

def remove_custom_fields(doc=None, method=None):
    remove_field("Employee","employee_id")
    remove_field("Attendance","employee_id")

import frappe

def add_field(doctype, fieldname, label, fieldtype, insert_after,reqd=None):
    
    if not frappe.db.exists('Custom Field', f'{doctype}-{fieldname}'):
        custom_field = {
            'doctype': 'Custom Field',
            'dt': doctype,
            'fieldname': fieldname,
            'fieldtype': fieldtype,
            'label': label,
            'insert_after': insert_after,
        }

        frappe.get_doc(custom_field).insert()
        frappe.db.commit()
        return f'Custom field {fieldname} created successfully.'
    else:
        return f'Custom field {fieldname} already exists.'

# def update_field_properties(doctype, fieldname, new_label=None, new_fieldtype=None, new_options=None):
#     """Function to update properties of an existing custom field."""
#     try:
#         custom_field = frappe.get_doc('Custom Field', f'{doctype}-{fieldname}')
        
#         if new_label:
#             custom_field.label = new_label
#         if new_fieldtype:
#             custom_field.fieldtype = new_fieldtype
#         if new_options:
#             custom_field.options = new_options
        
#         custom_field.save()
#         frappe.db.commit()
#         return f'Custom field {fieldname} updated successfully.'

#     except frappe.DoesNotExistError:
#         return f'Custom field {fieldname} does not exist in {doctype}.'
#     except Exception as e:
#         # Log and handle exception
#         frappe.log_error(message=str(e), title="Custom Field Update Error")
#         return f'An error occurred: {str(e)}'

def remove_field(doctype, fieldname):
    custom_field_name = f'{doctype}-{fieldname}'

    if frappe.db.exists('Custom Field', custom_field_name):
        frappe.delete_doc('Custom Field', custom_field_name)
        frappe.db.commit()
        
        table_name = f'tab{doctype}'
        frappe.db.sql(f'ALTER TABLE `{table_name}` DROP COLUMN `{fieldname}`')
        frappe.db.commit()
    else:
        return f'Custom field {fieldname} does not exist in doctype {doctype}.'