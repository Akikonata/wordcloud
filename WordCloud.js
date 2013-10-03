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
			data[cur_tag]._tpl = "<div style=''></div>";
			count += data[cur_tag].word.length;
			cur_tag++;
		}
		weight_count[i] = count;
		count = 0;
	}
	weight_count = weight_count.reverse();
  
	/*根据统计结果布局词云*/
	//根据权重和统计计算面积分割
	var break_num = 0;
	for(var i=0;i<weight_count.length;i++){
		break_num += weight_count[i]*(i+1);
	}
	var char_weight = Math.floor(Math.sqrt(width*height/break_num)/4);
	var lattic_width = Math.round(char_weight);

  //生成每个词的template

  //建立虚拟地图
  var map = {
  	width: Math.floor(width/lattic_width),//横向的格子数
  	height: Math.floor(height/lattic_width),//纵向的格子数
  	lattic_width: lattic_width
  }
  map.arrange = (function(){
  		var arrange = new Array();
  		for (var i = 0; i < map.width; i++){
  			arrange[i] = new Array();
  			for (var j = 0;j < map.height; j++){
  				arrange[i][j] = 0;
  			}  
  		}
  		return arrange;
  })();
  map.direction = 0;
  var dir = function(d){
    switch(d){
      case 0: return {x:1,y:1};
      case 1: return {x:-1,y:1};
      case 2: return {x:-1,y:-1};
      case 3: return {x:1,y:-1};
      default: return {x:1,y:1};
    }
  }
  var rand_color = function(){
    var random = function(range){return Math.round(Math.random()*range)};
    return "hsl("+random(360)+",60%,45%)";
  }
  //查找以s_x,s_y为起点的最近的空白区域
  var search_emp = function(map,s_x,s_y,_w,_h,dir){  
      //测试区域是否为空
      var test = function(s_X,s_Y){
        var empty = true;
        for(var i=0;i<_w;i++){
          for(var j=0;j<_h;j++){
            try{
              //console.log(s_x+dir.x*i,s_y+dir.y*j);
              if(map.arrange[s_X+i][s_Y+j]!==0){empty=false;break;}
            } catch (e){
              empty=false;break;
            }
          }
        }
        return empty;
      }
      //排布的策略
      var arrange_solution = function(){
        var s_X = s_x,s_Y = s_y; 
        var result = false;
        var found = false;
        if(Math.random()>0.9){
          while(!found&&s_X>-1&&s_X<map.width){
            while(!found&&s_Y>(Math.abs(s_x-s_X)*s_y/s_x)&&s_Y<(map.height-Math.abs(s_x-s_X)*s_y/s_x)){
              found = test(s_X,s_Y);
              if(found){result={x:s_X,y:s_Y}};
              s_Y+=dir.y;
            }
            s_X+=dir.x;
            s_Y = s_y;
          }
        } else {
          while(!found&&s_Y>-1&&s_Y<map.height){
            while(!found&&s_X>(Math.abs(s_y-s_Y)*s_x/s_y)&&s_X<(map.width-Math.abs(s_y-s_Y)*s_x/s_y)){
              found = test(s_X,s_Y);
              if(found){result={x:s_X,y:s_Y}};
              s_X+=dir.x;
            }
            s_Y+=dir.y;
            s_X = s_x;
          }
        }
        return result;
      }
      return arrange_solution();
    }

  var j = 0;
  while(j < config.max){
    var __w = (function(){
      var w = 0;
      var len = data[j].word.length;
      for(var _s=0;_s<len;_s++){
        (/[a-zA-Z]/).test(data[j].word[_s])?(w+=data[j].weight/2):(w+=data[j].weight);
      }
      return Math.round(w);
    })();
    var __h = data[j].weight;

  	//将初始词放置在区域中心
  	if(j===0){
  		var _left = Math.round(map.width/2) - Math.ceil(__w/2);
  		var _top = Math.round(map.height/2) - Math.ceil(__h/2);
  		data[j]._tpl = "<div class='wd"+(rotate?" rotate":"")+"' style='color:"+rand_color()+";font-size:"+data[j].weight*char_weight+"px;left:"+_left*map.lattic_width+"px;top:"+_top* map.lattic_width+"px'>"+data[j].word+"</div>";
  		//将已经填充的区域设置为1
  		for(var _h=0;_h<__w;_h++){
  			for(var _v=0;_v<__h;_v++){
  				map.arrange[_left+_h-1][_top+_v-1] = 1;
  			}
  		}
      j++;
  	} else {
      var rotate = Math.random()>0.618?true:false;
      var __tmp = __w;
      if(rotate){
        __w = __h;
        __h = __tmp; 
      }
  		var centerX = Math.round(map.width/2);
  		var centerY = Math.round(map.height/2);
      
  		var endloop = false;
      var pos_h,pos_v;
  		var s_Pos = search_emp(map,centerX,centerY,__w,__h,dir(map.direction));
      if(s_Pos){
        data[j]._tpl = "<div class='wd"+(rotate?" rotate":"")+"' style='"+(rotate?("width:"+(__tmp*char_weight+data[j].word.length)+"px;"):"")+"color:"+rand_color()+";font-size:"+data[j].weight*char_weight+"px;left:"+s_Pos.x*map.lattic_width+"px;top:"+s_Pos.y* map.lattic_width+"px'>"+data[j].word+"</div>";
        //将已经填充的区域设置为1
        for(var _h=0;_h<__w;_h++){
          for(var _v=0;_v<__h;_v++){
            map.arrange[s_Pos.x+_h][s_Pos.y+_v] = 1;
          }
        }
        j++;
      }
  	}
    map.direction = (++map.direction)%4;
  }

	cur_tag = 0;
	var _arrange = function(){
		var $ele = $(data[cur_tag]._tpl); 
		$this.append($ele.fadeIn(500));
		if(++cur_tag < data.length){setTimeout(arguments.callee,500)}
	}
	
	_arrange();
}
