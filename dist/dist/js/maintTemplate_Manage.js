"use strict";

//let HEADER = 'http://172.16.31.234:8040/lift'

// 选择图片

var selectImg = function selectImg(dom) {
  $(dom).find("div:first-child").toggleClass("hide").toggleClass("show");
  $(dom).siblings().find("div:first-child").removeClass("show").addClass("hide");
};
//获取维保模板
var getMaintTemp = function getMaintTemp() {
  var url = HEADER + '/maintTemplate/check_listMaintTemplate.do';
  $.ajax({
    type: 'get',
    url: url,
    beforeSend: function beforeSend() {
      loading();
    },
    success: function success(data) {
      disLoading();
      var dataArr = data.data.data;
      var html = '';
      for (var i = 0; i < dataArr.length; i++) {
        html += "<div class=\"list-item\" onclick=\"selectImg(this)\" ondblclick=\"dbClickLook(this)\" title=\"\u53CC\u51FB\u67E5\u770B\u8BE5\u6A21\u677F\" data-id=\"" + dataArr[i].template_id + "\">\n                    <div class=\"item-cover hide\">\n                        <div class=\"showicon\"></div>\n                    </div>\n                    <div class=\"item-name\">\u7EF4\u4FDD\u6A21\u677F</div>\n                    <div class=\"item\">" + dataArr[i].template_name + "<i class=\"item-img" + dataArr[i].template_type + "\"></i></div>\n               </div>";
      }
      if (html === '') {
        $("#editTemp,#deleteTemp").css('display', 'none');
      } else {
        $("#editTemp,#deleteTemp").css('display', 'block');
      }
      $("#tempList").html(html);
    }
  });
};

//删除模板
var opendeleteTip = function opendeleteTip() {
  var template_id = $(".list-item .item-cover.show").parent().attr('data-id');
  if (template_id === undefined) {
    secondPop("0", "请选择要删除的维保模板！");
  } else {
    openDelete('确认删除该维保模板？');
  }
};

var deleteTemp = function deleteTemp() {
  $("#delete-pop").hide();
  var url = HEADER + '/maintTemplate/delete_MaintTemplate.do';
  var template_id = $(".list-item .item-cover.show").parent().attr('data-id');
  $.ajax({
    type: 'post',
    url: url,
    data: {
      template_id: template_id
    }, success: function success(data) {
      secondPop(data.code, data.msg);
    }
  }).done(function () {
    $(".list-item .item-cover.show").parent().remove();
  });
};

//新增维保模板
var addTempInfor = function addTempInfor(maint_type) {
  $(".form-title").html('<i></i>新增维保模板');
  $(".form-templist").css('display', 'block');
  $("#back2").css('display', 'inline-block');
  $(".operationBar,.form-list,#back1").css('display', 'none');
  $("#updatetempInfo,.MaintTemplate-update").css('display', 'none');
  $(".tempTitle span:last-child").css('display', "inline-block");
  var url = HEADER + '/maintTemplate/check_listMaintItem.do';
  $.ajax({
    type: 'get',
    url: url,
    data: {
      maint_type: maint_type
    },
    beforeSend: function beforeSend() {
      loading();
    },
    success: function success(data) {
      disLoading();
      var dataArr = data.data;
      var html = '';
      for (var i = 0; i < dataArr.length; i++) {
        html += "<tr>\n                    <td class=\"itemArr\"><input type=\"checkbox\" data-itemId=\"" + dataArr[i].item_id + "\"  data-writen=\"" + dataArr[i].written + "\"></td>\n                    <td>" + (i + 1) + "</td>\n                    <td title=\"" + (!!dataArr[i].item_content ? dataArr[i].item_content : '') + "\">" + (!!dataArr[i].item_content ? dataArr[i].item_content : '') + "</td>\n                    <td title=\"" + (!!dataArr[i].item_claim ? dataArr[i].item_claim : '') + "\">" + (!!dataArr[i].item_claim ? dataArr[i].item_claim : '') + "</td>\n                </tr>";
      }
      $("#tempInfo").html(html);
    }
  });
};

