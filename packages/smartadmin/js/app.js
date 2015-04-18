SmartAdmin = SmartAdmin || {};

/*
 * APP CONFIGURATION (HTML/AJAX/PHP Versions ONLY)
 * Description: Enable / disable certain theme features here
 * GLOBAL: Your left nav in your app will no longer fire ajax calls, set
 * it to false for HTML version
 */

/*
 * The rate at which the menu expands revealing child elements on click
 */
var menu_speed = 235;
/*
 * Turn on JarvisWidget functionality
 * dependency: js/jarviswidget/jarvis.widget.min.js
 */
var enableJarvisWidgets = true;
/*
 * Warning: Enabling mobile widgets could potentially crash your webApp
 * if you have too many widgets running at once
 * (must have enableJarvisWidgets = true)
 */
var enableMobileWidgets = false;
/*
 * Turn on fast click for mobile devices
 * Enable this to activate fastclick plugin
 * dependency: js/plugin/fastclick/fastclick.js
 */
var fastClick = false;

var topmenu = false;
var thisDevice;
var ismobile = (/iphone|ipad|ipod|android|blackberry|mini|windows\sce|palm/i.test(navigator.userAgent.toLowerCase()));

var config = function() {
  /*
   * GLOBAL: Sound Config (define sound path, enable or disable all global sounds)
   */
  $.sound_path = "sound/";
  $.sound_on = true;
};

var addDeviceType = function() {
  if (!ismobile) {
    // Desktop
    $.root_.addClass("desktop-detected");
    thisDevice = "desktop";
    return false;
  } else {
    // Mobile
    $.root_.addClass("mobile-detected");
    thisDevice = "mobile";

    /*
    if (fastClick) {
      // Removes the tap delay in idevices
      // dependency: js/plugin/fastclick/fastclick.js 
      $.root_.addClass("needsclick");
      FastClick.attach(document.body);
      return false;
    }
    */
  }
};

var menuPos = function() {
  if ($.root_.hasClass("menu-on-top") || localStorage.getItem('sm-setmenu') == 'top') {
    topmenu = true;
    $.root_.addClass("menu-on-top");
  }
};


// ONLY BE AFTER CLIENT STARTUP
SmartAdmin.initApp = function() {
  $.root_ = $('body');
  $.intervalArr = [];
  config();

  addDeviceType();
  menuPos();
}

SmartAdmin.leftNav = function() {

  // INITIALIZE LEFT NAV
  if (!topmenu) {
    if (!null) {
      $('nav ul').jarvismenu({
        accordion: true,
        speed: menu_speed,
        closedSign: '<em class="fa fa-plus-square-o"></em>',
        openedSign: '<em class="fa fa-minus-square-o"></em>'
      });
    } else {
      alert("Error - menu anchor does not exist");
    }
  }

};

