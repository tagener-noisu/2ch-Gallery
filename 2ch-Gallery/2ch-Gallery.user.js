// ==UserScript==
// @name        2ch-Gallery
// @namespace   dot.noisu
// @include     https://2ch.pm/*/res/*
// @include     https://2ch.hk/*/res/*
// @version     1.1
// @grant       none
// ==/UserScript==

// tagener-noisu / 2015

var pics = []
var current_pos = 0;
var is_visible = false;
var is_created = false;

var gallery_css = "#gallery-wrapper { \
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
#theater { \
	width: 100%; \
	height: 80%; \
	background-color: #000; \
	background-size: contain; \
	background-repeat: no-repeat; \
	background-position: center; \
} \
#prev2ch { \
	height: 20%; \
	width: 100%; \
	overflow-x: auto; \
	overflow-y: hidden; \
	white-space: nowrap; \
} \
.g-preview { \
	height: 100%; \
	width: 200px; \
	background-size: cover; \
	background-position: center; \
	display: inline-block; \
} \
#menu-btn { \
	transition: 300ms; \
	position: fixed; \
	z-index: 101; \
	height: 64px; \
	width: 64px; \
	top: 40px; \
	right: 40px; \
	background: url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABA\
		CAYAAACqaXHeAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3\
		RJTUUH3wgNBSwk7l/a0gAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBk\
		LmUHAAACSklEQVR42u2bsUoDQRCG/zGdaHOBVAGtAoJFKskLKIi1jyBo41tYCdZWeYHUQY\
		gvEKxSSIRUEdIo5BrFSv1tVggSk90zd97O7l/v7d18O7s3szsLREVFRQUsKeIlJPcAtAA0\
		ATQA1AFUAaybJm8ApgAmAEYABgD6InLnLVmShyTbJJ+YXU+mj0OfDD8nOeTqNSR5XmbDT0\
		iOmb/GJE/KZPguyR6LV4/kbhlG/Z3/p/d/8waSlyyPLos2vs3yqR2y8cVAKJnbFzsdzILn\
		i6wXRrH91ZnwtOJJPPYBoCki98sarll2eOWR8TDfemXTcM3G9QHse5iO7NtMBbEAMAaw5W\
		lO9igi25k9wCQfuRmfJAmSJMkTwNayBGrZFDhVsOdxmgmAycF3FADYWbSfsMgDjhXtfB1n\
		AXCkCMCREwCzh1dTBKBmbLL2gJbCDeCWC4CmQgBNFwANhQAaLgDqCgHUXQBUFQKoWucCJD\
		8cMsW5IW5eStM066OfIlLJmg6r1W8e8AJgI++Xf3vKH0bVRa8ismnrAVOFgz11WQQnCgFM\
		XACMFAIYuQAYKAQwcAHQVwigbw3AVGY8KzL++bdqk0VxQFcRgK7TfoBRRxGAjjMAEbkB8K\
		DA+Adji7MHAMB1nl+WpmkRUeC1cyj8IyweI9SDEaMLj91/6bfbng734N/54K2IHKwKQNjH\
		46ajM49G/8zGeGcFXSIzAyHcIqmSQ2gXOsmCLpScgRBuqezsLzLYYuk53hBeufwcEGFemJ\
		gDwosrM/HSVFRUVFTI+gI6IznSGHRk1gAAAABJRU5ErkJggg==\'); \
} \
#menu-btn.loading { \
	animation: loading 600ms infinite; \
} \
@keyframes loading { \
    from {transform: rotate(0deg);} \
    to {transform: rotate(90deg);} \
}";


document.addEventListener("DOMContentLoaded", function(e) {
  var styles = document.createElement('style');
	styles.innerHTML = gallery_css;
	document.head.appendChild(styles);

	var gallery = document.createElement('div');
	gallery.id = 'gallery-wrapper';
	gallery.style.display = 'none';

	gallery.innerHTML = '<div id="theater"><video id="gallery-player" controls="1" loop="1"></video></div>\
		<div id="prev2ch"></div>\n';

	var ctrl_btn = document.createElement('div');
	ctrl_btn.id = 'menu-btn';

	document.body.appendChild(gallery);
	document.body.appendChild(ctrl_btn);

  document.getElementById('menu-btn').onclick = function() {
		toggleGallery();
	}
});


function toggleGallery() {
	if (!is_created) {
        createGallery();
        is_created = true;

				window.addEventListener('keydown', function(e) {
					if (e.keyCode === 37)
						makeMeSuffer(current_pos - 1);
					else if (e.keyCode === 39)
						makeMeSuffer(current_pos + 1);
					e.preventDefault();
				}, 'false');
  }

  var wrapper = document.getElementById('gallery-wrapper');

  if (is_visible) {
		var player = document.getElementById('gallery-player');
		player.pause();

  	document.getElementById('menu-btn').style.transform = 'rotate(0deg)';
  	wrapper.style.display = 'none';
		is_visible = false;
	}
	else {
		document.getElementById('menu-btn').style.transform = 'rotate(45deg)';
		wrapper.style.display = 'block';
		is_visible = true;
	}
}


function createGallery() {
	var thumbs = document.getElementsByClassName('preview');

	for (var i = 0, len = thumbs.length; i < len; ++i)
		galleryAddPicture(thumbs[i]);

  if (pics.length != 0)
    makeMeSuffer(0);
}


function galleryAddPicture(thumb_obj) {
	var preview_src = thumb_obj.src;
	var main_src = thumb_obj.parentNode.href;
	var wrapper = document.getElementById('prev2ch');

	if (pics.indexOf(main_src) != -1)
		return;

	var new_icon = document.createElement('a');
	new_icon.className = "g-preview";
	new_icon.id = pics.length;
	new_icon.style.backgroundImage = 'url(' + preview_src + ')';
	new_icon.href = main_src;

	new_icon.onclick = function(e) { 
		var a = parseInt(this.id);
		makeMeSuffer(a);
		e.preventDefault();
	};

	wrapper.appendChild(new_icon);
	pics.push(main_src);
}


function makeMeSuffer(id) {
	if (id < 0 || id >= pics.length)
		id = 0

	current_pos = id;

	var th = document.getElementById('theater');
	var wrapper = document.getElementById('prev2ch');
	var img = new Image();

	var player = document.getElementById('gallery-player');
	player.pause();
	th.style.backgroundImage = 'none';
	
	if (pics[id].endsWith('.webm')) {
		player.style.display = 'block';
		player.src = pics[id];
		player.play();
	}
	else {
		document.getElementById('menu-btn').className = 'loading';
		player.style.display = 'none';

		img.onload = function() {
			document.getElementById('menu-btn').className = '';
			th.style.backgroundImage = 'url(' + this.src + ')';
		}
		img.src = pics[id];
	}

	wrapper.scrollLeft = 200 * id - 40;
}
