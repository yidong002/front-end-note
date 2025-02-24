

# 常规面试题

## 课程介绍

罗列常见的面试题（代码实现及原理），分析其考点和解答思路，帮助前端工程师温故知新，填补自己的知识盲区，在面试中取得更好的表现。

## 代码实现题

### 实现call/apply/bind

考点:

- call/apply/bind的功能
- JS中this的指向
- 原型链

#### JS中this的指向

**1.当函数作为构造函数，通过new xxx()调用时，this指向生成的实例**

```javascript
    function Cat(name,color){
        　　　　this.name=name;
        　　　　this.color=color;
        　　}
        let cat1 = new Cat("大毛","橘色");//this指向的cat1
        let cat2 = new Cat("二毛","黑色");//this指向的cat2
        console.log(cat1); 
        console.log(cat2); 
```

**2.当函数直接被调用时（通过 xxx()的方式调用）this指向window对象,严格模式下为undefined**

```javascript
    function Cat(name,color){
        　　　　this.name=name;
        　　　　this.color=color;
        　　}
       Cat("大毛","橘色");
       console.log(window.name)//大毛
       console.log(window.color)//橘色
```

**3.当函数被调用时，它是作为某个对象的方法（前面加了 点'.'）this指向这个对象（点'.'前面的对象）**(谁调用它，它就指向谁)

```javascript
    function setDetails(name,color){
            　　　　this.name=name;
            　　　　this.color=color;
            　　}
    let cat={};
    cat.setDetails=setDetails;
    cat.setDetails('大毛','橘色');
    console.log(cat.name)//大毛
    console.log(cat.color)//橘色
```

思考1

```javascript
    let obj={
        x:  10,
        fn: function(){
                function a(){
                    console.log(this.x)
                }
                a();
            }
    };
    obj.fn() //输出什么？
```

思考2

```javascript
    let obj={
        x:  10,
        fn: function(){
                console.log(this.x)
            }
    };
    let a=obj.fn;
    obj.fn() //输出什么？
    a(); //输出什么？
```

思考3

```javascript
    let obj={
            x:  10,
            fn: function(){
                	return function (){
                        console.log(this.x)
                    }
                }
        };
    obj.fn()() //输出什么？
```

#### 实现call

函数通过`call`调用时，函数体内的`this`指向`call`方法传入的第一个实参，而`call`方法后续的实参会依次传入作为原函数的实参传入。

```javascript
function setDetails(name,color){
            　　　　this.name=name;
            　　　　this.color=color;
            　　}
    let cat1={};
    let cat2={};
    setDetails.call(cat1,'大毛','橘色')
    setDetails.call(cat2,'二毛','黑色')
    console.log(cat1.name)//大毛
    console.log(cat2.name)//二毛
```
```javascript
let person1 ={
  name:'zs',
  say:function (hobby) {
    console.log(this.name);
    console.log('爱好：'+ hobby);
  }
}
let person2 = {
  name:'ls'
}
person1.say('打游戏')
person1.say.call(person2,'健身')
```

开始实现：

先在原型链上挂上我们自定义的`call2`方法，让所有函数共享此方法：

```javascript
Function.prototype.call2 = function () {
  console.log(this);
}
setDetails.call2()
```

在`call2`中通过`this`拿到调用`call2`的原函数，接下来通过上面提到**当函数被调用时，它是作为某个对象的方法（前面加了 点'.'）this指向这个对象（点'.'前面的对象）**改变原函数中`this`的指向：

```javascript
Function.prototype.call2 = function (context) {
  //this === 原函数
  console.log(this);

  //将原函数作为cat1的方法调用
  context.setDetails = this
  context.setDetails()
}
```

继续改进：

- 其实将原函数作为`context`的方法调用时，方法名并不影响功能，将方法名写死反而可能会造成方法名冲突。在ES6中可以用`Symbol`来解决，如果不用`Symbol`可以随机生成一个基本不可能冲突的字符串，万一冲突则继续生成到不冲突为止
- 在方法调用后删除方法，避免给`context`增加多余的方法。
- 原函数可能有返回值，要将改变`this`并调用后的返回值也返回

```javascript
Function.prototype.call2 = function (context) {
  function mySymbol(obj) {
    let unique = (Math.random() + new Date())
    if (obj.hasOwnProperty(unique)) {
      return mySymbol(obj) //如果还是冲突，递归调用
    } else {
      return unique
    }
  }
  let uniqueName = mySymbol(context)
  //this === 原函数
  //console.log(this);

  //将原函数作为context的方法调用
  context[uniqueName] = this
  let result = context[uniqueName]()
  //用完删除
  delete context[uniqueName]
  return result
}
```

改进解决参数传递的问题：