SmartAdmin.SmartActions = {

  // LOGOUT MSG 
  userLogout: function($this) {

    // ask verification
    $.SmartMessageBox({
      title: "<i class='fa fa-sign-out txt-color-orangeDark'></i> Logout <span class='txt-color-orangeDark'><strong>" +
        $('#show-shortcut').text() + "</strong></span> ?",
      content: $this.data('logout-msg') ||
        "You can improve your security further after logging out by closing this opened browser",
      buttons: '[No][Yes]'

    }, function(ButtonPressed) {
      if (ButtonPressed == "Yes") {
        $.root_.addClass('animated fadeOutUp');
        setTimeout(logout, 1000);
      }
    });

    function logout() {
      window.location = $this.attr('href');
    }

  },

  // RESET WIDGETS
  resetWidgets: function($this) {
    $.widresetMSG = $this.data('reset-msg');

    $.SmartMessageBox({
      title: "<i class='fa fa-refresh' style='color:green'></i> Clear Local Storage",
      content: $.widresetMSG || "Would you like to RESET all your saved widgets and clear LocalStorage?",
      buttons: '[No][Yes]'
    }, function(ButtonPressed) {
      if (ButtonPressed == "Yes" && localStorage) {
        localStorage.clear();
        location.reload();
      }

    });
  },

  // LAUNCH FULLSCREEN 
  launchFullscreen: function(element) {

    if (!$.root_.hasClass("full-screen")) {

      $.root_.addClass("full-screen");

      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      }

    } else {

      $.root_.removeClass("full-screen");

      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }

    }

  },

  // MINIFY MENU
  minifyMenu: function($this) {
    if (!$.root_.hasClass("menu-on-top")) {
      $.root_.toggleClass("minified");
      $.root_.removeClass("hidden-menu");
      $('html').removeClass("hidden-menu-mobile-lock");
      $this.effect("highlight", {}, 500);
    }
  },

  // TOGGLE MENU 
  toggleMenu: function() {
    if (!$.root_.hasClass("menu-on-top")) {
      $('html').toggleClass("hidden-menu-mobile-lock");
      $.root_.toggleClass("hidden-menu");
      $.root_.removeClass("minified");
    } else if ($.root_.hasClass("menu-on-top") && $.root_.hasClass("mobile-view-activated")) {
      $('html').toggleClass("hidden-menu-mobile-lock");
      $.root_.toggleClass("hidden-menu");
      $.root_.removeClass("minified");
    }
  },

  // TOGGLE SHORTCUT 
  toggleShortcut: function() {

    if (shortcut_dropdown.is(":visible")) {
      shortcut_buttons_hide();
    } else {
      shortcut_buttons_show();
    }

    // SHORT CUT (buttons that appear when clicked on user name)
    shortcut_dropdown.find('a').click(function(e) {
      e.preventDefault();
      window.location = $(this).attr('href');
      setTimeout(shortcut_buttons_hide, 300);

    });

    // SHORTCUT buttons goes away if mouse is clicked outside of the area
    $(document).mouseup(function(e) {
      if (!shortcut_dropdown.is(e.target) && shortcut_dropdown.has(e.target).length === 0) {
        shortcut_buttons_hide();
      }
    });

    // SHORTCUT ANIMATE HIDE
    function shortcut_buttons_hide() {
      shortcut_dropdown.animate({
        height: "hide"
      }, 300, "easeOutCirc");
      $.root_.removeClass('shortcut-on');

    }

    // SHORTCUT ANIMATE SHOW
    function shortcut_buttons_show() {
      shortcut_dropdown.animate({
        height: "show"
      }, 200, "easeOutCirc");
      $.root_.addClass('shortcut-on');
    }

  }

};

SmartAdmin.domReadyMisc = function() {
  /*
   * FIRE TOOLTIPS
   */
  if ($("[rel=tooltip]").length) {
    $("[rel=tooltip]").tooltip();
  }

  // SHOW & HIDE MOBILE SEARCH FIELD
  $('#search-mobile').click(function() {
    $.root_.addClass('search-mobile');
  });

  $('#cancel-search-js').click(function() {
    $.root_.removeClass('search-mobile');
  });

  // ACTIVITY
  // ajax drop
  $('#activity').click(function(e) {
    var $this = $(this);

    if ($this.find('.badge').hasClass('bg-color-red')) {
      $this.find('.badge').removeClassPrefix('bg-color-');
      $this.find('.badge').text("0");
      // console.log("Ajax call for activity")
    }

    if (!$this.next('.ajax-dropdown').is(':visible')) {
      $this.next('.ajax-dropdown').fadeIn(150);
      $this.addClass('active');
    } else {
      $this.next('.ajax-dropdown').fadeOut(150);
      $this.removeClass('active');
    }

    var mytest = $this.next('.ajax-dropdown').find('.btn-group > .active > input').attr('id');
    //console.log(mytest)

    //clear memory reference
    $this = null;
    mytest = null;

    e.preventDefault();
  });

  $('input[name="activity"]').change(function() {
    //alert($(this).val())
    var $this = $(this);

    url = $this.attr('id');
    container = $('.ajax-notifications');

    loadURL(url, container);

    //clear memory reference
    $this = null;
  });

  // close dropdown if mouse is not inside the area of .ajax-dropdown
  $(document).mouseup(function(e) {
    if (!$('.ajax-dropdown').is(e.target) && $('.ajax-dropdown').has(e.target).length === 0) {
      $('.ajax-dropdown').fadeOut(150);
      $('.ajax-dropdown').prev().removeClass("active");
    }
  });

  // loading animation (demo purpose only)
  $('button[data-btn-loading]').on('click', function() {
    var btn = $(this);
    btn.button('loading');
    setTimeout(function() {
      btn.button('reset');
    }, 3000);

    //clear memory reference
    $this = null;
  });

  // NOTIFICATION IS PRESENT
  // Change color of lable once notification button is clicked

  $this = $('#activity > .badge');

  if (parseInt($this.text()) > 0) {
    $this.addClass("bg-color-red bounceIn animated");

    //clear memory reference
    $this = null;
  }

  /*
   * 1 POP OVER THEORY
   * Keep only 1 active popover per trigger - also check and hide active popover if user clicks on document
   */
  $('body').on('click', function(e) {
    $('[rel="popover"]').each(function() {
      //the 'is' for buttons that trigger popups
      //the 'has' for icons within a button that triggers a popup
      if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
        $(this).popover('hide');
      }
    });
  });
};

