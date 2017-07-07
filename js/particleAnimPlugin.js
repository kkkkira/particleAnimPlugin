
//particles-animation plugin

function ParticleAnim () {
	//this 指向实例，在这里只是为了传值，而无须在显示的调用init函数去初始化
	// 所以是实例的init借用了原型的方法
	this.init.apply(this, arguments);
}

ParticleAnim.prototype = {
	constructor: ParticleAnim,


	//types属于原型对象
	types:{
		'base': {
			collsion: function ( obj,mouse ) {
				var _self = this,
					parts = obj,
					num = obj.length,
					mx = mouse.x,
					my = mouse.y,
					i = 0,
					dix, diy;

				for (i; i < length; i++) {
					dix = mx - parts[i].x;
					diy = my - parts[i].y;
					
					//范围也是可以传入的值
					if (dix < 50 && dix > -50 && parts[i].r < 35 && diy < 50 && diy > -50) {
						parts[i].r += 2;
					}
					else if ((dix >= 50 && parts[i].or < parts[i].r) || 
							(dix <= -50 && parts[i].or < parts[i].r) || 
							(diy >= 50 && parts[i].or < parts[i].r) || 
							(diy <= -50 && parts[i].or < parts[i].r)) {

						parts[i].r -= 2; 
					}

					_self.draw();
				}
			},

			animRules: function ( obj, canvas ) {
				var _self = this,
					parts = obj,
					num = obj.length,
					width = canvas.width,
					height = canvas.height,
					i = 0;
				//set the velocity and make the circle move
				for (i; i < num; i++) {
				//arrive the border
					if(parts[i].x + parts[i].r >= width || parts[i].x - parts[i].r <= 0)
					{
						parts[i].vx = -parts[i].vx;
					}
					if(parts[i].y + parts[i].r >= height || parts[i].y - parts[i].r <= 0)
					{
						parts[i].vy = -parts[i].vy;
					}
					parts[i].x += parts[i].vx;
					parts[i].y += parts[i].vy;
				}		
			},

			draw: function ( obj, ctx ) {
				var _self = this,
					parts = obj,
					num = obj.length,
					i = 0;
				
				ctx.fillstyle = "#FF0000";

				for ( i = 0; i < num; i++ ) {
					ctx.save();
					ctx.beginPath();
					ctx.arc(parts[i].x, parts[i].y, parts[i].r, 0, 2*Math.PI, true);
					ctx.closePath();
					ctx.fill();
					ctx.restore();
				}
			}
		}
	},

	init: function ( id, obj ) {
		//这里的this指向实例
		// console.log(this);
		// init the options
		var defaultOptions = {
			num: 10,
			type: 'base',
			triggerEvent:'auto',
			height: window.innerHeight,
			width: window.innerWidth,
			r: 3,
			interval: 40,
			direction: .4
		};


		var partAttrs = {};

		var err = this.checkValues(obj);
		if ( !err.status ) {
			console.log(err.msg);
			return false;
		}


		// //merge  options and defaultOptions
		this.options = this.extend( defaultOptions, obj || {} );



		//set canvas' context and h/w
		this.canvas = document.getElementById(id);
		this.ctx = this.canvas.getContext('2d');
		this.canvas.height = this.options.height;
		this.canvas.width = this.options.width;	

		if (typeof this.options.type === 'object') {
			this.animType = this.options.type;
		}else{
			this.animType = this.types[this.options.type];
		}

		//set the particles & single particle's attrs
		this.particles = [];
		partAttrs = this.setBaseAttr( this.options );

		//create particles
		this.initParts( partAttrs, this.options );
		// console.log(this.particles);

		this.loopDraw();

	},

	//merge options and defaultOptions
	extend: function ( orr, target ) {
		for ( var attr in target ) {
			if ( target.hasOwnProperty(attr) ) {
				orr[attr]  = target[attr];
			}
		}

		return orr;
	},
	//create single part
	setBaseAttr: function (obj) {
		// body...
		var _self = this;

		var attr = {
			or: obj.r,
			r: obj.r,
			num: obj.num,
			direction: obj.direction
		};

		return attr;
	},

	initParts: function (obj, options) {
		var _self = this,
			attr = obj,
			width = options.width,
			height = options.height,
			i = 0;
		// console.log('this initParts function is direct: ');
		// console.log(this);//指向particleAnim
		
		function createParts() {
			// console.log('this createParts function is direct: ');
			// console.log(this);//指向window
			//console.log(_self);//指向particleAnim
			var o = {
				x : Math.floor(Math.random() * width),
				y : Math.floor(Math.random() * height),
				r : Math.floor(Math.random() * attr.r) + 1,
				dirt : Math.random()
			};


			if (o.dirt < attr.direction ) {
				o.vx = -Math.random();
				o.vy = Math.random();
			}else{
				o.vx = Math.random();
				o.vy = -Math.random();
			}
			
			return o;
		}

		for(i; i < attr.num; i++) {
			this.particles.push( createParts() );
		}

	},

	loopDraw: function () {
		var _self = this;

		window.requestAnimationFrame(this.loopDraw.bind(this));
		this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height);
		this.render( this.particles, this.animType );
	},

	render: function ( obj, animType ) {
		var parts = obj,
			collsion = animType.collsion,
			move = animType.animRules,
			drawParts = animType.draw;

		

			move( parts, this.canvas );
			drawParts( parts, this.ctx );	
	},


	//check whether custom values are standardized
	checkValues: function (obj) {
		var err = {
			status: true,
			msg: ''
		};

		if (obj.type) {
			err = this.checkTypeValues(obj.type);
		}

		return err;		
	},


	checkTypeValues: function (type) {
		var err = {
				status: true,
				msg: ''
			},
			attr;

		if ( !(typeof type === 'string' || typeof type === 'object') ) {
			err.status = false;
			err.msg = 'the type is not string Or is object';
			return err;
		}

		if ( typeof type ==='string' && type !== '' ) {
			return err;
		}else if ( typeof type ==='string' && type !== '' ){
			err.status = false;
			err.msg = 'the type is not object Or is empty string';
			return err;
		}	

		//check whether the options.type has own prototype functions: [collsion,animRules,draw]
		if (this.isEmptyObject(type)) {
			err.status = false;
			err.msg = 'the type is empty object';
			return err;
		}else{
			for( attr in type){
				if(! (type.hasOwnProperty(attr) && (typeof type[attr] === 'function') ) ){
					err.status = false;
					err.msg = 'the type.' + attr + ' is undefined or the type.' + attr + ' is not a function';
					return err;
				}
			}
		}

		//if options is correct ,return true
		return err;
	},

	isEmptyObject: function (obj) {
		for (var key in obj){
			return false;
		}
		return true;
	},

	onMouseMove: function () {

	}
}