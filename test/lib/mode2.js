define('lib.mode2',"lib.mode1,lib.mode3",function(){
	console.log('mode2 loaded! depend: lib.mode1,lib.mode2');
	return function(){
		console.log('mode2');
	}
});