SmartAdmin.mainResize = function() {
  $('#main').resize(function() {
    if ($(window).width() < 979) {
      $.root_.addClass('mobile-view-activated');
      $.root_.removeClass('minified');
    } else if ($.root_.hasClass('mobile-view-activated')) {
      $.root_.removeClass('mobile-view-activated');
    }

  });
};

/*
 * CUSTOM MENU PLUGIN
 */
$.fn.extend({

  //pass the options variable to the function
  jarvismenu: function(options) {

    var defaults = {
        accordion: 'true',
        speed: 200,
        closedSign: '[+]',
        openedSign: '[-]'
      },

      // Extend our default options with those provided.
      opts = $.extend(defaults, options),
      //Assign current element to variable, in this case is UL element
      $this = $(this);

    //add a mark [+] to a multilevel menu
    $this.find("li").each(function() {
      var $anchor;
      if ($(this).find("ul").size() !== 0) {
        $anchor = $(this).find("a:first");
        //add the multilevel sign next to the link
        if ($anchor.find("b.collapse-sign").size() == 0) {
          $anchor.append("<b class='collapse-sign'>" + opts.closedSign + "</b>");
        }

        //avoid jumping to the top of the page when the href is an #
        if ($anchor.attr('href') == "#") {
          $anchor.click(function() {
            return false;
          });

          $anchor.find("a").click(function(e) {
            e.preventDefault();
            Router.go($(this).attr('href'));
            return false;
          });
        }
      }
    });

    //open active level
    $this.find("li.active").each(function() {
      $(this).parents("ul").slideDown(opts.speed);
      $(this).parents("ul").parent("li").find("b:first").html(opts.openedSign);
      $(this).parents("ul").parent("li").addClass("open");
    });

    $this.find("li > a").unbind('click.jarvismenu');
    $this.find("li > a").bind('click.jarvismenu', function(e) {

      if ($(this).parent().find("ul").size() !== 0) {

        if (opts.accordion) {
          //Do nothing when the list is open
          if (!$(this).parent().find("ul").is(':visible')) {
            parents = $(this).parent().parents("ul");
            visible = $this.find("ul:visible");
            visible.each(function(visibleIndex) {
              var close = true;
              parents.each(function(parentIndex) {
                if (parents[parentIndex] == visible[visibleIndex]) {
                  close = false;
                  return false;
                }
              });
              if (close) {
                if ($(this).parent().find("ul") != visible[visibleIndex]) {
                  $(visible[visibleIndex]).slideUp(opts.speed, function() {
                    $(this).parent("li").find("b:first").html(opts.closedSign);
                    $(this).parent("li").removeClass("open");
                  });

                }
              }
            });
          }
        } // end if
        if ($(this).parent().find("ul:first").is(":visible") && !$(this).parent().find("ul:first").hasClass(
          "active")) {
          $(this).parent().find("ul:first").slideUp(opts.speed, function() {
            $(this).parent("li").removeClass("open");
            $(this).parent("li").find("b:first").delay(opts.speed).html(opts.closedSign);
          });

        } else {
          $(this).parent().find("ul:first").slideDown(opts.speed, function() {
            /*$(this).effect("highlight", {color : '#616161'}, 500); - disabled due to CPU clocking on phones*/
            $(this).parent("li").addClass("open");
            $(this).parent("li").find("b:first").delay(opts.speed).html(opts.openedSign);
          });
        } // end else
      } // end if
    });
  } // end function
});
/* ~ END: CUSTOM MENU PLUGIN */

/*
 * INITIALIZE FORMS
 * Description: Select2, Masking, Datepicker, Autocomplete
 */
