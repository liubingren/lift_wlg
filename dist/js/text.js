"use strict";

$("screlation", SCFILE_READONLY).setOrderBy(['depend'], [SCFILE_ASC]).select("depend.filename=\"incidents\" and source=\"" + fulfilled_record_id + "\"").iterate(function (record) {
  var interaction_id = record.depend;
  var query = "application=\"incidents\" and topic=\"" + interaction_id + "\" and segment=0";

  $("SYSATTACHMENTS", SCFILE_READONLY).select(query).iterate(function (attachment) {
    // build HTML
    var sRowClass = "TableCellResults"; //iLineCount%2==0 ? "evenRow" : "oddRow";
    var file_size = Math.round(attachment.size / 1024);
    if (file_size == 0) {
      file_size = 1;
    }
    //	iLineCount++;  	// counter for even / odd row
    sHtmlReturn += "<tr class=\"TableNormalRow\">";
    sHtmlReturn += "<td class=\"" + sRowClass + "\"><div><a class=\"shadowFocus\" tabindex=\"0\" href=\"scattach://" + attachment.uid + ":" + attachment.filename + ":incidents:" + interaction_id + "\"><div class=\"Text FormatTableElementReadonly\"><span class=\"xTableCell FormatTableElementReadonly\" style=\"text-decoration:underline;color:#0000FF;\">" + attachment.filename + "</span></div></a></div></td>";
    sHtmlReturn += "<td class=\"" + sRowClass + "\"><div tabindex=\"0\" class=\"shadowFocus\"><div class=\"Text FormatTableElementReadonly\"><span class=\"file_Approval field_approval_status xTableCell FormatTableElementReadonly value_pending\">" + file_size + "</span></div></div></td>";
    sHtmlReturn += "<td class=\"" + sRowClass + "\"><div tabindex=\"0\" class=\"shadowFocus\"><div class=\"Text FormatTableElementReadonly\"><span class=\"file_Approval field_approval_status xTableCell FormatTableElementReadonly value_pending\">" + interaction_id + "</span></div></div></td>";
    sHtmlReturn += "</tr>" + sCR;
  });
});
//# sourceMappingURL=text.js.map