//var config = {
//	max:100,//最大词数
//  data:data;
//  weight:{
//    key:"num",//确定权重的key
//    levels:[],//判断权重分级的数组
//  }
//}
$.fn.WordCloud = function(config){
	var $this = this; 
	//console.log(this);
	var data = config.data.slice(0,config.max);//截取数组,假设数组是有序的
	var weight_count = new Array();//用于记录各权重的分布
	var weight_key = config.weight.key;
	var weight_levels = config.weight.levels;
	var cur_tag = 0;
	var count = 0;
	var height = this.height();
	var width = this.width();
	//获取每个权重(面积分块)的统计
	for( var i = 0;i < weight_levels.length; i ++ ){
		while(cur_tag<config.max && data[cur_tag][weight_key]>=weight_levels[i]){
			data[cur_tag].weight = weight_levels.length - i;
			data[cur_tag].weight ++;
			data[cur_tag]._tpl = "<div style=''></div>"
			data[cur_tag].arranged = false;
			count += data[cur_tag].word.length;
			cur_tag++;
		}
		weight_count[i] = count;
		count = 0;
	}
	weight_count = weight_count.reverse();
	console.log(weight_count);
  
	/*根据统计结果布局词云*/
	//根据权重和统计计算面积分割
	var break_num = 0;
	for(var i=0;i<weight_count.length;i++){
		break_num += weight_count[i]*(i+1);
	}
	var char_weight = Math.floor(Math.sqrt(width*height/break_num)/4);
	var lattic_width = parseInt(char_weight) + 2;

  //生成每个词的template

  //建立虚拟地图
  var map = {
  	width: Math.floor(width/lattic_width),//横向的格子数
  	height: Math.floor(height/lattic_width),//纵向的格子数
  	lattic_width: lattic_width//为保险，在字体尺寸的基础上＋2来防止过小溢出
  }
  map.lattic_arrange = (function(){
  		console.log(map.height,map.width);
  		var arrange = new Array();
  		for (var i = 0; i < map.width; i++){
  			arrange[i] = new Array();
  			for (var j = 0;j < map.height; j++){
  				arrange[i][j] = 0;
  			}  
  		}
  		return arrange;
  })();
  //初始化虚拟地图的中心区域
  map.left = Math.floor(map.width/2);
  map.right = parseInt(map.left) + 1;
  map.top = Math.floor(map.height/2);
  map.bottom = parseInt(map.top) + 1;
  map.direction = 0;//用0来标记左侧

  for(var j = 0;j < config.max;j ++){
  	//将初始词放置在区域中心
  	if(j===0){
  		//计算横向的格子数
  		var _left = map.width - Math.ceil(data[j].weight*data[j].word.length/2);
  		var _top = map.height - Math.ceil(data[j].weight/2);
  		data[j]._tpl = "<div class='wd' style='font-size:"+data[j].weight*char_weight+"px;left:"+_left* map.lattic_width+"px;top:"+_left* map.lattic_width+"px'>"+data[j].word+"</div>";
  		
  	} else {
  		data[j]._tpl = "<div class='wd' style='font-size:"+data[j].weight*char_weight+"px'>"+data[j].word+"</div>";
  	}
  }

	cur_tag = 0;
	var _arrange = function(){
		var $ele = $(data[cur_tag]._tpl); 
		$this.append($ele.fadeIn(500));
		if(++cur_tag < data.length){setTimeout(arguments.callee,500)}
	}
	
	_arrange();
}
