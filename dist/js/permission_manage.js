'use strict';

// 设置.table-wrapper的宽度
var setTableWrapperWidth = function setTableWrapperWidth() {
  var TableWrapper = document.getElementById('table-wrapper');
  if (TableWrapper) {
    TableWrapper.style.width = document.getElementById('content').clientWidth - 301 + 'px';
  }
};

// 树状图
// @lid: 区域ID
var loadZtree = function loadZtree(lid) {
  var lname = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '主菜单';
  var treeNode = arguments[2];
  var expandFlag = arguments[3];

  var zTreeObj = void 0;
  var zTree = void 0;
  var setting = {
    view: {
      showTitle: false,
      showLine: false,
      showIcon: false
    },
    data: {
      simpleData: {
        enable: true
      }
    },
    callback: {
      onClick: function onClick(event, treeId, treeNode) {
        // 禁止a标签跳转
        $('#treeDom').find('a').removeAttr('href');

        // 点击变色
        $('#' + treeNode.tId).find('.node_name').eq(0).css({
          'color': '#2e59bd'
        });

        // 获取对应的资源
        permissionManageVM.modelName = treeNode.name;
        permissionManageVM.getPermissions(treeNode.id);
        permissionManageVM.resourceId = treeNode.id;
      }
    }

    // 加载左侧资源树
  };$.ajax({
    type: 'get',
    url: HEADER + '/resources/check_getResourcesTree.do',
    success: function success(data) {
      var treeData = data.data;

      zTreeObj = $.fn.zTree.init($('#treeDom'), setting, treeData);
      zTree = $.fn.zTree.getZTreeObj("treeDom");

      // 自动展开全国
      var rootNode = zTree.getNodeByParam('name', '主菜单');
      zTree.expandNode(rootNode, true);

      // 定位到指定的节点
      var currentNode = zTree.getNodeByParam('name', lname);
      zTree.expandNode(currentNode, true);
      // 定位变色
      $('#' + currentNode.tId).find('.node_name').eq(0).css({
        'color': '#2e59bd'
      });
    }
  });
};

var permissionManageVM = new Vue({
  el: '#permission-manage',
  data: {
    permissionsList: [],
    isAddBtn: '',
    resourceId: '',
    recordId: '',
    permissionName: '',
    permissionValue: '',
    permissionId: '',
    modelName: '',
    permissions: [], // 弹窗中的下拉列表
    showPSelect: false // 切换显示下拉列表
  },
  methods: {
    getPermissions: function getPermissions() {
      var rId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

      var THIS = this;
      axios({
        params: {
          resourcesid: rId
        },
        url: HEADER + '/permission/check_PermissionForPage.do'
      }).then(function (_ref) {
        var data = _ref.data;

        THIS.permissionsList = data.data.list;
        Page.loadTotalPage(data.data);
      });
    },


    // 打开新建或编辑弹窗
    openPermissionPop: function openPermissionPop(e, index) {
      var thisText = e.target.innerText;
      var THIS = this;
      if (!this.modelName) {
        this.modelName = '主菜单';
      }
      axios({
        url: HEADER + '/dictionary/check_check_getPermissionDictionaryList.do'
      }).then(function (_ref2) {
        var data = _ref2.data;

        THIS.permissions = data.data;
      });
      if (thisText === '新建') {
        this.isAddBtn = true;
        this.permissionName = '';
        this.permissionValue = '';
        openPop('permission-pop');
      } else if (thisText === '编辑') {
        this.isAddBtn = false;
        this.permissionName = this.permissionsList[index].operatingname;
        this.permissionValue = this.permissionsList[index].operating;
        this.recordId = this.permissionsList[index].id; // 记录ID
        openPop('permission-pop');
      }
    },
    showPerList: function showPerList() {
      this.showPSelect = true;
    },
    selectPermission: function selectPermission(pName, pValue) {
      this.permissionName = pName;
      this.permissionValue = pValue;
      this.showPSelect = false;
    },


    // 提交新增或修改信息
    submitInfo: function submitInfo() {
      var THIS = this;
      if (!THIS.resourceId) {
        THIS.resourceId = 1;
      }
      if (THIS.isAddBtn) {
        axios({
          method: 'post',
          params: {
            resourcesid: THIS.resourceId,
            operating: THIS.permissionValue,
            operatingname: THIS.permissionName,
            model: THIS.modelName
          },
          url: HEADER + '/permission/add_Permission.do'
        }).then(function (_ref3) {
          var data = _ref3.data;

          secondPop(data.code, data.msg);
          if (data.code === 1) {
            THIS.getPermissions(THIS.resourceId);
          }
        });
      } else {
        axios({
          method: 'post',
          params: {
            id: THIS.recordId,
            resourcesid: THIS.resourceId,
            operating: THIS.permissionValue,
            operatingname: THIS.permissionName,
            model: THIS.modelName
          },
          url: HEADER + '/permission/update_Permission.do'
        }).then(function (_ref4) {
          var data = _ref4.data;

          secondPop(data.code, data.msg);
          if (data.code === 1) {
            THIS.getPermissions(THIS.resourceId);
          }
        });
      }
    },
    openPermissionDelete: function openPermissionDelete(index) {
      this.permissionName = this.permissionsList[index].operatingname;
      this.permissionValue = this.permissionsList[index].operating;
      this.recordId = this.permissionsList[index].id; // 记录ID
      openDelete('确认删除该权限?');
    },
    confirmDelete: function confirmDelete() {
      var THIS = this;
      axios({
        method: 'post',
        params: {
          id: THIS.recordId,
          resourcesid: THIS.resourceId,
          operating: THIS.permissionValue,
          operatingname: THIS.permissionName,
          model: THIS.modelName
        },
        url: HEADER + '/permission/delete_Permission.do'
      }).then(function (_ref5) {
        var data = _ref5.data;

        secondPop(data.code, data.msg);
        if (data.code === 1) {
          THIS.getPermissions(THIS.resourceId);
        }
      });
    }
  },
  mounted: function mounted() {
    this.getPermissions();

    loadZtree();

    setTableWrapperWidth();
    window.onresize = function () {
      setWrapperWidth();
      setTableWrapperWidth();
    };

    // 上下首尾按钮
    $('.page-bar li:not(:last)').click(function () {
      var thisClass = this.classList[0];
      Page.pageTurning(thisClass, getLiftsData, 6);
    });
    // 跳到指定页数
    document.getElementById('jump-into').onclick = function () {
      var inputPage = document.getElementById('input-page').value;
      Page.jumpIntoPage(inputPage, getLiftsData, 6);
    };

    //滚动条初始化
    $(function () {
      $("#treeBox").perfectScrollbar({
        wheelSpeed: 0.2,
        wheelPropagation: true,
        maxScrollbarLength: 50
      });
    });
  }
});
//# sourceMappingURL=permission_manage.js.map