- 因为不知道用户在调用时传参的个数，解决可以通过`arguments`或者`剩余参数`来获取除了`context`剩余的参数，将剩余参数传递给`context[uniqueName]`

```javascript
Function.prototype.call2 = function (context) {
  function mySymbol(obj) {
    let unique = (Math.random() + new Date())
    if (obj.hasOwnProperty(unique)) {
      return mySymbol(obj) //如果还是冲突，递归调用
    } else {
      return unique
    }
  }
  let uniqueName = mySymbol(context)

  //获取除了第一个参数外剩余的参数
  let args = Array.from(arguments).slice(1)
  
  //this === 原函数
  //将原函数作为cat1的方法调用
  context[uniqueName] = this
  //使用扩展运算符传参，可以解决参数不确定的问题
  let result = context[uniqueName](...args)

  //用完删除
  delete context[uniqueName]
  return result
}
```

将剩余参数传递给`context[uniqueName]`还可以通过`eval`来拼接调用语句：

```javascript
Function.prototype.call2 = function (context) {
  function mySymbol(obj) {
    let unique = (Math.random() + new Date())
    if (obj.hasOwnProperty(unique)) {
      return mySymbol(obj) //如果还是冲突，递归调用
    } else {
      return unique
    }
  }
  let uniqueName = mySymbol(context)
  //this === 原函数
  //console.log(this);
  //获取除了第一个参数外剩余的参数
  let args = [];
  for(let i = 1; i < arguments.length; i++) {
    args.push('arguments[' + i + ']');
  }

  //将原函数作为cat1的方法调用
  context[uniqueName] = this

  //使用扩展运算符传参，可以解决参数不确定的问题
  let result = eval('context[uniqueName](' + args.join(',') + ')');

  //用完删除
  delete context[uniqueName]
  return result
}
```



#### 实现apply

apply与call功能一致，但是在调用方式上，是将剩余的实参以一个数组的方式传参：

```javascript
function setDetails(name,color){
            　　　　this.name=name;
            　　　　this.color=color;
            　　}
    let cat1={};
    let cat2={};
    setDetails.apply(cat1,['大毛','橘色'])
    setDetails.apply(cat2,['二毛','黑色'])
    console.log(cat1.name)//大毛
    console.log(cat2.name)//二毛
```

实现与call基本一致，注意兼容`apply`第二个参数没有传入的情况:

使用扩展运算符

```javascript
Function.prototype.apply2 = function (context,args) {
  function mySymbol(obj) {
    let unique = (Math.random() + new Date())
    if (obj.hasOwnProperty(unique)) {
      return mySymbol(obj) //如果还是冲突，递归调用
    } else {
      return unique
    }
  }
  let uniqueName = mySymbol(context)
  //this === 原函数
  //console.log(this);


  args = args || [] //兼容没有传参的情况
  //将原函数作为context的方法调用
  context[uniqueName] = this

  //使用扩展运算符传参，可以解决参数不确定的问题
  context[uniqueName](...args)

  //用完删除
  delete context[uniqueName]
}
```

使用eval:

```javascript
Function.prototype.apply2 = function (context,args) {
    function mySymbol(obj){
      let unique = (Math.random()+ new Date())
      if(obj.hasOwnProperty(unique)){
        return mySymbol(obj)
      }else {
        return unique
      }
    }
    let uniqueName = mySymbol(context)
    //let args = Array.from(arguments).slice(1)
    let arr = []
    for (let i = 0; i <args.length; i++) {
      arr.push('args[' + i + ']')
    }

    context[uniqueName] = this
/*    let result = context[uniqueName](args.join(',')) //等同于context[uniqueName]('大毛','橘色')*/
    let result = eval('context[uniqueName](' + arr.join(',')+ ')')


    //删除临时方法
    delete context[uniqueName]
    return result
  }
```

#### 实现bind

`bind`与`call`和`apply`的功能相似，但有不同，`bind`不会立即调用函数，只做`this`的绑定，并且返回一个新的函数，这个函数运行的逻辑与原函数一致，但是`this`会指向之前绑定的对象。

```javascript
function setDetails(name,color){
  this.name = name
  this.color = color
}
let cat1 = {}
let setDetails2 = setDetails.bind(cat1)
setDetails2('大毛','橘色')
```

实现思路：`bind`返回一个函数，在函数体内调用`apply`

```javascript
Function.prototype.bind2 = function (context) {
  let originFn = this;
  return function () {
    return originFn.apply(context);
  }
}
```

继续改进：

调用`bind`后返回的函数是可以传参的。

`bind`方法除了第一个参数，还可以额外传参，可以理解为预传参。

```javascript
function setDetails(name,color){
  this.name = name
  this.color = color
}
let cat1 = {}
let setDetails2 = setDetails.bind(cat1,'大毛')
setDetails2('橘色')
```

