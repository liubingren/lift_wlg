'use strict';

//初始化或更新表格数据
var initTable = function initTable(pagesize, page) {
  $.ajax({
    type: 'get',
    data: {
      page: page,
      pagesize: pagesize
    },
    url: HEADER + 'monitoringEquipment/check_getMonitoringEquipmentForPage.do',
    beforeSend: function beforeSend() {
      loading();
    },
    success: function success(data) {
      console.log(data);
      disLoading();
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
      var statusType = '';
      var radioIsShow = true;
      var radioHTML = '<span class="radio" onclick="singleElection(this);" id="' + data[i].id + '"></span>';
      if (data[i].status === "已处理") {
        statusType = 'red';
        radioHTML = '';
      }

      str += '<tr>      \n                        <td>' + radioHTML + '</td>\n                        <td title="' + data[i].id_nr + '">' + data[i].id_nr + '</td>\n                        <td title="' + data[i].unit_id + '">' + data[i].unit_id + '</td>\n                        <td title="' + data[i].inst_addr + '">' + data[i].inst_addr + '</td>\n                        <td title="' + data[i].fault_code + '">' + data[i].fault_code + '</td>\n                        <td title="' + data[i].createtime + '">' + data[i].createtime + '</td>\n                        <td class="' + statusType + '">' + data[i].status + '</td>\n                    </tr>';
    }
    $("#content tbody").html('').html(str);
  } else {
    $("#content tbody").html('');
  }
};

//h获取url中的参数值
var parseQueryString = function parseQueryString(url) {
  var json = {};
  var arr = url.substr(url.indexOf('?') + 1).split('&');
  arr.forEach(function (item) {
    var tmp = item.split('=');
    json[tmp[0]] = tmp[1];
  });
  return json;
};

// 查询
var search = function search(pagesize, page) {
  var id_nr = $('#device_code').val();
  var unit_id = $('#unit_id').val();
  var order_status = $('#stateSpan').attr('state');
  var start_time = $('#start_t').val();
  var end_time = $('#end_t').val();
  $.ajax({
    type: 'get',
    data: {
      id_nr: id_nr,
      unit_id: unit_id,
      status: order_status,
      begindate: start_time,
      enddate: end_time,
      page: page,
      pagesize: pagesize
    },
    url: HEADER + 'monitoringEquipment/check_getMonitoringEquipmentForPage.do',
    beforeSend: function beforeSend() {
      loading();
    },
    success: function success(data) {
      disLoading();
      console.log(data);
      Page.loadTotalPage(data.data);
      constructTable(data.data.list);
    }
  });
};

//单选
var singleElection = function singleElection(dom) {
  $(".center table td .radio").removeClass("click");
  $(dom).toggleClass("click");
};

//更新监测异常设备为已处理
var confirmAlterToChanged = function confirmAlterToChanged(dom) {
  $.ajax({
    type: 'post',
    data: {
      id: $(dom).attr("id")
    },
    url: HEADER + 'monitoringEquipment/update_checkedMonitoringEquipment.do',
    success: function success(data) {
      closeBtn($(".close-btn")[0], 'delete-pop');
      secondPop(data.code, data.msg);
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
//时间选择器
laydate.render({
  elem: '#start_t',
  type: 'datetime',
  done: function done(value) {
    $('#start_t').val(value);
  }
});
laydate.render({
  elem: '#end_t',
  type: 'datetime',
  done: function done(value) {
    $('#end_t').val(value);
  }
});

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
  if (aSpan.attr('id') === 'stateSpan') {
    aSpan.attr('state', $(this).attr('state'));
  } else {
    aSpan.attr('alarmtype', $(this).attr('alarmtype'));
  }
  aSpan.html($(this).html() + '<div></div><p></p>').attr('title', $(this).html());
  if ($(this).closest('.selectText').hasClass("rid")) {
    $(this).closest('.selectText').attr('rid', $(this).attr('rid'));
  } else {
    $(this).closest('.selectText').attr('sex', $(this).text());
  }
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
  $('#unit_id').val('');
  $('#stateSpan').attr('state', '').html('请选择处理状态').attr('title', '请选择处理状态');
  $('#start_t').val('');
  $('#end_t').val('');
});

//更新监测异常设备为已处理信心提示框弹出
$("#alterToChanged").click(function () {
  var id = $(".radio.click").attr("id");
  if (id) {
    openDelete("确认更改为已处理？");
    $(".submit-user-info").attr("id", id);
  } else {
    secondPop(0, '请先选择需要修改的设备条目!');
  }
});

//跳转到指定页数
$("#jump-into").click(function () {
  var jumpPage = $("#input-page").val() - 0;
  var fn = void 0;
  if ($('#device_code').val() != null || $('#unit_id').val() != null || $('#stateSpan').text() !== '请选择处理状态' || $('#start_t').val() != null || $('#end_t').val() != null) {
    fn = search;
    Page.jumpIntoPage(jumpPage, fn, 2, 10);
  } else {
    fn = initTable;
    Page.jumpIntoPage(jumpPage, fn, 2, 10);
  }
});

//点击翻页组件触发
$('#page-bar').delegate('li:not(:last)', 'click', function () {
  var thisClass = this.classList[0];
  var fn = void 0;
  if ($('#device_code').val() || $('#unit_id').val() || $('#stateSpan').text() !== '请选择处理状态' || $('#start_t').val() || $('#end_t').val()) {
    fn = search;
    Page.pageTurning(thisClass, fn, 2, 10, undefined);
  } else {
    fn = initTable;
    Page.pageTurning(thisClass, fn, 2, 10);
  }
});
//# sourceMappingURL=testingEquipmentManager.js.map