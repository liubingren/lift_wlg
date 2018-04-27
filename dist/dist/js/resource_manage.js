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
        resourceManageVM.parentMenu = treeNode.name;
        resourceManageVM.getResources(treeNode.id);
        resourceManageVM.parentId = treeNode.id;
      }

      // 加载左侧资源树
    } };$.ajax({
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

var resourceManageVM = new Vue({
  el: '#resource-manage',
  data: {
    resourcesList: [],
    isAddBtn: '',
    parentId: '',
    recordId: '',
    resourceName: '',
    modelValue: '',
    resourceURL: '',
    resourceOrder: '',
    parentMenu: '',
    resources: [], // 弹窗中的下拉列表
    showPSelect: false // 切换显示下拉列表
  },
  methods: {
    getResources: function getResources() {
      var rId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

      var THIS = this;
      axios({
        params: {
          id: rId
        },
        url: HEADER + '/resources/check_listResourcesById.do'
      }).then(function (_ref) {
        var data = _ref.data;

        THIS.resourcesList = data.data.list;
        Page.loadTotalPage(data.data);
      });
    },

    // 打开新建或编辑弹窗
    openResourcePop: function openResourcePop(e, index) {
      var thisText = e.target.innerText;
      var THIS = this;
      if (!this.parentMenu) {
        this.parentMenu = '主菜单';
      }
      if (thisText === '新建') {
        this.isAddBtn = true;
        this.resourceName = '';
        this.modelValue = '';
        this.resourceURL = '';
        this.resourceOrder = '';

        openPop('resource-pop');
      } else if (thisText === '编辑') {
        this.isAddBtn = false;
        this.resourceName = this.resourcesList[index].name;
        this.modelValue = this.resourcesList[index].model;
        this.resourceURL = this.resourcesList[index].url;
        this.resourceOrder = this.resourcesList[index].number;
        this.recordId = this.resourcesList[index].id; // 记录ID

        openPop('resource-pop');
      }
    },
    isInputEmpty: function isInputEmpty(value, e) {
      var errorSpanClasses = e.target.nextSibling.nextSibling.classList;
      if (!value) {
        errorSpanClasses.add('show-error');
      } else {
        errorSpanClasses.remove('show-error');
      }
    },
    isInputInt: function isInputInt(value) {
      var errorSpanClasses = document.getElementById('not-int').classList;
      var reg = /^\+?[1-9][0-9]*$/;
      if (!reg.test(value)) {
        errorSpanClasses.add('show-error');
      } else {
        errorSpanClasses.remove('show-error');
      }
    },

    // 提交新增或修改信息
    submitInfo: function submitInfo() {
      var THIS = this;
      if (!THIS.parentId) {
        THIS.parentId = 1;
      }
      if (THIS.isAddBtn) {
        axios({
          method: 'post',
          params: {
            name: THIS.resourceName,
            url: THIS.resourceURL,
            parentid: THIS.parentId,
            number: THIS.resourceOrder,
            model: THIS.modelValue
          },
          url: HEADER + '/resources/add_Resources.do'
        }).then(function (_ref2) {
          var data = _ref2.data;

          secondPop(data.code, data.msg);
          if (data.code === 1) {
            THIS.getResources(THIS.parentId);
            loadZtree();
          }
        });
      } else {
        axios({
          method: 'post',
          params: {
            id: THIS.recordId,
            name: THIS.resourceName,
            url: THIS.resourceURL,
            parentid: THIS.parentId,
            number: THIS.resourceOrder,
            model: THIS.modelValue
          },
          url: HEADER + '/resources/update_Resources.do'
        }).then(function (_ref3) {
          var data = _ref3.data;

          secondPop(data.code, data.msg);
          if (data.code === 1) {
            THIS.getResources(THIS.parentId);
            loadZtree();
          }
        });
      }
    },
    openResourceDelete: function openResourceDelete(index) {
      this.recordId = this.resourcesList[index].id; // 记录ID
      console.log(this.parentId);
      openDelete('确认删除该资源?');
    },
    confirmDelete: function confirmDelete() {
      var THIS = this;
      axios({
        method: 'post',
        params: {
          id: THIS.recordId
        },
        url: HEADER + '/resources/delete_Resources.do'
      }).then(function (_ref4) {
        var data = _ref4.data;

        secondPop(data.code, data.msg);
        if (data.code === 1) {
          if (!THIS.parentId) {
            THIS.parentId = 1;
          }
          THIS.getResources(THIS.parentId);
          loadZtree();
        }
      });
    }
  },
  mounted: function mounted() {
    this.getResources();

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
//# sourceMappingURL=resource_manage.js.map
//# sourceMappingURL=resource_manage.js.map