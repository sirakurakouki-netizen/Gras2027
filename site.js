/* Games portal app: sidebar navigation, category pages, search, favorites,
   recently played, random game. Game catalog comes from games-data.js. */
(function () {
	"use strict";

	var GAMES = window.GAMES || [];
	var CATS = window.GAME_CATEGORIES || [];
	var byId = {};
	GAMES.forEach(function (g) { byId[g.id] = g; });

	var view = document.getElementById("view");
	var sideNav = document.getElementById("side-nav");
	if (!sideNav) return;

	/* On pages without the game view (e.g. tools.html) sidebar links point back to index. */
	var base = view ? "" : "index.html";

	/* ---------- storage ---------- */
	var FAV_KEY = "gras.favorites.v2";
	var RECENT_KEY = "gras.recent.v2";
	var RECENT_MAX = 8;

	function load(key) {
		try {
			var v = JSON.parse(localStorage.getItem(key));
			return Array.isArray(v) ? v.filter(function (id) { return byId[id]; }) : [];
		} catch (e) { return []; }
	}
	function save(key, list) {
		try { localStorage.setItem(key, JSON.stringify(list)); } catch (e) { /* ignore */ }
	}

	var favorites = load(FAV_KEY);
	var recent = load(RECENT_KEY);

	function isFavorite(id) { return favorites.indexOf(id) !== -1; }

	function toggleFavorite(id) {
		var i = favorites.indexOf(id);
		if (i === -1) favorites.unshift(id);
		else favorites.splice(i, 1);
		save(FAV_KEY, favorites);
		renderSidebarLists();
		Array.prototype.forEach.call(document.querySelectorAll('.fav-star[data-game="' + id + '"]'), function (btn) {
			btn.classList.toggle("active", isFavorite(id));
		});
	}

	function recordPlay(id) {
		var i = recent.indexOf(id);
		if (i !== -1) recent.splice(i, 1);
		recent.unshift(id);
		if (recent.length > RECENT_MAX) recent.length = RECENT_MAX;
		save(RECENT_KEY, recent);
	}

	function playUrl(game) {
		return game.external ? game.href : "play.html?g=" + encodeURIComponent(game.id);
	}

	/* ---------- cards ---------- */
	function makeCard(game) {
		var a = document.createElement("a");
		a.className = "card";
		a.href = playUrl(game);
		if (game.external) a.target = "_blank";

		var img = document.createElement("img");
		img.src = game.img;
		img.alt = game.name;
		img.loading = "lazy";
		a.appendChild(img);

		var overlay = document.createElement("span");
		overlay.className = "card-title";
		overlay.textContent = game.name;
		a.appendChild(overlay);

		var star = document.createElement("button");
		star.type = "button";
		star.className = "fav-star" + (isFavorite(game.id) ? " active" : "");
		star.dataset.game = game.id;
		star.title = "Add to favorites";
		star.innerHTML = window.iconSVG("star");
		star.addEventListener("click", function (e) {
			e.preventDefault();
			e.stopPropagation();
			toggleFavorite(game.id);
		});
		a.appendChild(star);

		a.addEventListener("click", function () { recordPlay(game.id); });
		return a;
	}

	function makeGrid(games) {
		var grid = document.createElement("div");
		grid.className = "games-grid";
		games.forEach(function (g) { grid.appendChild(makeCard(g)); });
		return grid;
	}

	function makeCarouselSection(cat, games) {
		var section = document.createElement("section");
		section.className = "cat-section";

		var head = document.createElement("div");
		head.className = "section-head";
		var h2 = document.createElement("h2");
		h2.innerHTML = window.iconSVG(cat.icon);
		h2.appendChild(document.createTextNode(" " + cat.name));
		head.appendChild(h2);
		var all = document.createElement("a");
		all.className = "view-all";
		all.href = "#c/" + cat.id;
		all.textContent = "View all (" + games.length + ") →";
		head.appendChild(all);
		section.appendChild(head);

		var row = document.createElement("div");
		row.className = "hrow";
		games.forEach(function (g) { row.appendChild(makeCard(g)); });
		section.appendChild(row);
		return section;
	}

	function gamesInCat(catId) {
		return GAMES.filter(function (g) { return g.cats.indexOf(catId) !== -1; });
	}

	/* ---------- views ---------- */
	function renderHome() {
		view.innerHTML = "";
		CATS.forEach(function (cat) {
			var games = gamesInCat(cat.id);
			if (games.length) view.appendChild(makeCarouselSection(cat, games));
		});
	}

	function renderCategory(catId) {
		var cat = null;
		CATS.forEach(function (c) { if (c.id === catId) cat = c; });
		if (!cat) { renderHome(); return; }
		var games = gamesInCat(catId);
		view.innerHTML = "";
		var h1 = document.createElement("h1");
		h1.className = "page-title";
		h1.innerHTML = window.iconSVG(cat.icon);
		h1.appendChild(document.createTextNode(" " + cat.name + " Games"));
		view.appendChild(h1);
		var sub = document.createElement("p");
		sub.className = "page-sub";
		sub.textContent = games.length + (games.length === 1 ? " game" : " games");
		view.appendChild(sub);
		view.appendChild(makeGrid(games));
	}

	function renderSearch(q) {
		var ql = q.toLowerCase();
		var games = GAMES.filter(function (g) { return g.name.toLowerCase().indexOf(ql) !== -1; });
		view.innerHTML = "";
		var h1 = document.createElement("h1");
		h1.className = "page-title";
		h1.innerHTML = window.iconSVG("search");
		h1.appendChild(document.createTextNode(" Results for “" + q + "”"));
		view.appendChild(h1);
		if (games.length) {
			var sub = document.createElement("p");
			sub.className = "page-sub";
			sub.textContent = games.length + (games.length === 1 ? " game" : " games");
			view.appendChild(sub);
			view.appendChild(makeGrid(games));
		} else {
			var none = document.createElement("p");
			none.className = "no-results";
			none.textContent = "No games match your search.";
			view.appendChild(none);
		}
	}

	/* ---------- sidebar ---------- */
	function sideLink(href, icon, label, id) {
		var a = document.createElement("a");
		a.className = "side-link";
		a.href = href;
		if (id) a.dataset.route = id;
		a.innerHTML = '<span class="side-icon">' + window.iconSVG(icon) + '</span><span>' + label + '</span>';
		return a;
	}

	function buildSidebar() {
		sideNav.innerHTML = "";

		var home = sideLink(view ? "#" : "index.html", "home", "Home", "home");
		if (view) {
			home.addEventListener("click", function (e) {
				e.preventDefault();
				if (searchInput) searchInput.value = "";
				if (window.location.hash) window.location.hash = "";
				render();
			});
		}
		sideNav.appendChild(home);

		var random = sideLink("#", "dice", "Random Game");
		random.addEventListener("click", function (e) {
			e.preventDefault();
			var game = GAMES[Math.floor(Math.random() * GAMES.length)];
			recordPlay(game.id);
			window.location.href = playUrl(game);
		});
		sideNav.appendChild(random);

		var favBlock = document.createElement("div");
		favBlock.className = "side-block";
		favBlock.innerHTML = '<h3>' + window.iconSVG("star") + ' Favorites</h3><div class="side-list" id="side-favs"></div>';
		sideNav.appendChild(favBlock);

		var recentBlock = document.createElement("div");
		recentBlock.className = "side-block";
		recentBlock.innerHTML = '<h3>' + window.iconSVG("clock") + ' Recently Played</h3><div class="side-list" id="side-recent"></div>';
		sideNav.appendChild(recentBlock);

		var catBlock = document.createElement("div");
		catBlock.className = "side-block";
		catBlock.innerHTML = "<h3>Categories</h3>";
		CATS.forEach(function (cat) {
			catBlock.appendChild(sideLink(base + "#c/" + cat.id, cat.icon, cat.name, "c/" + cat.id));
		});
		sideNav.appendChild(catBlock);

		var aboutBlock = document.createElement("div");
		aboutBlock.className = "side-block";
		aboutBlock.appendChild(sideLink("tools.html", "info", "About / Tools"));
		sideNav.appendChild(aboutBlock);

		renderSidebarLists();
	}

	function renderSidebarLists() {
		fillSideList("side-favs", favorites, "Hover a game and hit the star");
		fillSideList("side-recent", recent, "Games you play show up here");
	}

	function fillSideList(elId, ids, emptyHint) {
		var el = document.getElementById(elId);
		if (!el) return;
		el.innerHTML = "";
		if (!ids.length) {
			var hint = document.createElement("p");
			hint.className = "side-hint";
			hint.textContent = emptyHint;
			el.appendChild(hint);
			return;
		}
		ids.slice(0, 6).forEach(function (id) {
			var game = byId[id];
			var a = document.createElement("a");
			a.className = "side-game";
			a.href = playUrl(game);
			if (game.external) a.target = "_blank";
			a.innerHTML = '<img src="' + game.img + '" alt="" loading="lazy"><span>' + game.name + '</span>';
			a.addEventListener("click", function () { recordPlay(game.id); });
			el.appendChild(a);
		});
	}

	function setActiveRoute(route) {
		Array.prototype.forEach.call(sideNav.querySelectorAll(".side-link[data-route]"), function (a) {
			a.classList.toggle("active", a.dataset.route === route);
		});
	}

	/* ---------- routing ---------- */
	var searchInput = document.getElementById("game-search");

	function render() {
		if (!view) return;
		var q = searchInput ? searchInput.value.trim() : "";
		if (q) {
			renderSearch(q);
			setActiveRoute("");
			return;
		}
		var hash = window.location.hash.replace(/^#/, "");
		if (hash.indexOf("c/") === 0) {
			renderCategory(hash.slice(2));
			setActiveRoute(hash);
		} else {
			renderHome();
			setActiveRoute("home");
		}
		window.scrollTo(0, 0);
	}

	window.addEventListener("hashchange", function () {
		if (searchInput && searchInput.value) searchInput.value = "";
		render();
	});

	if (searchInput) {
		searchInput.addEventListener("input", render);
		document.addEventListener("keydown", function (e) {
			if (e.key === "/" && document.activeElement !== searchInput) {
				e.preventDefault();
				searchInput.focus();
			}
		});
	}

	/* ---------- mobile sidebar toggle ---------- */
	var menuBtn = document.getElementById("menu-toggle");
	var sidebar = document.getElementById("sidebar");
	if (menuBtn && sidebar) {
		menuBtn.addEventListener("click", function () {
			sidebar.classList.toggle("open");
		});
		sidebar.addEventListener("click", function (e) {
			if (e.target.closest("a")) sidebar.classList.remove("open");
		});
	}

	buildSidebar();
	render();
})();
