// ==UserScript==
// @name        2ch-Gallery
// @namespace   dot.noisu
// @include     https://2ch.hk/*/res/*
// @include     https://2ch.pm/*/res/*
// @version     1.5
// @grant       none
// ==/UserScript==

// TODO: create an image for preload icon
// TODO: draw a texture for wrapper

var Gallery_resources = {
	css: "#gallery-wrapper { \
		position: fixed; \
		z-index: 100; \
		top: 0; \
		right: 0; \
		bottom: 0; \
		left: 0; \
		min-height : 700px; \
		background-color: #333; \
		background-image: url('resource://pdf.js/web/images/texture.png'); \
		overflow-y: auto; \
	} \
	#gallery-player { \
		display: none; \
		height: 100%; \
		margin: auto; \
	} \
	#gallery-header { \
		position: fixed; \
		width: 100%; \
		height: 40px; \
		box-sizing: border-box; \
		padding: 4px 20px; \
		box-shadow: 0 0 5px #111; \
		background-color: inherit; \
		background-image: inherit; \
		z-index: 2; \
	} \
	.header-button { \
		display: inline-block; \
		width: 30px; \
		height: 30px; \
		border: solid 1px #222; \
		border-radius: 4px; \
		cursor: pointer; \
		margin: 0 2px; \
	} \
	.header-button.checked { \
		background-color: rgba(0,0,0,0.3); \
	} \
	#gallery-main { \
		position: absolute; \
		top: 38px; \
		bottom: 150px; \
		width: 100%; \
		background-size: contain; \
		background-repeat: no-repeat; \
		background-position: center; \
	} \
	#gallery-footer { \
		display: block; \
		margin: 0 auto; \
		padding: 0 10px; \
		margin-top: 40px; \
		width: 1200px; \
		overflow-x: auto; \
		overflow-y: hidden; \
	} \
	#gallery-footer.bottom { \
		position: absolute; \
		padding: 0; \
		padding-top: 5px; \
		height: 150px; \
		width: 100%; \
		bottom: 0px; \
		white-space: nowrap; \
		background-color: inherit; \
		background-image: inherit; \
		box-shadow: 0 0 5px #111; \
	} \
	.gallery-preview { \
		display: inline-block; \
		margin-bottom: -4px; \
		height: 150px; \
		width: 150px; \
		background-size: cover; \
		background-position: center; \
	} \
	.type-preview { \
		position: absolute; \
		cursor: auto; \
		width: 150px; \
		height: 150px; \
		font-size: 2em; \
		color: #FFF; \
		text-shadow: 0 0 2px #000; \
		line-height: 150px; \
		text-align: center; \
	} \
	#gallery-ctrl-btn { \
		background-color: #444; \
		position: fixed; \
		z-index: 101; \
		width: 30px; \
		height: 30px; \
		top: 5px; \
		right: 20px; \
	} \
	#gallery-ctrl-btn.checked { \
		background-color: rgba(0,0,0,0.3); \
	} \
	#gallery-ctrl-btn svg { \
		transition: 300ms; \
	} \
	#gallery-ctrl-btn.checked svg { \
		transform: rotate(45deg); \
	} \
	#preload-icon { \
		display: none; \
		position: absolute; \
		width: 50px; \
		height: 50px; \
		z-index: 50; \
		top: 50%; \
		left: 50%; \
		margin: -25px 0px 0px -25px; \
		background: magenta; \
	} \
	#preload-icon.show { \
		display: block; \
		animation: 300ms linear 0s normal none infinite running loading; \
	} \
	@keyframes loading { \
			from {transform: rotate(0deg);} \
			to {transform: rotate(90deg);} \
	}",

	inner_html: '<div id="gallery-header"></div><div id="gallery-main">\
	<video id="gallery-player" controls="1" loop="1"></video></div>\
	<div id="gallery-footer" class="bottom"></div><div id="preload-icon"><div>\n',

	ctrl_btn_svg: '<svg width="30" height="30">\
	<rect height="2" width="15" x="7.5" y="14" style="fill:#bbb;"/>\
	<rect height="15" width="2" x="14" y="7.5" style="fill:#bbb;"/></svg>',

	small_prevs_only_icon_svg: '<svg width="30" height="30"><g fill="#bbb" transform="translate(0 -1022.4)">\
	<rect id="rect4150" height="4" width="4" y="1039.9" x="7.5"/>\
	<rect id="rect4150-2" height="4" width="4" y="1039.9" x="18.5"/>\
	<rect id="rect4150-7" height="4" width="4" y="1039.9" x="13"/>\
	<rect id="rect4150-75" height="4" width="4" y="1035.4" x="7.5"/>\
	<rect id="rect4150-2-4" height="4" width="4" y="1035.4" x="18.5"/>\
	<rect id="rect4150-7-1" height="4" width="4" y="1035.4" x="13"/>\
	<rect id="rect4150-70" height="4" width="4" y="1030.9" x="7.5"/>\
	<rect id="rect4150-2-1" height="4" width="4" y="1030.9" x="18.5"/>\
	<rect id="rect4150-7-4" height="4" width="4" y="1030.9" x="13"/></g></svg>',

	large_preview_icon_svg: '<svg width="30" height="30"><g fill="#bbb" transform="translate(-30 -1022.4)">\
	<rect id="rect4150-759" height="4" width="4" y="1039.9" x="37.5"/>\
	<rect id="rect4150-2-2" height="4" width="4" y="1039.9" x="48.5"/>\
	<rect id="rect4150-7-12" height="4" width="4" y="1039.9" x="43"/>\
	<rect id="rect4150-70-6" height="8" width="15" y="1030.9" x="37.374"/></g></svg>'
};

