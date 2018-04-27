'use strict';

//let HEADER = 'http://172.16.31.231:8040/lift'
//let workOrderId = '2c909f6762ad5c440162ad656ed50004'

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

//工单id和操作类型
var workOrderId = parseQueryString(window.location.href).orderId;
var action = parseQueryString(window.location.href).action;

if (action === 'watch' || action === 'watchfromPlan') {
  $(".btnBar,.titleRight,.delete").css('display', 'none');
  $(".imgGroup-wrap").css('margin-top', '30px');
  $("#examineState,#examineremarks").css({ "background-color": "rgba(46, 89, 189, 0.15)", "cursor": "text" }).prop('disabled', true);
  $("#examineState + ul").html('');
  $(".form-title span").html('查看保养工单');
} else if (action === 'check') {
  $(".titleRight,.delete").css('display', 'none');
  $(".imgGroup-wrap").css('margin-top', '30px');
}

//获取保养工单信息
var getMaintInfor = function getMaintInfor() {
  var url = HEADER + '/workMaintenance/check_getworkMaintenanceById.do';
  var html = '';
  var html1 = '';
  $.ajax({
    type: 'get',
    data: {
      id: workOrderId
    },
    url: url,
    beforeSend: function beforeSend() {
      loading();
    },
    success: function success(data) {
      disLoading();
      var dataArr = data.data;
      $("#maintplanId").val(!!dataArr.plan_num ? dataArr.plan_num : '').attr("plan-id", !!dataArr.plan_num ? dataArr.plan_num : '');
      $("#village").val(!!dataArr.user ? dataArr.user : '');
      $("#solveMethod").attr('title', !!dataArr.solution ? dataArr.solution : '请选择解决方法或编辑下方添加新方法').html(!!dataArr.solution ? dataArr.solution : '请选择解决方法或编辑下方添加新方法');
      $("#maintType").val(!!dataArr.template_name ? dataArr.template_name : '');
      $("#startTime").val(!!dataArr.start_time ? dataArr.start_time : '');
      $("#endTime").val(!!dataArr.end_time ? dataArr.end_time : '');
      $("#maintenancepeople").attr({ 'title': !!dataArr.maint_staff_value ? dataArr.maint_staff_value : '请选择维保人员',
        peopleType: dataArr.maint_staff }).html(!!dataArr.maint_staff_value ? dataArr.maint_staff_value : '请选择维保人员');
      $("#maintenanceCom").val(!!dataArr.maint_comp ? dataArr.maint_comp : '');
      $("#question").val(!!dataArr.exist_problem ? dataArr.exist_problem : '');
      $("#remarks").val(!!dataArr.remark ? dataArr.remark : '');
      $("#question1").val(!!dataArr.exist_problem ? dataArr.exist_problem : '');
      $("#remarks1").val(!!dataArr.remark ? dataArr.remark : '');

      //照片
      if (dataArr.file_url) {
        constructImgList(dataArr.file_url);
      } else {
        $(".imgList .imgGroup-wrap").html(''); //清空新增图片列表
      }

      //维保项目
      var maintList = dataArr.maintItems;
      var normal = '';
      var Abnormal = '';
      var maintresult = void 0,
          maintwritten = void 0,
          maintText = void 0;
      for (var i = 0; i < maintList.length; i++) {
        maintresult = maintList[i].result;
        maintwritten = maintList[i].written;
        if (maintwritten === 1) {
          maintText = '<input type="text" class="maintwrite" placeholder="\u8BF7\u8F93\u5165\u5185\u5BB9" value="' + (!!maintresult ? maintresult : '') + '" />';
        } else if (maintwritten === 0) {
          if (maintresult === "1") {
            normal = 'checked="true"';
            Abnormal = '';
          } else if (maintresult === "0") {
            normal = '';
            Abnormal = 'checked="true"';
          } else {
            normal = '';
            Abnormal = '';
          }
          maintText = ' <input type="checkbox" name="checkbox" ' + normal + ' data-code="1"/>&nbsp;&nbsp;<span>\u6B63\u5E38</span>&nbsp;&nbsp;&nbsp;&nbsp;\n                 <input type="checkbox" name="checkbox" ' + Abnormal + '  data-code="0"/>&nbsp;&nbsp;<span>\u4E0D\u6B63\u5E38</span>';
        }

        html1 += '\n        <tr data-maintItemid="' + maintList[i].item_id + '" data-maintcode="' + maintresult + '" data-wirte="' + maintwritten + '">\n            <td>' + (i + 1) + '</td>\n            <td title="' + maintList[i].item_content + '">' + (!!maintList[i].item_content ? maintList[i].item_content : '') + '</td>\n            <td title="' + maintList[i].item_claim + '">' + (!!maintList[i].item_claim ? maintList[i].item_claim : '') + '</td>\n            <td class="showcheckbox">' + maintText + '</td>\n        </tr>\n      ';
      }
      $("#maintInfo").html(html1);

      //电梯信息
      html += '<tr data-lift_id="' + dataArr.lift_id + '">\n         <td style="flex: 3">' + (!!dataArr.id_nr ? dataArr.id_nr : '') + '</td>\n         <td>' + (!!dataArr.unit_id ? dataArr.unit_id : '') + '</td>\n         <td>' + (!!dataArr.inst_addr ? dataArr.inst_addr : '') + '</td>\n       </tr>\n      ';
      $("#liftsInfo").html(html);
      var code = dataArr.order_status;
      var status = void 0;
      if (code === 3) {
        status = "已处理";
      } else if (code === 2) {
        status = "处理中";
      } else if (code === 1) {
        status = "未处理";
      }
      $("#handleState").attr({ 'title': status, 'stateType': code }).html(status);

      //审核
      var code1 = dataArr.check_status;
      var status1 = void 0;
      if (code1 === 3) {
        status1 = "已审核";
      } else if (code1 === 2) {
        status1 = "审核未通过";
      } else if (code1 === 1) {
        status1 = "未审核";
      }
      $("#examineState").attr({ 'title': status1, 'examineType': code1 }).html(status1);
      $("#examineremarks").val(!!dataArr.check_opinions ? dataArr.check_opinions : '');
    }
  }).done(function () {
    $(".showcheckbox").on("click", 'input[type="checkbox"]', function () {
      $(this).prop("checked", true);
      $(this).siblings().prop("checked", false);
      var code = $(this).attr('data-code');
      $(this).parent().parent().attr('data-maintcode', code);
    });
    if (action === 'watch' || action === 'check' || action === 'watchfromPlan') {
      $("#maintInfo").find('input').css({ "background-color": "rgba(46, 89, 189, 0.15)", "cursor": "text" }).prop('disabled', true);
    }
  });
};

