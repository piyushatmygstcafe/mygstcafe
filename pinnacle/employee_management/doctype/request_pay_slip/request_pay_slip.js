// Copyright (c) 2024, mygstcafe and contributors
// For license information, please see license.txt

frappe.ui.form.on("Request Pay Slip", {
  refresh(frm) {
    currUser = frappe.session.user;
    frappe.db
      .get_doc("Employee", null, { personal_email: currUser })
      .then((doc) => {
        frm.set_value("employee", doc.name);
      });
  },
});