将第一次传参先存起来，在调用时将第一次和第二次传参进行拼接：

```javascript
Function.prototype.bind2 = function (context) {
  let originFn = this;
  let args = Array.from(arguments).slice(1);
  return function () {
    let bindArgs = Array.from(arguments);
    return originFn.apply(context, args.concat(bindArgs));
  }
}
```

最后改进：

- `bind`**返回的函数**，如果之后是作为构造函数调用，则**原函数**中的`this`会指向创建的对象，而不会指向之前绑定的对象，并且生成的实例仍然可以使用原型对象上的属性：

```javascript
function Cat(name, color) {
  this.name = name
  this.color = color
}
Cat.prototype.miao = function(){console.log('喵~！')}
let cat1 = {}
let CatBind = Cat.bind(cat1)
let cat2 = new CatBind('大毛','橘色')
cat2.miao()
```

当**返回的函数**作为构造函数，通过`new xxx()`调用时，返回的函数的`this`指向以返回函数作为构造生成的实例。因此只需要判断`this instanceof 返回的函数`，另外，返回的函数要继承原函数（将原型链连接起来）:

```javascript
Function.prototype.bind2 = function (context) {
  let originFn = this;
  let args = Array.from(arguments).slice(1);
  function fBind() {
    let bindArgs = Array.from(arguments);
    return originFn.apply(this instanceof fBind ? this /*作为构造函数调用*/: context, args.concat(bindArgs));
  }
  fBind.prototype = Object.create(this.prototype) //继承
  return fBind
}
```



### 实现 new

考点：

- 构造函数，原型链

函数通过`new` 操作符调用，此时函数被称为构造函数，运行后会返回一个对象，该对象的`__proto__`属性指向`构造函数.prototype`

```javascript
function Cat(name) {
  this.name = name
}
Cat.prototype.miao = function() {
  console.log('喵~！');
}
let cat = new Cat('大毛')
console.log(cat.__proto__ === Cat.prototype); //true
```

由于`new`是语言层面的操作符，所以用函数来模拟`new`的功能：

```javascript
function newFactory() {
  let constructor = arguments[0]
  let obj = Object.create(constructor.prototype)

  constructor.apply(obj, Array.from(arguments).slice(1));
  return obj
}

function Cat(name) {
  this.name = name
}
Cat.prototype.miao = function() {
  console.log('喵~！');
}
let cat = newFactory(Cat,'大毛')
```

改进：当构造函数本身会返回一个非null的对象时，则通过`new`会返回这个对象，其他情况还是会返回新生成的对象

```javascript
function Cat(name) {
  this.name = name
  return {
    name:'zs'
  }
}
Cat.prototype.miao = function() {
  console.log('喵~！');
}
let cat = new Cat('大毛')
console.log(cat.name) //'zs'
```

因此需要将调用`Cat`后返回的结果进行判断，如果是非null的对象，则返回该对象，其他情况返回新生成的对象

```javascript
function newFactory() {
  let constructor = arguments[0]
  let obj = Object.create(constructor.prototype)
  let result = constructor.apply(obj, Array.from(arguments).slice(1));
  return result instanceof Object ? result : obj
}
function Cat(name) {
  this.name = name
  return {
    name:'zs'
  }
}
Cat.prototype.miao = function() {
  console.log('喵~！');
}
let cat = new Cat('大毛')
```



### 实现防抖节流

#### 实现防抖

概念： 在事件被触发n秒后再执行回调，如果在这n秒内又被触发，则重新计时。

例子：如果有人进电梯，那电梯将在10秒钟后出发，这时如果又有人进电梯了，我们又得等10秒再出发。

思路：通过闭包维护一个变量，此变量代表是否已经开始计时，如果已经开始计时则清空之前的计时器，重新开始计时。

```javascript
function debounce(fn, time) {
  let timer = null;
  return function () {
    let context = this
    let args = arguments
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    timer = setTimeout(function () {
      fn.apply(context, args)
    }, time)
  }
}
window.onscroll = debounce(function(){
  console.log('触发：'+ new Date().getTime());
},1000)
```

#### 实现节流

概念： 规定一个单位时间，在这个单位时间内，只能有一次触发事件的回调函数执行，如果在同一个单位时间内某事件被触发多次，只有一次能生效。

例子：游戏内的技能冷却，无论你按多少次，技能只能在冷却好了之后才能再次触发

思路：通过闭包维护一个变量，此变量代表是否允许执行函数，如果允许则执行函数并且把该变量修改为不允许，并使用定时器在规定时间后恢复该变量。

