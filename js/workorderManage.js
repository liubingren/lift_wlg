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

let orderType = parseQueryString(window.location.href).orderType;
//修改,查看或者审核工单
const operatingOrder = (dom, operating) => {
  let pa = $(dom).parent();
  let orderId = pa.attr('orderId');
  let orderType = pa.attr('orderType');

  switch (orderType) {
    case "维修工单":
      window.location.href = `../html/maintain_workorderManage.html?orderId=${orderId}&action=${operating}`;
      break;
    case "报警工单":
      if (operating === 'watch') {
        window.location.href = `../html/examine_workorderalarm.html?orderId=${orderId}&action=${operating}`;
        break;
      } else if (operating === 'edit') {
        window.location.href = `../html/add_workorderalarm.html?orderId=${orderId}&action=${operating}`;
        break;
      } else {
        window.location.href = `../html/examine_workorderalarm.html?orderId=${orderId}&action=${operating}`;
        break;
      }
    case "保养工单":
      if (operating === 'watch') {
        window.location.href = `../html/examine_maintainworkorder.html?orderId=${orderId}&action=${operating}`;
        break;
      } else if (operating === 'edit') {
        window.location.href = `../html/update_maintainworkorder.html?orderId=${orderId}&action=${operating}`;
        break;
      } else {
        window.location.href = `../html/examine_maintainworkorder.html?orderId=${orderId}&action=${operating}`;
        break;
      }
    case "系统故障工单":
      window.location.href = `../html/systemError_workorderManage.html?orderId=${orderId}&action=${operating}`;
      break;
  }
}

