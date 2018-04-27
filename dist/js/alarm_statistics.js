'use strict';

//初始化或更新表格数据
var initTable = function initTable(pagesize, page) {
  $.ajax({
    type: 'get',
    data: {
      page: page,
      pagesize: pagesize
    },
    url: HEADER + 'bigScreen/check_listAlarm.do',
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
      var statusText = void 0;
      var statusType = void 0;
      switch (data[i].order_status) {
        case 1:
          statusText = '未处理', statusType = 'status1';
          break;
        case 2:
          statusText = '处理中';
          break;
        case 3:
          statusText = '已处理';
          break;
      }
      str += '<tr>\n                        <td>' + data[i].id_nr + '</td>\n                        <td>' + data[i].unit_id + '</td>\n                        <td>' + data[i].inst_addr + '</td>\n                        <td>' + data[i].fault_time + '</td>\n                        <td>' + data[i].fault_type + '</td>\n                        <td class="' + statusType + '">' + statusText + '</td>\n                        <td><span onclick="confirmAlarm(this);" data-id="' + data[i].lift_id + '">\u67E5\u770B\u7535\u68AF\u8FD0\u884C\u72B6\u6001>></span></td>\n                    </tr>';
    }
    $("#content tbody").html('').html(str);
  } else {
    $("#content tbody").html('');
  }
};

//返回到上个页面
var goBackHistory = function goBackHistory() {
  window.location.href = '../html/large_screen.html';
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
var search = function search(pagesize, stateValue, page) {
  var id_nr = $('#device_code').val();
  var alarm_type = $('#alarmTypeSpan').attr('alarmType');
  var order_status = stateValue || $('#stateSpan').attr('state');
  var start_time = $('#start_t').val();
  var end_time = $('#end_t').val();
  $.ajax({
    type: 'get',
    data: {
      id_nr: id_nr,
      alarm_type: alarm_type,
      order_status: order_status,
      start_time: start_time,
      end_time: end_time,
      page: page,
      pagesize: pagesize
    },
    url: HEADER + 'bigScreen/check_listAlarm.do',
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

//页面初始化
var init = function init() {
  var stateValue = parseQueryString(window.location.href).stateValue;
  if (stateValue) {
    search(10, stateValue, 1);
    var stateValueText = void 0;
    switch (stateValue) {
      case '1':
        stateValueText = '未处理';
        break;
      case '3':
        stateValueText = '已处理';
        break;
    }
    $("#stateSpan").attr('state', stateValue).html(stateValueText);
  } else {
    initTable(10, 1);
  }
};

/**
 *初始化
 * */

init();

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
  search(10, undefined, 1);
});

//重置
$('#reset').on('click', function () {
  $('#device_code').val('');
  $('#alarmTypeSpan').attr('alarmType', '').html('请选择报警类型').attr('title', '请选择报警类型');
  $('#stateSpan').attr('state', '').html('请选择处理状态').attr('title', '请选择处理状态');
  $('#start_t').val('');
  $('#end_t').val('');
});

//跳转到指定页数
$("#jump-into").click(function () {
  var jumpPage = $("#input-page").val() - 0;
  var fn = void 0;
  if ($('#device_code').val() != null || $('#alarmTypeSpan').text() !== '请选择报警类型' || $('#stateSpan').text() !== '请选择处理状态' || $('#start_t').val() != null || $('#end_t').val() != null) {
    fn = search;
    Page.jumpIntoPage(jumpPage, fn, 2, 10, undefined);
  } else {
    fn = initTable;
    Page.jumpIntoPage(jumpPage, fn, 2, 10);
  }
});

//点击翻页组件触发
$('#page-bar').delegate('li:not(:last)', 'click', function () {
  var thisClass = this.classList[0];
  var fn = void 0;
  if ($('#device_code').val() != null || $('#alarmTypeSpan').text() !== '请选择报警类型' || $('#stateSpan').text() !== '请选择处理状态' || $('#start_t').val() != null || $('#end_t').val() != null) {
    fn = search;
    Page.pageTurning(thisClass, fn, 2, 10, undefined);
  } else {
    fn = initTable;
    Page.pageTurning(thisClass, fn, 2, 10);
  }
});
//# sourceMappingURL=alarm_statistics.js.map