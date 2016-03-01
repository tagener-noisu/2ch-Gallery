// ==UserScript==
// @name        2ch-Gallery
// @namespace   dot.noisu
// @include     https://2ch.hk/*/res/*
// @include     https://2ch.pm/*/res/*
// @version     1.3
// @grant       none
// ==/UserScript==

var Gallery = Gallery || {};

Gallery.pics = []
Gallery.current_index = 0;
Gallery.is_visible = false;
Gallery.is_created = false;
Gallery.preload_img = new Image();

Gallery.css = "#gallery-wrapper { \
	position: fixed; \
	z-index: 100; \
	top: 0; \
	right: 0; \
	bottom: 0; \
	left: 0; \
	min-height : 700px; \
	background-color: #000; \
} \
#gallery-player { \
	display: none; \
	height: 100%; \
	margin: auto; \
} \
#gallery-main { \
	width: 100%; \
	height: 80%; \
	background-color: #000; \
	background-size: contain; \
	background-repeat: no-repeat; \
	background-position: center; \
} \
#gallery-footer { \
	height: 20%; \
	width: 100%; \
	overflow-x: auto; \
	overflow-y: hidden; \
	white-space: nowrap; \
} \
.gallery-preview { \
	height: 100%; \
	width: 200px; \
	background-size: cover; \
	background-position: center; \
	display: inline-block; \
} \
#gallery-ctrl-btn { \
	transition: 300ms; \
	position: fixed; \
	display: inline-block; \
	z-index: 101; \
	width: 50px; \
	height: 50px; \
	top: 40px; \
	right: 40px; \
} \
#gallery-ctrl-btn.loading { \
	animation: loading 400ms infinite linear; \
} \
@keyframes loading { \
    from {transform: rotate(0deg);} \
    to {transform: rotate(90deg);} \
}";


Gallery.init = function() {
	var styles = document.createElement('style');
	styles.innerHTML = this.css;
	document.head.appendChild(styles);

	this.main_wrap = document.createElement('div');
	this.main_wrap.id = 'gallery-wrapper';
	this.main_wrap.style.display = 'none';

	this.main_wrap.innerHTML = '<div id="gallery-main">\
						<video id="gallery-player" controls="1" loop="1"></video></div>\
						<div id="gallery-footer"></div>\n';

	this.ctrl_btn = document.createElement('div');
	this.ctrl_btn = document.createElement('div');
	this.ctrl_btn.innerHTML = '<svg width="50" height="50">\
		<circle cx="25" cy="25" r="24" style="fill:white;stroke:#CCC;stroke-width:1;"/>\
		<rect height="2" width="20" x="15" y="24" style="fill:black;"/>\
		<rect height="20" width="2" x="24" y="15" style="fill:black;"/></svg>';
	this.ctrl_btn.id = 'gallery-ctrl-btn';

	document.body.appendChild(this.main_wrap);
	document.body.appendChild(this.ctrl_btn);
	this.player = document.getElementById("gallery-player");
	this.footer = document.getElementById("gallery-footer");

	this.ctrl_btn.addEventListener('click', function() {
		Gallery.toggleGallery();
	}, 'false');
};


Gallery.toggleGallery = function() {
	if (!this.is_created) {
        this.createGallery();
        this.is_created = true;
		
		window.addEventListener('keydown', function(e) {
			if (!Gallery.is_visible) 
				return;
			if (e.keyCode === 37)
				Gallery.makeMeSuffer(Gallery.current_index - 1);
			else if (e.keyCode === 39)
				Gallery.makeMeSuffer(Gallery.current_index + 1);

			e.preventDefault();
		}, 'false');
	}

	if (this.is_visible) {
		this.player.pause();

		this.ctrl_btn.style.transform = 'rotate(0deg)';
		this.main_wrap.style.display = 'none';
		this.is_visible = false;
	}
	else {
		this.ctrl_btn.style.transform = 'rotate(45deg)';
		this.main_wrap.style.display = 'block';
		this.is_visible = true;
	}
};


Gallery.createGallery = function() {
	var thumbs = document.getElementsByClassName('preview');

	for (var i = 0, len = thumbs.length; i < len; ++i)
		this.galleryAddPicture(thumbs[i]);

	if (this.pics.length != 0)
		this.makeMeSuffer(0);
};


Gallery.galleryAddPicture = function(thumb_obj) {
	var preview_src = thumb_obj.src;
	var main_src = thumb_obj.parentNode.href;

	if (!preview_src || !main_src)
		return 1;

	if (this.pics.indexOf(main_src) != -1)
		return;

	var new_icon = document.createElement('a');
	new_icon.className = "gallery-preview";
	new_icon.id = this.pics.length;
	new_icon.style.backgroundImage = 'url(' + preview_src + ')';
	new_icon.href = main_src;

	new_icon.addEventListener('click', function(e) {
		var a = parseInt(this.id);
		Gallery.makeMeSuffer(a);
		e.preventDefault();
	}, 'false');

	this.footer.appendChild(new_icon);
	this.pics.push(main_src);
};


Gallery.makeMeSuffer = function(id) {
	if (id < 0 || id >= this.pics.length)
		id = 0

	this.current_index = id;

	var th = document.getElementById('gallery-main');

	this.player.pause();
	th.style.backgroundImage = 'none';
	
	if (this.pics[id].endsWith('.webm')) {
		this.player.style.display = 'block';
		this.player.src = this.pics[id];
		this.player.play();
	}
	else {
		this.ctrl_btn.className = 'loading';
		this.player.style.display = 'none';

		this.preload_img.onload = function() {
			Gallery.ctrl_btn.className = '';
			th.style.backgroundImage = 'url(' + this.src + ')';
		}
		this.preload_img.src = this.pics[id];
	}

	this.footer.scrollLeft = 200 * id - 40;
};


window.addEventListener("DOMContentLoaded",Gallery.init(), "false");
