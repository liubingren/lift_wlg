// 设置.table-wrapper的宽度
const setTableWrapperWidth = () => {
  let TableWrapper = document.getElementById('table-wrapper')
  if (TableWrapper) {
    TableWrapper.style.width =
      document.getElementById('content').clientWidth - 301 + 'px'
  }
}

// 树状图
// @lid: 区域ID
const loadZtree = (lid, lname = '主菜单', treeNode, expandFlag) => {
  let zTreeObj
  let zTree
  let setting = {
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
      onClick: (event, treeId, treeNode) => {
        // 禁止a标签跳转
        $('#treeDom').find('a').removeAttr('href')

        // 点击变色
        $('#' + treeNode.tId).find('.node_name').eq(0).css({
          'color': '#2e59bd'
        })

        // 获取对应的资源
        resourceManageVM.parentMenu = treeNode.name
        resourceManageVM.getResources(treeNode.id)
        resourceManageVM.parentId = treeNode.id
      }
    }
  }

  // 加载左侧资源树
  $.ajax({
    type: 'get',
    url: HEADER + '/resources/check_getResourcesTree.do',
    success: (data) => {
      let treeData = data.data

      zTreeObj = $.fn.zTree.init($('#treeDom'), setting, treeData)
      zTree = $.fn.zTree.getZTreeObj("treeDom")

      // 自动展开全国
      let rootNode = zTree.getNodeByParam('name', '主菜单')
      zTree.expandNode(rootNode, true)

      // 定位到指定的节点
      let currentNode = zTree.getNodeByParam('name', lname)
      zTree.expandNode(currentNode, true)
      // 定位变色
      $('#' + currentNode.tId).find('.node_name').eq(0).css({
        'color': '#2e59bd'
      })
    }
  })
}

let resourceManageVM = new Vue({
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
    resources: [],   // 弹窗中的下拉列表
    showPSelect: false   // 切换显示下拉列表
  },
  methods: {
    getResources (rId = 1) {
      let THIS = this
      axios({
        params: {
          id: rId
        },
        url: HEADER + '/resources/check_listResourcesById.do'
      })
        .then(({data}) => {
          THIS.resourcesList = data.data.list
          Page.loadTotalPage(data.data)
        })
    },

    // 打开新建或编辑弹窗
    openResourcePop (e, index) {
      let thisText = e.target.innerText
      let THIS = this
      if (!this.parentMenu) {
        this.parentMenu = '主菜单'
      }
      if (thisText === '新建') {
        this.isAddBtn = true
        this.resourceName = ''
        this.modelValue = ''
        this.resourceURL = ''
        this.resourceOrder = ''

        openPop('resource-pop')
      }
      else if (thisText === '编辑') {
        this.isAddBtn = false
        this.resourceName = this.resourcesList[index].name
        this.modelValue = this.resourcesList[index].model
        this.resourceURL = this.resourcesList[index].url
        this.resourceOrder = this.resourcesList[index].number
        this.recordId = this.resourcesList[index].id   // 记录ID

        openPop('resource-pop')
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

    isInputInt (value) {
      let errorSpanClasses = document.getElementById('not-int').classList
      let reg = /^\+?[1-9][0-9]*$/
      if (!reg.test(value)) {
        errorSpanClasses.add('show-error')
      } else {
        errorSpanClasses.remove('show-error')
      }
    },

    // 提交新增或修改信息
    submitInfo () {
      let THIS = this
      if (!THIS.parentId) {
        THIS.parentId = 1
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
        })
          .then(({data}) => {
            secondPop(data.code, data.msg)
            if (data.code === 1) {
              THIS.getResources(THIS.parentId)
              loadZtree()
            }
          })
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
        })
          .then(({data}) => {
            secondPop(data.code, data.msg)
            if (data.code === 1) {
              THIS.getResources(THIS.parentId)
              loadZtree()
            }
          })
      }
    },

    openResourceDelete (index) {
      this.recordId = this.resourcesList[index].id   // 记录ID
      console.log(this.parentId)
      openDelete('确认删除该资源?')
    },

    confirmDelete () {
      let THIS = this
      axios({
        method: 'post',
        params: {
          id: THIS.recordId
        },
        url: HEADER + '/resources/delete_Resources.do'
      })
        .then(({data}) => {
          secondPop(data.code, data.msg)
          if (data.code === 1) {
            if (!THIS.parentId) {
              THIS.parentId = 1
            }
            THIS.getResources(THIS.parentId)
            loadZtree()
          }
        })
    }
  },
  mounted () {
    this.getResources()

    loadZtree()

    setTableWrapperWidth()
    window.onresize = function () {
      setWrapperWidth()
      setTableWrapperWidth()
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

    //滚动条初始化
    $(function () {
      $("#treeBox").perfectScrollbar({
        wheelSpeed: 0.2,
        wheelPropagation: true,
        maxScrollbarLength: 50
      })
    })
  }
})
