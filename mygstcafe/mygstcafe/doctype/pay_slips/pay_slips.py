# Copyright (c) 2024, mygstcafe and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe import sendmail
from frappe.utils import get_url_to_form


class PaySlips(Document):
    pass
	# def on_submit(self): 
	# 	# Customize email content
	# 	subject = f"Pay Slip for {self.employee_name} - {self.month} {self.year}"
	# 	message = f"""
	# 		Dear {self.employee_name},

	# 		Please find attached your pay slip for {self.month} {self.year}.

	# 		Best regards,
	# 		Your Company
	# 	"""

	# 	# Attach the pay slip PDF
	# 	pdf_attachment = frappe.attach_print(self.doctype, self.name, file_name=f"Pay Slip {self.name}")

	# 	# Send the email
	# 	recipients = [self.personal_email]
	# 	sendmail(
	# 		recipients=recipients,
	# 		subject=subject,
	# 		message=message,
	# 		attachments=[{'fname': f"Pay Slip - {self.employee_name}.pdf", 'fcontent': pdf_attachment}],
	# 	)
