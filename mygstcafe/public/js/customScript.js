$(document).on("page-change", function () {
  setupPage();
});

function setupPage() {
  console.log("Page setup code running");
  debugger;
  frappe.require("hrms/hrms/hr/doctype/attendance_list.js");
  frappe.listview_settings["Attendance"] = {
    onload: function (list_view) {
      list_view.page.add_menu_item("Generate Pay Slips", () => {
        frappe.set_route("Form", "Pay Slip Generator", "new");
      });
    },
  };
}