//获取选择的checkbox的id
var getCheckedCheckboxId = function getCheckedCheckboxId() {
  var ids = [];
  $("tbody input[type='checkbox']:checked").each(function () {
    ids.push($(this).attr("data-itemId"));
  });
  //let idstr = JSON.stringify(ids)
  if (ids.length === 0) {
    secondPop("0", "请选择维保项目！");
    return '';
  } else {
    return ids;
  }
};

//提交新增维保工单
var postAddTempList = function postAddTempList() {
  var template_type = $("#maintTemp").attr("tempType");
  var item_ids = getCheckedCheckboxId();
  var url = HEADER + '/maintTemplate/add_MaintTemplate.do';
  var flag = true;
  if (item_ids === '') {
    flag = false;
  }
  if (!!flag) {
    $.ajax({
      type: 'post',
      url: url,
      data: {
        template_type: template_type,
        item_ids: item_ids
      },
      success: function success(data) {
        secondPop(data.code, data.msg);
        if (data.code === 1) {
          $('.second-close-btn').click(function () {
            window.location.href = "../html/maintTemplate_Manage.html";
          });
        }
      }
    }).done(function () {
      $(".form-title").html('<span style="border-left: 4px solid #2e59bc; padding-left: 10px">维保模板管理列表</span>');
      $(".form-templist").css('display', 'none');
      $(".operationBar,.form-list").css('display', 'flex');
    });
  }
};

//打开添加维保项目弹框
$("#addTempitem").on('click', function () {
  $("#item_content").val('');
  $("#item_claim").val('');
  openPop('add-update-item');
  $(".writtenBar").find('input[name="written"]').prop("checked", false);
});
//单选
$(".writtenBar,.writtenBar1").find('input[name="written"]').each(function (index) {
  $(this).click(function () {
    $(this).prop("checked", true);
    $(this).siblings().prop("checked", false);
  });
});
//维保项目增加
var addTempInforitem = function addTempInforitem() {
  var flag = true;
  var item_content = $("#item_content").val();
  var item_claim = $("#item_claim").val();
  var maint_type = parseInt($("#maintTemp").attr("temptype"));
  var writeTpye = $('.writtenBar input[name="written"]:checked').attr('data-value');
  if (!writeTpye) {
    flag = false;
    secondPop('1', '请选择是否可输入');
  }
  var url = HEADER + "/maintitemdictionary/add_maintitemdictionary.do";
  if (!!flag) {
    $.ajax({
      type: 'post',
      url: url,
      data: {
        item_content: item_content,
        item_claim: item_claim,
        maint_type: maint_type,
        written: parseInt(writeTpye)
      }, beforeSend: function beforeSend() {
        loading();
      }, success: function success(data) {
        disLoading();
        secondPop(data.code, data.msg);
        if (data.code + '' === '1') {
          addTempInfor(maint_type);
        }
      }
    });
  }
};

//打开修改维保项目弹框
$("#editTempitem").on('click', function () {
  var item_ids = getCheckedCheckboxId();
  var flag = true;
  if (item_ids === '') {
    flag = false;
  }
  if (item_ids.length > 1) {
    flag = false;
    secondPop("0", "请选择要修改的一项维保项目!");
  }
  if (!!flag) {
    openPop('update-item');
    var itemInfor = $('#tempInfo input[type="checkbox"]:checked');
    var content = itemInfor.parent().parent().find('td:nth-child(3)').html();
    var claim = itemInfor.parent().parent().find('td:nth-child(4)').html();
    $("#updateitem_content").val(content).attr("data-itemid", itemInfor.attr('data-itemid'));
    $("#updateitem_claim").val(claim);
    var writenType = itemInfor.attr('data-writen');
    if (writenType === '1') {
      $('.writtenBar1 input[data-value="1"]').prop('checked', true);
      $('.writtenBar1 input[data-value="0"]').prop('checked', false);
    } else if (writenType === '0') {
      $('.writtenBar1 input[data-value="0"]').prop('checked', true);
      $('.writtenBar1 input[data-value="1"]').prop('checked', false);
    } else {
      $('.writtenBar1 input[name="written"]').prop('checked', false);
    }
  }
});

