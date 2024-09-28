# Copyright (c) 2024, mygstcafe and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document
from datetime import datetime

class RequestPaySlip(Document):

	def before_save(self):
		current_date = datetime.now()

		self.requested_date = current_date.strftime("%Y-%m-%d")

