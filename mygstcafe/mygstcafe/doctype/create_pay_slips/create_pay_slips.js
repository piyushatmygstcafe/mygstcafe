// Copyright (c) 2024, mygstcafe and contributors
// For license information, please see license.txt
var preventSubmission;
frappe.ui.form.on("Create Pay Slips", {
  refresh(frm) {
    add_email_btn(frm);
    if (frm.genrate_for_all) {
      frm.set_df_property("select_company", "hidden", 1);
      frm.set_df_property("company_abbr", "hidden", 1);
    }
    frm.select_company = frappe.defaults.get_user_default("company");
    let currentYear = new Date().getFullYear();
    if (!frm.doc.year) {
      frm.set_value("year", currentYear);
    }
    if (frm.doc.add_regenrate_button) {
      frm.add_custom_button("Regenerate Pay Slip", () => {
        frappe.prompt(
          [
            {
              label: "Select Year",
              fieldname: "year",
              fieldtype: "Data",
              default: frm.doc.year,
            },
            {
              label: "Select Month",
              fieldname: "month",
              fieldtype: "Select",
              options: [
                "Select",
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
              ],
            },
            {
              label: "Select Employee",
              fieldname: "employee",
              fieldtype: "Link",
              options: "Employee",
            },
          ],
          (values) => {
            const months = {
              January: 1,
              February: 2,
              March: 3,
              April: 4,
              May: 5,
              June: 6,
              July: 7,
              August: 8,
              September: 9,
              October: 10,
              November: 11,
              December: 12,
            };

            let monthNum = months[values.month];

            const currentDate = new Date();
            const currentMonth = currentDate.getMonth() + 1;

            if (monthNum && currentMonth < monthNum) {
              frappe.validated = false;
              frappe.throw({
                message: "Pay Slips cannot be generated for future months!",
                title: "Error",
                indicator: "red",
              });
            }
            frappe.call({
              method: "mygstcafe.regenrate_pay_slips.regenerate_pay_slip",
              args: {
                selected_year: values.year,
                selected_month: monthNum,
                selected_emp: values.employee,
              },
              callback: function (res) {
                console.log(res);
              },
            });
          }
        );
      });
    }
  },

  before_save(frm) {
    frm.set_value("add_regenrate_button", 1);
  },

  after_save(frm) {
    createPaySlipList(frm)
  },

  select_month(frm) {
    const monthName = frm.doc.select_month;
    const months = {
      January: 1,
      February: 2,
      March: 3,
      April: 4,
      May: 5,
      June: 6,
      July: 7,
      August: 8,
      September: 9,
      October: 10,
      November: 11,
      December: 12,
    };

    let monthNum = months[monthName];

    if (!monthNum) {
      frappe.msgprint("Invalid month name.");
      return;
    }

    frm.set_value("month", monthNum);

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;

    if (monthNum && currentMonth < monthNum) {
      frappe.validated = false;
      frappe.throw({
        message: "Pay Slips cannot be generated for future months!",
        title: "Error",
        indicator: "red",
      });
    }
  },

  validate: function (frm) {
    if (preventSubmission) {
      frappe.validate = false;
    }
  },

  genrate_for_all(frm) {
    frm.set_df_property(
      "select_company",
      "hidden",
      frm.doc.genrate_for_all ? 1 : 0
    );
    frm.set_value("select_company", "");
    frm.set_df_property(
      "company_abbr",
      "hidden",
      frm.doc.genrate_for_all ? 1 : 0
    );
    frm.set_value("company_abbr");
    frm.set_df_property(
      "select_employee",
      "hidden",
      frm.doc.genrate_for_all ? 1 : 0
    );
    frm.set_value("select_employee", "");
    frm.set_df_property(
      "select_employee",
      "disabled",
      frm.doc.genrate_for_all ? 1 : 0
    );
  },

});

function add_email_btn(frm) {
  frm.fields_dict["created_pay_slips"].grid.wrapper
    .find(".grid-add-row")
    .hide();
   frm.fields_dict["created_pay_slips"].grid.wrapper
    .find(".grid-remove-rows")
    .hide();
  frm.fields_dict["created_pay_slips"].grid.add_custom_button(
    "Email Pay Slips",
    function () {
      let selected_rows =
        frm.fields_dict["created_pay_slips"].grid.get_selected();

      if (selected_rows.length > 0) {
        frappe.call({
          method: "mygstcafe.api.email_pay_slip",
          args: {
            raw_data: selected_rows,
          },
          callback: function (res) {
            frappe.msgprint("Pay slip emailed successfully!");
          },
          error: function (r) {
            frappe.msgprint(r.message);
          },
        });
      } else {
        frappe.msgprint("No row selected!");
      }
    },
    "Actions"
  );
}

function createPaySlipList(frm){
  frappe.call({
    method: "mygstcafe.api.get_pay_slip_list",
    args: {
      month: frm.doc.month,
      parent_docname: frm.docname,
    },
    callback: function (res) {
      frm.reload_doc();
    },
    error: function (r) {
      frappe.msgprint(r.message);
    },
  });
}