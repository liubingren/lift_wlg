"use strict";

var getlogList = function getlogList(pagesize, page) {
  var url = HEADER + "/log/check_listLogs.do";
  var keyworks = $("#searchText").val();
  var html = '';
  $.ajax({
    type: 'get',
    url: url,
    data: {
      page: page,
      pagesize: pagesize,
      keywords: keyworks
    }, success: function success(data) {
      var dataList = data.data.list;
      for (var i = 0; i < dataList.length; i++) {
        html += "<tr data-id=\"" + dataList[i].id + "\">\n                    <td>" + (i + 1) + "</td>\n                    <td>" + (!!dataList[i].username ? dataList[i].username : '') + "</td>\n                    <td>" + (!!dataList[i].modelname ? dataList[i].modelname : '') + "</td>\n                    <td>" + (!!dataList[i].ip ? dataList[i].ip : '') + "</td>\n                    <td>" + (!!dataList[i].method ? dataList[i].method : '') + "</td>\n                    <td title=\"" + (!!dataList[i].content ? dataList[i].content : '') + "\">" + (!!dataList[i].content ? dataList[i].content : '') + "</td>\n                    <td>" + (!!dataList[i].logdate ? dataList[i].logdate : '') + "</td>\n                </tr>";
      }
      $("#logInfo").html(html);
      Page.loadTotalPage(data.data);
    }
  });
};

/*---------------------------------上面是函数定义区, 下面是代码执行区----------------------------------------------------------------*/
getlogList(10, 1);
window.onresize = function () {
  setWrapperWidth();
};
//查询
$('#query').on('click', function () {
  $('#current-page').html(1);
  $('#input-page').val(1);
  Page.currentPage = 1;
  getlogList(10, 1);
});

//跳转到指定页数
$("#jump-into").click(function () {
  var jumpPage = $("#input-page").val() - 0;
  Page.jumpIntoPage(jumpPage, getlogList, 2, 10);
});

//点击翻页组件触发
$('#page-bar').delegate('li:not(:last)', 'click', function () {
  var thisClass = this.classList[0];
  Page.pageTurning(thisClass, getlogList, 2, 10);
});
//# sourceMappingURL=log_management.js.map