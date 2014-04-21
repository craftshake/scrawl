var ScrawlEditor = Garnish.Base.extend(
{
	$element: null,
	$content: null,
	$toolbar: null,
	$preview: null,
	$code: null,
	$wrapper: null,

	options: null,
	editor: null,

	CodeMirror: null,
	marked: null,

	init: function(element, options) {
		this.$element = $(element);
		this.$wrapper = this.$element.parent();

		this.options = $.extend({}, ScrawlEditor.defaults, options);

		this.$content = this.$wrapper.find(".scrawl-content");
		this.$toolbar = this.$wrapper.find(".scrawl-toolbar");
		this.$preview = this.$wrapper.find(".scrawl-preview").children().eq(0);
		this.$code = this.$wrapper.find(".scrawl-code");

		this.$element.appendTo(this.$code);

		this.editor = CodeMirror.fromTextArea(this.$element[0], this.options.codemirror);
		this.editor.scrawl = this;

		var that = this;
		this.editor.on('change', function() {
			var value = $this.editor.getValue();
			var currentValue  = String(value);
			marked(currentValue, function (err, markdown) {
				if (err) throw err;
				that.$preview.html(markdown);
				that.$element.val(that.editor.getValue());
			});
		});

		this.$code.find(".CodeMirror").css("height", this.options.height);

		this._buildToolbar();
		//this._fit();

		$(window).on('resize', function() {
			//that._fit();
		});

		var previewContainer = this.$preview.parent(),
			codeContent = this.$code.find('.CodeMirror-sizer'),
			codeScroll = this.$code.find('.CodeMirror-scroll').on('scroll',function() {
				// calc position
				var codeHeight       = codeContent.height() - codeScroll.height(),
					previewHeight    = previewContainer[0].scrollHeight - previewContainer.height(),
					ratio            = previewHeight / codeHeight,
					previewPostition = codeScroll.scrollTop() * ratio;

				// apply new scroll
				previewContainer.scrollTop(previewPostition);
		});

		this.$preview.parent().css("height", this.$code.height());
	},

	_buildToolbar: function() {
		var that = this;

		var bar = [];

		this.options.toolbar.forEach(function(cmd){
			if(ScrawlEditor.commands[cmd]) {

			   var title = ScrawlEditor.commands[cmd].title ? ScrawlEditor.commands[cmd].title : cmd;

			   bar.push('<li><a scrawl-cmd="'+cmd+'" title="'+title+'">'+ScrawlEditor.commands[cmd].label+'</a></li>');

			   // @TODO register shortcut
			}
		});

		this.$toolbar.html(bar.join('\n'));

		this.$toolbar.on("click", "a[scrawl-cmd]", function(){
			var cmd = $(this).data("markdownareaCmd");

			if(cmd && ScrawlEditor.commands[cmd]) {
				ScrawlEditor.commands[cmd].action.apply(that, [that.editor])
			}

		});
	},

	_fit: function() {

		// @TODO handle mobile

		this.editor.refresh();
		this.$preview.parent().css("height", this.$code.height());
	},

},
{

	defaults: {
		"height"       : 500,
		"maxsplitsize" : 1000,
		"codemirror"   : { mode: 'gfm', tabMode: 'indent', tabindex: "2", lineWrapping: true, dragDrop: false },
		"toolbar"      : [ "bold", "italic", "strike", "link", "picture", "blockquote", "listUl", "listOl" ],
	},

	replacer: function(replace, editor){
        var text     = editor.getSelection(),
            markdown = replace.replace('$1', text);

        editor.replaceSelection(markdown, 'end');
    },

	commands: {
		"fullscreen": {
			"title"  : 'Fullscreen',
			"label"  : '<i class="uk-icon-expand"></i>',
			"action" : function(editor){

				editor.scrawl.$wrapper.toggleClass("scrawl-fullscreen");

				var wrap = editor.getWrapperElement();

				if(editor.scrawl.$wrapper.hasClass("scrawl-fullscreen")) {
					editor.state.fullScreenRestore = {scrollTop: window.pageYOffset, scrollLeft: window.pageXOffset, width: wrap.style.width, height: wrap.style.height};
					wrap.style.width  = "";
					wrap.style.height = editor.scrawl.$content.height()+"px";
					document.documentElement.style.overflow = "hidden";
				} else {
					document.documentElement.style.overflow = "";
					var info = editor.state.fullScreenRestore;
					wrap.style.width = info.width; wrap.style.height = info.height;
					window.scrollTo(info.scrollLeft, info.scrollTop);
				}

				editor.refresh();
				editor.scrawl.$preview.parent().css("height", editor.scrawl.code.height());
			}
		},

		"bold" : {
			"title"  : "Bold",
			"label"  : '<i class="uk-icon-bold"></i>',
			"shortcut": ['Ctrl-B', 'Cmd-B'],
			"action" : function(editor){
				ScrawlEditor.replacer("**$1**", editor);
			}
		},
		"italic" : {
			"title"  : "Italic",
			"label"  : '<i class="uk-icon-italic"></i>',
			"action" : function(editor){
				ScrawlEditor.replacer("*$1*", editor);
			}
		},
		"strike" : {
			"title"  : "Strikethrough",
			"label"  : '<i class="uk-icon-strikethrough"></i>',
			"action" : function(editor){
				ScrawlEditor.replacer("~~$1~~", editor);
			}
		},
		"blockquote" : {
			"title"  : "Blockquote",
			"label"  : '<i class="uk-icon-quote-right"></i>',
			"action" : function(editor){
				ScrawlEditor.replacer("> $1", editor);
			}
		},
		"link" : {
			"title"  : "Link",
			"label"  : '<i class="uk-icon-link"></i>',
			"action" : function(editor){
				ScrawlEditor.replacer("[$1](http://)", editor);
			}
		},
		"picture" : {
			"title"  : "Picture",
			"label"  : '<i class="uk-icon-picture-o"></i>',
			"action" : function(editor){
				ScrawlEditor.replacer("![$1](http://)", editor);
			}
		},
		"listUl" : {
			"title"  : "Unordered List",
			"label"  : '<i class="uk-icon-list-ul"></i>',
			"action" : function(editor){
				ScrawlEditor.replacer("* $1", editor);
			}
		},
		"listOl" : {
			"title"  : "Ordered List",
			"label"  : '<i class="uk-icon-list-ol"></i>',
			"action" : function(editor){
				ScrawlEditor.replacer("1. $1", editor);
			}
		}
	}

});
