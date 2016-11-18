/**===================================================================================***
*** 默认的hook，集成中心
*** 
***===================================================================================**/
missDefine('hook',function( $exports , $tool ){
	//获取核心支持插件
	var $               =  $tool.support().$
	,   _               =  $tool.support()._
	,   miss            =  $tool.miss
	,   behavior        =  {}
	,   ISVIR           =  miss.config('runModel') == "virtual" //是否在模拟状态下
    new function(){
    	if( $.validator != void 0 ){
    		$.validator.addMethod('isTrain',function(value,e,param){
    			if( !value )  return true
    			var train          =  /^([a-zA-Z]{0,})([0-9])+?/g ///^([a-zA-Z]*)([0-9]+)$/g
    		    return train.test( value )
    		},"请正确输入车次")
    		$.validator.addMethod('isTel',function( value , e , param ){
	            if( !value )  return  true
	            var isPhone        =  /^([0-9]{3,4}-)?[0-9]{7,8}$/g;
	            var isMob          =  /^((\+?86)|(\(\+86\)))?(13[012356789][0-9]{8}|15[012356789][0-9]{8}|18[02356789][0-9]{8}|147[0-9]{8}|1349[0-9]{7})$/g;
	            if( isMob.test(value) || isPhone.test(value) )
	                return true ;
	            else
	                return false ;
	        },'请正确填写电话号码')
            $.validator.addMethod( "isName" , function( value , e , param ){
                if( !value )  return true
                var isName         =  /((^[\u4E00-\uFA29]{1,20})|(^[a-zA-Z]+(\s{0,1}[a-zA-Z]+){0,}){1,}){1}[0-9]{0,5}$/g
                return isName.test(value)
            },"请正确填写名字" )
	        // $.validator.addMethod( "compare" , function( value , e , param ){
	        // 	// 
	        // } )
    	}
    }
    behavior.ucfirst        =  function(str){
    	return str.replace(/^\S/,function(s){return s.toUpperCase()})
    }
    
    //获取单月时间区间
    behavior.getOneMonth    =  function( year , month ){
    	var date        =  new Date( year , month , 0 ) 
    	,   mstr        =  month < 10 ? "0"+String(month):month
    	return [[year,mstr,"01"],[year,mstr,date.getDate()]]
    }
    //实现form对象
	behavior.form       =  (function(){

		//事件代理
		function agentEvent( el ){
			// 
		}
		function form( cf ){
			"use strict" ;
            $.extend( this , cf )
            this.$el    =  $( this.el )

            var status  =  this.$el.length < 1
            this.getStatus   =  function(){
            	return status
            }
            this.initVirtual()
            this.validatorConfig && 
            ($.type( this.validatorConfig ) == "object" && this.validator(this.validatorConfig))
            || ( $.isFunction(this.validatorConfig) && this.validator(this.validatorConfig()) ) || null
            this.init && $.isFunction( this.init ) && this.init()
		}
		$.extend( form.prototype , {
			//获取表单的值
			val          :  function( fn ){
				var $this         =  this
				,   $sArray       =  $this.$el.serializeArray()
				,   rule          =  $this.valRule || {} , data = {}
				$.each($sArray,function(i,t){
					var arr       =  	rule[t.name]
					if( $.type( arr ) == 'string' ){
						data[t.name]    =  $this.get('[name="'+t.name+'"]').attr(arr)
					}else if( $.type( arr ) == 'function' ){
						data[t.name]    =  arr.call( true , $this.get('[name="'+t.name+'"]') )
					}else if( !arr ){
						data[t.name]    =  t.value
					}
					$this.observer && $.isFunction( $this.observer ) && $this.observer.call(true,"val",data , t )
				})
				$this.listenData && $.each( $this.listenData , function( k , v ){
					data[V(k)]         =  data[V(k)] && v || null
				} )
				if( $.isFunction( fn ) ){
					fn.call( true , data )
				}else{
					return data
				}
			}
			, getVirEl   :  function( name ){
				if( ISVIR ){
					return this.get('[name="'+name+'"]')
				}else{
					var key      =  behavior.resource('virtual@'+name) || null
					if( !key )  return ;
					return this.get('[name="'+key+'"]')
				}
			}
			, initVirtual:  function(){
				var data         =  $.isFunction( this.virtual ) && this.virtual() || []
				// ,   karr         =  miss.config('runModel') == "virtual"?_.keys( data ):_.values(data)
				,   sArray       =  this.$el.serializeArray() , _this = this
				if( data.length < 1  )
					return ;
				$.each( sArray , function( i , t ){
					var name     =  data[i]
					,   key      =  !ISVIR?behavior.resource('virtual@'+ name):name
					if( !name )  return ;
					_this.get('[name="'+t.name+'"]').attr({name:key})
				} )
			}
			, listen     :  function( k , v ){
				if( !this.listenData ) 
					this.listenData       =  {}
				if( $.type( k ) == "string" )
				    this.listenData[k]        =  v
				else if( $.type( k  ) == "object" )
					$.extend( this.listenData , k )
			}
			, get        :  function( el ){
				return this.$el.find( el )
			}
			, validator  :  function( cf ){
				if( typeof $.validator == "undefined" ){
					return {};
				}
				var $self        =  this
				var ret          =  {
					done :  function( fn ){
					    var bool  =  $self.$el.valid()
					    fn && $.isFunction( fn ) && fn.call( $self , $self.val() , bool )							
					}
				}
				if( $.type( cf ) != "object" && !$.isFunction( cf ) ){
					return ret
				}else if( cf && $.isFunction( cf ) ){
					ret.done( cf )
					return ret
				}
				function virValidator( vir ){
					if( ISVIR || !behavior.resource("virtual") )  return vir ;
					vir.rules && $.each( vir.rules , function( i , t ){
						vir.rules[V(i)]       =  t
						delete vir.rules[i] 
					} )
					vir.messages && $.each( vir.messages , function( i , t ){
						vir.messages[V(i) ]       =  t
						delete vir.messages[i] 
					} )
					return vir 
				}
				var df           =  {
				}
				, useData        =  virValidator($.extend( true , df , cf ))
                $self.fail && (df.showErrors    =  function(){
					$.isFunction( $self.fail ) && $self.fail.apply( $self , arguments  )
                })
				$self.$el.validate( useData ) ;
				// $self.fail &&  $self.$el.valid()
				return ret
			}
			, defaults   :  function( data ){
				var $this         =  this
				,   $sArray       =  $this.$el.serializeArray()
				,   rule          =  $this.valRule || {}
				
				$.each($sArray,function(i,t){
					var arr       =  rule[t.name]
					,   value     =  data[t.name]  
					if( $.type( arr ) == 'string' ){
						$this.get('[name="'+t.name+'"]').attr(arr,value)
					}else if( $.type( arr ) == 'function' ){
						data[t.name]    =  arr.call( true , $this.get('[name="'+t.name+'"]') , value )
					}else if( !arr ){
						$this.get('[name="'+t.name+'"]').val(value)
					}
					$this.observer && $.isFunction( $this.observer ) && $this.observer.call(true,"defaults",data)
				})
				
			}
		} )
		return function( cf ){
			return new form( cf )
		} ;
	}());
    //用jquery选择摸一个区域，进行事件的代理
    behavior.selector        =  (function(){
    	function selector( cf ){
    		"use strict" ;
    		$.extend( this , cf )
    		this.$el         =  this.$el || this.el && $(this.el) || null
    		this.el          =  this.el || this.$el && this.el.selector || ""
    		if( !this.$el || this.$el && this.$el.length < 1 ){
    			miss.console.warn("未检测到选择器："+this.el)
    		}
    		var $this        =  this
    		,   events       =  this.events && $.isFunction( this.events ) && this.events.call() || {}
    		
            if( !$.isEmptyObject( events ) ){
    			$.each( events , function( it , t ){
    				var iarr       =  it.split("|")
    				,   i   
    				while( i = iarr.shift() ){
    					try{
	    					var fn          =  $.isFunction( t ) && t || $.type(t) == "string" && $this[t] || null 
		    				,   arr         =  i.split(":")
		    				,   fnTypeArr   =  arr[0].split("&")
		    				,   elArr       =  arr[1].split("&")
		    				if( fn ) $this.bindMany( fnTypeArr , elArr , fn )
	    				}catch(e){
	    					miss.console.warn( e )
	    				}
    				}
    				
    			})
    		}
    		this.template     =  function(){
    			if( /<[^>]+>/g.test(this.tpl) ){
    				return this.tpl
    			}else{
    				return $.ajax({url:[miss.config('path.root'),this.tpl].join('/'),async:false,cache:true}).responseText
    			}
    		}
    		this.init && $.isFunction( this.init ) && this.init() ;
    	}
    	$.extend( selector.prototype , {
    		bind              :  function( evt ,  selector , fn ){
    			var _this     =  this
    			return this.$el.on( evt , selector , function(e){
    				if( !_this.evtAuth( e.type , $(this) ) )  return ;
    				fn && $.isFunction( fn ) && fn.call( _this , e )
    			}  )
    		}
    		, disable         :  function(){
    			var rule      =  arguments[0] , _this = this
    			,   auth      =  arguments[1] || false
    			if( $.type(rule) != "string" || rule === "" )  return ;
    			try{
    				var arr   =  rule.split(":")
    				,   fns   =  arr[0].split("&") || []
    				,   btns  =  arr[1] && arr[1].split("&") || []
    				if( fns.length < 1 || btns.length < 1 )  return ;
    				_this.get( btns.join(",") ).each(function(){
    					$(this).data({"miss-event-auth":auth,"miss-auth-fn":fns})
    				})
    			}catch(e){
    				console.warn(e)
    			}
    		}
    		, evtAuth         :  function(type,$this){
    			var auth  =  $this.data("miss-event-auth") === false?false:true
	    		,   fn    =  $this.data("miss-auth-fn")
	    		return ( $.type( fn ) != "array" && auth || $.type( fn ) == "array"
	    		&& $.inArray( type , fn ) != -1 && auth || $.type( fn ) == "array"
	    		&& $.inArray( type , fn ) == -1 || false  )
    		}
    		, bindMany        :  function( atcarr , elarr , fn ){
    			var action    =  {} , _this = this
    			$.each( atcarr , function(i,type){
    				action[type]    =  function(e){
    					if( !_this.evtAuth( e.type , $(this) ) )  return ;
    					fn && $.isFunction( fn ) && fn.call( _this , e )
    				}
    			} )
    			this.$el.on(action,elarr.join(","))
    		}
    		, unbind          :  function( evt , selector ){
    			return this.$el.off( evt , selector )
    		}
    		, render          :  function( data , fn ){
    			var compile   =  _.template( this.template() )
    			if( fn && $.isFunction( fn ) ){
    				fn.call( true , compile( data ) )
    			}else{
    				this.$el.html( compile( data ) )
    			}
    		}
    		, get             :  function( el ){
    			return this.$el.find( el )
    		}
    	} )
    	return function( cf ){
    		return new selector( cf )
    	} ;
    }());
    //模板
    behavior.template         =  (function(){
        var driverList        =  ['underscore','react']
    	function template( cf ){
    		'use strict' ;
    		this.engine       =  this.engine || "underscore"
    		$.extend( this , cf )
    	}
    	$.extend( template.prototype , {
    		driver            :  function(){
    			var bool      =  $.type( arguments[0] ) != "string"
    			if( bool || !bool && $.inArray( arguments[0] , ['underscore','react'] ) == -1 ){
    				miss.console.warn("配置渲染引擎有误！！")
    				return this;
    			}
    			this.engine   =  arguments[0]
    		}
    		, render          :  function(){
    			var data      =  arguments[0]
    			,   tpl       =  this.getTpl( arguments[1] )
    			return this[this.engine+"Render"]( data , tpl )
    		}
    		, underscoreRender:  function( data , tpl ){
    			var template  = _.template(tpl);
                return template(data);
    		}
    		, reactRender     :  function( data , tpl  ){}
    		, getTpl          :  function( tpl ){
    			if( !/<[^>]+>/g.test(tpl) ){
    				return $.ajax({url:[miss.config('path.root'),tpl].join('/'),async:false,cache:true}).responseText
    			}else{
    				return tpl
    			}
    		}
    	} ) 
    	return function(){
    		var data  =  arguments[0] , tpl  =  arguments[1] , core
    		if( $.type( data ) == "object" && !tpl ){
    			return new template( data )
    		}else if( $.type( data ) == "object" && $.type(tpl) == "string" ){
    			core           =  new template({})
    			return core.render( data , tpl )
    		}
    		return null
    	}
    }())
    behavior.resource         =  (function(){
    	var RES_CACHE             =  miss.cache({})
    	return function( k , callback ){

    		if( $.type( k ) == "string" && $.isFunction(callback) ){
    			RES_CACHE( k , callback )
    			return behavior
    		}else if( $.type( k ) == "string" && !callback ){
    			var ret           =  null
    			try{
    				var arr       =  k.split( "@" )
    			    ,   fn        =  RES_CACHE(arr[0])
    			    ,   useKey    =  arr[1] || null
    			    if( !$.isFunction( fn ) )  return null ;
    			    if( !useKey ){
    			    	ret       =  fn.call({})
    			    }else{
    			    	ret       =  miss.getAimValue( useKey , fn.call({}) )
    			    }
    			}catch(e){
    				miss.console.warn(e)
    			}
    			return ret
    		}
    	}

    }())
    window.V           =  function( k ){
		if( ISVIR || !behavior.resource('virtual') )
			return k
		var arr        =  [] , ret = []
		if( $.type(k) == "string" )
			arr        =  [k]
	    else if ( $.type(k) == "array" )
	    	arr        =  k
	    else
	    	return k
	    arr.length > 0 && $.each( arr , function( i , t ){
	    	ret.push( behavior.resource('virtual@'+ t) || t )
	    } )
	    return $.type(k) == "string"?ret[0]:ret
	}
    //实现跨模块通信
    new function(){
    	var listenCenter          =  miss.cache({})
    	
	    behavior.subscribe        =  (function(){
	    	// var arr               =  []
	    	return function( id , fn ){
	    		if( $.type( id ) != "string" || !$.isFunction( fn ) )
	    			return ;
	    		var arr           =  listenCenter(id) || []
	    		arr.push( fn )
	    		listenCenter( id , arr )
	    	}
	    }())
	    behavior.observer         =  (function(){
	    	return function( id , param , _this ){
	    		var fnArr         =  listenCenter(id) || []
	    		,   fn
	    		$.each( fnArr , function(i,callback){
	    			$.isFunction( callback ) && callback.call( _this || true , param )
	    		} )
	    	}
	    }())
	    behavior.unsubscribe      =  function(){
	    	return function( id ){
	    		listenCenter( id , null )
	    	}
	    }
    }
    behavior.request          =  function(opt){
        var /*deff              =  this.callPromise()
        ,   */error             =  opt.error
        ,   success           =  opt.success
        $.each([{error:error,success:success}],function(name,fn){
            opt[name]  =  function(){
                // deff.resolve()
                $.isFunction( fn ) && fn.call( this , arguments )
            }
        })
        return $.ajax( opt )
    }
    /**======================REACTJS==============================**/
    behavior.react        =  function(fnClass){
        return function( id ){
            return new fnClass(id)
        } 
    }(function(){
        function core(opt){
            this.id             =  opt.id
            this.reactObject    =  miss.import(id).from({type:'react'}) || {}
            if( $.isEmptyObject( this.reactObject ) )
                return {}
        }
    })

    /**=====================VUEJS==================================**/
    behavior.vue          =  function(fn){
        var Vue           =  miss.support("vue")
        if( !vue ){
            miss.vendor("vue")
        }
        if( typeof vue == "undefined" ){
            miss.$error("VUE.js is need require")
        }
        return fn.call(true,Vue)
    }(function(vue){
        var vueCache         =  miss.cache({})
        "use strict" ;
        function view(cf){
            $.extend(  this , cf )
            this.templateUrl && this.getTpl(this.templateUrl)
            this.ctrlFnArr = []
            // this.component() 
            this.ctrlCenter()
            this.initVue()
            // this.componentList        =  miss.cache({})
            
        }
        $.extend(view.prototype,{
            ctrlCenter   :  function(fn){
                ctrlFnArr.push(fn)
            }
            ,runCtrl      :  function(){}
            ,getTpl  :  function(url){
                return $.ajax({url:url,async:false}).responseText ;
            }
            /**
            * demo
            * component(function($exports){
            *     $exports['todo-item']   =  {}
            *
            *
            *
            * })
            */
            ,component    :  function(fn){
                var componentHandlers         =  {}
                $.isFunction( fn ) && $fn.call(true,componentHandlers)
                !$.isEmptyObject(componentHandlers) && 
                $.each( componentHandlers , function(name,config){
                    vue.component(name,config)
                } )
            }
            /*,_checkEv:  function(){
                
            }*/
            // ,
        })


        return function(view){
            function core(cf){
                return new view(cf)
            }
            core.filter        =  function(fn){
                var filter     =  {}
                $.isFunction( fn ) && fn.call(true,filter)
                // 
            }
            return core ;
        }( view)
    })
    
    $exports.behavior         =  function(){
    	return behavior
    }
    
})