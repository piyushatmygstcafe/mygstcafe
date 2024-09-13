// Copyright (c) 2024, mygstcafe and contributors
// For license information, please see license.txt

frappe.ui.form.on("Pay Slips", {
  refresh(frm) {
    const fields = [
      "full_days_working_rate",
      "half_day_working_rate",
      "quarter_day_working_rate",
      "three_four_quarter_days_rate",
      "lates_rate",
    ];

    fields.forEach((field) => {
      frm.set_value(field, frm.doc.per_day_salary);
    });
    otherEarningsAmount =
      frm.doc.other_earnings_incentives +
      frm.doc.other_earning_project_deadline_allowance +
      frm.doc.other_earnings_special_incentives +
      frm.doc.other_earnings_overtime;

    frm.set_value("other_earnings_amount", otherEarningsAmount);

    let currentMonth = frm.doc.for_month;
    let monthName;

    switch (currentMonth) {
      case "1":
        monthName = "January";
        break;
      case "2":
        monthName = "February";
        break;
      case "3":
        monthName = "March";
        break;
      case "4":
        monthName = "April";
        break;
      case "5":
        monthName = "May";
        break;
      case "6":
        monthName = "June";
        break;
      case "7":
        monthName = "July";
        break;
      case "8":
        monthName = "August";
        break;
      case "9":
        monthName = "September";
        break;
      case "10":
        monthName = "October";
        break;
      case "11":
        monthName = "November";
        break;
      case "12":
        monthName = "December";
        break;
      default:
        console.log("Invalid month");
        return null; // Exit if an invalid month is selected
    }

    frm.set_value("month", monthName);
  },
  lates_amount(frm) {
    totalMonthlySalary =
      frm.doc.full_day_working_amount +
      frm.doc.quarter_day_working_amount +
      frm.doc.half_day_working_amount +
      frm.doc.three_four_quarter_days_working_amount -
      frm.doc.lates_amount;
    frm.set_value("total_monthly_salary", totalMonthlySalary);
  },
  full_days_working_rate(frm) {
    frm.set_value(
      "full_day_working_amount",
      frm.doc.full_day_working_days * frm.doc.full_days_working_rate * 1
    );
  },

  quarter_day_working_rate(frm) {
    frm.set_value(
      "quarter_day_working_amount",
      frm.doc.quarter_day_working_days * frm.doc.quarter_day_working_rate * 0.75
    );
  },

  half_day_working_rate(frm) {
    frm.set_value(
      "half_day_working_amount",
      frm.doc.half_day_working_days * frm.doc.half_day_working_rate * 0.5
    );
  },

  three_four_quarter_days_rate(frm) {
    frm.set_value(
      "three_four_quarter_days_working_amount",
      frm.doc.three_four_quarter_days_working_days *
        frm.doc.three_four_quarter_days_rate *
        0.25
    );
  },
  lates_rate(frm) {
    frm.set_value(
      "lates_amount",
      frm.doc.lates_days * frm.doc.lates_rate * 0.1
    );
  },
});
