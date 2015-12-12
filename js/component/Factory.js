define(function(){
	/**
	*仿邮箱收件人输入框
	*@Class ReceiveFactory
	*@param opt {object}配置参数
	*@param opt["dom"]{jquery obejct}整个标签的dom jquery 对象
	*/
	function ReceiveFactory (opt){
		var me = this;
		$.extend(me,opt||{});
		me.init();
		me.addDataFocus();
	}
	ReceiveFactory.prototype = {
		//取得输入框
		getInput:function(){
			return this.dom.find("input.js-factory-input");
		},
		//取得输入框的盒子
		getInputBox:function(){
			return this.dom.find("span.js-factory-inputBox");
		},
		getTagInShadow:function(){
			return this.dom.find(".tagInShadow");
		},
		//输入框获得光标
		inputFocus:function(){
			this.getInput().focus();	
			this.dom.find(".Factory-box").addClass("Factory-borderBlue");
		},
		/**
		*创建tag
		*@param data {object}:{key:1,value:"美食"}
		*/
		createTag:function(data){
			var me = this;
			return '<span class="tagItem" data-id="'+data.key+'">'+data.value+'</span>';
		},
		//取得tag数据
		getData:function(arg){
			var me = this;
			var opt = $.extend({url:(me.url||"url")},arg);
			if(arg.testData){
				arg.success.call(me,arg.testData);
				return
			}
			$.ajax(opt);
		},
		//把标签放到盒子里
		insertBeforeInput:function(dom){
			this.dom.find(".tagItem[data-id="+($(dom).attr("data-id"))+"]").remove();
			$(dom).insertBefore(this.getInputBox())
		},
		//找到data-focus＝on的标签
		getLabelFocus:function(){
			return this.dom.find("span[data-focus]");
		},
		//清除所有标签上的data-focus
		clearLabelFocus:function(){
			this.dom.find(".tagItem[data-focus]").removeAttr("data-focus");
			return this;
		},
		//设置标签
		setLabelFocus:function(tar){
			$(tar).attr("data-focus","on");
			return this;
		},
		//找到input前一个或才一个标签
		getSlibingLabel:function(){
			return this.getInputBox().prev(".tagItem").length==0?(this.getInputBox().next(".tagItem").length==0?false:this.getInputBox().next(".tagItem")):this.getInputBox().prev(".tagItem");
		},
		//给相临tag加data-focus
		addDataFocus:function(){
			var me = this;
			!(me.getSlibingLabel())||me.setLabelFocus(me.getSlibingLabel());
		},
		//把input的值放到隐藏盒子中
		copyToHidden:function(){
			var me = this,$input = me.getInput(),$getTagInShadow = me.getTagInShadow();
			$getTagInShadow.find("i").text($input.val());
		},
		/**
		*删除标签
		*@param n 第几个case
		*@param arg 参数情况
		*/
		handler:function(n,arg){
			var me = this,timer = null;
			switch(n){
				//删除标签
				case 1: 
					/*arg=需要删除的label*/
				(arg||me.dom.find("span[data-focus]")).hasClass("delete")?(arg||me.dom.find("span[data-focus]")).remove():me.dom.find(".delete").removeClass("delete")&&(arg||me.dom.find("span[data-focus]")).addClass("delete");
				break;
				//新标签放到盒子里
				case 2:
					/*arg=新的标签dom*/
				me.insertBeforeInput(arg);
				break;
				//input盒子前移
				case 3:
				var $input = me.getInputBox();
				!($input.prev().length)||($input.insertBefore($input.prev())&&me.inputFocus());
				break;
				//input盒子后移
				case 4:
				var $input = me.getInputBox();
				!($input.next().length)||($input.insertAfter($input.next())&&me.inputFocus());
				break;
				default:;
			}
			me.clearLabelFocus();
			me.addDataFocus();
		},
		bindEvent:function(){
			var me = this,timer = null;
			//获得光标
			me.dom.find(".Factory-box").on("click",function(){
				me.inputFocus();
			});
			$(me).on("tagHide_e",function(){
				me.dom.find(".tagList").hide().find(".js-tagList-li").remove();
				me.getInput().attr("data-keyword","").val("");
				me.dom.find(".tagInShadow i").html("");
			});
			me
			.getInput()
			.off("focus._keydown")
			.on("focus._keydown",function(){
				var $t = $(this);
				me.dom.find(".Factory-box").addClass("Factory-borderBlue");
				$t.off("keydown._addTag").on("keydown._addTag",function(e){
					var code = e.keyCode;
					switch(code){
						//退格键
						case 8: 
						if($.trim(me.getInput().val())==""){
							e.preventDefault();
							!(me.getInputBox().prev().length)||me.handler(1,me.getInputBox().prev());
							return
						}
						
						break;
						//左
						case 37:
						if($.trim(me.getInput().val())==""){
							e.preventDefault();
							me.handler(3);
						}
						break;
						//右
						case 39:
						if($.trim(me.getInput().val())==""){
							e.preventDefault();
							me.handler(4);
							return
						}
						break;
						default:;
					}
				})
				.off("keyup._addTag").on("keyup._addTag",function(e){
					if(timer){
						clearTimeout(timer);
					}
					me.copyToHidden();
					var $input = me.getInput();
					if($.trim($input.val())==""){
						$(me).trigger("tagHide_e");
						return;
					}
					//上、下、回车键
					if(e.keyCode==38||e.keyCode==40||e.keyCode==13){
						if(me.dom.find(".js-tagList-li").length==0){
							return;
						}
						if(me.dom.find(".tagList .on").length==0){
							me.dom.find(".js-tagList-li").eq(0).addClass("on");
							return
						}
						var $tagList = me.dom.find(".tagList"),
						$on = $tagList.find(".on");
						if(e.keyCode==13){
							me.insertBeforeInput(me.createTag({key:$on.attr("data-id"),value:$on.text()}));
							$(me).trigger("tagHide_e");
							return
						}
						$on.removeClass("on");
						$tagList
						.find(".js-tagList-li")
						.eq(e.keyCode==38?(($on.index()==1)?($tagList.find(".js-tagList-li").length-1):($on.index()-2)):(($on.index()==$tagList.find(".js-tagList-li").length)?(0):($on.index())))
						.addClass("on");
						return
					}
					if($input.attr("data-keyword")&&$input.attr("data-keyword")==$input.val()){
						return;
					}
					timer = setTimeout(function(){
						if($input.val()!=""){
							me.getData({
								testData:me.testData||"",
								success:function(data){
									
									if(data.data.keyword==$input.val()){
										$input.attr("data-keyword",data.data.keyword);
										me.dom
											.find(".tagList")
											.find(".js-tagList-li")
											.remove();
										if(!data.data.list.length){
											return ;
										}
										var str = "";
										$.each(data.data.list,function(i,item){
											str+='<li class="js-tagList-li '+(i==0?"on":"")+'" data-id="'+item.key+'">'+item.value+'</li>';
										});
										$(str).appendTo(me.dom.find(".tagList").show());
										return;
									}

								},
								error:function(){
									$(me).trigger("tagHide_e");
								}
							})
						}
					},30)
					
				});
			})
			.off("blur._keydown")
			.on("blur._keydown",function(){
				me.dom.find(".Factory-box").removeClass("Factory-borderBlue");
				var $t = $(this);
				$t.off("keydown._addTag keyup._addTag");
				$(me).trigger("tagHide_e");
			});

			//checkbox
			me.dom.find(".Factory-list").on("click","input[type=checkbox]",function(){console.log(11);
				var $t = $(this);
				if($t.prop("checked")){
					me.insertBeforeInput(me.createTag({key:$t.attr("data-id"),value:$t.val()}));
				}else{
					me.dom.find(".tagItem[data-id="+$t.attr("data-id")+"]").remove();
				}
				
			})
		}
		,init:function(){
			this.bindEvent();
		}
	}
	return ReceiveFactory;
})



	




















