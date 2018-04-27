'use strict';

var roleManageVM = new Vue({
  el: '#role-manage',
  data: {
    rolesList: '',
    isAddBtn: '',
    roleName: '',
    roleValue: '',
    roleId: '',
    remark: ''
  },
  methods: {
    getRoles: function getRoles() {
      var THIS = this;
      axios({
        url: HEADER + '/role/check_RoleList.do'
      }).then(function (_ref) {
        var data = _ref.data;

        THIS.rolesList = data.data;
        Page.loadTotalPage(data.data);
      });
    },


    // 打开新建或编辑弹窗
    openRolePop: function openRolePop(e, index) {
      var thisText = e.target.innerText;
      if (thisText === '新建') {
        this.isAddBtn = true;
        this.roleName = '';
        this.roleValue = '';
        openPop('role-pop');
      } else if (thisText === '编辑') {
        this.isAddBtn = false;
        this.roleName = e.target.getAttribute('data-rname');
        this.roleValue = e.target.getAttribute('data-name');
        this.roleId = this.rolesList[index].id;
        openPop('role-pop');
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


    // 提交新增或修改信息
    submitInfo: function submitInfo() {
      var THIS = this;
      if (THIS.isAddBtn) {
        axios({
          method: 'post',
          params: {
            name: THIS.roleValue,
            rname: THIS.roleName,
            remark: THIS.remark
          },
          url: HEADER + '/role/add_Role.do'
        }).then(function (_ref2) {
          var data = _ref2.data;

          secondPop(data.code, data.msg);
          if (data.code === 1) {
            THIS.getRoles();
          }
        });
      } else {
        axios({
          method: 'post',
          params: {
            id: THIS.roleId,
            name: THIS.roleValue,
            rname: THIS.roleName,
            remark: THIS.remark
          },
          url: HEADER + '/role/update_Role.do'
        }).then(function (_ref3) {
          var data = _ref3.data;

          secondPop(data.code, data.msg);
          if (data.code === 1) {
            THIS.getRoles();
          }
        });
      }
    },
    openRoleDelete: function openRoleDelete(e, index) {
      var preBtn = e.target.previousSibling.previousSibling;
      this.roleValue = preBtn.getAttribute('data-name');
      this.roleName = preBtn.getAttribute('data-rname');
      this.roleId = this.rolesList[index].id;
      openDelete('确认删除该角色?');
    },
    confirmDelete: function confirmDelete() {
      var THIS = this;
      axios({
        method: 'post',
        params: {
          id: THIS.roleId,
          name: THIS.roleValue,
          rname: THIS.roleName
        },
        url: HEADER + '/role/delete_Role.do'
      }).then(function (_ref4) {
        var data = _ref4.data;

        secondPop(data.code, data.msg);
        if (data.code === 1) {
          THIS.getRoles();
        }
      });
    }
  },
  mounted: function mounted() {
    this.getRoles();

    window.onresize = function () {
      setWrapperWidth();
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
  }
});
//# sourceMappingURL=role_manage.js.map