"use strict";

var actionType = void 0; //用于判断当前是新增还是编辑的全局变量
var editId = void 0; //当前编辑的id

// 获取导入模块url
$("#getImportTemplate").attr('href', HEADER + "excel/用户导入模板.xls");

//初始化或更新表格数据
var initTable = function initTable(pagesize, page) {
  $.ajax({
    type: 'get',
    data: {
      page: page,
      pagesize: pagesize
    },
    url: HEADER + 'user/check_UserForPage.do',
    success: function success(data) {
      console.log(data);
      Page.loadTotalPage(data);
      constructTable(data.list);
    }
  });
};

//构造表格
var constructTable = function constructTable(data) {
  var str = "";
  if (data && data.length) {
    for (var i = 0; i < data.length; i++) {
      var statusType = '启用';
      if (data[i].status === 0) {
        statusType = '禁用';
      }

      str += "<tr>      \n                        <td title=\"" + data[i].username + "\">" + data[i].username + "</td>\n                        <td title=\"" + data[i].name + "\">" + data[i].name + "</td>\n                        <td>" + data[i].sex + "</td>\n                        <td>" + data[i].phonenumber + "</td>\n                        <td title=\"" + data[i].email + "\">" + data[i].email + "</td>\n                        <td title=\"" + data[i].rname + "\">" + data[i].rname + "</td>\n                        <td>" + statusType + "</td>\n                        <td>\n                            <button class=\"edit\" onclick=\"getInfoById('" + data[i].id + "');\">\u7F16\u8F91</button>\n                            <button class=\"delete\" onclick=\"deleteMaintenanceUnit('" + data[i].id + "');\">\u5220\u9664</button>\n                        </td>\n                    </tr>";
    }
    $("#content tbody").html('').html(str);
  } else {
    $("#content tbody").html('');
  }
};

//获取角色列表
var getRoleList = function getRoleList() {
  $.ajax({
    type: 'get',
    url: HEADER + 'user/check_RoleList.do',
    success: function success(data) {
      constructRoleList(data.data);
    }
  });
};

//构造角色列表
var constructRoleList = function constructRoleList(data) {
  var str = "";
  if (data && data.length) {
    for (var i = 0; i < data.length; i++) {
      str += "<li itemAttr=\"" + data[i].id + "\">" + data[i].rname + "</li>";
    }
    $(".ridType .son_ul").html('').html(str);
  } else {
    $(".ridType .son_ul").html('');
  }
};

//获取单位列表
var getLocationList = function getLocationList() {
  $.ajax({
    type: 'get',
    url: HEADER + 'user/check_listLocation.do',
    success: function success(data) {
      constructLocationList(data.data);
    }
  });
};

//构造单位列表
var constructLocationList = function constructLocationList(data) {
  var str = "";
  if (data && data.length) {
    for (var i = 0; i < data.length; i++) {
      str += "<li itemAttr=\"" + data[i].id + "\">" + data[i].name + "</li>";
    }
    $(".locationType .son_ul").html('').html(str);
  } else {
    $(".locationType .son_ul").html('');
  }
};

//获取维保公司列表
var getMcList = function getMcList() {
  $.ajax({
    type: 'get',
    url: HEADER + 'user/check_listMaintCompany.do',
    success: function success(data) {
      constructMcList(data.data);
    }
  });
};

//构造维保公司列表
var constructMcList = function constructMcList(data) {
  var str = "";
  if (data && data.length) {
    for (var i = 0; i < data.length; i++) {
      str += "<li itemAttr=\"" + data[i].id + "\">" + data[i].name + "</li>";
    }
    $(".mcType .son_ul").html('').html(str);
  } else {
    $(".mcType .son_ul").html('');
  }
};

// 为不能修改的部分添加遮罩
var addCoverInDisabled = function addCoverInDisabled(idArr) {
  $.each(idArr, function (key, value) {
    if (value === 'checkbox') {
      $("input[type='checkbox']").prop("disabled", true).css("cursor", "not-allowed");
    } else {
      if ($("#" + value)[0].tagName === 'SPAN') {
        $("#" + value).parent().append("<div class=\"disabledCover\"></div>").css("cursor", "not-allowed");
      } else if ($("#" + value)[0].tagName === 'DIV') {
        $("#" + value).append("<div class=\"disabledCover\"></div>");
      } else {
        $("#" + value).prop("disabled", true).css("cursor", "not-allowed");
      }
    }
  });
};

