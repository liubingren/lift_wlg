let currentTreeId;   // 保存当前定位的树节点id
let globalName;
let globalId;
let parentLevelId;
let actionType;
let editId;

// 获取导入模块url
$("#getImportTemplate").attr('href', HEADER + "excel/单位导入模板.xls")

//单位导入,选择文件时把文件信息保存在fileData中
let addFileBtn = $('#upload-btn')
let files = document.getElementById('upload-btn')
let fileName = document.getElementById('fileName')
let fileData
addFileBtn.change(() => {
  fileData = new FormData()                                              //创建一个formData对象
  fileData.append('pid', $('#import').attr('locationID'))             //一定要传黄浦区这种区id
  fileData.append('file', files.files[0])
  handleFile()
})

// 将选择的文件名保存放在一个input框中
const handleFile = () => {
  $('#fileName').val(files.value).attr("title", files.value)
}

// 单击树节点的事件
const zTreeOnClick = (event, treeId, treeNode) => {
  $(".node_name").css("color", "#000000")
  $("#" + treeNode.tId).find('.node_name').eq(0).css({
    "color": "rgb(46, 89, 189)"
  })

  let domId = $.fn.zTree.getZTreeObj("treeDom").getSelectedNodes()[0].id
  let domPid = $.fn.zTree.getZTreeObj("treeDom").getSelectedNodes()[0].pId
  let domName = $.fn.zTree.getZTreeObj("treeDom").getSelectedNodes()[0].name
  let domType = $.fn.zTree.getZTreeObj("treeDom").getSelectedNodes()[0].type

  globalId = domId;
  parentLevelId = domPid;
  globalName = domName;

  //判断区域type下按钮的显示状况
  $('#add,#import,#edit,#delete').css("display", "none").attr("locationID", "");
  if (domType === 4) {
    initInfo(domId);
    $(".unitInfo").css("display", "block");
    $('#edit,#delete').css("display", "block").attr("locationID", domId).attr("pId", domPid);
  } else {
    $(".unitInfo").css("display", "none");
    if (domType !== 3) {
      $('#add,#import,#edit,#delete').css("display", "none").attr("locationID", "");
    } else {
      $('#add,#import').css("display", "block").attr("locationID", domId).attr("pId", domPid).attr("name", domName);
    }
  }
}

//更新区域信息
const initInfo = (domId) => {
  $.ajax({
    type: 'get',
    url: HEADER + 'location/check_getLocationByID.do',
    data: {
      id: domId
    },
    success: (data) => {
      constructInfo(data.data);
    }
  })
}

//构造区域信息
const constructInfo = (data) => {
  console.log(data)
  let wrapper = $(".rightContent .unitInfo");
  wrapper.find(".unName").html(data.name).attr("title", data.name);
  wrapper.find(".pname").html(data.pname);
  wrapper.find(".name").html(data.name);
  wrapper.find(".principal").html(data.principal);
  wrapper.find(".phonenumber").html(data.phonenumber);
  wrapper.find(".email").html(data.email);
  wrapper.find(".address").html(data.address);
  wrapper.find(".longitude").html(data.longitude);
  wrapper.find(".latitude").html(data.latitude);
}

// 树状图
let zTreeObj;
let zTree;
let setting = {
  view: {
    showLine: false,
    showIcon: false
  },
  data: {
    simpleData: {
      enable: true
    }
  },
  callback: {
    onClick: zTreeOnClick
  }
};

// 获取该用户所有区域信息,初始化树的数据
const initTree = (flag, type) => {
  if (flag) {
    $.ajax({
      type: 'get',
      url: HEADER + 'location/check_getAllLocationByUser.do',
      success: (data) => {
        zTreeObj = $.fn.zTree.init($("#treeDom"), setting, data.data)
        zTree = $.fn.zTree.getZTreeObj("treeDom")
      }
    }).done(function () {
      getValue(type)
    })
  } else {
    $.ajax({
      type: 'get',
      url: HEADER + 'location/check_getAllLocationByUser.do',
      beforeSend: () => {
        loading()
      },
      success: (data) => {
        disLoading()

        console.log(data);
        zTreeObj = $.fn.zTree.init($("#treeDom"), setting, data.data)
        zTree = $.fn.zTree.getZTreeObj("treeDom")

        // 自动展开全国
        let rootNode = zTree.getNodeByParam('name', '全国')
        zTree.expandNode(rootNode, true)
      }
    })
  }
}

//根据单位或者区域名搜索
const search = () => {
  let searchKey = $(".unitName").val()
  if (searchKey) {
    $.ajax({
      url: HEADER + 'location/check_sreachLocationByName.do',
      type: 'get',
      data: {
        name: searchKey
      },
      success: (data) => {
        constructSearchBody(data.data);
        $(".searchBody").css("display", "block");
      }
    });
  } else {
    let tId = zTreeObj.getNodesByParam("name", '全国', null)[0]
    loacationArea(tId, hideBackBtn)
  }
}