//初始化或更新表格数据
const initTable = (pagesize, page) => {
  $.ajax({
    type: 'get',
    data: {
      page: page,
      pagesize: pagesize
    },
    url: HEADER + 'workOrder/check_getWorkOrderForPage.do',
    success: (data) => {
      constructTable(data.data.list);
      Page.loadTotalPage(data.data);
      $(".tableWrap tbody tr").each(function () {
        let orderType = $(this).find('td:nth-child(4)').html();
        let orderStatue = $(this).find('td:nth-child(6)').html();
        if (orderType === "维修工单" && orderStatue === "未处理") {
          $(this).find('td:nth-child(1)>input').css('visibility', 'visiable');
        } else {
          $(this).find('td:nth-child(1)>input').css('visibility', 'hidden');
        }
      });
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
      let checkText;
      let checkisShow = '';
      let editIsShow = `<button class="edit" onclick="operatingOrder(this,'edit')">修改</button>`;
      switch (data[i].order_status) {
        case 1:
          statusText = '未处理', statusType = 'status1';
          break;
        case 2:
          statusText = '处理中';
          break;
        case 3:
          statusText = '已处理';
          checkisShow = `<button class="Check" onclick="operatingOrder(this,'check')">审核</button>`;
          break;
      }
      switch (data[i].check_status) {
        case 1:
          checkText = '未审核';
          break;
        case 2:
          checkText = '审核未通过';
          break;
        case 3:
          checkText = '已审核';
          checkisShow = '';
          editIsShow = '';
          break;
      }
      str += `<tr>
                        <td><input type="checkbox" name="order" value="${data[i].work_order}"/></td>
                        <td>${data[i].id_nr}</td>
                        <td>${data[i].inst_addr}</td>
                        <td>${data[i].order_type_value}</td>
                        <td>${data[i].maint_staff_value}</td>
                        <td>${statusText}</td>
                        <td>${checkText}</td>
                        <td orderId="${data[i].work_order}" orderType="${data[i].order_type_value}"><button class="watch" onclick="operatingOrder(this,'watch')">查看</button>
                        ${editIsShow}${checkisShow}</td>
                    </tr>`;
    }
    $("#content tbody").html('').html(str);
  } else {
    $("#content tbody").html('')
  }
}

// 删除选中的一条或者多条工单
const deleteWorkOrder = (orderId) => {
  $.ajax({
    type: 'post',
    data: {
      id: orderId
    },
    url: HEADER + 'workMaintain/delete_WorkMaintain.do',
    success: (data) => {
      initTable(10, 1);
      secondPop(data.code, data.msg);
    }
  })
}

// 全选方法
const checkAll = (dom, tableId) => {
  let checkItems = document.getElementById(tableId).getElementsByTagName('input');
  for (let i = 0; i < checkItems.length; i++) {
    let checkItem = checkItems[i];
    if ($(checkItem).css("visibility") != "hidden") {
      checkItem.checked = dom.checked;
    }
  }
}

//查询
const search = (pagesize, page) => {
  let id_nr = $('#device_code').val();
  let order_type = $('#workorderTypeSpan').attr('spanAttr');
  let check_status = $('#checkSpan').attr('spanAttr');
  let start_time = $('#start_t').val();
  let end_time = $('#end_t').val();

  $.ajax({
    type: 'get',
    data: {
      id_nr: id_nr,
      order_type: order_type,
      check_status: check_status,
      start_time: start_time,
      end_time: end_time,
      page: page,
      pagesize: pagesize
    },
    url: HEADER + 'workOrder/check_getWorkOrderForPage.do',
    beforeSend: () => {
      loading()
    },
    success: (data) => {
      disLoading();
      Page.loadTotalPage(data.data);
      constructTable(data.data.list);
      $(".tableWrap tbody tr").each(function () {
        let orderType = $(this).find('td:nth-child(4)').html();
        let orderStatue = $(this).find('td:nth-child(6)').html();
        if (orderType === "维修工单" && orderStatue === "未处理") {
          $(this).find('td:nth-child(1)>input').css('visibility', 'visiable');
        } else {
          $(this).find('td:nth-child(1)>input').css('visibility', 'hidden');
        }
      });
    }
  })
}

//搜索栏小屏幕显示
const resize = () => {
  if ($(window).width() < 1602) {
    $(".top_body label").hide()
  } else {
    $(".top_body label").show()
  }
}

//初始化方法
const init = () => {
  if (orderType) {
    let orderTypeText;
    let orderTypeVal;
    switch(orderType){
      case "workMaintain":orderTypeText="维修工单";break;
      case "workfaul":orderTypeText="系统故障工单";break;
      case "workAlarm":orderTypeText="报警工单";break;
      case "workMaintenance":orderTypeText="保养工单";break;
    }
    $('#workorderTypeSpan').attr('spanAttr',orderType).html(orderTypeText).attr('title',orderTypeText);
    search(10, 1);
  } else {
    initTable(10, 1)
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

//搜索栏标签隐藏显示
$(window).on('resize', resize).trigger('resize')

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
  aSpan.attr('spanAttr', $(this).attr('itemAttr'))
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
  Page.currentPage = 1
  search(10, 1);
})

//重置
$('#reset').on('click', function () {
  $('#device_code').val('');
  $('#workorderTypeSpan').attr('spanAttr', '').html('请选择工单类型').attr('title', '请选择工单类型');
  $('#checkSpan').attr('spanAttr', '').html('请选择审核状态').attr('title', '请选择审核状态');
  $('#start_t').val('');
  $('#end_t').val('');
})

//新增维修工单
$('.add').click(function () {
  window.location.href = `../html/maintain_workorderManage.html`
});

$(".btnGroup>div span:last-child").click(function () {
  let checkedIds = [];
  $(".tableWrap tbody tr input[type='checkbox']:checked").each(function () {
    checkedIds.push($(this).val());
  });
  if (checkedIds.length > 0) {
    let checkedIdsStr = checkedIds.join(",");
    deleteWorkOrder(checkedIdsStr);
  } else {
    secondPop(2, "当前未有可选择删除的工单");
  }
})

//跳转到指定页数
$("#jump-into").click(function () {
  let jumpPage = $("#input-page").val() - 0;
  let fn
  if ($('#device_code').val() != null || $('#workorderTypeSpan').text() !== '请选择工单类型' || $('#checkSpan').text() !== '请选择审核状态' || $('#start_t').val() != null || $('#end_t').val() != null) {
    fn = search
  } else {
    fn = initTable
  }
  Page.jumpIntoPage(jumpPage, fn, 2, 10);
})

//点击翻页组件触发
$('#page-bar').delegate('li:not(:last)', 'click', function () {
  let thisClass = this.classList[0];
  let fn;
  if ($('#device_code').val() != null || $('#workorderTypeSpan').text() !== '请选择工单类型' || $('#checkSpan').text() !== '请选择审核状态' || $('#start_t').val() != null || $('#end_t').val() != null) {
    fn = search
  } else {
    fn = initTable
  }

  Page.pageTurning(
    thisClass,
    fn,
    2,
    10)
})