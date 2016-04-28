/*
 * Fifteen Puzzle
 *
 * Copyright 2016 8am.
 * http://8am.jp/
 *
 */

$(function() {
    
    var hasTouchEvent = ('ontouchstart' in window);
    var numGrid = 4;   // 一辺のグリッド数
    var draggable;
    var space;

    init();

    function init() {
        var board = $("<div/>").addClass("board");
        $("body").append(board);
        var width = $(window).width();
        var height = $(window).height() - $(".navbar").height();
        var boardsize = (width < height) ? width : height;
        board.css({ width: boardsize, height: boardsize });
        var blocksize = Math.round( boardsize / numGrid );
        var block = $("<div/>").addClass("block").css({ "width": blocksize, "height": blocksize, "font-size": blocksize * 0.5 });
        var offset = board.offset();
        var numBlock = Math.pow(numGrid, 2) - 1;
        for (var i = 0; i < numBlock; i++) {
            board.append(
                block.clone()
                .data("offset", {
                    top:  offset.top  + (Math.floor( i / numGrid ) * blocksize),
                    left: offset.left + (i % numGrid * blocksize)
                })
                .text(i + 1)
            );
        }
        space = $("<div/>").addClass("space");
        board.append(
            space
            .css({ "width": blocksize, "height": blocksize })
            .data("offset", {
                top:  offset.top  + ( (numGrid - 1) * blocksize),
                left: offset.left + ( (numGrid - 1) * blocksize)
            })
        );
        start();
    }

    // 開始
    function start() {
        set();
        shuffle();
    }

    // touchstart
    function ontouchstart(event) {
        event.preventDefault();
        var block = $(event.target);
        // アクティブなブロックと空ブロック間の距離を測定し、最短ならドラッグ可とする
        var b = block.offset();
        var s = space.offset();
        var size = block.width();
        var distance = Math.abs(s.top - b.top) + Math.abs(s.left - b.left);
        if (distance <= size) {
            var touch = hasTouchEvent ? event.originalEvent.targetTouches[0] : event;
            draggable = {
                offset: b,
                origin: {
                    x: touch.pageX,
                    y: touch.pageY
                },
                range: {
                    x: s.left - b.left,
                    y: s.top  - b.top
                },
                touchoffset: {
                    x: (touch.pageX - b.left),
                    y: (touch.pageY - b.top)
                }
            }
            block.css({ "z-index": 1 });
        }
    }

    // touchmove
    function ontouchmove(event) {
        event.preventDefault();
        var block = $(event.target);
        if (draggable) {
            var touch = hasTouchEvent ? event.originalEvent.targetTouches[0] : event;
            var distance = {
                x: (touch.pageX - draggable.origin.x),
                y: (touch.pageY - draggable.origin.y)
            };
            var range = draggable.range;
            var x = distance.x < 0 ? (distance.x < range.x ? Math.min(0, range.x) : distance.x) :
                    distance.x > 0 ? (distance.x > range.x ? Math.max(0, range.x) : distance.x) : 0;
            var y = distance.y < 0 ? (distance.y < range.y ? Math.min(0, range.y) : distance.y) :
                    distance.y > 0 ? (distance.y > range.y ? Math.max(0, range.y) : distance.y) : 0;

            block
            .offset({
                top:  y + draggable.origin.y - draggable.touchoffset.y,
                left: x + draggable.origin.x - draggable.touchoffset.x
            });
        }
    }

    // touchend
    function ontouchend(event) {
        event.preventDefault();
        var block = $(event.target);
        if (draggable) {
            // ブロックを交換可能か判定する
            var b = block.offset();
            var s = space.offset();
            var distance = Math.abs(s.top - b.top) + Math.abs(s.left - b.left);
            var canSwap = ( distance < block.width() * 0.5); //距離がブロックの1辺の長さの半分より小さい(=空ブロックに近い)
            if (canSwap) {
                block.offset({ top: s.top, left: s.left });
                space.offset({ top: draggable.offset.top, left: draggable.offset.left })
            } else {
                block.offset({ top: draggable.offset.top, left: draggable.offset.left })
            }
            block.css({ "z-index": "auto" });
            draggable = null;
            slided();
        }
    }

    // ブロックの初期化
    function set() {
        $(".block").each( function() {
            $(this).offset({ top: $(this).data("offset").top, left: $(this).data("offset").left })
        });
        space.offset({ top: space.data("offset").top, left: space.data("offset").left });
        $(".block").on({
            "touchstart": function(event) {
                ontouchstart(event);
            },
            "touchmove": function(event) {
                ontouchmove(event);
            },
            "touchend": function(event) {
                ontouchend(event);
            }
        });
    }

    // シャッフル
    function shuffle() {
        var n = $(".block").length;
        var times = numGrid * 10;
        for (var i = 0; i < times; i++) {
            var a = Math.floor( Math.random() * n );
            var b = (Math.floor( Math.random() * (n - 1) ) + a + 1) % n;
            var ap = $(".block").eq(a).position();
            var bp = $(".block").eq(b).position();
            $(".block").eq(a).css({ top: bp.top, left: bp.left });
            $(".block").eq(b).css({ top: ap.top, left: ap.left });
        }
    }

    // スライド後の処理
    function slided() {
        var numOrdered = 0;
        $(".block").each( function() {
            if ( $(this).offset().top == $(this).data("offset").top && $(this).offset().left == $(this).data("offset").left ) numOrdered++;
        });
        if(numOrdered == $(".block").length) success();
    }

});