//构造搜索结果列表
const constructSearchBody = (data) => {
  let str = ``;
  if (data && data.length) {
    for (let i = 0; i < data.length; i++) {
      str += `<li id="${data[i].id}" pid="${data[i].pid}" name="${data[i].name}" type="${data[i].type}" title="${data[i].name}">${data[i].name}</li>`;
    }
    $(".searchBody").html('').html(str);
  } else {
    $(".searchBody").html('')
  }

}

//根据名称查找区域位置,展开对应的所有父节点
const getValue = (type) => {
  let tId
  if (type === 'name') {
    tId = zTreeObj.getNodesByParam("name", globalName, null)[0];
  } else {
    tId = zTreeObj.getNodesByParam("id", globalId, null)[0];
  }
  currentTreeId = tId.tId
  let node1 = zTree.getNodeByTId(tId.tId);

  //展开树节点
  zTree.expandNode(node1.getParentNode(), true, false, true);
  loacationArea(tId);
}

//根据输入的小区名称定位到他的位置上
const loacationArea = (treeDom, callback) => {
  $("#treeBox").scrollTop(0);
  $("#treeBox").perfectScrollbar('update');

  let dom
  if (treeDom.tId) {
    dom = $("#" + treeDom.tId)
  } else {
    dom = treeDom
    treeDom = zTree.getNodeByTId(dom.attr('id'))
  }

  $('#treeDom span').css("color", "#000000")
  dom.children("a").eq(0).children().css("color", "#2e59bd")

  $('#treeDom').css('position', 'absolute').animate({top: -(dom.offset().top - $('#treeDom').offset().top) + 'px'}, 10)

  //判断区域type下按钮的显示状况
  $('#add,#import,#edit,#delete').css("display", "none").attr("locationID", "");
  if (treeDom.type === 4) {
    initInfo(globalId);
    $(".unitInfo").css("display", "block");
    $('#edit,#delete').css("display", "block").attr("locationID", globalId);
  } else {
    $(".unitInfo").css("display", "none");
    if (treeDom.type !== 3) {
      $('#add,#import,#edit,#delete').css("display", "none").attr("locationID", "");
    } else {
      $('#add,#import').css("display", "block").attr("locationID", globalId).attr("name", globalName);
    }
  }

  if (callback) {
    callback()
  }
}

//根据id获取编辑内容并绑定
const getInfoById = (id) => {
  $.ajax({
    type: 'get',
    data: {
      id: id
    },
    url: HEADER + 'location/check_getLocationByID.do',
    success: (data) => {
      console.log(data);
      let response = data.data;
      let pa = $("#add-update-lift");
      pa.find(".name").val(response.name);
      pa.find(".principal").val(response.principal);
      pa.find(".phonenumber").val(response.phonenumber);
      pa.find(".email").val(response.email);
      pa.find(".address").val(response.address);
      pa.find(".longitude").val(response.longitude);
      pa.find(".latitude").val(response.latitude);
      pa.find(".pname").val(response.pname);
      editId = response.id;

      if (actionType === "edit") {
        pa.find(".pop-title i").addClass("edit-lift").removeClass("add-lift");
        pa.find(".pop-title span").text("编辑用户");
      }
    }
  })
}

//隐藏树状图返回按钮
const hideBackBtn = () => {
  $('.backBtn').css('display', 'none')
  $('#treeBox').css('height', '100%')
}

//显示树状图返回按钮
const showBackBtn = () => {
  $('.backBtn').css('display', 'block')
  $('#treeBox').css('height', '92%')
}

//单位导入，点击确定导入单位
const importFile = () => {
  $.ajax({
    url: HEADER + 'location/import_importLocation.do',
    type: 'POST',
    data: fileData,
    cache: false,
    processData: false,
    contentType: false,
    success: (data) => {
      secondPop(data.code, data.msg);
      if (data.code == 1) {
        $("#umimport-pop").css("display", "none");
        initTree(1, "id");
      }

      //限制字符个数(多行省略号)
      $("#operation-result").each(function () {
        $(this).attr("title", $(this).text());
        let maxwidth = 30;
        if ($(this).text().length > maxwidth) {
          $(this).text($(this).text().substring(0, maxwidth));
          $(this).html($(this).html() + '...');
        }
      });
    }
  });
}

//确认删除
const confirmDelete = () => {
  $.ajax({
    url: HEADER + 'location/delete_delLocation.do',
    type: 'POST',
    data: {
      id: $("#delete").attr("locationid")
    },
    success: (data) => {
      secondPop(data.code, data.msg);
      if (data.code == 1) {
        $("#delete-pop").css("display", "none");
        globalId = parentLevelId;
        initTree(1, "id");
        showBackBtn();
      }
    }
  });
}

