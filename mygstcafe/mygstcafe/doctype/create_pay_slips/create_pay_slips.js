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

  select_month(frm) {
    let select_month = frm.doc.select_month;
    let currentMonth = get_month(select_month);
    frm.set_value("month", currentMonth);

    // Calculate working days based on the selected month
    let workingDays;
    if (currentMonth === 2) {
      // Check for leap year
      workingDays =
        (frm.doc.year % 4 === 0 && frm.doc.year % 100 !== 0) ||
        frm.doc.year % 400 === 0
          ? 29
          : 28;
    } else if ([4, 6, 9, 11].includes(currentMonth)) {
      workingDays = 30;
    } else {
      workingDays = 31;
    }

    frm.set_value("working_days", workingDays);
  },

  genrate_for_all(frm) {
    frm.set_df_property(
      "select_company",
      "hidden",
      frm.doc.genrate_for_all ? 1 : 0
    );
  },
});

function get_month(month) {
  let currentMonth;
  switch (month) {
    case "January":
      currentMonth = 1;
      break;
    case "February":
      currentMonth = 2;
      break;
    case "March":
      currentMonth = 3;
      break;
    case "April":
      currentMonth = 4;
      break;
    case "May":
      currentMonth = 5;
      break;
    case "June":
      currentMonth = 6;
      break;
    case "July":
      currentMonth = 7;
      break;
    case "August":
      currentMonth = 8;
      break;
    case "September":
      currentMonth = 9;
      break;
    case "October":
      currentMonth = 10;
      break;
    case "November":
      currentMonth = 11;
      break;
    case "December":
      currentMonth = 12;
      break;
    default:
      console.log("Invalid month");
      return null; // Exit if an invalid month is selected
  }

  return currentMonth;
}