var Gallery = {
	pics: [],
	current_index: 0,
	is_visible: false,
	preload_img: new Image(),

	init: function() {
		var styles = document.createElement('style');
		styles.innerHTML = Gallery_resources.css;
		document.head.appendChild(styles);

		this.main_wrap = document.createElement('div');
		this.main_wrap.id = 'gallery-wrapper';
		this.main_wrap.style.display = 'none';
		this.main_wrap.innerHTML = Gallery_resources.inner_html;

		this.ctrl_btn = document.createElement('div');
		this.ctrl_btn = document.createElement('div');
		this.ctrl_btn.innerHTML = Gallery_resources.ctrl_btn_svg;
		this.ctrl_btn.id = 'gallery-ctrl-btn';
		this.ctrl_btn.className = 'header-button';
		this.ctrl_btn.addEventListener('click', function() {
			Gallery.toggle();
		}, 'false');

		document.body.appendChild(this.main_wrap);
		document.body.appendChild(this.ctrl_btn);

		// TODO: set the proper name for these two buttons
		var button1 = document.createElement('div');
		button1.id = "mode0";
		button1.className = 'header-button';
		button1.innerHTML = Gallery_resources.small_prevs_only_icon_svg;
		button1.addEventListener('click', function() {
			Gallery.toggleMode(0);
		});
		var button2 = document.createElement('div');
		button2.id = "mode1";
		button2.className = 'header-button checked';
		button2.innerHTML = Gallery_resources.large_preview_icon_svg;
		button2.addEventListener('click', function() {
			Gallery.toggleMode(1);
		});

		var header = document.getElementById("gallery-header");
		header.appendChild(button1);
		header.appendChild(button2);

		this.player = document.getElementById("gallery-player");
		this.footer = document.getElementById("gallery-footer");
		this.preload_icon = document.getElementById("preload-icon");
		this.player.volume = 0.1;
	},

	toggle: function() {
		if (!this.is_created) {
			this.create();
			this.is_created = true;

			document.addEventListener('keydown', function(e) {
				var used_keys = [37, 39];
				if (!Gallery.is_visible || used_keys.indexOf(e.keyCode) === -1)
					return;

				switch (e.keyCode) {
					case 37:
						Gallery.showImage(Gallery.current_index - 1);
						break;
					case 39:
						Gallery.showImage(Gallery.current_index + 1);
						break;
				}
				e.preventDefault();
			}, 'false');
		}

		if (this.is_visible) {
			this.player.pause();

			this.ctrl_btn.classList.toggle('checked');
			this.main_wrap.style.display = 'none';
			this.is_visible = false;
		}
		else {
			this.ctrl_btn.classList.toggle('checked');
			this.main_wrap.style.display = 'block';
			this.is_visible = true;
		}
	},

	toggleMode: function(mode) {
		var th = document.getElementById('gallery-main');
		var foo = document.getElementById('gallery-footer');

		switch(mode) {
			case 0:
				foo.classList.remove('bottom');
				th.style.display = 'none';
				document.getElementById("mode0").classList.add("checked");
				document.getElementById("mode1").classList.remove("checked");
				break;
			case 1:
				foo.classList.add('bottom');
				th.style.display = 'block';
				document.getElementById("mode1").classList.add("checked");
				document.getElementById("mode0").classList.remove("checked");
				break;
		}
	},

	create: function() {
		var thumbs = document.getElementsByClassName('preview');

		for (var i = 0, len = thumbs.length; i < len; ++i)
			this.addPreview(thumbs[i]);

		if (this.pics.length != 0)
			this.showImage(0);
	},

	addPreview: function(thumb_obj) {
		var preview_src = thumb_obj.src;
		var main_src = thumb_obj.parentNode.href;

		if (!preview_src || !main_src)
			return 1;

		if (this.pics.indexOf(main_src) != -1)
			return;

		var new_icon = document.createElement('a');
		new_icon.className = "gallery-preview";
		new_icon.id = this.pics.length;
		new_icon.style.backgroundImage = 'url("' + preview_src + '")';
		new_icon.href = main_src;

		var ext = main_src.match(/\w+$/)[0];
		var special_type = ["webm", "gif"].indexOf(ext);
		if (special_type != -1) {
			var type_label = document.createElement('div');
			type_label.className = 'type-preview';
			type_label.innerHTML = ["webm", "gif"][special_type];
			new_icon.appendChild(type_label);
		}

		new_icon.addEventListener('click', function(e) {
			var a = parseInt(this.id);
			Gallery.showImage(a);
			e.preventDefault();
		}, 'false');

		this.footer.appendChild(new_icon);
		this.pics.push(main_src);
	},

	showImage: function(id) {
		if (id < 0 || id >= this.pics.length)
			id = 0

		this.current_index = id;
		this.toggleMode(1);

		var th = document.getElementById('gallery-main');

		this.player.pause();
		th.style.backgroundImage = 'none';

		if (this.pics[id].endsWith('.webm')) {
			Gallery.preload_icon.classList.remove('show');
			this.player.style.display = 'block';
			this.player.src = this.pics[id];
			this.player.play();
		}
		else {
			this.preload_icon.classList.add('show');
			this.player.style.display = 'none';

			this.preload_img.onload = function() {
				Gallery.preload_icon.classList.remove('show');
				th.style.backgroundImage = 'url(' + this.src + ')';
			}
			this.preload_img.src = this.pics[id];
		}

		this.footer.scrollLeft = 150 * id - document.body.clientWidth / 2 + 75;
	}
};


window.addEventListener("DOMContentLoaded",Gallery.init(), "false");
