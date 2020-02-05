class KVue{
  constructor(options){
    this.$options = options

    //数据响应化  
    this.$data = options.data

    this.observe(this.$data)

    new Compile(options.el, this)

    //created执行
    if(options.created){
      options.created.call(this)
    }
  }

  observe(val){
    if(!val || typeof val !== 'object'){
      return
    } 

    //遍历对象
    Object.keys(val).forEach(key=>{
      this.defineReactive(val, key, val[key])

      this.proxyData(key)
    })

  }

  //数据的响应化
  defineReactive(obj, key, val){

    this.observe(val)

    const dep = new Dep()

    Object.defineProperty(obj, key, {
      get:function(){
        Dep.target && dep.addDep(Dep.target)
        return val;
      },
      set(newVal){
        if(newVal === val){
          return 
        }
        val = newVal
        dep.notify()
      }
    })
  }

  proxyData(key){
    Object.defineProperty(this, key, {
      get(){
        return this.$data[key]
      },
      set(newVal){
        this.$data[key] = newVal
      }
    })
  }
}

//Dep: y用来管理Watcher
class Dep{
  constructor(){
    //这里存放着干依赖(watcher)
    this.deps = []

  }

  addDep(dep){
    this.deps.push(dep)
  }

  notify(){
    this.deps.forEach(dep=>dep.update())
  }


}


//Watcher

class Watcher{
  constructor(vm, key, callback){
    this.vm = vm
    this.key = key
    this.cb = callback
    Dep.target = this
    this.vm[this.key]
    Dep.target = null
  }

  update(){
    // console.log("属性更新了")
    this.cb.call(this.vm, this.vm[this.key])
  }
}