```javascript
function throttle(fn, time) {
  let canRun = true;
  return function () {
    if(canRun){
      fn.apply(this, arguments)
      canRun = false
      setTimeout(function () {
        canRun = true
      }, time)
    }
  }
}
window.onscroll = throttle(function(){
  console.log('触发：'+ new Date().getTime());
},1000)
```

### 实现promise

Promise是ES6中的新的异步语法，解决了回调嵌套的问题：

```javascript
new Promise((resolve)=>{
  setTimeout(()=>{
    resolve(1)
  },1000)
}).then(val =>{
  console.log(val);
  return new Promise((resolve)=>{
    setTimeout(()=>{
      resolve(2)
    },1000)
  })
}).then(val => {
  console.log(val);
})
```

#### 实现状态切换

- promise实例有三个状态，`pending`,`fulfilled`,`rejected`
- promise实例在构造是可以传入执行函数，执行函数有两个形参`resolve`,`reject`可以改变promise的状态，promise的状态一旦改变后不可再进行改变。
- 执行函数会在创建promise实例时，同步执行

```javascript
const PENDING = 'PENDING'; // 初始状态
const FULFILLED = 'FULFILLED'; // 成功状态
const REJECTED = 'REJECTED'; // 失败状态
class Promise2 {
  constructor(executor){
    this.status = PENDING
    this.value = null
    this.reason = null
    const resolve = (value) => {
      if (this.status === PENDING) {
        this.value = value;
        this.status = FULFILLED;
      }
    }
    const reject = (reason) => {
      if (this.status === PENDING) {
        this.reason = reason;
        this.status = REJECTED;
      }
    }
    try {
      executor(resolve,reject)
    }catch (e) {
      reject(e)
    }

  }
}
let p = new Promise2((resolve,reject)=>{resolve(1)})
```

#### 实现`then`异步执行

promise实例可以调用`then`方法并且传入回调：

如果调用`then`时，Promise实例是`fulfilled`状态，则马上**异步执行**传入的回调。

如果调用`then`时，Promise实例是`pending`状态，传入的回调会等到resolve后再**异步执行**

例子：

```javascript
let p = new Promise((resolve, reject)=>{
  console.log(1);
  resolve(2)
  console.log(3);
})
p.then((val)=>{
  console.log(val);
})
//1
//3
//2
```

```javascript
let p = new Promise((resolve, reject)=>{
  setTimeout(()=>{
    resolve(1)
  },2000)
})
p.then((val)=>{
  console.log(val);
})
```

思路：需要用回调先保存到队列中，在`resolve`后异步执行队列里的回调，在`then`时判断实例的状态再决定是将回调推入队列，还是直接异步执行回调：

```javascript
const PENDING = 'PENDING'; // 初始状态
const FULFILLED = 'FULFILLED'; // 成功状态
const REJECTED = 'REJECTED'; // 失败状态
class Promise2 {
  constructor(executor){
    this.status = PENDING
    this.value = null
    this.reason = null
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];
    const resolve = (value) => {
      if (this.status === PENDING) {
        this.value = value;
        this.status = FULFILLED;
        setTimeout(()=>{
          this.onFulfilledCallbacks.forEach(fn => fn(this.value));
        })
      }
    }
    const reject = (reason) => {
      if (this.status === PENDING) {
        this.reason = reason;
        this.status = REJECTED;
        setTimeout(()=>{
          this.onFulfilledCallbacks.forEach(fn => fn(this.reason));
        })
      }
    }
    try {
      executor(resolve,reject)
    }catch (e) {
      reject(e)
    }

  }
  then(onFulfilled, onRejected) {
    if (this.status === FULFILLED) {
      setTimeout(()=>{
        onFulfilled(this.value);
      })
    }
    if (this.status === REJECTED) {
      setTimeout(()=>{
        onRejected(this.reason);
      })

    }
    if (this.status === PENDING) {
      this.onFulfilledCallbacks.push(onFulfilled); // 存储回调函数
      this.onRejectedCallbacks.push(onRejected); // 存储回调函数
    }
  }
}
```

#### `resolve` Promise实例的情况

`resolve`的值有可能也是个promise实例，这时候就要用前述实例自己`resolve`的值

```javascript
let p = new Promise((resolve,reject) =>{  //promise1
  resolve(new Promise((resolve2,reject2)=>{  //promise2
    setTimeout(()=>{
      resolve2(1)
    },1000)
  }))
})
p.then((val)=>{
  console.log(val);
})
```

因此需要在promise1的`resolve`函数中进行判断，是promise实例则在这个promise实例（promise2）后接一个`then`，并且将promise1的`resolve`作为回调传入promise2的`then`

