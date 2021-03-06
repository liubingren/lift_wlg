let actionType;    //用于判断当前是新增还是编辑的全局变量
let editId;         //当前编辑的id
const NATIONID = "d87cfe59cb9b4260ac0e1c909e6350bf"; //全国id

// 获取导入模块url
$("#getImportTemplate").attr('href', HEADER + "excel/导入维护保养单位模板.xls")

//初始化或更新表格数据
const initTable = (pagesize, page) => {
  $.ajax({
    type: 'get',
    data: {
      page: page,
      pagesize: pagesize
    },
    url: HEADER + 'maintenanceCompany/check_getMaintenanceCompanyForPage.do',
    success: (data) => {
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
      let statusType = '';
      let radioIsShow = true;
      let radioHTML = `<span class="radio" onclick="singleElection(this);" id="${data[i].id}"></span>`;
      if (data[i].status === "已处理") {
        statusType = 'red';
        radioHTML = '';
      }

      str += `<tr>      
                        <td title="${data[i].name}">${data[i].name}</td>
                        <td title="${data[i].license_code}">${data[i].license_code}</td>
                        <td title="${data[i].contacts}">${data[i].contacts}</td>
                        <td title="${data[i].contact_number}">${data[i].contact_number}</td>
                        <td title="${data[i].report_number}">${data[i].report_number}</td>
                        <td title="${data[i].contact_email}">${data[i].contact_email}</td>
                        <td>
                            <button class="edit" onclick="getInfoById('${data[i].id}');">编辑</button>
                            <button class="delete" onclick="deleteMaintenanceUnit('${data[i].id}');">删除</button>
                        </td>
                    </tr>`;
    }
    $("#content tbody").html('').html(str);
  } else {
    $("#content tbody").html('')
  }
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

//根据上级区域的ID获取区域信息
const getLocationByParentId = (id, type) => {
  $.ajax({
    type: 'get',
    data: {
      id: id
    },
    url: HEADER + 'location/check_getLocationByParentId.do',
    success: (data) => {
      constructLocationList(data.data, type);
    }
  })
}

//构造区域列表
const constructLocationList = (data, type) => {
  let dom;
  let str = ``;
  switch (type) {
    case "province":
      dom = $(".provinceType .son_ul");
      break;
    case "city":
      dom = $(".cityType .son_ul");
      break;
    case "region":
      dom = $(".regionType .son_ul");
      break;
  }
  if (data && data.length) {
    for (let i = 0; i < data.length; i++) {
      str += `<li itemAttr="${data[i].id}">${data[i].name}</li>`;
    }
    dom.html('').html(str);
  } else {
    dom.html('')
  }
}

//根据id获取编辑内容并绑定
const getInfoById = (id) => {
  actionType = 'edit';
  editId = id;

  $.ajax({
    type: 'get',
    data: {
      id: id
    },
    url: HEADER + 'maintenanceCompany/check_getMaintenanceCompanyById.do',
    success: (data) => {
      console.log(data);
      let response = data.data;
      let pa = $("#add-update-lift");
      pa.find(".name").val(response.name);
      pa.find(".license_code").val(response.license_code);
      pa.find(".contacts").val(response.contacts);
      pa.find(".contact_number").val(response.contact_number);
      pa.find(".report_number").val(response.report_number);
      pa.find(".contact_email").val(response.contact_email);
      pa.find("#province").attr('spanAttr', response.province).text(response.province || "请选择省").attr("title", response.province);
      pa.find("#city").attr('spanAttr', response.city).text(response.city || "请选择市").attr("title", response.city);
      pa.find("#region").attr('spanAttr', response.area).text(response.area || "请选择区").attr("title", response.area);
      pa.find(".detailedAddress").val(response.address);

      if (actionType === "edit") {
        pa.find(".pop-title i").addClass("edit-lift").removeClass("add-lift");
        pa.find(".pop-title span").text("编辑维护保养单位");
      }

      $("#content").css("visibility", "hidden");
      $("#add-update-lift").css("display", "block");
    }
  })
}

// 查询
const search = (pagesize, page) => {
  let name = $('#name').val();
  let license_code = $('#license_code').val();
  $.ajax({
    type: 'get',
    data: {
      name: name,
      license_code: license_code,
      pagesize: pagesize,
      page: page
    },
    url: HEADER + 'maintenanceCompany/check_getMaintenanceCompanyForPage.do',
    success: (data) => {
      console.log(data);
      Page.loadTotalPage(data.data);
      constructTable(data.data.list);
    }
  })
}

//删除
const deleteMaintenanceUnit = (id) => {
  $.ajax({
    type: 'post',
    data: {
      id: id
    },
    url: HEADER + 'maintenanceCompany/delete_deleteMaintenanceCompany.do',
    success: (data) => {
      console.log(data);
      secondPop(data.code, data.msg);
      search(10,1);
    }
  })
}

//新增或者编辑
const submitAddLift = () => {
  let url;
  let pa = $("#add-update-lift");
  let name = pa.find(".name").val();
  let license_code = pa.find(".license_code").val();
  let contacts = pa.find(".contacts").val();
  let contact_number = pa.find(".contact_number").val();
  let report_number = pa.find(".report_number").val();
  let contact_email = pa.find(".contact_email").val();
  let province = pa.find("#province").text();
  let city = pa.find("#city").text();
  let region = pa.find("#region").text();
  let detailedAddress = pa.find(".detailedAddress").val();
  let sendData = {
    name: name,
    license_code: license_code,
    contacts: contacts,
    contact_number: contact_number,
    report_number: report_number,
    contact_email: contact_email,
    province: province,
    city: city,
    area: region,
    address: detailedAddress
  };
  if (actionType === "edit") {
    url = HEADER + "maintenanceCompany/update_updateMaintenanceCompany.do";
    sendData['id'] = editId;
  } else {
    url = HEADER + "maintenanceCompany/add_addMaintenanceCompany.do";
  }

  //前端判空
  if (!name) {
    secondPop(0, '请输入维护保养单位名称!');
    return false;
  }
  if (!license_code) {
    secondPop(0, '请输入许可证编号!');
    return false;
  }
  if (!contacts) {
    secondPop(0, '请输入联系人!');
    return false;
  }
  if (!contact_number) {
    secondPop(0, '请输入联系电话!');
    return false;
  }
  if (!report_number) {
    secondPop(0, '请输入报障电话!');
    return false;
  }
  if (!contact_email) {
    secondPop(0, '请输入联系邮箱!');
    return false;
  }
  if (!detailedAddress) {
    secondPop(0, '请输入详细地址!');
    return false;
  }

  $.ajax({
    type: 'post',
    data: sendData,
    url: url,
    beforeSend: () => {
      loading()
    },
    success: (data) => {
      disLoading();
      initTable(10, 1);
      secondPop(data.code, data.msg);
    }
  })

}

//导入,选择文件时把文件信息保存在fileData中
let addFileBtn = $('#upload-btn')
let files = document.getElementById('upload-btn')
let fileName = document.getElementById('fileName')
let fileData
addFileBtn.change(() => {
  fileData = new FormData()                                              //创建一个formData对象
  fileData.append('file', files.files[0])
  handleFile()
})
// 将选择的文件名保存放在一个input框中
const handleFile = () => {
  fileName.value = files.value
  $('#fileName').attr("title", files.value);
}

//单位导入，点击确定导入单位
const importFile = () => {
  $.ajax({
    url: HEADER + 'maintenanceCompany/import_importMaintenanceCompany.do',
    type: 'POST',
    data: fileData,
    cache: false,
    processData: false,
    contentType: false,
    success: (data) => {

      secondPop(data.code, data.msg);
      if (data.code == 1) {
        $("#umimport-pop").css("display", "none");
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
      search(10,1);
    }
  });
}

/**
 *初始化
 * */

initTable(10, 1);
getLocationByParentId(NATIONID, "province");

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
  let selectText = $(this).closest('.selectText');
  let aSpan = $(this).parents('li').find('span');
  aSpan.attr('spanAttr', $(this).attr('itemAttr'))
  aSpan.html($(this).html() + '<div></div><p></p>').attr('title', $(this).html());
  if ($(this).closest('.selectText').hasClass("rid")) {
    $(this).closest('.selectText').attr('rid', $(this).attr('rid'));
  } else {
    $(this).closest('.selectText').attr('sex', $(this).text());
  }
  $(this).parents('li').find('ul').hide()

  //有上级区域获得对应的下级区域
  let selectTextType = $(this).parent().parent().parent();
  if (selectTextType.hasClass("provinceType")) {
    getLocationByParentId($(this).attr('itemAttr'), "city");
  }
  if (selectTextType.hasClass("cityType")) {
    getLocationByParentId($(this).attr('itemAttr'), "region");
  }
});

//查询_
$('#query').on('click', function () {
  $('#current-page').html(1)
  $('#input-page').val(1)
  Page.currentPage = 1
  search(10, 1);
})

//新建
$("#add").click(function () {
  actionType = 'add';
  let pa = $("#add-update-lift");
  pa.find(".name").val('');
  pa.find(".license_code").val('');
  pa.find(".contacts").val('');
  pa.find(".contact_number").val('');
  pa.find(".report_number").val('');
  pa.find(".contact_email").val('');
  pa.find("#province").attr('spanAttr', '').text('请选择省').attr("title", '请选择省');
  pa.find("#city").attr('spanAttr', '').text('请选择市').attr("title", '请选择市');
  pa.find("#region").attr('spanAttr', '').text('请选择区').attr("title", '请选择区');
  pa.find(".detailedAddress").val('');

  if (actionType === "add") {
    pa.find(".pop-title i").addClass("add-lift").removeClass("edit-lift");
    pa.find(".pop-title span").text("新建维护保养单位");
  }

  $("#content").css("visibility", "hidden");
  $("#add-update-lift").css("display", "block");

})

//导入
$("#import").click(function () {
  $("#content").css("visibility", "hidden");
  $("#fileName").val("文件名");
  $("#umimport-pop").css("display", "block");
})

//跳转到指定页数
$("#jump-into").click(function () {
  let jumpPage = $("#input-page").val() - 0;
  let fn
  if ($('#name').val() != null || $('#license_code').val() != null) {
    fn = search;
    Page.jumpIntoPage(jumpPage, fn, 2, 10);
  } else {
    fn = initTable;
    Page.jumpIntoPage(jumpPage, fn, 2, 10);
  }
})

//点击翻页组件触发
$('#page-bar').delegate('li:not(:last)', 'click', function () {
  let thisClass = this.classList[0];
  let fn;
  if ($('#name').val()|| $('#license_code').val()) {
    fn = search;
    Page.pageTurning(
      thisClass,
      fn,
      2,
      10)
  } else {
    fn = initTable;
    Page.pageTurning(
      thisClass,
      fn,
      2,
      10)
  }
})