//获取维保人
var getMaintpeople = function getMaintpeople() {
  var url = HEADER + '/workOrder/check_listMaintStaffs.do';
  var html = '';
  $.ajax({
    type: 'get',
    url: url,
    success: function success(data) {
      var dataList = data.data;
      for (var i = 0; i < dataList.length; i++) {
        html += '<li title="' + (!!dataList[i].maint_staff_value ? dataList[i].maint_staff_value : '') + '" peopleType="' + dataList[i].maint_staff + '">' + (!!dataList[i].maint_staff ? dataList[i].maint_staff_value : '') + '</li>';
      }
      $("#maintpeople").html(html);
    }
  });
};

// 选择图片
var selectImg = function selectImg(dom) {
  $(dom).find("div").toggleClass("hide").toggleClass("show");
};

// 与图片相关的操作方法
var ImgOperation = {
  imgFilesArr: {
    files: []
  },
  // 继续添加图片
  addImg: function addImg() {
    var THIS = this;
    var addBtn = document.getElementById('add-img');
    var reader = new FileReader();
    addBtn.onchange = function () {
      var file = addBtn.files[0];
      THIS.imgFilesArr.files.push(file);
      reader.onload = function () {
        var preview = '<div class="imgGroup-item" onclick="selectImg(this)">\n                            <img src="' + reader.result + '"/>\n                            <span>' + file.name + '</span>\n                            <div class="item-cover hide">\n                                <div class="check_workorderManage"></div>            \n                            </div>\n                        </div>';
        $(".addImg .imgGroup-wrap").append(preview);
      };
      if (file) {
        reader.readAsDataURL(file);
      }
    };
  }
};