//单选
$(".radio-wrap-group").on('click', '*', function (e) {
  if (e && e.stopPropagation) {
    e.stopPropagation();
  } else {
    window.event.cancelBubble = true;
  }
  $(".radio-wrap-group span").removeClass("click");

  var dom = e.target;
  var nodeName = e.target.nodeName;
  if (nodeName === "SPAN") {
    $(dom).toggleClass("click");
  }
  if (nodeName === "I") {
    $(dom).prev().toggleClass("click");
  }
});

//根据id获取编辑内容并绑定
var getInfoById = function getInfoById(id) {
  actionType = 'edit';
  editId = id;

  $.ajax({
    type: 'get',
    data: {
      id: id
    },
    url: HEADER + 'user/check_getUserByUserID.do',
    success: function success(data) {
      console.log(data);
      var response = data.data;
      var pa = $("#add-update-lift");
      pa.find(".username").val(response.username);
      pa.find(".password").val('').attr("placeholder", "******");
      pa.find(".name").val(response.name);
      pa.find(".phonenumber").val(response.phonenumber);
      pa.find(".email").val(response.email);
      pa.find("#sex").attr('spanAttr', response.sex).text(response.sex || "请选择性别").attr("title", response.sex);
      pa.find("#rid").attr('spanAttr', response.rid).text(response.rname || "请选择角色").attr("title", response.rname);

      $(".disabledCover").remove();
      if (response.rid === "3") {
        addCoverInDisabled(["mc_id"]);
      } else if (response.rid === "4") {
        addCoverInDisabled(["location_id"]);
      } else {
        addCoverInDisabled(["location_id", "mc_id"]);
      }
      pa.find("#location_id").attr('spanAttr', response.location_id).text(response.location_name || "请选择单位").attr("title", response.location_name);
      pa.find("#mc_id").attr('spanAttr', response.mc_id).text(response.mc_name || "请选择维保单位名称").attr("title", response.mc_name);
      pa.find(".radio-wrap-group span").each(function () {
        if ($(this).attr("status") == response.status) {
          $(this).addClass("click");
        }
      });

      if (actionType === "edit") {
        pa.find(".pop-title i").addClass("edit-lift").removeClass("add-lift");
        pa.find(".pop-title span").text("编辑用户");
      }

      $("#content").css("visibility", "hidden");
      $("#add-update-lift").css("display", "block");
    }
  });
};

//删除
var deleteMaintenanceUnit = function deleteMaintenanceUnit(id) {
  $.ajax({
    type: 'post',
    data: {
      id: id
    },
    url: HEADER + 'user/delete_User.do',
    success: function success(data) {
      Page.loadTotalPage(data);
      initTable(10, 1);
      secondPop(data.code, data.msg);
    }
  });
};

//新增或者编辑
var submitAddLift = function submitAddLift() {
  var url = void 0;
  var pa = $("#add-update-lift");
  var username = pa.find(".username").val();
  var password = pa.find(".password").val();
  var name = pa.find(".name").val();
  var phonenumber = pa.find(".phonenumber").val();
  var email = pa.find(".email").val();
  var sex = pa.find("#sex").text();
  var rid = pa.find("#rid").attr("spanAttr");
  var location_id = pa.find("#location_id").attr("spanAttr");
  var mc_id = pa.find("#mc_id").attr("spanAttr");
  var status = void 0;
  pa.find(".radio-wrap-group span").each(function () {
    if ($(this).hasClass("click")) {
      status = $(this).attr("status");
    }
  });
  var sendData = {
    username: username,
    password: password,
    name: name,
    phonenumber: phonenumber,
    email: email,
    sex: sex,
    rid: rid,
    location_id: location_id,
    mc_id: mc_id,
    status: status
  };
  if (actionType === "edit") {
    url = HEADER + "user/update_User.do";
    sendData['id'] = editId;
  } else {
    url = HEADER + "user/add_User.do";
  }

  //前端判空
  if (!username) {
    secondPop(0, '请输入用户名!');
    return false;
  }
  if (actionType === "add") {
    if (!password) {
      secondPop(0, '请输入密码!');
      return false;
    }
    if (!location_id) {
      secondPop(0, '请选择单位名称!');
      return false;
    }
    if (!mc_id) {
      secondPop(0, '请选择维保单位名称!');
      return false;
    }
  }
  if (!name) {
    secondPop(0, '请输入姓名!');
    return false;
  }
  if (!phonenumber) {
    secondPop(0, '请输入手机号码!');
    return false;
  }
  if (!email) {
    secondPop(0, '请输入邮箱!');
    return false;
  }
  if (!sex) {
    secondPop(0, '请选择性别!');
    return false;
  }
  if (!rid) {
    secondPop(0, '请选择角色!');
    return false;
  }
  if (!status) {
    secondPop(0, '请勾选用户状态!');
    return false;
  }

  $.ajax({
    type: 'post',
    data: sendData,
    url: url,
    beforeSend: function beforeSend() {
      loading();
    },
    success: function success(data) {
      disLoading();
      initTable(10, 1);
      secondPop(data.code, data.msg);
    }
  });
};

