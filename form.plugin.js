(function(factory){
	if( typeof missDefine != 'undefined' ){
		missDefine('plugin',function( $exports , $tool ){
			return factory.call( true , $exports , $tool )
		})
	}else{
		return factory ;
	}
})(function( $exports , $tool ){
	var $               =  $tool.support().$
	,   _               =  $tool.support()._
	,   miss            =  $tool.miss
})