var constructImgList = function constructImgList(data) {
  var str = '';
  if (data.indexOf(',') > -1) {
    var datas = data.split(',');
    for (var i = 0; i < datas.length; i++) {
      var imgSrc = HEADER + '/workMaintenance/check_getFile.do?fileUrl=' + datas[i];
      var imgName = datas[i].split('iamsplitchar')[1];
      console.log(imgSrc);
      str += '\n        <div class="imgGroup-item" onclick="selectImg(this)">\n                            <img src="' + imgSrc + '"/>\n                            <span>' + imgName + '</span>\n                            <div class="item-cover hide" imgSrc="' + datas[i] + '">\n                                <div class="check_workorderManage"></div>            \n                            </div>\n                        </div>\n    ';
    }
    $(".imgList .imgGroup-wrap").html(str);
  } else {
    var _imgSrc = HEADER + '/workMaintenance/check_getFile.do?fileUrl=' + data;
    var _imgName = data.split('iamsplitchar')[1];
    //console.log(imgSrc)
    str += '\n        <div class="imgGroup-item" onclick="selectImg(this)">\n                            <img src="' + _imgSrc + '"/>\n                            <span>' + _imgName + '</span>\n                            <div class="item-cover hide" imgSrc="' + data + '">\n                                <div class="check_workorderManage"></div>            \n                            </div>\n                        </div>\n    ';
    $(".imgList .imgGroup-wrap").html(str);
  }
};

//获取解决方法
var solvemethod = function solvemethod() {
  var url = HEADER + '/workOrder/check_listSolution.do';
  var html = '';
  $.ajax({
    type: 'get',
    url: url,
    success: function success(data) {
      var dataList = data.data;
      for (var i = 0; i < dataList.length; i++) {
        html += '<li title="' + (!!dataList[i] ? dataList[i] : '') + '" methodType="' + (i + 1) + '">' + (!!dataList[i] ? dataList[i] : '') + '</li>';
      }
      $("#solve_Method").html(html);
    }
  });
};