var runAllForms = function() {

  /*
   * BOOTSTRAP SLIDER PLUGIN
   * Usage:
   * Dependency: js/plugin/bootstrap-slider
   */
  if ($.fn.slider) {
    $('.slider').slider();
  }

  /*
   * SELECT2 PLUGIN
   * Usage:
   * Dependency: js/plugin/select2/
   */
  if ($.fn.select2) {
    $('.select2').each(function() {
      var $this = $(this),
        width = $this.attr('data-select-width') || '100%';
      //, _showSearchInput = $this.attr('data-select-search') === 'true';
      $this.select2({
        //showSearchInput : _showSearchInput,
        allowClear: true,
        width: width
      });

      //clear memory reference
      $this = null;
    });
  }

  /*
   * MASKING
   * Dependency: js/plugin/masked-input/
   */
  if ($.fn.mask) {
    $('[data-mask]').each(function() {

      var $this = $(this),
        mask = $this.attr('data-mask') || 'error...',
        mask_placeholder = $this.attr('data-mask-placeholder') || 'X';

      $this.mask(mask, {
        placeholder: mask_placeholder
      });

      //clear memory reference
      $this = null;
    });
  }

  /*
   * AUTOCOMPLETE
   * Dependency: js/jqui
   */
  if ($.fn.autocomplete) {
    $('[data-autocomplete]').each(function() {

      var $this = $(this),
        availableTags = $this.data('autocomplete') || ["The", "Quick", "Brown", "Fox", "Jumps", "Over", "Three",
          "Lazy", "Dogs"
        ];

      $this.autocomplete({
        source: availableTags
      });

      //clear memory reference
      $this = null;
    });
  }

  /*
   * JQUERY UI DATE
   * Dependency: js/libs/jquery-ui-1.10.3.min.js
   * Usage: <input class="datepicker" />
   */
  if ($.fn.datepicker) {
    $('.datepicker').each(function() {

      var $this = $(this),
        dataDateFormat = $this.attr('data-dateformat') || 'dd.mm.yy';

      $this.datepicker({
        dateFormat: dataDateFormat,
        prevText: '<i class="fa fa-chevron-left"></i>',
        nextText: '<i class="fa fa-chevron-right"></i>',
      });

      //clear memory reference
      $this = null;
    });
  }

  /*
   * AJAX BUTTON LOADING TEXT
   * Usage: <button type="button" data-loading-text="Loading..." class="btn btn-xs btn-default ajax-refresh"> .. </button>
   */
  $('button[data-loading-text]').on('click', function() {
    var btn = $(this);
    btn.button('loading');
    setTimeout(function() {
      btn.button('reset');
    }, 3000);

    //clear memory reference
    btn = null;
  });

};
/* ~ END: INITIALIZE FORMS */

/*
 * INITIALIZE JARVIS WIDGETS
 * Setup Desktop Widgets
 */
var setup_widgets_desktop = function() {

  if ($.fn.jarvisWidgets && enableJarvisWidgets) {

    $('#widget-grid').jarvisWidgets({

      grid: 'article',
      widgets: '.jarviswidget',
      localStorage: true,
      deleteSettingsKey: '#deletesettingskey-options',
      settingsKeyLabel: 'Reset settings?',
      deletePositionKey: '#deletepositionkey-options',
      positionKeyLabel: 'Reset position?',
      sortable: true,
      buttonsHidden: false,
      // toggle button
      toggleButton: true,
      toggleClass: 'fa fa-minus | fa fa-plus',
      toggleSpeed: 200,
      onToggle: function() {},
      // delete btn
      deleteButton: true,
      deleteClass: 'fa fa-times',
      deleteSpeed: 200,
      onDelete: function() {},
      // edit btn
      editButton: true,
      editPlaceholder: '.jarviswidget-editbox',
      editClass: 'fa fa-cog | fa fa-save',
      editSpeed: 200,
      onEdit: function() {},
      // color button
      colorButton: true,
      // full screen
      fullscreenButton: true,
      fullscreenClass: 'fa fa-expand | fa fa-compress',
      fullscreenDiff: 3,
      onFullscreen: function() {},
      // custom btn
      customButton: false,
      customClass: 'folder-10 | next-10',
      customStart: function() {
        alert('Hello you, this is a custom button...');
      },
      customEnd: function() {
        alert('bye, till next time...');
      },
      // order
      buttonOrder: '%refresh% %custom% %edit% %toggle% %fullscreen% %delete%',
      opacity: 1.0,
      dragHandle: '> header',
      placeholderClass: 'jarviswidget-placeholder',
      indicator: true,
      indicatorTime: 600,
      ajax: true,
      timestampPlaceholder: '.jarviswidget-timestamp',
      timestampFormat: 'Last update: %m%/%d%/%y% %h%:%i%:%s%',
      refreshButton: true,
      refreshButtonClass: 'fa fa-refresh',
      labelError: 'Sorry but there was a error:',
      labelUpdated: 'Last Update:',
      labelRefresh: 'Refresh',
      labelDelete: 'Delete widget:',
      afterLoad: function() {},
      rtl: false, // best not to toggle this!
      onChange: function() {

      },
      onSave: function() {

      },
      ajaxnav: $.navAsAjax // declears how the localstorage should be saved (HTML or AJAX page)

    });

  }

};
/*
 * SETUP DESKTOP WIDGET
 */
