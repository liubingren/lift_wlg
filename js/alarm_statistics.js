//初始化或更新表格数据
const initTable = (pagesize, page) => {
  $.ajax({
    type: 'get',
    data: {
      page: page,
      pagesize: pagesize
    },
    url: HEADER + 'bigScreen/check_listAlarm.do',
    beforeSend: () => {
      loading()
    },
    success: (data) => {
      console.log(data)
      disLoading();
      Page.loadTotalPage(data.data);
      constructTable(data.data.list)
    }
  })
}

//构造表格
const constructTable = (data) => {
  let str = ``;
  if (data && data.length) {
    for (let i = 0; i < data.length; i++) {
      let statusText;
      let statusType;
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
      str += `<tr>
                        <td>${data[i].id_nr}</td>
                        <td>${data[i].unit_id}</td>
                        <td>${data[i].inst_addr}</td>
                        <td>${data[i].fault_time}</td>
                        <td>${data[i].fault_type}</td>
                        <td class="${statusType}">${statusText}</td>
                        <td><span onclick="confirmAlarm(this);" data-id="${data[i].lift_id}">查看电梯运行状态>></span></td>
                    </tr>`;
    }
    $("#content tbody").html('').html(str);
  } else {
    $("#content tbody").html('')
  }
}

//返回到上个页面
const goBackHistory = () => {
  window.location.href =`../html/large_screen.html`;
}

//h获取url中的参数值
const parseQueryString = (url) => {
  let json = {}
  let arr = url.substr(url.indexOf('?') + 1).split('&')
  arr.forEach(function (item) {
    let tmp = item.split('=')
    json[tmp[0]] = tmp[1]
  })
  return json
}

// 查询
const search = (pagesize,stateValue,page) => {
  let id_nr = $('#device_code').val();
  let alarm_type = $('#alarmTypeSpan').attr('alarmType');
  let order_status =stateValue|| $('#stateSpan').attr('state');
  let start_time = $('#start_t').val();
  let end_time = $('#end_t').val();
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
    beforeSend: () => {
      loading()
    },
    success: (data) => {
      disLoading();
      console.log(data);
      Page.loadTotalPage(data.data);
      constructTable(data.data.list);
    }
  })
}

//页面初始化
const init = () => {
  let stateValue = parseQueryString(window.location.href).stateValue;
  if (stateValue) {
    search(10, stateValue, 1);
    let stateValueText;
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
    initTable(10,1)
  }
}

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
  done: function done (value) {
    $('#start_t').val(value);
  }
});
laydate.render({
  elem: '#end_t',
  type: 'datetime',
  done: function done (value) {
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
  let selectText = $(this).closest('.selectText');
  let aSpan = $(this).parents('li').find('span');
  if (aSpan.attr('id') === 'stateSpan') {
    aSpan.attr('state', $(this).attr('state'))
  } else {
    aSpan.attr('alarmtype', $(this).attr('alarmtype'))
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
  $('#current-page').html(1)
  $('#input-page').val(1)
  Page.currentPage=1
  search(10,undefined,1);
})

//重置
$('#reset').on('click', function () {
  $('#device_code').val('');
  $('#alarmTypeSpan').attr('alarmType', '').html('请选择报警类型').attr('title', '请选择报警类型');
  $('#stateSpan').attr('state', '').html('请选择处理状态').attr('title', '请选择处理状态');
  $('#start_t').val('');
  $('#end_t').val('');
})

//跳转到指定页数
$("#jump-into").click(function () {
  let jumpPage = $("#input-page").val() - 0;
  let fn
  if ($('#device_code').val() != null || $('#alarmTypeSpan').text() !== '请选择报警类型' || $('#stateSpan').text() !== '请选择处理状态' || $('#start_t').val() != null || $('#end_t').val() != null) {
    fn = search;
    Page.jumpIntoPage(jumpPage, fn, 2, 10,undefined);
  } else {
    fn = initTable;
    Page.jumpIntoPage(jumpPage, fn, 2, 10);
  }
})

//点击翻页组件触发
$('#page-bar').delegate('li:not(:last)', 'click', function () {
  let thisClass = this.classList[0];
  let fn;
  if ($('#device_code').val() != null || $('#alarmTypeSpan').text() !== '请选择报警类型' || $('#stateSpan').text() !== '请选择处理状态' || $('#start_t').val() != null || $('#end_t').val() != null) {
    fn = search;
    Page.pageTurning(
      thisClass,
      fn,
      2,
      10,
      undefined)
  } else {
    fn = initTable;
    Page.pageTurning(
      thisClass,
      fn,
      2,
      10)
  }
})