//提交保养信息
var postMaintInfor = function postMaintInfor() {
  var url = HEADER + '/workMaintenance/update_WorkMaintenance.do';
  var jsonData = new FormData();
  var exist_problem = $("#question").val();
  //解决方法
  var solution = $("#solveMethod").html();
  var add_solveMethod = $("#add_solveMethod").val();
  var sm = '';
  if (add_solveMethod === '') {
    sm = solution;
  } else {
    sm = add_solveMethod;
  }
  var remark = $("#remarks").val();
  var maint_staff = $("#maintenancepeople").attr('peopleType');
  var order_status = $("#handleState").attr('stateType');

  //图片上传
  var imgList = ImgOperation.imgFilesArr.files; //文件数组
  var namesInput = $('.addImg .imgGroup-wrap span');
  for (var i = 0; i < imgList.length; i++) {
    jsonData.append('file', imgList[i]);
    jsonData.append('newFileName', namesInput[i].innerHTML);
  }
  jsonData.append('id', workOrderId);
  jsonData.append('solution', sm);
  jsonData.append('remark', remark);
  jsonData.append('exist_problem', exist_problem);
  jsonData.append('maint_staff', maint_staff);
  jsonData.append('order_status', order_status);

  //表格
  var ordermaints = [];
  var flag = true;
  var item_id = '';
  var trItem = $("#maintInfo tr");
  var resultCode = '';
  var maintwritten = '';
  for (var _i = 0; _i < trItem.length; _i++) {
    item_id = $(trItem[_i]).attr('data-maintitemid');
    resultCode = $(trItem[_i]).attr('data-maintcode');
    maintwritten = $(trItem[_i]).attr('data-wirte');
    if (maintwritten === '1') {
      resultCode = $(trItem[_i]).find('input').val();
    }
    if (resultCode === 'null') {
      secondPop("0", "请完成维保项目表的结果选项！");
      flag = false;
    } else {
      ordermaints.push({
        'maint_item_id': item_id,
        'result': resultCode
      });
      flag = true;
    }
  }
  jsonData.append('ordermaints', JSON.stringify(ordermaints));
  if ($('.maintwrite').val() === '') {
    secondPop("0", "请填写维保项目表输入框内容！");
    flag = false;
  }
  if (sm === '请选择解决方法或编辑下方添加新方法' || sm === '') {
    secondPop("0", "请选择解决方法或编辑添加新方法！");
    flag = false;
  }
  if (exist_problem === '') {
    secondPop("0", "请填写存在问题！");
    flag = false;
  }

  if (!!flag) {
    $.ajax({
      type: 'post',
      url: url,
      contentType: false,
      processData: false,
      data: jsonData,
      beforeSend: function beforeSend() {
        loading();
      },
      success: function success(data) {
        disLoading();
        $(".addImg .imgGroup-wrap").html(''); //清空新增图片列表
        ImgOperation.imgFilesArr.files = [];
        secondPop(data.code, data.msg);
        if (data.code === 1) {
          $('.second-close-btn').click(function () {
            window.location.href = '../html/workorderManage.html?orderType=workMaintenance';
          });
        }
      }
    });
  }
};

//提交审核工单
var postExamineworkorder = function postExamineworkorder() {
  var url = HEADER + '/workMaintenance/approval_WorkMaintenance.do';
  var check_status = $("#examineState").attr('examineType');
  var check_opinions = $("#examineremarks").val();

  var flag = true;
  if (!!flag) {
    $.ajax({
      type: 'post',
      url: url,
      data: {
        id: workOrderId,
        check_status: check_status,
        check_opinions: check_opinions
      },
      beforeSend: function beforeSend() {
        loading();
      },
      success: function success(data) {
        disLoading();
        secondPop(data.code, data.msg);
        if (data.code === 1) {
          $('.second-close-btn').click(function () {
            window.location.href = '../html/workorderManage.html?orderType=workMaintenance';
          });
        }
      }
    });
  }
};

/*---------------------------------上面是函数定义区, 下面是代码执行区----------------------------------------------------------------*/
window.onresize = function () {
  setWrapperWidth();
};
$('.back').click(function () {
  if (action === 'watch') {
    window.location.href = '../html/workorderManage.html?orderType=workMaintenance';
  } else if (action === 'watchfromPlan') {
    window.location.href = '../html/maintenancePlan.html';
  }
});

laydate.render({
  elem: '#startTime',
  type: 'datetime',
  format: 'yyyy.MM.dd HH:mm:ss', //可任意组合
  done: function done(value) {
    $('#startTime').val(value);
  }
});
laydate.render({
  elem: '#startTime',
  type: 'datetime',
  format: 'yyyy.MM.dd HH:mm:ss', //可任意组合
  done: function done(value) {
    $('#startTime').val(value);
  }
});
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
  if (aSpan.attr('id') === 'solveMethod') {
    aSpan.attr('methodType', $(this).attr('methodType'));
  } else if (aSpan.attr('id') === 'examineState') {
    aSpan.attr('examineType', $(this).attr('examineType'));
  } else if (aSpan.attr('id') === 'handleState') {
    aSpan.attr('stateType', $(this).attr('stateType'));
  } else {
    aSpan.attr('peopleType', $(this).attr('peopleType'));
  }
  aSpan.html($(this).html() + '<div></div><p></p>').attr('title', $(this).html());
  if ($(this).closest('.selectText').hasClass("rid")) {
    $(this).closest('.selectText').attr('rid', $(this).attr('rid'));
  } else {
    $(this).closest('.selectText').attr('sex', $(this).text());
  }
  $(this).parents('li').find('ul').hide();
});

