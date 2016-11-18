/****======================tuniu plugin===========================****/
missDefine("hook",function( $exports , $tool ){
	var $               =  $tool.support().$
	,   _               =  $tool.support()._
	,   miss            =  $tool.miss
	,   behavior        =  {}
	,   ISVIR           =  miss.config( "runModel" ) == "virtual"
	new function(){
		if( typeof tn == "undefined" ){
			alert('未检测到对象tn，无法正确加载脚本[tuniu.hook.js]')
			miss.errors("未检测到对象tn")
		} 
		behavior.alert       =  tn.noty.alert
		behavior.info        =  tn.noty.info
		behavior.warn        =  tn.noty.error
		behavior.confirm     =  function( msg , fn ){
			var button       =  {
				type: "btn btn-primary",
	            text : '确定',
	            click: function ($noty) {
	            	$noty.close() ;
	            	fn && $.isFunction( fn ) && fn.call(this,arguments)
	            }
	        }
			tn.noty.confirm(msg,button)
		}

		behavior.autoComplete  =  function(){
			var config         =  arguments[0]
			if( $.type( config ) != 'object' )  return ;
			config.show || config.attrs && (function(){
				config.show    =  V(config.show)
				config.attrs   =  V(config.attrs)
			}())
			TNSearch( config )
			$(config.el).unbind("keydown").bind("keydown",function(e){
				// console.log( e.keyCode )
				if( e.keyCode == 8 || e.keyCode == 46 ){
					$(this).val("")
				}
			})
		}
		//时间控件
		behavior.datePlugin    =  function(){
			var cf             =  arguments[0]
			,   $el     
			,   config         =  {
				mode: 'range',
				months: 2,
				rangeDelimiter: ' - ',
				direction: 'today-past',
				subscribe: {
					change: function() {
						this.subscribe('change', function() {
							if (this.getSelected().length < 11) {
                                $(this.input).val(this.getSelected() + " 00:00:00");
                            } else {
                                var time = this.getSelected().split(' - ');
                                time[0] = time[0] + " 00:00:00";
                                time[1] = time[1] + " 23:59:59";
                                var str = time[0] + '~' + time[1];
                                $(this.input).val(str);
                            }
						});
					}
				}
			}
			if( $.type( cf ) == "string" ){
				$el            =  $(cf)
			}else if( $.type( cf ) == "object" ){
				$.extend( cf , config )
				$el            =  cf.$el || $(cf.el)  ;
			}else
			    return
			$el.unbind("keydown").bind("keydown",function(e){
				// console.log( e.keyCode )
				if( e.keyCode == 8 || e.keyCode == 46 ){
					$(this).val("")
				}
			})
			$el.unbind("blur").bind("blur",function(){
				var auth       =  $(this).val() && $(this).val().replace("~","") == $(this).val()
				if( !auth )
					return ;
			    try{
			    	var date       =  $(this).val().split(" ")[0]
			    	date           =  [date,"23:59:59"].join(" ")
			    	$(this).val( [ $(this).val() , date ].join(" ~ ") )
			    }catch(e){
			    	console.warn( e )
			    }
				
				// console.log( ret )
				// var date       =  
			    
			})
			cf.$el  &&  delete cf.$el
			cf.el   &&  delete cf.el
			var ret      =  $el.kalendae( cf )
			return ret 
		}
		/*behavior.request      =  function( opt ){
			var always        =  opt.always
			,   done          =  opt.done
			delete opt.always
			delete opt.done
			$.ajax(opt).done(function(){})
		}*/
		behavior.spinner    =  (function(opt){
	    	if( typeof Spinner == "undefined" )  return {spin:$.noop,start:$.noop,stop:$.noop}
	    	var spinnerList =  miss.cache({})
	        return function(cf){
	        	if( $.type( cf ) == "string" ){
	        		return spinnerList(cf)
	        	}else if($.type(cf) != "object" ){
	        		return null ;
	        	}
	        	var $id     =  cf 
	        	delete cf.$id && delete cf.el
	        	cf          =  $.extend(true ,opt , cf )
	        	var spinner =  {}
	        	spinner[$id]    =  new Spinner(cf)
	        	spinnerList( spinner ) ;
	        	return spinner[$id]
	        }
	    }({
			lines: 11,
		    // The number of lines to draw
		    length: 3,
		    // The length of each line
		    width: 4,
		    // The line thickness
		    radius: 11,
		    // The radius of the inner circle
		    corners: 1,
		    // Corner roundness (0..1)
		    rotate: 0,
		    // The rotation offset
		    color: '#000',
		    // #rgb or #rrggbb
		    speed: 1,
		    // Rounds per second
		    trail: 60,
		    // Afterglow percentage
		    shadow: false,
		    // Whether to render a shadow
		    hwaccel: false,
		    // Whether to use hardware acceleration
		    className: 'spinner',
		    // The CSS class to assign to the spinner
		    zIndex: 2e9,
		    // The z-index (defaults to 2000000000)
		    top: 'auto',
		    // Top position relative to parent in px
		    left: 'auto' 
		})) ;
		behavior.table        =  (function(){
			var tableList     =  miss.cache({})
			,   demoConfig    =  {
				model         :  'server'
				// , param       :  config.param || {}
				// , url         :  config.url
				, usepager    :  true
				// , el          :  $(config.el)
				, autoload    :  true
				, css: {
	                height: "auto",
	                width:"auto"
	            }
			}
			return function(){
				var config    =  arguments[0]
				,   data      =  arguments[1]
				,   fn        =  arguments[2]
				if( $.type(config) == "string" && data == void 0 )
					return tableList(config)
				else if( $.type( config ) == "object" ){
					config           =   $.extend( true , demoConfig , config ) 
					var $id          =  config.$id
					$id && delete config.$id
					if( !$id )  return ;
					if( !tableList( $id )  ){
						// console.log( config )
						var table        =  new nb.GridPanel( config ) ;
						tableList($id,table)
					}else{
						tableList($id).reload( config ) ;
					}
					return tableList($id)
				}else if( $.type(config) == "string"  ){
					var core        =  tableList( config )
					// console.log( core )
					core.reload.call( core , data , $.isFunction( fn ) && fn || null )
				}else{
					return ;
				}
			}
		}())
		var ajaxSpinner      =  behavior.spinner({$id:"tuniu-ajax-spin"})
		
		behavior.ajax        =  function( opt ){
			// console.log( behavior )
			var isAllow      =  opt.spinEl !== null
			,   $el          =  opt.spinEl && $(opt.spinEl) || $('.main')
			,   deff         =  this.callPromise()
			,   error        =  opt.listener && opt.listener.error || null
			,   success      =  opt.listener && opt.listener.success || null
			opt.spinEl && delete opt.spinEl 
			opt              =  $.extend({type:"GET",timeout:5000},opt)
			var beforerequest=  opt.listener.beforerequest
			opt.listener.beforerequest = function(){
				isAllow && ajaxSpinner.spin( $el[0] )
				opt.listener && $.isFunction(beforerequest)
				&& beforerequest.apply(this,arguments) 
			}
			isAllow && !$.isEmptyObject( opt.listener ) && $.each( opt.listener , function(i,fn){
				if( i != "beforerequest" ) 
					opt.listener[i]    =  function(){
						ajaxSpinner.stop() ;
						$.isFunction( fn ) && fn.apply(this,arguments)
					}
			} )
			$.each([{error:error,success:success}],function(name,error){
				opt.listener[name]       =  function(){
					deff.resolve()
					$.isFunction( error ) && error.apply(this,arguments)
				}
			})
			// behavior.recycleAsync( deff )
			return tn.ajax.request(opt)
		}
		//用于获取url参数
		!( "I" in window )  &&  (window.I=function(k,df){
			var base         =  new URI( location.href )
			,   data         =  base.decode( location.hash )
			return k && miss.getAimValue( k , data ) || !k && data || df
		})
	}
	$exports.behavior          =  function(){
		return behavior ;
	}
	$exports.done             =  function(){
    }
})