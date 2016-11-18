/**======================主要作用于ajax，实现log的打印以及data结构转化=================**/
missDefine("hook",function( $exports , $tool ){
	var $              =  $tool.support().$
	,   _              =  $tool.support()._
	,   miss           =  $tool.miss
    if( !miss.config('showLog') )  return ;
    function getTemplate(){
    	return $.ajax({url:"./templates/showLog.html",async:false}).responseText ;
    }
    function render( data ){
    	var complie          =  _.template( getTemplate() )
	    ,   html             =  complie( data || {} ) ;
    	if( data === true ){
    		$('body').append( html )
    	}else if( $.type( data ) == 'object' ){
	    	$('#show-log-content').append( html )
    	}
    }
    $(document).on("click",'#show-log>.show-icon-position,.show-log-icon',function(){
    	$("#show-log>.show-icon-position").hide() ;
    	$("#show-log>.show-content").show() ;
    })
     $(document).on("click",'#show-log>.close-icon-position,.close-log-icon',function(){
    	$("#show-log>.show-icon-position").show() ;
    	$("#show-log>.show-content").hide() ;
    })

    // 

	$exports.behavior        =  function(){
		render(true);
		return {
			ajax             :  function( opt ){
				// 
			}
		}
	}
})