var setup_widgets_mobile = function() {

  if (enableMobileWidgets && enableJarvisWidgets) {
    setup_widgets_desktop();
  }

};
/* ~ END: INITIALIZE JARVIS WIDGETS */

// ----------

SmartAdmin.cleanDatatables = function() {
  // destroy all datatable instances
  if ($('.dataTables_wrapper')[0]) {
    var tables = $.fn.dataTable.fnTables(true);
    $(tables).each(function() {
      $(this).dataTable().fnDestroy();
    });
    //console.log("datatable nuked!!!");
  }
  // end destroy
};

SmartAdmin.cleanJavisWidgets = function() {
  // pop intervals (destroys jarviswidget related intervals)
  if ($.intervalArr.length > 0 && enableJarvisWidgets) {
    while ($.intervalArr.length > 0)
      clearInterval($.intervalArr.pop());
    //console.log("all intervals cleared..")
  }
  // end pop intervals
};

var drawBreadCrumb = SmartAdmin.drawBreadCrumb = function(head) {
  var bread_crumb = $('#ribbon ol.breadcrumb'),
    nav_elems = $('nav li.active > a'),
    count = nav_elems.length,
    head_crumb = head ? '' + head : 'Home';

  //console.log("breadcrumb")
  bread_crumb.empty();
  bread_crumb.append($("<li>" + head_crumb + "</li>"));
  nav_elems.each(function() {
    bread_crumb.append($("<li></li>").html($.trim($(this).clone().children(".badge").remove().end().text())));
    // update title when breadcrumb is finished...
    if (!--count) document.title = bread_crumb.find("li:last-child").text();
    //nav_elems = null;
  });

  // clear dom reference
  nav_elems = null;
}

var updateNav = SmartAdmin.updateNav = function(href) {
  var li, queryIndex, menu;
  // remove all active class
  $('nav li.active').removeClass("active");

  // --------------------------------------------
  // 1.a Has LI > A
  // match the url and add the active class
  li = $('nav li:has(li > a[href="' + href + '"])'); // exact match
  if (li.size() == 0) {
    // pathname match
    li = $('nav li:has(li > a[href^="' + href + '?"])');
  }
  // active
  li.addClass("active");
  // open
  li.each(function() {
    var $this = $(this);
    if (!$this.hasClass('open')) {
      $this.children('a').trigger('click');
    }
  });

  // 1.b Has direct A
  li = $('nav li:has(> a[href="' + href + '"])'); // exact match
  if (li.size() == 0) {
    // pathname match
    li = $('nav li:has(> a[href^="' + href + '?"])');
  }
  li.addClass("active");

  // --------------------------------------------
  // 2.a Has LI > A and A contains A
  // match the url and add the active class
  li = $('nav li:has(li > a a[href="' + href + '"])'); // exact match
  if (li.size() == 0) {
    // pathname match
    li = $('nav li:has(li > a a[href^="' + href + '?"])');
  }
  // active
  li.addClass("active");
  // open
  li.each(function() {
    var $this = $(this);
    if (!$this.hasClass('open')) {
      $this.children('a').trigger('click');
    }
  });

  // 2.b Has direct A and A contains A
  li = $('nav li:has(> a a[href="' + href + '"])'); // exact match
  if (li.size() == 0) {
    // pathname match
    li = $('nav li:has(> a a[href^="' + href + '?"])');
  }
  li.addClass("active");

  // $this.parents('nav li').addClass('active');
}

SmartAdmin.pageSetup = function(path) {

  if (thisDevice === "desktop") {
    // is desktop

    // activate tooltips
    $("[rel=tooltip]").tooltip();

    // activate popovers
    $("[rel=popover]").popover();

    // activate popovers with hover states
    $("[rel=popover-hover]").popover({
      trigger: "hover"
    });

    // setup widgets
    setup_widgets_desktop();

    // activate inline charts
    //runAllCharts();

    // run form elements
    runAllForms();

  } else {

    // is mobile

    // activate popovers
    $("[rel=popover]").popover();

    // activate popovers with hover states
    $("[rel=popover-hover]").popover({
      trigger: "hover"
    });

    // activate inline charts
    //runAllCharts();

    // setup widgets
    setup_widgets_mobile();

    // run form elements
    runAllForms();

  }

  var pathname = path || location.pathname;

  // Navigation update
  SmartAdmin.updateNav(pathname);

  // change page title from global var
  // TODO 'Product - Page Title'
  //document.title = ($this.attr('title') || document.title);

  // BreadCrumb
  //SmartAdmin.drawBreadCrumb(Utils.getSerialNumber().toUpperCase());
};