//维保项目修改
var updataTempitem = function updataTempitem() {
  var flag = true;
  var item_id = $("#updateitem_content").attr("data-itemid");
  var item_content = $("#updateitem_content").val();
  var item_claim = $("#updateitem_claim").val();
  var maint_type = parseInt($("#maintTemp").attr("temptype"));
  var writeTpye = $('.writtenBar1 input[name="written"]:checked').attr('data-value');
  if (!writeTpye) {
    flag = false;
    secondPop('1', '请选择是否可输入');
  }
  var url = HEADER + '/maintitemdictionary/update_maintitemdictionary.do';
  if (item_content === '') {
    flag = false;
    secondPop("0", "项目内容不能为空！");
  }
  if (item_claim === '') {
    flag = false;
    secondPop("0", "项目要求不能为空！");
  }
  if (!!flag) {
    $.ajax({
      type: 'post',
      url: url,
      data: {
        item_id: item_id,
        item_content: item_content,
        item_claim: item_claim,
        maint_type: maint_type,
        written: parseInt(writeTpye)
      },
      beforeSend: function beforeSend() {
        loading();
      }, success: function success(data) {
        disLoading();
        secondPop(data.code, data.msg);
        if (data.code + '' === '1') {
          addTempInfor(maint_type);
        }
      }
    });
  }
};
//维保项目删除
var opendeleteTipitem = function opendeleteTipitem() {
  var maint_type = parseInt($("#maintTemp").attr("temptype"));
  var checkedId = getCheckedCheckboxId();
  var url = HEADER + '/maintitemdictionary/delete_maintitemdictionary.do';
  var flag = true;
  if (checkedId === '') {
    flag = false;
  }
  if (!!flag) {
    $.ajax({
      type: 'post',
      url: url,
      data: {
        item_ids: checkedId
      }, beforeSend: function beforeSend() {
        loading();
      }, success: function success(data) {
        disLoading();
        secondPop(data.code, data.msg);
        if (data.code + '' === '1') {
          addTempInfor(maint_type);
        }
      }
    });
  }
};

//更新模板列表

$("#result-pop button").click(function () {
  getMaintTemp();
});