getMaintInfor();
getMaintpeople();
solvemethod();

$("#content .right-form .img-form").click(function () {
  $("#picture-pop").css({
    'display': 'block'
  });
  $("#content").css("visibility", "hidden");
  if ($('.imgList').hasClass('hide')) {
    $('.imgList').removeClass('hide').addClass('show');
    $('.addImg').removeClass('show').addClass('hide');
    $(".titleLeft i").addClass('imgCheck-workorderManage').removeClass('imgUncheck_workorderManage');
    $(".titleLeft span").addClass('check').removeClass('uncheck');
    $(".titleRight i").addClass('addImgUnclick_workorderManage').removeClass('addImgClick_workorderManage');
    $(".titleRight span").removeClass('check').addClass('uncheck');
  }
  getMaintInfor();
});

//图片列表弹出框选项卡
$(".titleLeft").click(function () {
  if ($(this).find('i').hasClass('imgCheck-workorderManage')) {
    return false;
  } else {
    $(this).find('i').toggleClass('imgCheck-workorderManage').toggleClass('imgUncheck_workorderManage');
    $(this).find('span').toggleClass('check').toggleClass('uncheck');
    $(".titleRight i").toggleClass('addImgUnclick_workorderManage').toggleClass('addImgClick_workorderManage');
    $(".titleRight span").toggleClass('check').toggleClass('uncheck');
    $('.imgList').toggleClass('show').toggleClass('hide');
    $('.addImg').toggleClass('show').toggleClass('hide');
  }
});

$(".titleRight").click(function () {
  if ($(this).find('i').hasClass('addImgClick_workorderManage')) {
    return false;
  } else {
    $(this).find('i').toggleClass('addImgUnclick_workorderManage').toggleClass('addImgClick_workorderManage');
    $(this).find('span').toggleClass('check').toggleClass('uncheck');
    $(".titleLeft i").toggleClass('imgCheck-workorderManage').toggleClass('imgUncheck_workorderManage');
    $(".titleLeft span").toggleClass('check').toggleClass('uncheck');
    $('.imgList').toggleClass('show').toggleClass('hide');
    $('.addImg').toggleClass('show').toggleClass('hide');
  }
});
//删除图片列表中的图片
$(".imgList .delete").click(function () {
  var srcArr = [];
  var srcStr = void 0;
  var imgSrc = $(".imgList .item-cover.show");
  imgSrc.each(function () {
    srcArr.push($(this).attr('imgSrc'));
  });
  if (srcArr.length !== 0) {
    if (srcArr.length >= 2) {
      srcStr = srcArr.join(',');
    } else {
      srcStr = srcArr.join('');
    }
    $.ajax({
      type: 'post',
      data: {
        fileurl: srcStr,
        id: workOrderId
      },
      url: HEADER + '/workMaintenance/delete_File.do',
      beforeSend: function beforeSend() {
        loading();
      },
      success: function success(data) {
        disLoading();
        imgSrc.each(function () {
          $(this).parent().html('').remove();
        });
        secondPop(data.code, data.msg);
      }
    });
  }
});

//删除新增图片列表中的图片
$(".addImg .btn-group button:first-child").click(function () {
  var checkedImg = $(".addImg .item-cover");
  checkedImg.each(function (index, ele) {
    if ($(this).hasClass("show")) {
      ImgOperation.imgFilesArr.files.splice(index, 1);
      $(ele).parent().remove();
    }
  });
});

ImgOperation.addImg();
//# sourceMappingURL=update_maintainworkorder.js.map
//# sourceMappingURL=update_maintainworkorder.js.map