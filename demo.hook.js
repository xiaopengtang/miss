//请记住这个范例
/*missDefine("hook",function( $exports , $tool ){
	$exports.behavior       =  function(){
		return {id:1}
	}
})*/
/*(function(){
	return function( $scope , $tool ){
		$scope.behavior         =  function(){
			return {
				id              :  1
				, demo          :  function(){}
			}
		}
		$scope.done             =  function( config ){
		}
	}
}())*/
(function(factory){
	if( typeof missDefine != 'undefined' ){
		missDefine('hook',function( $exports , $tool ){
			return factory.call( true , $exports , $tool )
		})
	}else{
		return factory ;
	}
})(function( $exports , $tool ){
	$exports.behavior       =  function(){
		return {id:1}
	}
})