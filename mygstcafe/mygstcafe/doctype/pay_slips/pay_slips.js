// Copyright (c) 2024, mygstcafe and contributors
// For license information, please see license.txt

frappe.ui.form.on("Pay Slips", {
  refresh(frm) {
    const fields = [
      "full_days_working_rate",
      "half_day_working_rate",
      "quarter_day_working_rate",
      "3_4_quarter_days_rate",
      "lates_rate",
    ];

    fields.forEach((field) => {
      frm.set_value(field, frm.doc.per_day_salary);
    });
  },
});
