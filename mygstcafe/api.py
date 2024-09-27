import frappe
import frappe.defaults
from frappe import _
import json
import uuid
from frappe import sendmail
from frappe.core.doctype.communication.email import make

# API to get default company and list
@frappe.whitelist(allow_guest=True)
def get_default_company_and_list():
    user = frappe.session.user
    
    default_company = frappe.db.get_value("DefaultValue", {"parent": user, "defkey": "company"}, "defvalue")
    default_fiscal_year = frappe.db.get_value("DefaultValue",{"parent": user, "defkey":"fiscal_year"},"defvalue")
    
    companies = frappe.get_all("Company", fields=["name", "company_name"])
    fiscal_years = frappe.get_all("Fiscal Year",fields=["name"])
    
    return {
        "default_company": default_company,
        "default_fiscal_year": default_fiscal_year,
        "companies": companies,
        "fiscal_years": fiscal_years
    }

# API to set default settings
@frappe.whitelist(allow_guest=True)
def set_default_settings(data):
    
    data = json.loads(data)  
    company_name = data.get('company_name')
    fiscal_year = data.get('fiscal_year')
    if not company_name and not fiscal_year :
        return { "error": "Data Missing" }
    
    try:
        frappe.defaults.set_user_default("company", company_name)
        frappe.defaults.set_user_default("fiscal_year", fiscal_year)
        
        return { "message": "Defaults set successfully." }
    except Exception as e:
        return { "error": str(e) }

@frappe.whitelist(allow_guest=True)
def get_item_defaults():
    user = frappe.session.user
    
    default_company = frappe.db.get_value("DefaultValue", {"parent": user, "defkey": "company"}, "defvalue")
    
    return default_company

# API to get pay slips
@frappe.whitelist(allow_guest=True)
def get_pay_slip_list(month, parent_docname):
    pay_slip_list = frappe.db.sql("""
        SELECT name, employee_name, net_payble_amount 
        FROM `tabPay Slips` 
        WHERE month_num = %s
    """, (month,), as_dict=True)
    
    created_pay_slips = []

    for pay_slip in pay_slip_list:
        generated_name = str(uuid.uuid4())  # Generate a unique ID for the name field
        frappe.db.sql("""
            INSERT INTO `tabCreated Pay Slips` (
                `name`, `pay_slip`, `employee`, `salary`, `parent`, `parenttype`, `parentfield`
            ) VALUES (%s, %s, %s, %s, %s, %s, %s);
        """, (
            generated_name,                 # name
            pay_slip['name'],               # pay_slip
            pay_slip['employee_name'],        # employee
            pay_slip['net_payble_amount'],# salary
            parent_docname,                 # parent
            'Create Pay Slips',             # parenttype
            'created_pay_slips'             # parentfield
        ))
        if not any(item['pay_slip'] == pay_slip['name'] for item in created_pay_slips):
                    created_pay_slips.append({
                        'name': generated_name,
                        'pay_slip': pay_slip['name'],
                        'employee': pay_slip['employee_name'],
                        'salary': pay_slip['net_payble_amount'],
                        'parent': parent_docname,
                        'parenttype': 'Create Pay Slips',
                        'parentfield': 'created_pay_slips'
                    })

    return created_pay_slips

# API to e-mail pay slips
@frappe.whitelist(allow_guest=True)
def email_pay_slip(pay_slips=None, raw_data=None):
    if pay_slips is None:
        pay_slips = []

    if raw_data is not None:
        try:
            data = json.loads(raw_data)
        except json.JSONDecodeError:
            raise ValueError("Invalid JSON data provided in raw_data.")
    elif pay_slips:
        data = json.loads(pay_slips) 
    else:
        raise ValueError("Either raw_data or pay_slips must be provided.")

    for item in data:
        record = frappe.db.get_value("Created Pay Slips", item, "pay_slip")
        if record:
            pay_slips.append(record)
        if raw_data:
            data = pay_slips
   
    for pay_slip_name in data:
        doc = frappe.get_doc('Pay Slips', pay_slip_name)

        employee_name = doc.employee_name
        month = doc.month
        year = doc.year
        doctype = doc.doctype
        docname = doc.name
        personal_email = doc.personal_email

        subject = f"Pay Slip for {employee_name} - {month} {year}"
        message = f"""
        Dear {employee_name},

        Please find attached your pay slip for {month} {year}.

        Best regards,
        Your Company
        """

        pdf_attachment = frappe.attach_print(doctype, docname, file_name=f"Pay Slip {docname}")

        if personal_email:
            frappe.sendmail(
                recipients=[personal_email],
                subject=subject,
                message=message,
                attachments=[{
                    'fname': f"Pay Slip - {employee_name}.pdf",
                    'fcontent': pdf_attachment
                }],
            )
        else:
            frappe.throw(f"No email address found for employee {employee_name}")
            
@frappe.whitelist(allow_guest=True)
def get_pay_slips_list(year=None,month=None):
    records = frappe.db.get_all("Pay Slips",
                                filters={"year": year, "month_num": month},
                                fields=["name", "employee_name","net_payble_amount"]
                                )
    if not records:
        return frappe.throw("No records found!")
    return records