```javascript
const PENDING = 'PENDING'; // 初始状态
const FULFILLED = 'FULFILLED'; // 成功状态
const REJECTED = 'REJECTED'; // 失败状态
class Promise2 {
  constructor(executor){
    this.status = PENDING
    this.value = null
    this.reason = null
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];
    const resolve = (value) => {
      if (value instanceof this.constructor) {
        value.then(resolve, reject); //resolve reject是箭头函数，this已经绑定到外层Promise
        return
      }
      if (this.status === PENDING) {
        this.value = value;
        this.status = FULFILLED;
        setTimeout(()=>{
          this.onFulfilledCallbacks.forEach(fn => fn(this.value));
        })
      }
    }
    const reject = (reason) => {
      if (this.status === PENDING) {
        this.reason = reason;
        this.status = REJECTED;
        setTimeout(()=>{
          this.onFulfilledCallbacks.forEach(fn => fn(this.reason));
        })
      }
    }
    try {
      executor(resolve,reject)
    }catch (e) {
      reject(e)
    }

  }
  then(onFulfilled, onRejected) {
    if (this.status === FULFILLED) {
      setTimeout(()=>{
        onFulfilled(this.value);
      })
    }
    if (this.status === REJECTED) {
      setTimeout(()=>{
        onRejected(this.reason);
      })

    }
    if (this.status === PENDING) {
      this.onFulfilledCallbacks.push(onFulfilled); // 存储回调函数
      this.onRejectedCallbacks.push(onRejected); // 存储回调函数
    }
  }
}
let p = new Promise2((resolve,reject) =>{
  resolve(new Promise2((resolve2,reject2)=>{
    setTimeout(()=>{
      resolve2(1)
    },1000)
  }))
})
p.then((val)=>{
  console.log(val);
})
```

#### 实现链式调用

`then`可以链式调用，而且前一个`then`的回调的返回值，如果不是promise实例，则下一个`then`回调的传参值就是上一个`then`回调的返回值，如果是promise实例，则下一个`then`回调的传参值，是上一个`then`回调返回的promise实例的解决值(value)

```javascript
let p = new Promise((resolve,reject) =>{
    setTimeout(()=>{
      resolve(1)
    },1000)
})
p.then(val => {
  console.log(val);
  return new Promise((resolve) => {
    setTimeout(()=>{
      resolve(2)
    },1000)
  })
}).then(val => {
  console.log(val);
  return 3
}).then(val => {
  console.log(val);
})
```

既然能够链式调用，那么`then`方法本身的返回值必定是一个Promise实例。那么返回的promise实例是不是自身呢？答案显而易见：不是。如果一个promise的then方法的返回值是promise自身，在new一个Promise时，调用了resolve方法，因为promise的状态一旦更改便不能再次更改，那么下面的所有then便只能执行成功的回调，无法进行错误处理，这显然并不符合promise的规范和设计promise的初衷。

因此 `then`方法会返回一个新的promise实例

```javascript
const PENDING = 'PENDING'; // 初始状态
const FULFILLED = 'FULFILLED'; // 成功状态
const REJECTED = 'REJECTED'; // 失败状态
class Promise2 {
  constructor(executor){
    this.status = PENDING
    this.value = null
    this.reason = null
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];
    const resolve = (value) => {
      if (value instanceof this.constructor) {
        value.then(resolve, reject); //resolve reject是箭头函数，this已经绑定到外层Promise

        return
      }
      if (this.status === PENDING) {
        this.value = value;
        this.status = FULFILLED;
        setTimeout(()=>{
          this.onFulfilledCallbacks.forEach(fn => fn(this.value));
        })
      }
    }
    const reject = (reason) => {
      if (this.status === PENDING) {
        this.reason = reason;
        this.status = REJECTED;
        setTimeout(()=>{
          this.onFulfilledCallbacks.forEach(fn => fn(this.reason));
        })
      }
    }
    try {
      executor(resolve,reject)
    }catch (e) {
      reject(e)
    }

  }
  then(onFulfilled, onRejected) {
    const promise2 = new this.constructor((resolve, reject) => { // 待返回的新的promise实例
      if (this.status === FULFILLED) {
          setTimeout(()=>{
            try {
              let callbackValue = onFulfilled(this.value);
              resolve(callbackValue);
            }catch(error) {
              reject(error) // 如果出错此次的then方法的回调函数出错，在将错误传递给promise2
            }
          })
      }
      if (this.status === REJECTED) {
        setTimeout(()=>{
          try {
            let callbackValue= onRejected(this.reason);
            resolve(callbackValue);
          } catch (error) {
            reject(error);
          }
        })

      }
      if (this.status === PENDING) {
        this.onFulfilledCallbacks.push(() => {
          try {
            let callbackValue = onFulfilled(this.value);
            resolve(callbackValue);
          }catch (error) {
            reject(error)
          }
        });
        this.onRejectedCallbacks.push(() => {
          try {
            let callbackValue = onRejected(this.reason);
            resolve(callbackValue);
          } catch (error) {
            reject(error);
          }
        });
      }
    })
    return promise2;
  }
}
```

