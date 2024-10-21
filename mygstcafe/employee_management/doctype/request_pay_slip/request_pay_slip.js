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

    if (!frm.is_new()) {
      // Check if the user has the "HR Manager" role
      if (frappe.user.has_role("HR Manager")) {
        // Add the "Approve" button if not already added
        if (!frm.custom_buttons["Approve"]) {
          frm
            .add_custom_button(__("Approve"), function () {
              // Confirm with the user before proceeding
              frappe.confirm(
                "Are you sure you want to approve this document?",
                function () {
                  // Call a server-side method to handle the approval
                  frappe.call({
                    method: "mygstcafe.api.approve_pay_slip_req",
                    args: {
                      employee: frm.doc.employee,
                      month: frm.doc.year,
                      year: frm.doc.month,
                    },
                    callback: function (response) {
                      if (response.message === "success") {
                        frappe.msgprint(__("Document approved successfully"));
                        frm.reload_doc();
                      } else {
                        frappe.msgprint({
                          title: __("Error"),
                          indicator: "red",
                          message: __("Approval failed. Please try again."),
                        });
                      }
                    },
                  });
                }
              );
            })
            .addClass("btn-primary"); // Adds a blue color to the button
        }
      }
    }
  },
});
