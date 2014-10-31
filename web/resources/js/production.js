/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var Utils  = __webpack_require__(1);
	var Furniture  = __webpack_require__(2);
	var welcome = __webpack_require__(3);
	var rootRef = new Firebase(Utils.urls.root);
	var furnitureRef = new Firebase(Utils.urls.furniture);

	/*
	* Application Module
	*
	* This is the main module that initializes the entire application.
	*/

	var app = {

	  // REGISTER ELEMENTS
	  $welcome: null,
	  $app: null,
	  $signInButtons: null,
	  $alert: null,
	  $signOutButton: null,

	  // HIDE / SHOW WELCOME SCREEN
	  showWelcomeScreen: function(){
	    this.$welcome.removeClass("is-hidden");
	    this.$app.addClass("is-hidden");
	  },

	  hideWelcomeScreen: function(){
	    this.$welcome.addClass("is-hidden");
	    this.$app.removeClass("is-hidden");
	  },

	  /*
	  * Initalize the application
	  *
	  * Get intials dump of Firebase furniture data.
	  */

	  init: function() {
	    var self = this;
	    // REGISTER ELEMENTS
	    this.$welcome = $("#welcome");
	    this.$app = $("#app");
	    this.$signInButtons = $(".welcome-hero-signin");
	    this.$alert = $(".alert");
	    this.$signOutButton = $(".toolbar-sign-out");

	    welcome.init();                 // SET UP HOME PAGE
	    this.logout();                  // SET UP LOGOUT FUNCTIONALITY
	    this.checkUserAuthentication(); // SET AUTH LISTENER
	    this.renderFurniture();         // RENDER FURNITURE
	  },

	  createFurniture: function(snapshot) {
	    snapshot.forEach(function(childSnapshot) {
	      new Furniture(childSnapshot);
	    });
	  },

	  removeFurniture: function(snapshot){
	    // TODO: add method to remove furniture
	  },

	  checkUserAuthentication: function(){
	    var self = this;

	    rootRef.onAuth(function(authData){
	      if (authData) {
	        self.hideWelcomeScreen();
	      }
	      else {
	        self.showWelcomeScreen();
	      }
	    });
	  },

	  renderFurniture: function(){
	    var self = this;

	    furnitureRef.once("value", function(snapshot){
	      self.createFurniture(snapshot);
	    });

	    // furnitureRef.on("child_added", function(snapshot){
	    //   self.createFurniture(snapshot);
	    // });

	    // furnitureRef.on("child_removed", function(snapshot){
	    //   self.removeFurniture(snapshot);
	    // });
	  },

	  logout: function(){
	    // SETUP LOGOUT BUTTON
	    this.$signOutButton.on("click", function(e){
	      rootRef.unauth();
	    });
	  }

	};


	/*
	* Initialize App
	*
	*/

	$(document).ready(function() {
	  app.init();
	});


	/*
	* Export App
	*
	*/

	module.exports = app;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/*
	* Helper
	*
	*/

	var root = 'https://mover-app-5000-demo.firebaseio.com/';

	var utils = {
	  urls: {
	    root: root,
	    furniture: root + 'furniture/',
	    background: root + 'background/'
	  }
	};

	module.exports = utils;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var utils  = __webpack_require__(1);
	var furnitureRef = new Firebase(utils.urls.furniture);

	/*
	* FURNITURE MODULES
	*
	* This is a furniture class and must be instaniated like
	* a normal class with the "new" keyword.
	*/

	var Furniture = function(snapshot, options) {
	  options = options || {};
	  var self = this;
	  var data = snapshot.val();
	  var element = "<div class='furniture'></div>";
	  var tooltip = "<div class='tooltip'>" +
	                  "<button class='edit is-hidden'>Edit</button>" +
	                  "<button class='rotate'>Rotate</button>" +
	                  "<button class='delete'>Delete</button>" +
	                "</div>";

	  /*
	  * Register Furniture Values
	  *
	  */

	  this.officeSpace = $('#office-space');
	  this.element = $(element + tooltip);
	  this.id = snapshot.name();
	  this.ref = snapshot.ref();
	  this.type = data.type;
	  this.locked = data.locked;
	  this.rotation = data.rotation;
	  this.top = data.top;
	  this.left = data.left;
	  this.name = data.name;


	  /*
	  * Create Firebase Reference
	  *
	  */

	  this.ref  = new Firebase(utils.urls.furniture + this.id);

	  this.ref.on("value", function(snap){

	    // UPDATE Furniture INSTANCE WITH MOST RECENT DATA
	    var state = snap.val();
	    _.extend(self, state);

	    // RENDER
	    self.render();
	  });

	  this.render = function(){

	    // REMOVE ELEMENT FROM DOM
	    this.element.detach();

	    // SET CURRENT LOCATION
	    this.element.css({
	      "top": parseInt(this.top, 10),
	      "left": parseInt(this.left, 10)
	    });

	    // SET ACTIVE STATE
	    if (this.locked){
	      this.element.addClass("is-active");
	    }
	    else {
	      this.element.removeClass("is-active");
	    }

	    // ADD TO DOM
	    this.officeSpace.append(this.element);
	  };

	  /*
	  * Create Furniture Method
	  *
	  */

	  this.initElement = function() {

	    //SET DRAG OPTIONS
	    this.element.draggable({
	      containment: self.officeSpace,
	      start: function(event, ui){
	        self.element.addClass("is-active");
	        self.ref.child("locked").set(true);
	      },

	      drag: function(event, ui){
	        self.ref.child("left").set(ui.position.left);
	        self.ref.child("top").set(ui.position.top);
	      },

	      stop: function(event, ui){
	        self.element.removeClass("is-active");
	        self.ref.child("locked").set(false);
	      }
	    });

	    // SET IMAGE FOR ELEMENT
	    this.element.addClass(this.type);

	    this.element.on("click", function(e){
	      // delegate the event to the body
	      e.preventDefault();
	      console.log("clicked")
	      // $(this).append("<a href='#' title="\<button\>LOL\<button\>"></a>");
	    });

	    // RENDER 
	    this.render();
	  };


	  /*
	  * Create Furniture Element
	  *
	  */

	  this.initElement();
	};

	module.exports = Furniture;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var utils  = __webpack_require__(1);
	var rootRef = new Firebase(utils.urls.root);

	/*
	* Welcome module
	*
	* This is the module that sets up the welcome page and Google login
	*/


	var welcome = {

	  $alert: null,
	  $signInButtons: null,

	  init: function(){
	    var self = this;

	    this.$alert = $(".alert");
	    this.$signInButtons = $(".welcome-hero-signin");

	    // SETUP LOGIN BUTTON
	    this.$signInButtons.on("click", function(e){
	      var provider = $(this).data("provider");

	      rootRef.authWithOAuthPopup(provider, function(error, authData){
	        if (error){
	          self.$alert.removeClass("is-hidden");
	        }
	        else {
	          self.$alert.addClass("is-hidden");
	        }
	      });
	    });

	  }
	};

	module.exports = welcome;

/***/ }
/******/ ])