#### 实现其他方法

- catch
- resolve
- reject
- all
- race

方法演示：

```javascript
/*catch方法*/
let p = new Promise((resolve, reject) => {
  reject(1)
})
p.catch(reason => {
  console.log(reason);
})

/*Promise.resolve*/
let p = Promise.resolve(1)

/*Promise.resolve*/
let p = Promise.reject(1)

/*Promise.all*/
let p = Promise.all([
  new Promise(resolve => {
    setTimeout(() => {
      resolve(1)
    }, 1000)
  }),
  new Promise(resolve => {
    setTimeout(() => {
      resolve(2)
    }, 2000)
  }),
  new Promise(resolve => {
    setTimeout(() => {
      resolve(3)
    }, 3000)
  }),
])
p.then(val => {
  console.log(val);
})
/*Promise.race*/
let p = Promise.race([
  new Promise(resolve => {
    setTimeout(() => {
      resolve(1)
    }, 1000)
  }),
  new Promise(resolve => {
    setTimeout(() => {
      resolve(2)
    }, 2000)
  }),
  new Promise(resolve => {
    setTimeout(() => {
      resolve(3)
    }, 3000)
  }),
])
p.then(val => {
  console.log(val);
})
```



```javascript
const PENDING = 'PENDING'; // 初始状态
const FULFILLED = 'FULFILLED'; // 成功状态
const REJECTED = 'REJECTED'; // 失败状态
class Promise2 {

  static resolve(value) {
    if (value instanceof this) {
      return value;
    }
    return new this((resolve, reject) => {
        resolve(value);
    });
  };

  static reject(reason) {
    return new this((resolve, reject) => reject(reason))
  };
  static all(promises){
    return new this((resolve, reject) => {
      let resolvedCounter = 0;
      let promiseNum = promises.length;
      let resolvedValues = new Array(promiseNum);
      for (let i = 0; i < promiseNum; i += 1) {
        Promise2.resolve(promises[i]).then(
          value => {
            resolvedCounter++;
            resolvedValues[i] = value;
            if (resolvedCounter === promiseNum) {
              return resolve(resolvedValues);
            }
          },
          reason => {
            return reject(reason);
          },
        );

      }
    });
  };
  static race(promises){
    return new this((resolve, reject) => {
      if (promises.length === 0) {
        return;
      } else {
        for (let i = 0, l = promises.length; i < l; i += 1) {
          Promise2.resolve(promises[i]).then(
            data => {
              resolve(data);
              return;
            },
            err => {
              reject(err);
              return;
            },
          );
        }
      }
    });
  }
  constructor(executor) {
    this.status = PENDING
    this.value = null
    this.reason = null
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];
    const resolve = (value) => {
      if (value instanceof this.constructor) {
        value.then(resolve, reject); //resolve reject是箭头函数，this已经绑定到外层Promise

        return
      }
      if (this.status === PENDING) {
        this.value = value;
        this.status = FULFILLED;
        setTimeout(() => {
          this.onFulfilledCallbacks.forEach(fn => fn(this.value));
        })
      }
    }
    const reject = (reason) => {
      if (this.status === PENDING) {
        this.reason = reason;
        this.status = REJECTED;
        setTimeout(() => {
          this.onFulfilledCallbacks.forEach(fn => fn(this.reason));
        })
      }
    }
    try {
      executor(resolve, reject)
    } catch (e) {
      reject(e)
    }

  }

  then(onFulfilled, onRejected) {
    const promise2 = new this.constructor((resolve, reject) => { // 待返回的新的promise实例
      if (this.status === FULFILLED) {

        setTimeout(() => {
          try {
            let callbackValue = onFulfilled(this.value);
            resolve(callbackValue);
          } catch (error) {
            reject(error) // 如果出错此次的then方法的回调函数出错，在将错误传递给promise2
          }
        })
      }
      if (this.status === REJECTED) {
        setTimeout(() => {
          try {
            let x = onRejected(this.reason);
            resolve(x);
          } catch (error) {
            reject(error);
          }
        })

      }
      if (this.status === PENDING) {
        this.onFulfilledCallbacks.push(() => {
          try {
            let callbackValue = onFulfilled(this.value);
            resolve(callbackValue);
          } catch (error) {
            reject(error)
          }
        });
        this.onRejectedCallbacks.push(() => {
          try {
            let callbackValue = onRejected(this.reason);
            resolve(callbackValue);
          } catch (error) {
            reject(error);
          }
        });
      }
    })
    return promise2;
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }
}
```



#### macrotask和mirotask

