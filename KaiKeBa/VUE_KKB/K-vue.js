class KVue{
  constructor(options){
    this.$options = options

    //数据响应化  
    this.$data = options.data

    this.observe(this.$data)

    //模拟一下watcher创建
    new Watcher()
    this.$data.test
  }

  observe(val){
    if(!val || typeof val !== 'object'){
      return
    } 

    //遍历对象
    console.log(val)
    Object.keys(val).forEach(key=>{
      this.defineReactive(val, key, val[key])
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
  constructor(){
    Dep.target = this
  }

  update(){
    console.log("属性更新了")
  }
}