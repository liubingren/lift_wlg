let roleManageVM = new Vue({
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
    getRoles () {
      let THIS = this
      axios({
        url: HEADER + '/role/check_RoleList.do'
      })
        .then(({data}) => {
          THIS.rolesList = data.data
          Page.loadTotalPage(data.data)
        })
    },

    // 打开新建或编辑弹窗
    openRolePop (e, index) {
      let thisText = e.target.innerText
      if (thisText === '新建') {
        this.isAddBtn = true
        this.roleName = ''
        this.roleValue = ''
        openPop('role-pop')
      }
      else if (thisText === '编辑') {
        this.isAddBtn = false
        this.roleName = e.target.getAttribute('data-rname')
        this.roleValue = e.target.getAttribute('data-name')
        this.roleId = this.rolesList[index].id
        openPop('role-pop')
      }
    },

    isInputEmpty (value, e) {
      let errorSpanClasses = e.target.nextSibling.nextSibling.classList
      if (!value) {
        errorSpanClasses.add('show-error')
      } else {
        errorSpanClasses.remove('show-error')
      }
    },

    // 提交新增或修改信息
    submitInfo () {
      let THIS = this
      if (THIS.isAddBtn) {
        axios({
          method: 'post',
          params: {
            name: THIS.roleValue,
            rname: THIS.roleName,
            remark: THIS.remark
          },
          url: HEADER + '/role/add_Role.do'
        })
          .then(({data}) => {
            secondPop(data.code, data.msg)
            if (data.code === 1) {
              THIS.getRoles()
            }
          })
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
        })
          .then(({data}) => {
            secondPop(data.code, data.msg)
            if (data.code === 1) {
              THIS.getRoles()
            }
          })
      }
    },

    openRoleDelete (e, index) {
      let preBtn = e.target.previousSibling.previousSibling
      this.roleValue = preBtn.getAttribute('data-name')
      this.roleName = preBtn.getAttribute('data-rname')
      this.roleId = this.rolesList[index].id
      openDelete('确认删除该角色?')
    },

    confirmDelete () {
      let THIS = this
      axios({
        method: 'post',
        params: {
          id: THIS.roleId,
          name: THIS.roleValue,
          rname: THIS.roleName
        },
        url: HEADER + '/role/delete_Role.do'
      })
        .then(({data}) => {
          secondPop(data.code, data.msg)
          if (data.code === 1) {
            THIS.getRoles()
          }
        })
    }
  },
  mounted () {
    this.getRoles()

    window.onresize = function () {
      setWrapperWidth()
    }

// 上下首尾按钮
    $('.page-bar li:not(:last)').click(function () {
      let thisClass = this.classList[0]
      Page.pageTurning(thisClass, getLiftsData, 6)
    })
    // 跳到指定页数
    document.getElementById('jump-into').onclick = function () {
      let inputPage = document.getElementById('input-page').value
      Page.jumpIntoPage(inputPage, getLiftsData, 6)
    }
  }
})