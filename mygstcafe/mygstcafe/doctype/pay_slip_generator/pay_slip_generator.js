// Copyright (c) 2024, mygstcafe and contributors
// For license information, please see license.txt

frappe.ui.form.on("Pay Slip Generator", {
  refresh(frm) {
    let currentYear = new Date().getFullYear();
    frm.set_value("year", currentYear);
    frm.set_value("select_company", "");
  },
  
  select_month: function (frm) {
    let select_month = frm.doc.select_month;
    let currentMonth;

    switch (select_month) {
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
        return; // Exit if an invalid month is selected
    }

    frm.set_value("month", currentMonth);

    // Calculate working days based on the selected month
    let workingDays;
    if (currentMonth === 2) {
      // Check for leap year
      workingDays = (frm.doc.year % 4 === 0 && frm.doc.year % 100 !== 0) || frm.doc.year % 400 === 0 ? 29 : 28;
    } else if ([4, 6, 9, 11].includes(currentMonth)) {
      workingDays = 30;
    } else {
      workingDays = 31;
    }

    frm.set_value("working_days", workingDays);
  },

  genrate_for_all: function (frm) {
    if (frm.doc.genrate_for_all) {
      frm.set_df_property("select_company", "hidden", 1);
      frm.set_value("select_company", "");
    } else {
      frm.set_df_property("select_company", "hidden", 0);
    }
  },
});
