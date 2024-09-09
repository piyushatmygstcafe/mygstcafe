// Copyright (c) 2024, mygstcafe and contributors
// For license information, please see license.txt

frappe.ui.form.on("Pay Slip Generator", {
  refresh(frm) {
    frm.set_value("select_company", "");
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
