$(function () {
    SABnzbd = function (params) {
        var sabnzbd  = this;
        sabnzbd.api_key = params.api_key == undefined ? alert("api_key is a required parameter for SABnzbd")
                                                      : params.api_key;
        sabnzbd.limit   = params.limit   == undefined ? 10
                                                      : params.limit;
        sabnzbd.url     = params.url     == undefined ? "http://127.0.0.1:8080/"
                                                      : params.url;
        sabnzbd.debug   = params.debug   == undefined ? 0 : 1;

        if ( sabnzbd.debug ) {
            console.log("Refreshing SABnzbd");
            console.log(" - api_key: " + sabnzbd.api_key);
            console.log(" - limit: " + sabnzbd.limit);
            console.log(" - url: " + sabnzbd.url);
        }

        // start updating the page while the object is created
        sabnzbd.refresh();

        // update the sabnzbd link and show the table
        $("a[href='http://127.0.0.1:8080/']").attr("href", sabnzbd.url);
        $("#sabnzbd").show();

        return sabnzbd;
    };
    SABnzbd.prototype.refresh = function () {
        var sabnzbd    = this;
        var date_obj   = new Date();
        var today_ymd  = date_obj.getFullYear() + "-" + date_obj.getMonth() + "-" + date_obj.getDate();
        var url        = sabnzbd.url + "api?&mode=history&output=json&callback=?&limit=" + sabnzbd.limit +
                         "&start=" + today_ymd + "&apikey=" + sabnzbd.api_key;

        // clear out any existing downloads
        $("#sabnzbd-downloads > tbody:last").children().remove();

        if ( sabnzbd.debug ) console.log("SABnzbd: querying " + url);

        $.getJSON(url, function (data) {
            $.each(data, function (key, history) {
                if ( sabnzbd.debug ) console.log("SABnzbd: found " + history.slots.length + " downloads");

                $.each(history.slots, function (id, file) {
                    if ( sabnzbd.debug ) console.log("SABnzbd: processing " + file.name);

                    var vars = {
                        "id"    : file.id,
                        "name"  : file.name,
                        "size"  : file.size,
                        "date"  : new Date(file.completed * 1000),
                        "class" : file.status == "Completed" ? "complete" : "failed",
                    };

                    $("#sabnzbd-downloads > tbody:last").append($("#sabnzbd-template").render(vars));

                    // build the tooltip display
                    var message = file.fail_message == "" ? "" : file.fail_message + " / ";
                    $.each(file.stage_log, function(id, stage) {
                        if ( stage.name == "Source" ) {
                            return true;
                        }
                        $.each(stage.actions, function(stage_id, action) {
                            // bootstrap tooltips don't currently support html linebreaks,
                            // so we're going with a slash
                            action = action.replace(/<br\/>/g," / ");

                            // some actions have the download name in brackets
                            action = action.match(/([^\]]+)$/)[0];

                            message += action + " / ";
                        });
                    });

                    // trim the trailing slash
                    message = message.replace(/\s\/\s$/,"");

                    var tooltip_vars = {
                        "placement" : "top",
                        "title"     : message,
                    };

                    $("#sabnzbd-" + file.id).tooltip(tooltip_vars);
                });
            });
        });
    };

    SickBeard = function (params) {
        var sickbeard = this;
        sickbeard.api_key = params.api_key == undefined ? alert("api_key is a required parameter for SickBeard")
                                                        : params.api_key;
        sickbeard.limit   = params.limit   == undefined ? 10
                                                        : params.limit;
        sickbeard.url     = params.url     == undefined ? "http://127.0.0.1:8081/"
                                                        : params.url;
        sickbeard.debug   = params.debug   == undefined ? 0 : 1;

        if ( sickbeard.debug ) {
            console.log("Refreshing SickBeard");
            console.log(" - api_key: " + sickbeard.api_key);
            console.log(" - limit: " + sickbeard.limit);
            console.log(" - url: " + sickbeard.url);
        }

        // set up the episode search callback
        $(".sickbeard-search").live("click","img", function(e) {
            if ( this.src.match('search') ) {

                // disable clicking and start the spinner
                e.preventDefault();
                $(this).css("cursor","auto");
                $(this).attr("src", sickbeard.url + "images/loading16_dddddd.gif");

                var img    = $(this);
                var params = this.id.split("-");
                var url    = sickbeard.url + "api/" + sickbeard.api_key + "/?cmd=episode.search&callback=?&tvdbid=" + params[2] + "&season=" +
                             params[3] + "&episode="  + params[4];

                // search for the episode
                $.getJSON(url, function(data) {
                    if ( sickbeard.debug ) console.log(data);

                    if (data.result != "failure") {
                        img.attr("src", sickbeard.url + "images/yes16.png");
                    } else {
                        img.attr("src", sickbeard.url + "images/no16.png");
                    }
                });
            }
        });

        // start updating the page while the object is created
        sickbeard.refresh();

        // update the sickbeard link and show the table
        $("a[href='http://127.0.01:8081/']").attr("href", sickbeard.url);
        $("#sickbeard").show();

        return sickbeard;
    };
    SickBeard.prototype.refresh = function () {
        var sickbeard = this;
        var url       = sickbeard.url + "api/" + sickbeard.api_key + "/?cmd=future&limit=" + sickbeard.limit +
                        "&callback=?&sort=date&type=today|missed|soon";

        // clear out any existing upcoming shows
        $("#sickbeard-upcoming > tbody:last").children().remove();

        if ( sickbeard.debug ) console.log("SickBeard: querying " + url);

        $.getJSON(url, function (results) {
            var data = results.data;
            var types = new Array("missed", "today", "soon");

            if ( sickbeard.debug ) console.log("SickBeard: found " + types.length + " types");

            $.each(types, function (id, type) {
                if ( sickbeard.debug ) console.log("Sickbeard: processing " + type + " type");

                // was this type in the results?
                if (data[type]) {
                    $.each(data[type], function (id, episode) {
                        if ( sickbeard.debug ) console.log("SickBeard: processing episode for " + episode.show_name + "(" + episode.tvdbid + ")");
                        var vars = {
                            "name"         : episode.show_name,
                            "season"       : episode.season,
                            "episode"      : episode.episode,
                            "episode_name" : episode.ep_name,
                            "air_date"     : episode.airdate,
                            "airs"         : episode.airs,
                            "class"        : type,
                            "id"           : episode.tvdbid,
                            "base"         : sickbeard.url,
                            "show_url"     : sickbeard.url + "/home/displayShow?show=" + episode.tvdbid,
                        };

                        $("#sickbeard-upcoming > tbody:last").append($("#sickbeard-template").render(vars));
                    });
                }
            });
        });
    };

    CouchPotato = function (params) {
        var couchpotato = this;
        couchpotato.api_key = params.api_key == undefined ? alert("api_key is a required parameter for CouchPotato")
                                                          : params.api_key;
        couchpotato.limit   = params.limit   == undefined ? 10
                                                          : params.limit;
        couchpotato.url     = params.url     == undefined ? "http://127.0.0.1:5050/"
                                                          : params.url;
        couchpotato.debug   = params.debug   == undefined ? 0 : 1;

        if ( couchpotato.debug ) {
            console.log("Refreshing CouchPotato");
            console.log(" - api_key: " + couchpotato.api_key);
            console.log(" - limit: " + couchpotato.limit);
            console.log(" - url: " + couchpotato.url);
        }

        // start updating the page while the object is created
        couchpotato.refresh();

        // update the couchpotato link and show the table
        $("a[href='http://127.0.0.1:5050/']").attr("href", couchpotato.url);
        $("#couchpotato").show();

        return couchpotato;
    };
    CouchPotato.prototype.refresh = function () {
        var couchpotato = this;
        var url         = couchpotato.url + "api/" + couchpotato.api_key +
                          "/movie.list/?status=done&callback_func=?&limit_offset=" + couchpotato.limit;

        // clear out any existing recently found movies
        $("#couchpotato-downloads > tbody:last").children().remove();

        if ( couchpotato.debug ) console.log("CouchPotato: querying " + couchpotato.url);

        $.getJSON(url, function (data) {
            if ( couchpotato.debug ) console.log("CouchPotato: found " + data.movies.length + " movies");

            $.each(data.movies, function (id, movie) {
                if ( couchpotato.debug ) console.log("CouchPotato: processing " + movie.library.info.original_title);

                var vars = {
                    "title"        : movie.library.info.original_title,
                    "quality"      : movie.profile ? movie.profile.label : "",
                    "release_date" : movie.library.info.released,
                };

                $("#couchpotato-downloads > tbody:last").append($("#couchpotato-template").render(vars));
            });
        });
    };

    Headphones = function (params) {
        var headphones = this;
        headphones.api_key = params.api_key == undefined ? alert("api_key is a required parameter for Headphones")
                                                         : params.api_key;
        headphones.url     = params.url     == undefined ? "http://127.0.0.1:8181/"
                                                         : params.url;
        headphones.limit   = params.limit   == undefined ? 10
                                                         : params.limit;
        headphones.debug   = params.debug   == undefined ? 0 : 1;

        if ( headphones.debug ) {
            console.log("Refreshing HeadPhones");
            console.log(" - api_key: " + headphones.api_key);
            console.log(" - limit: " + headphones.limit);
            console.log(" - url: " + headphones.url);
        }

        // start updating the page while the object is created
        headphones.refresh();

        // update the headphones link and show the table
        $("a[href='http://127.0.0.1:8181/']").attr("href", headphones.url);
        $("#headphones").show();

        return headphones;
    };
    Headphones.prototype.refresh = function () {
        var headphones = this;
        var url        = headphones.url + "api/?&cmd=getHistory&callback=?&apikey=" + headphones.api_key;

        // clear out any existing history
        $("#headphones-downloads > tbody:last").children().remove();

        if ( headphones.debug ) console.log("HeadPhones: querying " + url);

        $.getJSON(url, function (data) {
            if ( headphones.debug ) console.log("HeadPhones: found " + data.length + " downloads. Limit " + headphones.limit);

            // the HeadPhones API has no limit, so apply one now before returning the results
            data = data.slice(0,++headphones.limit);

            $.each(data, function (id, file) {
                if ( headphones.debug ) console.log("HeadPhones: processing " + file.Title);
                var vars = {
                    "status"    : file.Status,
                    "title"     : file.Title,
                    "class"     : file.Status.toLowerCase(),
                    "album_url" : headphones.url + "albumPage?AlbumID=" + file.AlbumID,
                };

                $("#headphones-downloads > tbody:last").append($("#headphones-template").render(vars));
            });
        });
    };
});
