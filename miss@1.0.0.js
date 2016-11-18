/**====================================================================================**
*  整合插件[仅仅一层封装] **jquery must**version@1.0.0
*  说明：   
*       1、基于jquery
*       2、对于功能插件的使用遵循cmd模式[使用$.getScript，请注意]
*       3、支持外部插件的挂载[即非插件的编写模式]
*       4、插件的调用遵循一键化调用原则
*       
*
*
* create by txp'team
***====================================================================================**/
;(function(factory){
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
	    if( typeof module != 'undefined' ){
	    	module.exports    =  factory.call(true,global,$)
	    }else{
	    	global.miss       =  factory.call( true,global,$ )
	    }
	}else{
		throw new ERROR('miss.js ERROR:报错啦~~，原因你猜')
	}
})(function(root,$){
	function miss(){}

	miss.fn             =  miss.prototype ;

	miss.cache               =  function( $data ){
		function cache( k , v ){
			var $cache       =  cache.$data || {}
			if( $.type( k ) == "object" ){
				$.extend( $cache , k ) ;
			}else if( $.type( k ) == "string" && !v ){
				return v===null?miss.delAimValue( k , $cache ):miss.getAimValue( k , $cache )
			}else if( $.type( k ) == "string" && v ){
				return miss.setAimValue( k , v , $cache )
			}else if($.type( k ) == 'array'){
				cache.$data  =  k ;
			}
			return $cache;
		}
		cache.$data          =  $data
		return cache
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
	root.missDefine       =  function( $id , fn ){
		if( $.type( $id ) == 'string' && $.type( fn ) == 'function' ){
			var arr       =  $id.split('.')
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
			}
		}
	}

	miss.loadSelfJS       =  function(arr , fn , bool){
		if( $.type( arr ) == 'string' ){
			arr         =  [arr]
		}else if( $.type( arr ) != 'array' ){
			return ;
		}
		var file          =  arr.shift() 
		,  rootPath       =  (miss.getAimValue('path.root',keral) || "")
		file              =  [rootPath,file].join('/')
		file              =  file.substr(-3).toLowerCase() == ".js"?file:(file+'.js') ;
		var funList       =  []
		$.ajax({url:file,type:'GET'}).always(function(js,status){
			if( status.toLowerCase() != 'success' ){
				js                =  "$.noop()"
				console.log("js["+file+"] load fail")
			}
			if( !bool || ( bool && arr.length == 0 ) ){
				fn && $.isFunction( fn ) && fn.call( true , js )
			}	
			if( arr.length == 0 && funList.length > 0 ){
				var callback
				while( callback = funList.shift() ){
					callback && $.isFunction( callback ) && callback.call()
				}
			}
			arr.length > 0 && miss.loadSelfJS( arr , fn , bool )
		})
		return {
			done          :  function( callback ){
				callback && $.isFunction( callback ) && funList.push( callback )
			}
		}
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
		if( $.type( arr ) == 'string' ){
			arr         =  [arr]
		}else if( $.type( arr ) != 'array' ){
			return ;
		}
		var file          =  arr.shift() 
		,  rootPath       =  (miss.getAimValue('path.root',keral) || "")
		,  async          =  !!fn
		file              =  miss.getAimValue('alies.'+file,keral) || file
		file              =  [rootPath,file].join('/')
		file              =  file.substr(-3).toLowerCase() == ".js"?file:(file+'.js') ;
		$.ajax( {url:file,async:async} ).always(function(js , status ){
			if( status.toLowerCase() != 'success' ){
				console.log('js['+file+'] load fail')
			}
			if( arr.length == 0 ){
				fn && $.isFunction( fn ) && fn.call() ;
			}else{
				loadJS( arr , fn )
			}
		})
	}
	getJSONfile('./config.json',function(data){
		keral( data || {} )
		var support             =  miss.getAimValue('support',keral) || {}
		,   list                =  []
		$.each( support, function(i,t){
			list.push(t)
		} )
		//同步加载
		miss.loadJS(list)
	})
	var $taskList         =  miss.cache({})

	//创建服务
	miss.createServer     =  function( $id , fn ){
		var cache         =  {}
		cache[$id]        =  fn ;
		$taskList(cache)
	}
	
	//运行application
	function app( $id , type ){
		if( $.type( $id ) == 'string' ){
			$id       =  [$id]
		}else if( $.type($id) != 'array' )
		    return ;
		switch( type ){
			case "widget" :
			var id           =  $id.shift()
			,   widget       =  miss.config('widget.'+id) 
			if( !widget )  return ;
			miss.loadSelfJS(widget,function(js){
	        	// miss.hook(eval( js ))
	        }).done(function(){
	        	var func     =  $widget( id )
	        	func && $.isFunction( func ) && func.call( true , tool() )
	        	if( $id.length > 0 ){
	        		app( $id , type )
	        	}
	        })
			// console.log( $id )
			/*miss.loadSelfJS($widget(),function(js){
	        	// miss.hook(eval( js ))
	        }).done(function(){
	        	_.mapObject( $widget() , function( val , key ){
	        		$.inArray( key , $id ) != -1 && $.isFunction(val) && val.call(true,tool())
	        	} )
	        })*/
			break ;
			default :
				var id            =  $id.shift() 
				,   task          =  $taskList(id)
				if( !task )  return ;
				var hook          =  miss.getAimValue( 'hook' , keral )
				,   hookList      =  _.values( hook )
		        miss.loadSelfJS(hookList,function(js){
		        	// miss.hook(eval( js ))
		        }).done(function(){
		        	var behavior  =  $hook('behavior') ;
		        	task && $.isFunction( task ) && task.call( true , behavior  )
		        	var actione   =  $hook('done')
		        	,   fn
		        	behavior.$id  =  id
		        	while( fn = actione.shift() ){
		        		fn && $.isFunction( fn ) && fn.call( true , behavior  ) 
		        	}
		        })
			break ;
		}
		
	}
    //
	miss.use              =  function( arr , fn ){
		// 
	}
	miss.import           =  function( arr ){
		return miss.loadJS( arr )
	}
    $widget               =  miss.cache({funcArr:[]})
	miss.widget           =  function( $id , fn ){
		var cache         =  {}
		cache[$id]        =  fn
		$widget(cache)
	}


	miss.run              =  app

	//开启服务
	miss.start            =  function(){
		miss.run( miss.getAimValue('init.task',keral) )
		miss.run( miss.getAimValue('init.widget',keral) , 'widget' )
	}

	miss.config               =  keral ;

	return miss ;
})