所谓`macroTask`（宏任务）是指将任务排到下一个事件循环，`microTask`（微任务）是指将任务排到当前事件循环的队尾，执行时机会被宏任务更早。Promise的标准里没有规定Promise里的异步该使用哪种，但在node和浏览器的实现里都是使用的`miroTask`（微任务）

![](.\img\2.png)

```javascript
setTimeout(() => {
  console.log(1);
}, 0)
let p = Promise.resolve(2)
p.then((val) => {
  console.log(val);
})
```

宏任务api包括：`setTimeout`,`setInterval`,`setImmediate(Node)`,`requestAnimationFrame(浏览器)`,`各种IO操作，网络请求`

微任务api包括：`process.nextTick(Node)`,`MutationObserver（浏览器）`

`MutaionObserver`演示：

```javascript
let observer = new MutationObserver(()=>{
  console.log(1);
})
let node = document.createElement('div')
observer.observe(node, { // 监听节点
  childList: true // 一旦改变则触发回调函数 nextTickHandler
})
node.innerHTML = 1
```

利用`MutaionObserver`封装一个微任务执行函数

```javascript
let nextTick = (function () {
  let callbacks = []
  function nextTickHandler() {
    let copies = callbacks.slice(0)
    callbacks = []
    for (let i = 0; i < copies.length; i++) {
      copies[i]()
    }
  }

  let counter = 1
  let observer = new MutationObserver(nextTickHandler) // 声明 MO 和回调函数
  let node = document.createElement('div')
  observer.observe(node, { // 监听节点
    childList: true // 一旦改变则触发回调函数 nextTickHandler
  })
  return function (cb) {
    callbacks.push(cb)
    counter = (counter + 1) % 2 //让节点内容文本在 1 和 0 间切换
    node.innerHTML = counter
  }
})()
```





## 原理题

### 浏览器从输入地址到页面输出

#### 主要流程

![](.\img\7.png)

#### DNS原理

DNS（Domain Name Server）用来返回某个域名对应主机的ip的服务器

**根DNS （.）**

只负责提供各类顶级DNS服务器ip地址. 是域名解析的入口.

**顶级DNS (TLD, Top Level Domain)**

负责提供二级域名的DNS服务器IP地址. 每一个顶级域名都有对应的DNS的服务器,它们通常由专门的机构公司来维护. 比如`.com`由`Verisign Global Registry Services`公司维护,`.edu`由`Educause`公司维护. 它们各自提供自家域名下的子域名（二级域名)的名称服务. 通常我们所说的"购买域名"就是向这些公司的数据库注册一条记录.

**权威DNS**

负责提供三级域名对应的主机IP地址。由域名购买者提供，大多数域名注册公司同时提供了权威DNS托管服务。

获取域名对应的服务器ip的过程：

1）**浏览器缓存**

　　当用户通过浏览器访问某域名时，浏览器首先会在自己的缓存中查找是否有该域名对应的IP地址（若曾经访问过该域名且没有清空缓存便存在）；

2）**系统Hosts**

　　当浏览器缓存中无域名对应IP则会自动检查用户计算机系统Hosts文件是否有该域名对应IP；

3）**本地域名服务器**

　　当在用户客服端查找不到域名对应IP地址，则将进入本地DNS缓存中进行查询。通常这个本地域名DNS会配置成运营商（ISP）指定的DNS，但也不是必须的。

4）**迭代查询**

　　当以上均未完成，则会由本地DNS开始进行迭代查询：

- 向根域名服务器查询，得到顶级域名服务器的IP地址
- 向顶级域名服务器查询，得到权威域名服务器的IP地址
- 向权威域名服务器查询，最终得到域名的ip

则进入根服务器进行查询。全球仅有13台根域名服务器，1个主根域名服务器，其余12为辅根域名服务器。根域名收到请求后会查看区域文件记录，若无则将其管辖范围内顶级域名（如.com）服务器IP告诉本地DNS服务器；

5）**保存结果至缓存**

　　本地域名服务器把返回的结果保存到缓存，以备下一次使用，同时将该结果反馈给客户端，客户端通过这个IP地址与web服务器建立链接。

![](.\img\1.png)



#### TCP三次握手与四次挥手

为什么tcp是三次握手不是两次

![](.\img\6.png)



> “已失效的连接请求报文段”的产生在这样一种情况下：client发出的第一个连接请求报文段并没有丢失，而是在某个网络结点长时间的滞留了，以致延误到连接释放以后的某个时间才到达server。本来这是一个早已失效的报文段。但server收到此失效的连接请求报文段后，就误认为是client再次发出的一个新的连接请求。于是就向client发出确认报文段，同意建立连接。假设不采用“三次握手”，那么只要server发出确认，新的连接就建立了。由于现在client并没有发出建立连接的请求，因此不会理睬server的确认，也不会向server发送数据。但server却以为新的运输连接已经建立，并一直等待client发来数据。这样，server的很多资源就白白浪费掉了。采用“三次握手”的办法可以防止上述现象发生。例如刚才那种情况，client不会向server的确认发出确认。server由于收不到确认，就知道client并没有要求建立连接。”



