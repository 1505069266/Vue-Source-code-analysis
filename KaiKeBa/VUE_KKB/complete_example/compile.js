//用法 new compile(el, vm)

class Compile{
  constructor(el, vm){
    this.$el = document.querySelector(el)

    this.$vm = vm

    //编译
    if(this.$el){
      //转换内部内容喂片段Fragment
      this.$fragment = this.node2Fragment(this.$el)
      //执行编译过程
      this.compile(this.$fragment)
      //将编译完的html结果追加至$el
      this.$el.appendChild(this.$fragment)
    }
  }
  
  //将元素中的代码片段拿出来遍历, 这样做比较高效
  node2Fragment(el){
    const frag = document.createDocumentFragment()
    //将el中的所有子元素搬家至frag中
    let child;
    while(child = el.firstChild){
      frag.appendChild(child)
    }
    return frag
  }

  //编译过程
  compile(el){
    const childNodes = el.childNodes
    Array.from(childNodes).forEach(node => {
      //类型判断
      if(this.isElement(node)){
        //元素
        // console.log("编译元素" + node.nodeName)
        const nodeAttrs = node.attributes;
        Array.from(nodeAttrs).forEach(attr=>{
          const attrName = attr.name
          const exp = attr.value
          if(this.isDirective(attrName)){
            const dir = attrName.substring(2)
            //执行命令
            this[dir] && this[dir](node, this.$vm, exp)
          }
          if(this.isEvent(attrName)){
            let dir = attrName.substring(1) //@click
            this.eventHandler(node, this.$vm, exp, dir)
          }
        })
      } else if(this.isIntepolation(node)){
        //文本
        // console.log("编译文本" + node.textContent)
        this.compileText(node)
      }

      //递归子节点
      if(node.childNodes && node.childNodes.length > 0){
        this.compile(node)
      }
    })
  }

  isElement(node){
    return node.nodeType === 1
  }

  //更新函数
  update(node, vm, exp, dir){
    const updateFn = this[dir+'Updater']
    //初始化
    updateFn && updateFn(node, vm.$data[exp])
    //依赖收集
    new Watcher(vm, exp, function(value){
      updateFn && updateFn(node, value)
    })
  }

  text(node, vm, exp){
    this.update(node, vm, RegExp.$1, 'text')

  }

  html(node, vm, exp){
    this.update(node, vm, exp, 'html')
  }

  htmlUpdater(node, value){
    node.innerHTML = value
  }

  textUpdater(node, value){
    node.textContent = value
  }

  isIntepolation(node){
    return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent)
  }

  compileText(node){
    this.update(node, this.$vm,RegExp.$1, 'text')
  }

  isDirective(attr){
    return attr.indexOf('k-') == 0
  }

  isEvent(attr){
    return attr.indexOf('@') == 0
  }

  eventHandler(node, vm, exp, dir){
    let fn = vm.$options.methods && vm.$options.methods[exp]
    if(dir && fn){
      node.addEventListener(dir, fn.bind(vm))
    }
  }
}