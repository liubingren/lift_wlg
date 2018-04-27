'use strict';

//修改,查看或者审核工单
var operatingOrder = function operatingOrder(operating, dom) {
  if (operating && operating) {
    var pa = $(dom).parent();
    var plan_id = pa.attr('plan_id');
    var workOrder = pa.attr('workOrder');
    if (plan_id) {
      window.location.href = '../html/addOrUpdate_maintenancePlan.html?plan_id=' + plan_id + '&action=' + operating;
    }
    if (workOrder) {
      window.location.href = '../html/examine_maintainworkorder.html?orderId=' + workOrder + '&action=' + operating;
    }
  } else {
    window.location.href = '../html/addOrUpdate_maintenancePlan.html';
  }
};

//初始化或更新表格数据
var initTable = function initTable(pagesize, page) {
  $.ajax({
    type: 'get',
    data: {
      page: page,
      pagesize: pagesize
    },
    url: HEADER + 'maintPlan/check_listMaintPlanForPage.do',
    success: function success(data) {
      console.log(data);
      Page.loadTotalPage(data.data);
      constructTable(data.data.list);
    }
  });
};

//构造表格
var constructTable = function constructTable(data) {
  var str = '';
  if (data && data.length) {
    for (var i = 0; i < data.length; i++) {
      str += '<tr>\n                        <td><input type="checkbox" name="order" value="' + data[i].plan_id + '"/></td>\n                        <td plan_id="' + data[i].plan_id + '"><span onclick="operatingOrder(\'watch\',this)" style="color: blue;cursor: pointer">' + data[i].id_nr + '</span></td>\n                        <td workOrder="' + data[i].work_order + '"><span onclick="operatingOrder(\'watchfromPlan\',this)" style="color: blue;cursor: pointer">' + data[i].plan_num + '</span></td>\n                        <td>' + data[i].template_name + '</td>\n                        <td>' + data[i].maint_comp_value + '</td>\n                        <td>' + data[i].maint_staff_value + '</td>\n                        <td>' + data[i].order_status_value + '</td>\n                        <td plan_id="' + data[i].plan_id + '">\n                            <button class="edit" onclick="operatingOrder(\'edit\',this)">\u4FEE\u6539</button>\n                        </td>\n                    </tr>';
    }
    $("#content tbody").html('').html(str);
  } else {
    $("#content tbody").html('');
  }
};

// 删除选中的一条或者多条工单
var deleteWorkOrder = function deleteWorkOrder(plan_id) {
  $.ajax({
    type: 'post',
    data: {
      plan_id: plan_id
    },
    url: HEADER + 'maintPlan/delete_MaintPlan.do',
    success: function success(data) {
      initTable(10, 1);
      secondPop(data.code, data.msg);
    }
  });
};

// 全选方法
var checkAll = function checkAll(dom, tableId) {
  var checkItems = document.getElementById(tableId).getElementsByTagName('input');
  for (var i = 0; i < checkItems.length; i++) {
    var checkItem = checkItems[i];
    checkItem.checked = dom.checked;
  }
};

// 查询
var search = function search(pagesize, page) {
  var id_nr = $('#device_code').val();
  var maintenanceType = $('#maintenanceSpan').attr("spanAttr");

  $.ajax({
    type: 'get',
    data: {
      id_nr: id_nr,
      template_type: maintenanceType,
      page: page,
      pagesize: pagesize
    },
    url: HEADER + 'maintPlan/check_listMaintPlanForPage.do',
    beforeSend: function beforeSend() {
      loading();
    },
    success: function success(data) {
      disLoading();
      Page.loadTotalPage(data.data);
      constructTable(data.data.list);
    }
  });
};

/**
 *初始化
 * */
initTable(10, 1);

//适配不同分辨率
window.onresize = function () {
  setWrapperWidth();
};

/**
 *事件触发
 * */
//下拉列表公用
$('.select_box span').click(function () {
  $(this).parent().find('ul.son_ul').show();
  //li的hover效果方法触发 mouseenter 和 mouseleave 事件
  $(this).parent().find('li').hover(function () {
    $(this).addClass('hover');
  }, function () {
    $(this).removeClass('hover');
  });
  $(this).parent().hover(function () {}, function () {
    $(this).parent().find("ul.son_ul").hide();
  });
});
$('ul.son_ul').on('click', 'li', function () {
  var selectText = $(this).closest('.selectText');
  var aSpan = $(this).parents('li').find('span');
  aSpan.attr('spanAttr', $(this).attr('itemAttr'));
  aSpan.html($(this).html() + '<div></div><p></p>').attr('title', $(this).html());
  $(this).parents('li').find('ul').hide();
});

//查询
$('#query').on('click', function () {
  $('#current-page').html(1);
  $('#input-page').val(1);
  Page.currentPage = 1;
  search(10, 1);
});

//重置
$('#reset').on('click', function () {
  $('#device_code').val('');
  $('#maintenanceSpan').attr('spanAttr', '').html('请选择维保类型').attr('title', '请选择维保类型');
});

//批量删除
$(".btnGroup>div span:last-child").click(function () {
  var checkedIds = [];
  $(".tableWrap tbody tr input[type='checkbox']:checked").each(function () {
    checkedIds.push($(this).val());
  });
  var checkedIdsStr = checkedIds.join(",");
  deleteWorkOrder(checkedIdsStr);
});

//跳转到指定页数
$("#jump-into").click(function () {
  var jumpPage = $("#input-page").val() - 0;
  var fn = void 0;
  if ($('#device_code').val() != null || $('#workorderTypeSpan').text() !== '请选择维保类型') {
    fn = search;
  } else {
    fn = initTable;
  }
  Page.jumpIntoPage(jumpPage, fn, 2, 10);
});

//点击翻页组件触发
$('#page-bar').delegate('li:not(:last)', 'click', function () {
  var thisClass = this.classList[0];
  var fn = void 0;
  if ($('#device_code').val() != null || $('#workorderTypeSpan').text() !== '请选择维保类型') {
    fn = search;
  } else {
    fn = initTable;
  }

  Page.pageTurning(thisClass, fn, 2, 10);
});
//# sourceMappingURL=maintenancePlan.js.map