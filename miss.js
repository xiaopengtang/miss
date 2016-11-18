/**====================================================================================**
*  整合插件[仅仅一层封装] **jquery must**version@1.0.2
*  说明：   
*       1、基于jquery
*       2、对于功能插件的使用遵循cmd模式[使用$.getScript，请注意]
*       3、支持外部插件的挂载[即非插件的编写模式]
*       4、插件的调用遵循一键化调用原则
*       
*  BUG : 
*       1、关于selector方法的重复绑定事件问题
*          场景：单页面模式下，页面的重新加载
*          原因：根选择器不随页面刷新变化【即根选择器始终存在】，导致页面通过on不断绑定新事件
*          建议做法：将根选择器选重新加载的内容页面里的元素
*       2、node的完全兼容
*       3、script标签或者ajax引用，导致miss重复申明【已修复】
*       4、缺乏前置、后置、auth、widget验证等操作的promise监控，异步条件下出错
*       5、_loadJS同步加载done方法的失效，暂时支持异步
* create by txp'team
***====================================================================================**/
;(function(factory){
	if( typeof miss != 'undefined' )  return ; //window避免多次加载
	if( typeof self != 'undefined' && self.self == self ){
		self.isWin          =  true
		var $               =  self.$
		if( typeof define != 'undefined' ){
			define.cmd?define(function(require,exports,module){
				var $              =  require('jquery') ;
				module.exports     =  factory.call(true, self , $ )
			}):define(['jquery'],function( $ ){
				return factory.call(true,self,$)
			})
		}else if( typeof $ != 'undefined' ){
			self.miss            =  factory.call( true , self , $ )
		}else{
			throw new Error('miss.js ERROR:need require jquery first')
		}
	}else if( typeof global != 'undefined' ){
		var $                 =  require('jquery')
		if( typeof $ == 'undefined' ) throw new Error('miss.js ERROR:need require jquery first')
		global.isWin          =  false
	    if( typeof exports   != 'undefined' ){
	    	exports.miss      =  factory.call(true,global,$)
	    }else{
	    	global.miss       =  factory.call( true,global,$ )
	    }
	}else{
		throw new ERROR('miss.js ERROR:报错啦~~，原因你猜')
	}
})(function(root,$){
	function miss(){
		return miss.fn.init.apply( miss.fn , arguments )
	}
	miss.fn             =  miss.prototype ;
    //安全监测
    if( "console" in root )
    	miss.console         =  console
    else{
    	miss.console   =  root.console  =  {log:$.noop,warn:$.noop,info:$.noop}
    }
    miss.fn.init             =  function(){
    	return miss.createServer.apply(miss,arguments)
    }
    miss.VERSION             =  "1.0.2"
	miss.cache               =  function( $data ){
		$data                =  $.type( $data ) == 'object' && $data || {}
		return function( k , v ){
			var $cache       =  $data || {}
			if( $.type( k ) == "object" ){
				$.extend( $cache , k ) ;
			}else if( $.type( k ) == "string" && !v ){
				return v===null?miss.delAimValue( k , $cache ):miss.getAimValue( k , $cache )
			}else if( $.type( k ) == "string" && v ){
				return miss.setAimValue( k , v , $cache )
			}else if($.type( k ) == 'array'){
				$data        =  k ;
			}
			return $cache;
		}
	}
	//获取层级内的指定元素
	miss.getAimValue         =  function( key , aim ){
		if( $.type( key ) != 'string' || $.inArray( $.type( aim ) , ['array' , 'object','function'] ) == -1 )  return ;
		var arr              =  key.split( '.' )
		,   flag             =  aim
		if( arr.length < 1 )  return ;
		$.each( arr , function( i , t ){
			flag             =  flag[t]
			if( !flag ) return false ;
		} )
		return flag ;
	}
	//获取层级内的指定元素
	miss.delAimValue         =  function( key , aim ){
		if( $.type( key ) != 'string' || $.inArray( $.type( aim ) , ['array' , 'object','function'] ) == -1 )  return ;
		var arr              =  key.split( '.' )
		,   flag             =  aim
		if( arr.length < 1 )  return ;
		$.each( arr , function( i , t ){
			if( i == arr.length -1 && flag[t]){
				delete flag[t]
			}else{
				flag             =  flag[t]
			    if( !flag ) return false ;
			}
		} )
		return flag ;
	}
	//设置某个值
	miss.setAimValue         =  function( key , value , aim  ){
		if( $.type( key ) != 'string' || $.inArray( $.type( aim ) , ['array' , 'object','function'] ) == -1 )  return ;
		var arr              =  key.split( '.' )
		,   flag             =  aim
		,   type             =  $.type( aim )
		if( arr.length < 1 )  return ;
		$.each( arr , function( i , t ){
			if( !flag[t] ) flag[t]    =  {}
			if( arr.length == i + 1 ){
				flag[t]         =  value ;
			}
			flag             =  flag[t]
		} )
		return flag ;
	}
	//获取json配置
	function getJSONfile(file , fn){
		var ret          =  null
		try{
			file         =  (keral.path && keral.path.root || "") + file
			ret          =  $.ajax({url: file,async:false}).responseText ;
			ret          =  eval( "(" + ret + ")" )
		}catch(e){
			console.log( e )
		}
		if( fn && $.isFunction(fn) ){
			fn.call(true,ret)
		}else
		    return ret ;
	}
    //配置
	function keral( config ){
		if( $.type( config ) == 'object' ){
			keral           =  $.extend( true , keral , config ) ;
		}else if( $.type( config ) == 'string' ){
			return miss.getAimValue( config , keral )
		}
	}
	miss.$error         =  function(m){
		throw new Error('[miss.js ERROR]:'+m)
	}
    /**
    * @param  $id  -- 标志【type.name】
    * @param  fn   -- 函数域
    *
    */
    var $parseDefine      =  miss.cache({})
	root.missDefine       =  function( $id , fn ){
		if( $.type( $id ) == 'string' && $.type( fn ) == 'function' ){
			var arr       =  $id.split('@')
			,   id        =  arr.length == 2?arr[0]:null
			,   type      =  arr.length == 2?arr[1]:arr.length == 1?arr[0]:null
			// if( id )  return ;
			switch( type ){
				case 'hook':
				    miss.hook( fn )
				break ;
				case 'widget':
				    miss.widget( id , fn )
				break ;
				case "parse" :
				    var modules       =  {}
				    $.isFunction( fn ) && fn.call( true , modules , tool )
				    // console.log( ['this is parse',modules] )
				    $.each(modules,function(k,fn){
				    	var fnArr     =  $parseExport(k) || []
				    	fnArr.push(fn)
				    	$parseExport(k,fnArr)
				    })
				    // $parseExport( modules )
				break ;
			}
		}
	}
	/*===================向miss作用域里追加========================*/
	var $parseExport      =  miss.cache({})
	,   $parseTask        =  miss.cache({})
	,   $parseResult      =  miss.cache({})
	root.missExport       =  function($id,param){
		var arr           =  $id.split("@")
		,   id            =  arr.length > 1?arr[1]:null
		,   type          =  arr[0]
		$parseTask( ['import',type,id].join(".") , param )
	}

	function $getParseExportResult(key,type){
		var parseFnArr    =  $parseExport( type ) || []
		,   result        =  $parseResult( key )
		,   param         =  $parseTask( key )
		,   parseFn
		if( result ){
			$parseTask( key , null )
			return result 
		}
		if( parseFnArr.length < 1 || !param )  return ;        
		while( parseFn = parseFnArr.shift() ){
			$.isFunction( parseFn ) && parseFn.call(true,param)
		}
		$parseResult( key , param )
		return param ;
	}
	//使用外部插件
	miss.vendor           =  function( arr , fn ){
		return _loadJS( arr , fn , 'vendor' )
	}
	var _loadJS           =  function(fn){
		return fn.call(true)
	}(function(){
		var $cache        =  miss.cache({})
		function checkFileExist(url){
			var http      =  ""
			if( url.substr(0,4).toLowerCase() === "http" && url.length >= 7 ){
				url       =  url.substr(7)
				http      =  "http://"
			}
			var arr       =  url.split("/")
			,   info  , uarr = []
			$.each( arr , function(i,v){
				v && uarr.push(v)
			} )
			url           =  uarr.join("/")  //_.filter(arr,function(v){ return !!v }).join("/")
			info          =  $cache( url )
			if( !info || info && info.status  ){
				return http + url
			}else{
				return null ;
			}
		}
		function loadJS( arr , fn , relativePath , async , path ){
			if( $.type( arr ) == 'string' ){
				arr         =  [arr]
			}else if( $.type( arr ) != 'array' ){
				return ;
			}
			var file          =  arr.shift() 
			,  rootPath       =  path !== void 0?path:(miss.getAimValue('path.root',keral) || "")
			relativePath && (file =  miss.config( relativePath + "."+file ) || file)
			file              =  (rootPath?[rootPath,file]:[file]).join('/')
			file              =  file.substr(-3).toLowerCase() == ".js"?file:(file+'.js') ;
			file              =  checkFileExist( file )
			var funList       =  []
			function loadNext(){
				fn && $.isFunction( fn ) && fn.call( true  )
				if( arr.length == 0 && funList.length > 0 ){
					var callback
					while( callback = funList.shift() ){
						callback && $.isFunction( callback ) && callback.call()
					}
				}
				arr.length > 0 && loadJS( arr , fn , relativePath , async , path ).done(function(){
					var callback
					while( callback = funList.shift() ){
						callback && $.isFunction( callback ) && callback.call()
					}
				})
			}
			if( !file ){
				loadNext()
				return {
					done          :  function( callback ){
						callback && $.isFunction( callback ) && funList.push( callback )
					}
				}
			}
			file              =  !keral.dev?file:file+"?v="+parseInt(Math.random() * 1000000000)
			$.ajax({url:file,type:'GET',async:async === void 0?false:!!async}).always(function(js,status){
				var bool      =  status.toLowerCase() != 'success' 
				$cache( file , {
					status    :  !bool
					,jsCode   :  js
				} )
				if( bool ){
					js                =  "$.noop()"
					console.log("js["+file+"] load fail")
				}
				loadNext()
			})
			return {
				done          :  function( callback ){
					callback && $.isFunction( callback ) && funList.push( callback )
				}
			}
		}
		return loadJS
	})
	//获取支持的插件
    miss.support          =  function(cache){
        return function(){
            return cache.apply(miss,arguments)
        }
    }(miss.cache({}))
    
	miss.loadSelfJS       =  function(arr , fn ){
		return _loadJS( arr , fn , null , true )
	}
	var $hook             =  miss.cache({behavior:{},done:[]})
	function tool(){
		return {
    		support     :  function(){
    			return    {
    				$     :  $
    				, _   :  _
    			}
    		}
    		, miss        :  miss
    	}
	}
	miss.hook             =  function(  fn ){
		var $scope        =  {} , cache = {}
		fn && $.isFunction( fn ) && fn.call( true , $scope , tool() )
		var behavior      =  $hook('behavior') || {}
		,   newHavior     =  $scope.behavior && $.isFunction($scope.behavior) && $scope.behavior.call() || $.type($scope.behavior) == 'object' && $scope.behavior || {}
		,   done          =  $scope.done
		,   doneData      =  $hook('done') || []
		behavior          =  $.extend( true , behavior , newHavior )
		doneData.push( done )
		$hook({done:doneData,behavior:behavior})
	}
	miss.loadJS           =  function(arr , fn){
		return _loadJS( arr , fn , "alies" )
	}
	var $taskList         =  miss.cache({})
	,   $serverList       =  miss.cache({})
	//创建服务
	miss.createServer     =  function( $id , fn ){
		if( !fn && $id ){
			return $serverList($id)
		}else if( arguments.length === 0 ){
			return $serverList()
		}
		var cache         =  {}
		cache[$id]        =  {
			run           :  fn
		} ;
		$taskList(cache)
		return {
			//请将一些常用资源的申明放在该函数里，该函数的作用域内的功能不能等价于主函数体内的
			before        :  function( fn ){
				$.extend( cache[$id],{before:fn} )
				$taskList(cache)
				return this
			}
			,after        :  function( fn ){
				$.extend( cache[$id],{after:fn} )
				$taskList(cache)
				return this
			}
			,auth         :  function(fn){
				$.extend( cache[$id],{auth:fn} )
				$taskList(cache)
				return this
			}
			,middleware   :  function(fn){
				$.extend( cache[$id],{middleware:fn} )
				$taskList(cache)
				return this
			}
			,common       :  function(fn){
				$.extend( cache[$id],{common:fn} )
				$taskList(cache)
				return this
			}
		}
	}
	//运行application
	function app( $id , type ){
		if( $.type( $id ) == 'string' ){
			$id       =  [$id]
		}else if( $.type($id) != 'array' )
		    return $.isFunction(arguments[2]) && arguments[2].call(true);
		switch( type ){
			case "widget" :
			var id           =  $id.shift()
			,   widget       =  miss.config('widget.'+id) 
			if( !widget )  return ;
			miss.loadSelfJS(widget).done(function(){
	        	var func     =  $widget( id )
	        	func && $.isFunction( func ) && func.call( true , tool() )
	        	if( $id.length > 0 ){
	        		app( $id , type )
	        	}
	        })
			break ;
			case "parse" :
			    var parse        =  miss.config('parseCore') 
			    ,   useList      =  _.values( parse )
			    miss.loadSelfJS(useList).done( $.isFunction(arguments[2]) && arguments[2] )
			break ;
			default :
				var id            =  $id.shift() 
				,   task          =  $taskList(id) || {};

				if( !task )  return ;
				var hook          =  miss.getAimValue( 'hook' , keral )
				,   hookList      =  _.values( hook );
		        miss.loadSelfJS(hookList).done(function(){
		        	var behavior  =  $hook('behavior') || {} 
		        	,   user      =  {} 
		        	$.isFunction( task.common ) && task.common.call( true , user )
		        	function server(id){
		        		this.$id   =  id
		        	}
		        	function userDefine(id){
		        		this.$id   =  id
		        	}
		        	$.extend( userDefine.prototype, user )
		        	$.extend( server.prototype , behavior )
		        	var $server    =  new server(id)
		        	,   $user      =  new userDefine(id)
		        	if( $.isFunction( task.auth ) && !task.auth.call(true,$server , $user ) ){
		        	    return ;
		        	}
		        	function next(){
                    	task.before && $.isFunction( task.before ) && task.before.call( true , $server ,$user  )
			        	task.run && $.isFunction( task.run ) && task.run.call( true , $server ,$user  )
			        	task.after && $.isFunction( task.after ) && task.after.call( true , $server ,$user   )
                    }
		        	$.isFunction( task.middleware ) && task.middleware(next , $server , $user ) || next.call( true )
	                var actione   =  $hook('done')
	                ,   $exports  =  $server.exports
		        	,   fn
		        	$exports  &&  $serverList( id , $exports )
		        	$exports && delete $server.exports
		        	while( fn = actione.shift() ){
		        		fn && $.isFunction( fn ) && fn.call( true , $server  ) 
		        	}
		        })
			break ;
		}
	}
	miss.parseDefine      =  function(){}
	miss.parseImport      =  function(id,fn){
		var fnArr         =  $parseFnArr( id ) || []
		$.isFunction( fn ) && function(){
			fnArr.push( fn )
		    $parseFnArr( id , fnArr )
		}()
	}
    /****
    * 导入外部包   可以为通过missExport 获取到的功能，也可以为单纯的js文件
    * @param  $id  -- 标志 导入的类型以及etc.
    * demo ： 
    * miss.import("tpl").from("http://......demo.js")  ==[waite] miss.loadJS("tpl")
    * miss.import("react-login").from({type:"react"})  -- 获取missExport定义的值
    **/
	miss.import           =  function( $id ){
	    var alies         =  miss.config("alies") || {}
		return {
			from          :  function( url ){
				var ret
				switch( $.type(url) ){
					case "string" : 
						alies[$id]          =  url
						miss.config( "alies" , alies  )
						ret          =  _loadJS(url,null,"alies",false,"")
					break ;
					case "object" :
					    if( $.isEmptyObject(url) )  return ;
					    var type     =  url.type
					    ,   searchKey=  url.searchKey
					    ret          =  $getParseExportResult(_.filter(['import',type,$id,searchKey],function(v){return !!v}).join('.'),type)
					break ;
				}
				return ret  
			}
		}
	}
	miss.run              =  app
	//开启服务
	miss.start            =  function(){
		var task          =  arguments[0]
		,   runTask  
		if( $.type( task ) == 'string' || $.type(task) == 'array' ){
			runTask       =  task
		}else if( $.type( task ) != 'object' )
		    return ;
		runTask           =  runTask?runTask:task.task
		getJSONfile('/config.json',function(data){
			keral( data || {} )
			var support             =  miss.getAimValue('support',keral) || {}
			,   list                =  []
			$.each( support, function(i,t){
				list.push(t)
			} )
			//同步加载
			miss.loadJS(list)
		})
		miss.run([],"parse",function(){
			miss.run( runTask || miss.config('init.task') )
		})
		
	}
	miss.config               =  keral ;
	return miss ;
})