![](.\img\5.png)



TCP连接关闭时进行四次握手过程👋

客户端：“你好，我这边没有数据要传了，我要关闭咯。”

服务端：“收到～我看一下我这边有没数据要传的。”

服务端：“我这边也没有数据要传啦，我们可以关闭连接咯～”

客户端：”ok～“

#### http缓存

浏览器缓存可以分为两种模式，**强缓存**和**协商缓存**。

强缓存（无HTTP请求，无需协商）

直接读取本地缓存，无需跟服务端发送请求确认，http返回状态码是200（from memory cache或者from disk cache ，不同浏览器返回的信息不一致的）。

- 对应的Http header有:

- - Cache-Control
  - Expires

协商缓存（有HTTP请求，需协商）

浏览器虽然发现了本地有该资源的缓存，但是不确定是否是最新的，于是想服务器询问，若服务器认为浏览器的缓存版本还可用，那么便会返回304（Not Modified） http状态码。

- 对应的Http header有:

- - Last-Modified（缺点只能精确到1s）
  - ETag



| Http Header   | 描述                                              |
| ------------- | ------------------------------------------------- |
| Cache-Control | 指定缓存机制，优先级最高                          |
| Pragma        | http1.0字段，**已废弃**，为了兼容一般使用no-cache |
| Expires       | http1.0字段,指定缓存的过期时间                    |
| Last-Modified | http1.0字段，资源最后一次的修改时间               |
| ETag          | 唯一标识请求资源的字符串，会覆盖Last-Modified     |

![](.\img\3.png)



#### 浏览器渲染页面

1. 从HTML解析出DOM Tree（DOM树）
2. 从CSS解析出CSSOM Tree(CSS规则树)
3. JavaScript代码由JavaScript引擎处理
4. DOM树建立后根据CSS样式进行构建内部绘图模型，生成RenderObject树(渲染树)
5. 根据网页层次结构构建RenderLayer树，同时构建虚拟绘图上下文(重排)
6. 依赖2D和3D图形库渲染成图像结果呈现在浏览器中（重绘）

css的下载过程不会阻塞解析，但JS会等待其下载并执行完成后才会继续解析。JS下载时，会并行下载其他的资源。

webkit内核浏览器渲染过程为例：

![](.\img\4.png)



##### 重绘与重排

一旦渲染树构建完成，就要开始绘制（paint）页面元素了。当DOM的变化包括

- 添加或删除可见的DOM元素
- 元素位置改变
- 元素本身的尺寸发生改变
- 内容改变
- 页面渲染器初始化
- 浏览器窗口大小发生改变

导致浏览器不得不重新计算元素的几何属性，并重新构建渲染树，这个过程称为“**重排**”。完成重排后，要将重新构建的渲染树渲染到屏幕上，这个过程就是“**重绘**”。

简单的说，重排负责元素的**几何属性**更新，重绘负责元素的**样式**更新。而且，**重排必然带来重绘，但是重绘未必带来重排**。比如，改变某个元素的背景，这个就不涉及元素的几何属性，所以只发生重绘。

减少重绘和重排的措施包括：

- 一次性改变样式：

```javascript
var el = document.querySelector('.el');
el.style.borderLeft = '1px';
el.style.borderRight = '2px';
el.style.padding = '5px';
```

```javascript
var el = document.querySelector('.el');
el.style.cssText = 'border-left: 1px; border-right: 2px; padding: 5px';
//或者
// css 
.active {
    padding: 5px;
    border-left: 1px;
    border-right: 2px;
}
// javascript
var el = document.querySelector('.el');
el.className = 'active';
```



- 隐藏元素，进行修改后，然后再显示该元素

```javascript
let ul = document.querySelector('#mylist');
ul.style.display = 'none';
appendNode(ul, data);
ul.style.display = 'block';
```

- 使用文档片段创建一个子树，然后再拷贝到文档中

```javascript
let fragment = document.createDocumentFragment();
appendNode(fragment, data);
ul.appendChild(fragment);
```

- 将原始元素拷贝到一个独立的节点中，操作这个节点，然后覆盖原始元素

```javascript
let old = document.querySelector('#mylist');
let clone = old.cloneNode(true);
appendNode(clone, data);
old.parentNode.replaceChild(clone, old);
```

- 缓存布局信息

```javascript
current = div.offsetLeft;
div.style.left = 1 + ++current + 'px';
div.style.top = 1 + ++current + 'px';
```


