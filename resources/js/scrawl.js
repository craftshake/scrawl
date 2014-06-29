var ScrawlEditor = Garnish.Base.extend(
{
	$element: null,
	$content: null,
	$toolbar: null,
	$toolbarButtons: null,
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
		this.$toolbarButtons = this.$toolbar.find(".scrawl-buttons");
		this.$preview = this.$wrapper.find(".scrawl-preview").children().eq(0);
		this.$code = this.$wrapper.find(".scrawl-code");

		this.$element.appendTo(this.$code);

		this.editor = CodeMirror.fromTextArea(this.$element[0], this.options.codemirror);
		this.editor.scrawl = this;

		var that = this;
		this.editor.on('change', function() {
			that._updatePreview();
		});
		that._updatePreview();

		this.$code.find(".CodeMirror").css("height", this.options.height);

		this._buildToolbar();
		this._fit();

		$(window).on('resize', function() {
			that._fit();
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
			if (cmd == '|') {
				bar.push('<li class="scrawl-separator"></li>');
			}
			else if(ScrawlEditor.commands[cmd]) {
			   var title = ScrawlEditor.commands[cmd].title ? ScrawlEditor.commands[cmd].title : cmd;
			   bar.push('<li><a data-scrawl-cmd="'+cmd+'" title="'+title+'" class="icon-'+ ScrawlEditor.commands[cmd].label +'"></a></li>');

			   // @TODO register shortcut
			}
		});

		this.$toolbarButtons.html(bar.join('\n'));

		this.$toolbar.on("click", "a[data-scrawl-cmd]", function(){
			var cmd = $(this).data("scrawl-cmd");

			if(cmd && ScrawlEditor.commands[cmd]) {
				ScrawlEditor.commands[cmd].action.apply(that, [that.editor])
			}

		});
	},

	_fit: function() {

		// @TODO handle mobile
		if (this.$wrapper.width() < ScrawlEditor.defaults.maxsplitsize) {
			this.$wrapper.addClass('scrawl-mobile');
		}
		else {
			this.$wrapper.removeClass('scrawl-mobile');
			this.$content.toggleClass('preview-mode');
		}

		this.editor.refresh();
		this.$preview.parent().css("height", this.$code.height());
	},

	_updatePreview: function() {
		var value = this.editor.getValue();
		var parsed = marked(String(value));
		this.$preview.html(parsed);
		this.$element.val(value);
	}

},
{

	defaults: {
		"height"       	: 400,
		"maxsplitsize" 	: 650,
		"codemirror"   	: { mode: 'markdown', theme: 'paper', tabMode: 'indent', tabindex: "2", lineWrapping: true, dragDrop: false, extraKeys: {"Enter": 'newlineAndIndentContinueMarkdownList'} },
		"toolbar"      	: [ "h1", "h2", "h3", "|", "bold", "italic", "strike", "|", "link", "picture", "blockquote", "listUl", "listOl", "|", "undo", "redo" ],
	},

	replacer: function(replace, editor){
        var text     = editor.getSelection(),
            markdown = replace.replace('$1', text);

        editor.replaceSelection(markdown, 'end');
        editor.focus();
    },

	commands: {

		"h1" : {
			"title"  : "Title",
			"label"  : 'h1',
			"action" : function(editor){
				ScrawlEditor.replacer("# $1", editor);
			}
		},
		"h2" : {
			"title"  : "Small title",
			"label"  : 'h2',
			"action" : function(editor){
				ScrawlEditor.replacer("## $1", editor);
			}
		},
		"h3" : {
			"title"  : "Smaller title",
			"label"  : 'h3',
			"action" : function(editor){
				ScrawlEditor.replacer("### $1", editor);
			}
		},
		"preview" : {
			"title"  : "Preview",
			"action" : function(editor){
				editor.scrawl.$content.toggleClass('preview-mode');
			}
		},
		"fullscreen": {
			"title"  : 'Fullscreen',
			"label"  : 'fullscreen',
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
				editor.scrawl.$preview.parent().css("height", editor.scrawl.$code.height());
			}
		},

		"bold" : {
			"title"  : "Bold",
			"label"  : 'bold',
			"shortcut": ['Ctrl-B', 'Cmd-B'],
			"action" : function(editor){
				ScrawlEditor.replacer("**$1**", editor);
			}
		},
		"italic" : {
			"title"  : "Italic",
			"label"  : 'italic',
			"action" : function(editor){
				ScrawlEditor.replacer("*$1*", editor);
			}
		},
		"strike" : {
			"title"  : "Strikethrough",
			"label"  : 'strikethrough',
			"action" : function(editor){
				ScrawlEditor.replacer("~~$1~~", editor);
			}
		},
		"blockquote" : {
			"title"  : "Blockquote",
			"label"  : 'quote',
			"action" : function(editor){
				ScrawlEditor.replacer("> $1", editor);
			}
		},
		"link" : {
			"title"  : "Link",
			"label"  : 'link',
			"action" : function(editor){
				ScrawlEditor.replacer("[$1](http://)", editor);
			}
		},
		"picture" : {
			"title"  : "Picture",
			"label"  : 'picture',
			"action" : function(editor){
				ScrawlEditor.replacer("![$1](http://)", editor);
			}
		},
		"listUl" : {
			"title"  : "Unordered List",
			"label"  : 'unordered-list',
			"action" : function(editor){
				ScrawlEditor.replacer("* $1", editor);
			}
		},
		"listOl" : {
			"title"  : "Ordered List",
			"label"  : 'ordered-list',
			"action" : function(editor){
				ScrawlEditor.replacer("1. $1", editor);
			}
		},
		"undo" : {
			"title"  : "Undo action",
			"label"  : 'undo',
			"action" : function(editor){
				editor.undo();
				editor.focus();
			}
		},
		"redo" : {
			"title"  : "Redo action",
			"label"  : 'redo',
			"action" : function(editor){
				editor.redo();
				editor.focus();
			}
		}
	}

});
