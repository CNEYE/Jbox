/**
 * Jbox
 * @author 蜗眼<iceet@uoeye.com>
 */    

(function(window,undefined){
    
var Jbox       = function(){},

    expando    = 'Jbox'+(+new Date),
    
    concat     = Array.prototype.concat,
    toString   = Object.prototype.toString;
    
    function mix(target,source){
        arguments.length <2  
            && (source=target) && (target= this)
            
        for(var p in source){
            source.hasOwnProperty(p) 
                && (target[p] = source[p]);
        }
        return target;
    }
    
    //扩充
    mix(Jbox,{
        mix: mix,
        //唯一索引
        uniq: function(){
            var unique = +new Date;
            return function(){
                return unique++;
            }
        }(),
        //配置设置,简单的函数
        config: function(){
            var config = {BASE_PATH:'.'};
            return function(key,value){
                return typeof value === 'undefined' 
                ? config[key] || null : (config[key]=value);
            }
        }(),
        //一个空函数
        noop: function(){},
        //简单定义模块 
        define: function(factory){
            if (typeof factory=== 'function'){
                factory(Jbox);
            }
        },
        //foreach函数
        forEach: function(object,callc){
            var i = -1,e,p;

            if (typeof object == 'function') {
                callc  = object;
                object = this;
            }

            if (object.length !== undefined) {
                while(e=object[++i]){
                    if ( false === callc(i,e,this) ) {
                        break;
                    }
                }
            } else {
                for(var p in object) {
                    if (object.hasOwnProperty(p) && 
                            false === callc(p,object[p],this)){
                        break;        
                    }
                }
            }
        }
    });    
    
    window.define  = Jbox.define;
    
    
    define(function(J){
        /*
         * 语言类型检测辅助部分
         */ 
        J.forEach('Undefined,Array,Boolean,Object,String,Function,RegExp'
                .split(',') , function(_,method){
            J['is'+method] = function(object){
                return toString.call(object) === '[object '+method+']'
            }
        });
        J.mix({
            isPlainObject: function(object){
                if (!object || typeof object !=='object' || 
                        object.nodeType || object.setInterval){
                    return false;
                }
                if (objcet.constructor && 
                    ! hasOwnProperty.call(object,'canstructor') &&
                    ! hasOwnProperty.call(object.canstructor.prototype,'isPrototypeOf')){
                        return false;    
                }
                for(var key in object){}

                return key === undefined || hasOwnProperty.call(object,key);
            },
            isEmptyObject: function(object){
                if (J.isPlainObject(object)){
                    for(var key in object){}
                    return key === undefined;
                }
                return false;
            }
        });
    });
    
    
    define(function(J){
        /*
         * DOM 事件处理模块
         */
        J.forEach({
            bind: ['add','attach'],
            unbind: ['remove','detach']
        },function(method,prop){
            J[method+'Event'] =  document.addEventListener ? 
                function(elem,type,fn){
                    elem[prop[0]+'EventListener'](type,fn,false);
                }: function(elem,type,fn){
                    elem[prop[1]+'Event']('on'+type,fn);
            }
        });
    });
    
    
    define(function(J){
        /*
         * 对象处理模块OOP（简单oop）
         * 这里只适合本系统的 oop
         */
         J.mix({
            //创建类
            Class: function(prop,mode,init,proto){
                
                function Class(){
                    //类名
                    typeof mode == 'string' && (this.__CLASSNAME__ = mode);
                    
                    typeof this.initialize === 'function' 
                            && this.initialize.call(this,arguments);
                }
                proto = Class.fn = Class.prototype;
                
                for( var name in prop ) {
                    if ( prop.hasOwnProperty(name) ) {
                        proto[name] = prop[name];
                    }
                }
                
                //cache the initalize
                typeof proto.initialize == 'function' 
                        || (proto.initialize = J.noop);
                    
                typeof mode == 'string' && (J[mode]=Class);
                
                //增加一个创建类的时候初始化的一个函数
                return typeof init === 'function' 
                     && init(Class),Class.constructor = Class;
            },
            //继承机制
            extend: function(subber,supper){
                
                if (typeof supper ==='string'){
                    if (typeof (supper = J[supper]) != 'function'){
                        return subber;
                    }
                }
                 
                
                if (typeof subber === 'function') {
                    var supperproto = typeof supper === 'function' 
                            ? supper.prototype : supper,
                        subberproto = subber.prototype;
                    //储存超类
                    subber.__supper = supper;

                    for(var name in supperproto ){
                        
                        subberproto[name] = typeof supperproto[name] ==='function' && 
                        typeof subberproto[name] === 'function' ? 
                            (function(name,fn){
                                return function(){
                                    return fn.apply(this.arguments) , supperproto[name].apply(this,arguments);
                                }
                            })(name,subberproto[name]):
                        supperproto[name];
                    }
                }
                return subber;
            }
         });
    });
    
    
    /**
     * 核心简单属性模块
     * NOTICE:只支持两级缓存
     * @model Jbox.Attribute
     */
    define(function(J){
        var ID = '__attr:'+J.uniq();
        J.Class({
            initialize: function(){
                this[ ID ] = {};
            },
            getAttr: function(name,sub){
                if (typeof sub === 'undefined') {
                    return this[ ID ][ name ] || null;
                }
                return (name = this[ ID ][ name ])
                            ? name[ sub ] || null : null;
            },
            setAttr: function(name,sub,value){
                if (typeof value === 'undefined') {
                    return this[ID][name] = sub;
                }
                
                this.hasAttr(name) || (this[ID][name] = {});
                return this[ID][name][sub] = value;
            },
            removeAttr: function(name,sub){
                if (typeof sub === 'undefined') {
                    if (this.hasAttr(name)){
                        delete this[ID][name];
                    }
                } else {
                    if ( this.hasAttr(name,sub) ) {
                        
                        delete this[ID][name][sub];
                    }
                }
            },
            hasAttr: function(name,sub){
                if ( typeof sub == 'undefined') {
                    return !!this[ID][name]
                }
                return !!this[ID][name] 
                    && !!this[ID][name][sub];
            }
        },'Attribute');
    });
    
    
    /**
     * 核心模块自定义事件模块
     * api来源于 NodeJS 的 EventEmitter 类
     * @model Jbox.Emitter
     */ 
    define(function(J){
        var ID = '__emitter:'+J.uniq();
    
        J.extend(J.Class({
            addListener: function(event,handler,data,once){
                
                this.hasAttr('emitter',event)
                        || this.setAttr('emitter',event,[]);
                
                if (typeof handler == 'function') {
                        
                    this.getAttr('emitter',event).push({
                        handler: handler,
                        guid: handler[ID] || (handler[ID]=J.uniq()),
                        data: data||{},
                        once: once
                    });
                }
            },
            on: function(event,handler,data){
                this.addListener(event,handler,data);
            },
            once: function(event,handler,data){
                this.addListener(event,handler,data,true);
            },
            removeListener: function(event,handler){
                
                if (typeof event == 'undefined'){
                    
                    if (typeof handler !=='function') {
                        this.removeAttr('emitter',event);
                    } else {
                        var emitter = this.getAttr('emitter',event),
                            uniq = handler[ID];
                        for(var i=0,l=emitter.length;i<l;i++){
                            if (uniq === emitter[i][ID]){
                                emitter.splice(i,1);
                            }
                        }
                    }
                } else {
                    var emitter = this.getAttr('emitter');
                    for(var p in emitter){
                        this.removeListener(emitter[p]);
                    }
                }    
            },
            emit: function(event,data){
                var emitter,emit,
                    index = -1;
                
                if ( emitter = this.getAttr('emitter',event) ) {
                
                    while(emit = emitter[++index]){
                    
                        if (data || emit.data){
                            data = Jbox.mix(data||{},emit.data)
                        }
                        
                        emit.once && emitter.splice(index,1);
                        
                        if (false === emit.handler(data)){
                            idx =-1;
                        }
                        
                    }
                }
            }
        },'Emitter'),'Attribute');
    });
    
    /*
     * 简单的异步编程的Promise模式
     * Defered对象
     */ 
    define(function(J){
        var ID = '__defered:'+J.uniq();
        
        J.extend(J.Class({
            //添加回调函数
            _callbacks: function(){
                
                function run (arr,type,data,self) {
                    var aj = self.getAttr('jobs'),jobs,
                        index=0,job,_data,fire;
                        
                    if ( arr  && arr.length) {
                        for(var i=0,l=arr.length;i<l;i++){
                            if ((fire = true) && (jobs = arr[i] ? arr[i].jobs : 0)) {
                                while(job = jobs[index++]){
                                    if(!_data && data) {
                                        _data=data[job];
                                    }
                                    if (aj[job] !=  self.now){
                                        fire = false;
                                        break;
                                    }
                                }
                                
                                //触发事件
                                if ( true === fire ){
                                    var callback = arr[i].callback;
                                                    
                                        //执行过的就给删掉
                                        arr.splice(i,1);
                                        
                                    ( !data || !J.isArray(data) ) ? callback(data)
                                                : callback.apply(null,data);
                                    
                                    if ( type !== 'always'){
                                        run(self.getAttr('always'),'always',data,self);
                                    }
                                }
                            }
                        }
                        //重新设值
                        //self.setAttr(type,arr);
                    }
                };
                
                return function(type ,callback){
                    
                    var jobarr=this.getAttr(type) ||
                           this.setAttr(type,[]) , data;
                    
                    //注册方法
                    if ( arguments.length == 2 ) {
                        if ( typeof callback == 'function') {
                            jobarr.push({
                                callback: callback,
                                //该方法依赖的job列表
                                jobs: this.jobs || true
                            });
                        }
                    } else {
                        run(jobarr,type,data=this.getAttr('data'),this);
                    }
                    return this;
                }
            }(),
            //获取/设置jobid
            _jobs: function(job){
                
                if (typeof job !== 'function' 
                        && typeof job !== 'object') {
                    return job;
                }
                
                if ( job instanceof J.Defered ) {
                    //检测是否传入的Defered对象
                    this.hasAttr('hooks') || this.setAttr('hooks',[]);
                    this.getAttr('hooks').push(this);    
                }
                
                return job[ID] || (job[ID] = J.uniq());
            },
            then: function(done,fail,always){
                
                return this.done(done)
                    .fail(fail).always(always);
            },
            /*
             * 注册任务
             * 注意：1、在调用该函数的时候即清空当前任务列表
             *      2、要注册全局done，fail，always函数请在调用该函数之前调用
             */ 
            when: function(){
                
                var job , jobname , index =0,
                    jobs = this.getAttr('jobs') || this.setAttr('jobs',{});
                    
                //初始化当前job列表
                this.jobs = [];
                
                while (job = arguments[index++]){
                    if (jobname = this._jobs(job) ){
                        //标记该任务未初始化
                        jobs[jobname] = 'init';
                        this.jobs.push(jobname);
                    }
                }
                
                return this;
            }
        },'Defered',function(Class){
            /*
             * 实现done，fail，always方法
             */ 
            J.forEach('done,fail,always'.split(','),
                    function(_,method){
                        
                Class.fn[method] = function(fn){
                    
                    return this._callbacks(method,fn)
                };
            });
            /*
             * 实现 resolve，reject方法
             */ 
            J.forEach ( {
                Resolve : 'done',
                Reject : 'fail'
            } , function( method , prop ) {
                
                Class.fn[ method.toLowerCase() ] = function(){
                     
                    var ar  = concat.apply([],arguments),
                        self = this,data,index=0,job,jobid,cache; 
                        var jobs = this.getAttr('jobs');
                    //cache the now state
                    this.now = prop;
                    
                    if ( ar.length > 0 && (data = ar[ar.length-1])) {
                        //maybe the last arguments is data
                        if (J.isArray(data) || J.isPlainObject(data)) {
                            //删除最后一个元素，最后一个是数据
                            //获得数据缓存
                            cache = ar.pop(),this.getAttr('data') ||
                                 this.setAttr('data',{});
                        }
                    }
                    
                    if (typeof jobs == 'object' || ar.length) {
                        
                        J.forEach( ar.length ? ar : jobs,
                                function ( _,item ) {
                                    
                            if (jobid = self._jobs(item)) {
                                cache && (cache[jobid] = data);
                                
                                jobs[jobid] = prop;
                            }
                        });
                    }
                    
                    return this._callbacks(prop);
                };
                
               /*
                * 实现 isResolve，isReject 
                */
               Class.fn['is'+method] = function(job){
                    
                    if ( job = this._jobs(job) ) { 
                        var jobs = this.getAttr('jobs');
                        
                        return jobs ? jobs[job] == prop  : false;
                    }
               };
            });
        }),'Attribute');
    });
    /**
     * 这里是包加载器
     * 提供两个主要的接口 define,require
     * 注意，这里的包加载没有处理包间相互依赖的问题
     */
    define(function(J){
        //包管理单类
        var Bundle = new (J.Class({
            initialize: function(){
                //管理事件
                this.defered = new J.Defered;
                //标记已经加载了的组件
                this.loaded = {};
                
            },
            _path: function(mode){
                return J.config('BASE_PATH')+'/' +
                            mode.toLowerCase().replace('Jbox.','')
                                .replace(/\./g,'/')+'.js';
            },
            _loadJS: function(mode){
                var script = document.createElement('script');
            
                script.onload = script.onreadystatechange = function(){
                    if (/undefined|loaded|complete/
                            .test(script.readyState)) {
                            
                        script.onload=script.onreadystatechange
                                =script.onerror = null;
                        
                    }
                };
                
                script.onerror = function(){
                    script.onload=script.onreadystatechange
                                =script.onerror = null;
                    throw new Error("Don't load the module "+mode);
                };
                
                script.src = this._path(mode);
                document.getElementsByTagName("head")[0].appendChild(script);
            },
            _load: function(deps,factory){
                
                if ( !(deps = this._repeat(deps)) 
                        || !deps.length){
                    
                    return factory();
                }
                this.defered.when.apply(
                    this.defered,deps).done(factory);
                
                var item ,index=0;
                while(item = deps[index++]) {
                    this._loadJS(item);
                }
            },
            //去掉以及加载了的
            _repeat: function(deps){
                
                if ( ! deps ){
                    return deps;
                }
                
                var item,index=-1,
                    dep = deps.concat();
                
                while( item = dep[++index] ){
                    if ( item in this.loaded ) {
                        dep.splice(index,1);
                    }
                }
                
                return dep;
            },
            _depends: function(deps){
                
                if ( deps && typeof deps== 'string') {
                    
                    return deps.split(',');
                }
                return deps;
            },
            _callbacks: function(deps,callback){
                
                var item ,index=-1;
                if ( deps && deps.length){
                    while(item = deps[++index]){
                        deps[index] = this.loaded[item];
                    }
                    deps.unshift(Jbox);
                    return callback.apply(this,deps);
                }
                return callback();
            },
            /*
             * 
             */
            define: function ( id,deps,factory ) {
                
                if (J.isFunction(id)) {
                    return J.define(id);
                }
                //没有依赖的时候
                J.isFunction(deps) &&
                    (factory = [deps,deps=null][0]);
                
                //如果有依赖列表的时候，先加载依赖列表的
                this._load(deps = this._depends(deps)
                        ,function(){
                    Bundle.loaded[id] = Bundle._callbacks(deps,factory);
                    //标记该id状态
                    Bundle.defered.resolve(id);
                });
            },
            
            require: function(deps,factory){
                
                this._load(deps = this._depends(deps)
                        ,function(){
                    Bundle._callbacks(deps,factory);
                });
            }
        }));
        
        /*
         * 暴露两个方法接口给全局控件
         */
        J.forEach('define,require'.split(','),
            function(_,method){
            window[method] = function(){
                Bundle[method].apply(Bundle,arguments)
            }
        });
    });
    
    window.Jbox = Jbox;
})(this);
