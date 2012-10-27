/**
 * jQuery Transformer Plugin
 *
 * Copyright 2011 creatorish.com
 * Author: y.hayashi
 * Site: http://creatorish.com
 * LastUpdate: 2011/04/10
 * HowToUse: http://creatorish.com/lab/2176
 *
**/
var Transformer = function(elm,option) {
	this.container = elm;
	this.options = {
		prevent: true,
		trigger: null,
		gesture: true,
		tapDelay: 200,
		holdDelay: 500,
		minScale: NaN,
		maxScale: NaN,
		centering: true,
		transform3d: true,
		stopPropagation: true
	};
	
	for (var key in option) {
		this.options[key] = option[key];
	}
	
	this.centering = "";
	this.isMove = false;
	this.isGesture = false;
	this.isTapWait = false;
	this.isHold = false;
	
	this.timer = null;
	this.holdTimer = null;
	this.touchList = null;
	this.lastTouchCount = 0;
	this.support3d = (typeof WebKitCSSMatrix != 'undefined' && new WebKitCSSMatrix().hasOwnProperty('m41'));
	
	this.param = {
		x: 0,
		y: 0,
		rotation: 0,
		scale: 1,
		touchCount: 0,
		allTouchCount: 0
	};
	
	this.temp = {
		startX: 0,
		startY: 0,
		x: 0,
		y: 0,
		rotation: 0,
		scale: 1
	};
	
	var self = this;
	this._touchStartHandler = function(e) {
		self._touchStart(e);
	};
	this._touchMoveHandler = function(e) {
		self._touchMove(e);
	};
	this._touchEndHandler = function(e) {
		self._touchEnd(e);
	};
	this._gestureStartHandler = function(e) {
		self._gestureStart(e);
	};
	this._gestureChangeHandler = function(e) {
		self._gestureChange(e);
	};
	this._gestureEndHandler = function(e) {
		self._gestureEnd(e);
	};
	this._timeoutHandler = function(e) {
		self.isTapWait = false;
	};
	this._startAnimation = function(e) {
		self._animate(e);
	};
	this._animationEnd = function(e) {
		self.stop(e);
	};
	this._holdTimeout = function(e) {
		self._hold(e);
	};
	
	this.init();
};
Transformer.prototype = {
	init: function() {
		if (this.options.centering) {
			this.centering = "translate(-50%,-50%) ";
		}
		this.container.style.webkitTransform = this.centering + this._getTranslate("0,0") +  " rotate(0deg) scale(1,1)";
		this.addEvent();
	},
	addEvent: function() {
		this.removeEvent();
		if (this.options.trigger === null) {
			this.container.addEventListener("touchstart",this._touchStartHandler,false);
			this.container.addEventListener("touchmove",this._touchMoveHandler,false);
			this.container.addEventListener("touchend",this._touchEndHandler,false);
			if (this.options.gesture) {
				this.container.addEventListener("gesturestart",this._gestureStartHandler,false);
				this.container.addEventListener("gesturechange",this._gestureChangeHandler,false);
				this.container.addEventListener("gestureend",this._gestureEndHandler,false);
			}
		} else {
			jQuery(this.options.trigger).get(0).addEventListener("touchstart",this._touchStartHandler,false);
			jQuery(this.options.trigger).get(0).addEventListener("touchmove",this._touchMoveHandler,false);
			jQuery(this.options.trigger).get(0).addEventListener("touchend",this._touchEndHandler,false);
			if (this.options.gesture) {
				jQuery(this.options.trigger).get(0).addEventListener("gesturestart",this._gestureStartHandler,false);
				jQuery(this.options.trigger).get(0).addEventListener("gesturechange",this._gestureChangeHandler,false);
				jQuery(this.options.trigger).get(0).addEventListener("gestureend",this._gestureEndHandler,false);
			}
		}
	},
	removeEvent: function() {
		if (this.options.trigger === null) {
			this.container.removeEventListener("touchstart",this._touchStartHandler);
			this.container.removeEventListener("touchmove",this._touchMoveHandler);
			this.container.removeEventListener("touchend",this._touchEndHandler);
		} else {
			jQuery(this.options.trigger).get(0).removeEventListener("touchstart",this._touchStartHandler);
			jQuery(this.options.trigger).get(0).removeEventListener("touchmove",this._touchMoveHandler);
			jQuery(this.options.trigger).get(0).removeEventListener("touchend",this._touchEndHandler);
		}
	},
	_touchStart: function(e) {
		if (this.isTransition) {
			this.stop();
		}
		
		this.touchList = e.touches;
		var touches = this._getCurrentTouches(e.currentTarget,e.touches);
		this.param.touchCount = touches.length;
		this.param.allTouchCount = e.touches.length;
		
		this.isMove = false;
		
		this.holdTimer = setTimeout(this._holdTimeout,this.options.holdDelay);
		jQuery(this.container).trigger("touch",[this.temp]);
	},
	_touchMove: function(e) {
		clearTimeout(this.holdTimer);
		
		this.touchList = e.touches;
		var touches = this._getCurrentTouches(e.currentTarget,e.touches);
		this.param.touchCount = touches.length;
		this.param.allTouchCount = e.touches.length;
		
		
		var first = touches[0];
		var second = touches[1];
		
		var x = 0;
		var y = 0;
		
		if (this.param.touchCount !== this.lastTouchCount) {
			if (this.param.touchCount === 1) {
				this.temp.startX = first.pageX;
				this.temp.startY = first.pageY;
			} else {
				this.temp.startX = (first.pageX + second.pageX) / 2;
				this.temp.startY = (first.pageY + second.pageY) / 2;
			}
			this.save();
		}
		
		this.isMove = true;
		if (this.param.touchCount === 1) {
			x = first.pageX - this.temp.startX;
			y = first.pageY - this.temp.startY;
			
			jQuery(this.container).trigger("drag",[this.temp]);
		} else {
			x = (first.pageX + second.pageX) / 2 - this.temp.startX;
			y = (first.pageY + second.pageY) / 2 - this.temp.startY;
			
			jQuery(this.container).trigger("transform",[this.temp]);
		}
		this._trans(x,y,this.temp.scale,this.temp.rotation);
		this.prevent(e);
	},
	_touchEnd: function(e) {
		clearTimeout(this.holdTimer);
		if (!this.isMove && !this.isHold) {
			if (this.isTapWait) {
				this.isTapWait = false;
				clearTimeout(this.timer);
				jQuery(this.container).trigger("dblTap",[this.param]);
			} else {
				this.isTapWait = true;
				this.timer = setTimeout(this._timeoutHandler,this.options.tapDelay);
				jQuery(this.container).trigger("tap",[this.param]);
			}
		} else {
			jQuery(this.container).trigger("release",[this.temp]);
		}
		this.isMove = false;
		this.isHold = false;
		this.param.touchCount = 0;
		this.save();
	},
	_hold: function() {
		this.isHold = true;
		jQuery(this.container).trigger("hold",[this.temp]);
	},
	_trans: function(x,y,scale,rotation) {
		this.container.style.webkitTransform = this.centering + this._getTranslate((x+this.param.x) + "px," + (y+this.param.y) + "px") + " rotate(" + rotation + "deg) scale(" + scale + "," + scale + ")";
		
		this.temp.x = x+this.param.x;
		this.temp.y = y+this.param.y;
		this.temp.scale = scale;
		this.temp.rotation = rotation;
	},
	_gestureStart: function(e) {
		this.prevent(e);
	},
	_gestureChange: function(e) {
		var touches = this._getCurrentTouches(e.currentTarget,this.touchList);
		var first = touches[0];
		var second = touches[1];
		
		if (touches.length < 2 || this.param.allTouchCount > 2) {
			return;
		} else if (first && second) {
			if (first.target !== second.target) {
				return;
			}
		}
		
		this.isGesture = true;
		var s = this.param.scale * (1 + (e.scale - 1) / 2);
		
		if (!isNaN(this.options.minScale) && this.options.minScale > s) {
			s = this.options.minScale;
		}
		if (!isNaN(this.options.maxScale) && this.options.maxScale < s) {
			s = this.options.maxScale;
		}
		
		var r = (e.rotation + this.param.rotation) % 360;
		this.temp.scale = s;
		this.temp.rotation = r;
		this.prevent(e);
	},
	_gestureEnd: function(e) {
		this.isChange = false;
		this.prevent(e);
	},
	_getCurrentTouches: function(current,touches) {
		arr = [];
		for (var i = 0; i < touches.length; i++) {
			var target = touches[i].target;
			if (current === target || current === target.parentNode || jQuery(current).find(target.parentNode).length !== 0) {
				arr.push(touches[i]);
			}
		}
		return arr;
	},
	save: function() {
		this.param.x = this.temp.x;
		this.param.y = this.temp.y;
		this.param.scale = this.temp.scale;
		this.param.rotation = this.temp.rotation;
		this.lastTouchCount = this.param.touchCount;
	},
	prevent: function(e) {
		if (this.options.prevent === true) {
			e.preventDefault();
		}
		if (this.options.stopPropagation === true) {
			e.stopPropagation();
		}
	},
	destroy: function() {
		this.removeEvent();
		this.container.style.webkitTransform = "";
	},
	transform: function(p) {
		if (!p.x && p.x !== 0) {
			p.x = this.param.x;
		}
		if (!p.y && p.y !== 0) {
			p.y = this.param.y;
		}
		if (!p.scale && p.scale !== 0) {
			p.scale = this.param.scale;
		}
		if (!p.rotation && p.rotation !== 0) {
			p.rotation = this.param.rotation;
		}
		
		this._trans(p.x,p.y,p.scale,p.rotation);
	},
	animate: function(prop,time) {
		if (this.isTransition) {
			return;
		}
		this.isTransition = true;
		if (!time) {
			time = 1000;
		}
		this.prop = prop;
		this.container.style.webkitTransitionDuration = time+"ms";
		this.container.style.webkitTransitionTimingFunction = "ease-out";
		this.container.removeEventListener("webkitTransitionEnd",this._animationEnd);
		this.container.addEventListener("webkitTransitionEnd",this._animationEnd);
		
		setTimeout(this._startAnimation,16);
	},
	stop: function() {
		if (this.isTransition) {
			this.container.style.webkitTransitionDuration = "";
			this.container.style.webkitTransitionTimingFunction = "";
			this.container.removeEventListener("webkitTransitionEnd",this._animationEnd);
			this.isTransition = false;
		}
	},
	_animate: function() {
		var transform = this.centering;
		
		if (this.prop["x"] || this.prop["y"] || this.prop["translate"]) {
			if (this.prop["translate"]) {
				transform += this._getTranslate(this.prop["translate"]);
				var pos = String(this.prop["translate"]).split(",");
				if (pos.length === 2) {
					this.temp.x = pos[0];
					this.temp.y = pos[1];
				}
				delete this.prop["translate"];
			} else if (this.prop["x"] && this.prop["y"]){
				transform += this._getTranslate(this.prop["x"] + "px," + this.prop["y"] + "px");
				this.temp.x = this.prop[x];
				this.temp.y = this.prop[y];
				delete this.prop["x"];
				delete this.prop["y"];
			} else if (this.prop["x"]) {
				transform += this._getTranslate(this.prop["x"] + "px," + this.param["y"] + "px");
				this.temp.x = this.prop[x];
				delete this.prop["x"];
			} else if (this.prop["y"]) {
				transform += this._getTranslate(this.param["x"] + "px," + this.prop["y"] + "px");
				this.temp.y = this.prop["y"];
				delete this.prop["y"];
			}
		} else {
			transform += this._getTranslate(this.param["x"] + "px," + this.param["y"] + "px");
		}
		
		if (this.prop["rotation"]) {
			transform +="rotate(" + this.prop["rotation"] + "deg) ";
			this.temp.rotation = this.prop["rotation"];
			delete this.prop["rotation"];
		} else {
			transform +="rotate(" + this.param["rotation"] + "deg) ";
		}
		
		if (this.prop["scale"]) {
			transform +="scale(" + this.prop["scale"] + "," + this.prop["scale"] + ") ";
			this.temp.scale = this.prop["scale"];
			delete this.prop["scale"];
		} else {
			transform +="scale(" + this.param["scale"] + "," +  this.param["scale"] + ") ";
		}
		
		this.prop.webkitTransform = transform;
		jQuery(this.container).css(this.prop);
		
		this.save();
	},
	_getTranslate: function(val) {
		if (this.support3d && this.options.transform3d) {
			return "translate3d(" + val + ",0)";
		}
		return "translate(" + val + ")";
	}
};

jQuery.fn.transformer = function(option) {
	jQuery.each(this,function() {
		tf = new Transformer(this,option);
		jQuery(this).data("transform",tf);
	});
};