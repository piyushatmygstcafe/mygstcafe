// Copyright (c) 2024, mygstcafe and contributors
// For license information, please see license.txt

frappe.ui.form.on("Create Pay Slips", {
  refresh(frm) {
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
            let month = get_month(values.month);
            frappe.call({
              method: "mygstcafe.regenrate_pay_slips.regenerate_pay_slip",
              args: {
                selected_year: values.year,
                selected_month: month,
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
  },

  month(frm) {
    const monthName = frm.doc.month;
    let monthNum;

    currentDate = new Date()
    currentMonth = currentDate.getMonth()

    // Use a switch statement to map month names to numbers
    switch (monthName) {
      case "January":
        monthNum = 1;
        break;
      case "February":
        monthNum = 2;
        break;
      case "March":
        monthNum = 3;
        break;
      case "April":
        monthNum = 4;
        break;
      case "May":
        monthNum = 5;
        break;
      case "June":
        monthNum = 6;
        break;
      case "July":
        monthNum = 7;
        break;
      case "August":
        monthNum = 8;
        break;
      case "September":
        monthNum = 9;
        break;
      case "October":
        monthNum = 10;
        break;
      case "November":
        monthNum = 11;
        break;
      case "December":
        monthNum = 12;
        break;
      default:
        frappe.msgprint("Invalid month name.");
        monthNum = null; // Set to null or some default value if month name is invalid
        break;
    }

    if (currentMonth < monthNum) {
      frappe.msgprint({
        message: "Pay Slips can not be generated for future months!",
        title: "Warning",
        indicator: "orange" // You can also use "red" for errors, "green" for success, etc.
    });
    }
    
  },

  genrate_for_all(frm) {
    frm.set_df_property(
      "select_company",
      "hidden",
      frm.doc.genrate_for_all ? 1 : 0
    );
  },
});