//获取修改模板
var updataTemp = function updataTemp(tempId) {
  $(".tempTitle span:last-child").css('display', "none");
  var template_id = '';
  if (!!tempId) {
    template_id = tempId;
  } else {
    template_id = $(".list-item .item-cover.show").parent().attr('data-id');
  }
  $("#back2").css('display', 'inline-block');
  $("#back1").css('display', 'none');
  var url = HEADER + '/maintTemplate/check_getMaintTemplateById.do';
  var flag = true;
  if (template_id === undefined) {
    secondPop("0", "请选择要修改的维保模板！");
    flag = false;
  } else {
    $(".form-title").html('<i></i>修改维保模板');
    $(".form-templist").css('display', 'block');
    $(".operationBar,.form-list").css('display', 'none');
  }
  if (!!flag) {
    var html = '';
    $.ajax({
      type: 'get',
      url: url,
      data: {
        template_id: template_id
      }, success: function success(data) {
        var dataArr = data.data;
        $(".son_ul").html('');
        $("#tempInfo,.MaintTemplate-add").css('display', 'none');
        $("#updatetempInfo").css('display', 'block');
        $(".MaintTemplate-update").css('display', 'inline-block');
        $("#maintTemp").html(!!dataArr.template_name ? dataArr.template_name : '').attr({
          'tempType': !!dataArr.template_type ? dataArr.template_type : '',
          'template_id': !!dataArr.template_id ? dataArr.template_id : ''
        }).prop('disabled', true).css({ "background-color": "rgba(46, 89, 189, 0.15)", "cursor": "text" });

        //模板项目选择
        var maintList = dataArr.maintItemList;
        var maintresult = '';
        var normal = '';
        for (var i = 0; i < maintList.length; i++) {
          maintresult = maintList[i].checked;
          if (maintresult === 1) {
            normal = 'checked';
          } else if (maintresult === 0) {
            normal = '';
          }
          html += "<tr>\n                    <td class=\"itemArr\"><input type=\"checkbox\" " + normal + " data-itemId=\"" + maintList[i].item_id + "\"></td>\n                    <td>" + (i + 1) + "</td>\n                    <td title=\"" + (!!maintList[i].item_content ? maintList[i].item_content : '') + "\">" + (!!maintList[i].item_content ? maintList[i].item_content : '') + "</td>\n                    <td title=\"" + (!!maintList[i].item_claim ? maintList[i].item_claim : '') + "\">" + (!!maintList[i].item_claim ? maintList[i].item_claim : '') + "</td>\n                </tr>";
        }

        $("#updatetempInfo").html(html);
      }
    });
  }
};

//提交修改模板
var postUpdateTemp = function postUpdateTemp() {
  var template_id = $("#maintTemp").attr('template_id');
  var item_ids = getCheckedCheckboxId();
  var url = HEADER + '/maintTemplate/update_MaintTemplate.do';
  var flag = true;
  if (item_ids === '') {
    flag = false;
  }
  if (!!flag) {
    $.ajax({
      type: 'post',
      url: url,
      data: {
        template_id: template_id,
        item_ids: item_ids
      },
      success: function success(data) {
        secondPop(data.code, data.msg);
        if (data.code === 1) {
          $('.second-close-btn').click(function () {
            window.location.href = "../html/maintTemplate_Manage.html";
          });
        }
      }
    });
  }
};

//双击查看模板信息
var dbClickLook = function dbClickLook(dom) {
  var tempId = $(dom).attr('data-id');
  updataTemp(tempId);
  $(".btnBar").hide();
  $(".form-title").html('<span style="border-left: 4px solid #2e59bc; padding-left: 10px">查看维保模板</span>');
  $("table").find(" input[type='checkbox']").prop('disabled', true);
  $(".tempTitle span:last-child").css('display', "none");
};

/*---------------------------------上面是函数定义区, 下面是代码执行区----------------------------------------------------------------*/
window.onresize = function () {
  setWrapperWidth();
};

$('#back2').click(function () {
  window.location.href = "../html/maintTemplate_Manage.html";
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
  var temp_Type = '';
  if (aSpan.attr('id') === 'maintTemp') {
    temp_Type = $(this).attr('tempType');
    aSpan.attr('tempType', temp_Type);
    addTempInfor(temp_Type);
  }
  aSpan.html($(this).html() + '<div></div><p></p>').attr('title', $(this).html());
  if ($(this).closest('.selectText').hasClass("rid")) {
    $(this).closest('.selectText').attr('rid', $(this).attr('rid'));
  } else {
    $(this).closest('.selectText').attr('tempType', $(this).text());
  }
  $(this).parents('li').find('ul').hide();
});

//全选
$("#checkboxList").on('click', function () {
  if (this.checked == true) {
    $(".itemArr input[type='checkbox']").each(function () {
      this.checked = true;
    });
  } else {
    $(".itemArr input[type='checkbox']").each(function () {
      this.checked = false;
    });
  }
});
getMaintTemp();
//# sourceMappingURL=maintTemplate_Manage.js.map
//# sourceMappingURL=maintTemplate_Manage.js.map