//新增或者修改单位信息
const submitAddUnit = () => {
  let url;
  let pa = $("#add-update-lift");
  let name = pa.find(".name").val();
  let principal = pa.find(".principal").val();
  let phonenumber = pa.find(".phonenumber").val();
  let email = pa.find(".email").val();
  let address = pa.find(".address").val();
  let longitude = pa.find(".longitude").val();
  let latitude = pa.find(".latitude").val();

  let sendData = {
    pid: globalId,
    name: name,
    principal: principal,
    phonenumber: phonenumber,
    email: email,
    address: address,
    longitude: longitude,
    latitude: latitude
  };

  if (actionType === "edit") {
    url = HEADER + "location/update_updateLocation.do";
    sendData['id'] = editId;
  } else {
    url = HEADER + "location/add_addLocation.do";
  }

  //前端判空
  if (!name) {
    secondPop(0, '请输入单位名称!');
    return false;
  }
  if (!principal) {
    secondPop(0, '请输入联系人!');
    return false;
  }
  if (!phonenumber) {
    secondPop(0, '请输入联系电话!');
    return false;
  }
  if (!phonenumber) {
    secondPop(0, '请输入联系邮箱!');
    return false;
  }
  if (!address) {
    secondPop(0, '请输入联系地址!');
    return false;
  }
  if (!longitude) {
    secondPop(0, '请输入经度!');
    return false;
  }
  if (!latitude) {
    secondPop(0, '请输入纬度!');
    return false;
  }

  $.ajax({
    url: url,
    type: 'POST',
    data: sendData,
    success: (data) => {
      secondPop(data.code, data.msg);
      if (data.code === 1) {
        initTree(1, "id");
        showBackBtn();
      }
    }
  });

}

/**
 *初始化树*/
initTree();

window.onresize = function () {
  setWrapperWidth();
}

/**
 *以下是各种事件触发
 * */

$("#query").click(function () {
  search();
})

// 输入关键字发生变化触发
$(".unitName").bind('input propertychange', () => {
  search();
});

// 点击查询结果触发
$(".searchBody").on('click', 'li', function () {
  $(".searchBody").css("display", "none");
  showBackBtn();
  let name = $(this).text();
  globalName = name;
  globalId = $(this).attr("id");
  parentLevelId = $(this).attr("pid");
  getValue('name');
})

// 点击导入触发
$("#umimport-pop .submit-user-info").click(function () {
  importFile();
})

//返回全国时候触发
$('.bToNation').click(function () {
  let tId = zTreeObj.getNodesByParam("name", '全国', null)[0]
  loacationArea(tId, hideBackBtn)
})

//返回上一级时候触发
$('.bToLastlv').click(function () {
  let dom = $('#' + currentTreeId).parent().parent()
  let parentJson = zTree.getNodeByTId(dom.attr('id'))
  if (dom.hasClass('level0')) {
    loacationArea(dom, hideBackBtn)
  } else {
    loacationArea(dom)
  }
  currentTreeId = dom.attr('id')
})

//导入
$("#import").click(function () {
  $("#content").css("visibility", "hidden");
  $("#fileName").val("文件名");
  fileData = '';
  $("#umimport-pop").css("display", "block");
})

//删除小区
$("#delete").click(function () {
  $("#delete-pop").css("display", "block");
  $("#content").css("visibility", "hidden");
})

//新增小区
$("#add").click(function () {
  actionType = "add";
  let pa = $("#add-update-lift");
  pa.find(".pname").val(globalName);
  pa.find(".name").val('');
  pa.find(".principal").val('');
  pa.find(".phonenumber").val('');
  pa.find(".email").val('');
  pa.find(".address").val('');
  pa.find(".longitude").val('');
  pa.find(".latitude").val('');

  if (actionType === "add") {
    pa.find(".pop-title i").addClass("add-lift").removeClass("edit-lift");
    pa.find(".pop-title span").text("新建单位");
  }
  $("#add-update-lift").css("display", "block");
  $("#content").css("visibility", "hidden");
})

//编辑小区
$("#edit").click(function () {
  actionType = "edit";
  getInfoById(globalId);
  $("#add-update-lift").css("display", "block");
  $("#content").css("visibility", "hidden");
})

//填写完单位名称后获取经纬度
$("#add-update-lift").on('blur', '.address', function () {
  let address = $(this).val();
  let pa = $("#add-update-lift");
  $.ajax({
    url: HEADER + "location/check_getAddressLatLon.do",
    type: 'get',
    data: {
      ak: "oIlwMrZYdYeZL8CH1pH6vm8KYR3C9TLe",
      address: address
    },
    success: (data) => {
      console.log(data)
      let response = data.data;
      if (response) {
        pa.find(".longitude").val(response.lng);
        pa.find(".latitude").val(response.lat);
      }
    }
  });
})

//滚动条初始化
$(function () {
  $("#treeBox").perfectScrollbar({
    wheelSpeed: 0.2,
    wheelPropagation: true,
    maxScrollbarLength: 50
  })
})