//导入,选择文件时把文件信息保存在fileData中
var addFileBtn = $('#upload-btn');
var files = document.getElementById('upload-btn');
var fileName = document.getElementById('fileName');
var fileData = void 0;
addFileBtn.change(function () {
  fileData = new FormData(); //创建一个formData对象
  fileData.append('file', files.files[0]);
  handleFile();
});
// 将选择的文件名保存放在一个input框中
var handleFile = function handleFile() {
  fileName.value = files.value;
  $('#fileName').attr("title", files.value);
};

//用户导入，点击确定导入用户
var importFile = function importFile() {
  $.ajax({
    url: HEADER + 'user/import_importUser.do',
    type: 'POST',
    data: fileData,
    cache: false,
    processData: false,
    contentType: false,
    success: function success(data) {
      Page.loadTotalPage(data);
      initTable(10, 1);
      secondPop(data.code, data.msg);
      if (data.code == 1) {
        $("#umimport-pop").css("display", "none");
      }
      //限制字符个数(多行省略号)
      $("#operation-result").each(function () {
        $(this).attr("title", $(this).text());
        var maxwidth = 30;
        if ($(this).text().length > maxwidth) {
          $(this).text($(this).text().substring(0, maxwidth));
          $(this).html($(this).html() + '...');
        }
      });
    }
  });
};

/**
 *初始化
 * */

initTable(10, 1);
getRoleList();
getLocationList();
getMcList();

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
  if ($(this).closest('.selectText').hasClass("rid")) {
    $(this).closest('.selectText').attr('rid', $(this).attr('rid'));
  } else {
    $(this).closest('.selectText').attr('sex', $(this).text());
  }
  $(this).parents('li').find('ul').hide();
});

//新建
$("#add").click(function () {
  actionType = 'add';
  var pa = $("#add-update-lift");
  pa.find("input").val('');
  pa.find(".password").attr('placeholder', "请输入密码");
  pa.find("#sex").attr('spanAttr', '').text('请选择性别').attr("title", '请选择性别');
  pa.find("#rid").attr('spanAttr', '').text('请选择角色').attr("title", '请选择角色');
  pa.find("#location_id").attr('spanAttr', '').text('请选择单位').attr("title", '请选择单位');
  pa.find("#mc_id").attr('spanAttr', '').text('请选择维保单位名称').attr("title", '请选择维保单位名称');
  $(".disabledCover").remove();
  if (actionType === "add") {
    pa.find(".pop-title i").addClass("add-lift").removeClass("edit-lift");
    pa.find(".pop-title span").text("新建用户");
  }

  $("#content").css("visibility", "hidden");
  $("#add-update-lift").css("display", "block");
});

//导入
$("#import").click(function () {
  $("#content").css("visibility", "hidden");
  $("#fileName").val("文件名");
  $("#umimport-pop").css("display", "block");
});

//跳转到指定页数
$("#jump-into").click(function () {
  var jumpPage = $("#input-page").val() - 0;
  var fn = initTable;
  Page.jumpIntoPage(jumpPage, fn, 2, 10);
});

//点击翻页组件触发
$('#page-bar').delegate('li:not(:last)', 'click', function () {
  var thisClass = this.classList[0];
  var fn = initTable;
  Page.pageTurning(thisClass, fn, 2, 10);
});
//# sourceMappingURL=userManage.js.map