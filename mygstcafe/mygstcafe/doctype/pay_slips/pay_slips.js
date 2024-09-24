// Copyright (c) 2024, mygstcafe and contributors
// For license information, please see license.txt

frappe.ui.form.on("Pay Slips", {
  before_save(frm) {
    const fields = [
      "full_days_working_rate",
      "half_day_working_rate",
      "quarter_day_working_rate",
      "three_four_quarter_days_rate",
      "lates_rate",
      "sunday_working_rate",
    ];
    fields.forEach((field) => {
      frm.set_value(field, frm.doc.per_day_salary);
    });
  },
});
