$(function () {
    SABnzbd = function (params) {
        this.api_key = params.api_key == undefined ? alert("api_key is a required parameter for SABnzbd")
                                                   : params.api_key;
        this.limit   = params.limit   == undefined ? 10
                                                   : params.limit;
        this.url     = params.url     == undefined ? "http://127.0.0.1:8080/"
                                                   : params.url;
        this.debug   = params.debug   == undefined ? 0 : 1;

        if ( this.debug ) {
            console.log("Refreshing SABnzbd");
            console.log(" - api_key: " + this.api_key);
            console.log(" - limit: " + this.limit);
            console.log(" - url: " + this.url);
        }

        // start updating the page while the object is created
        this.refresh();

        // update the sabnzbd link and show the table
        $("a[href='http://127.0.0.1:8080/']").attr("href", this.url);
        $("#sabnzbd").show();

        return this;
    };
    SABnzbd.prototype.refresh = function () {
        var date_obj    = new Date();
        var today_ymd   = date_obj.getFullYear() + "-" + date_obj.getMonth() + "-" + date_obj.getDate();
        var sabnzbd_url = this.url + "api?&mode=history&output=json&callback=?&limit=" + this.limit +
                          "&start=" + today_ymd + "&apikey=" + this.api_key;
        var debug       = this.debug;

        // clear out any existing downloads
        $("#sabnzbd-downloads > tbody:last").children().remove();

        if ( debug ) console.log("SABnzbd: querying " + sabnzbd_url);

        $.getJSON(sabnzbd_url, function (data) {
            $.each(data, function (key, history) {
                if ( debug ) console.log("SABnzbd: processing " + history.slots.length + " downloads");
                $.each(history.slots, function (id, file) {
                    if ( debug ) console.log("SABnzbd: processing " + file.name);
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
                            // bootstrap tooltips don"t currently support html linebreaks,
                            // so we"re going with a slash
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
        this.api_key = params.api_key == undefined ? alert("api_key is a required parameter for SickBeard")
                                                     : params.api_key;
        this.limit   = params.limit   == undefined ? 10
                                                   : params.limit;
        this.url     = params.url     == undefined ? "http://127.0.0.1:8081/"
                                                   : params.url;
        this.debug   = params.debug   == undefined ? 0 : 1;

        if ( this.debug ) {
            console.log("Refreshing SickBeard");
            console.log(" - api_key: " + this.api_key);
            console.log(" - limit: " + this.limit);
            console.log(" - url: " + this.url);
        }

        // start updating the page while the object is created
        this.refresh();

        // update the sickbeard link and show the table
        $("a[href='http://127.0.01:8081/']").attr("href", this.url);
        $("#sickbeard").show();

        return this;
    };
    SickBeard.prototype.refresh = function () {
        var base_url      = this.url;
        var sickbeard_url = this.url + "api/" + this.api_key + "/?cmd=future&limit=" + this.limit +
                            "&callback=?&sort=date&type=today|missed|soon";
        var debug         = this.debug;

        // clear out any existing upcoming shows
        $("#sickbeard-upcoming > tbody:last").children().remove();

        if ( debug ) console.log("SickBeard: querying " + sickbeard_url);

        $.getJSON(sickbeard_url, function (results) {
            var data = results.data;
            var types = new Array("missed", "today", "soon");

            if ( debug ) console.log("SickBeard: found " + types.length + " types");

            $.each(types, function (id, type) {
                if ( debug ) console.log("Sickbeard: processing " + type + " type");
                // was this type in the results?
                if (data[type]) {
                    $.each(data[type], function (id, episode) {
                        if ( debug ) console.log("SickBeard: processing episode for " + episode.show_name );
                        var vars = {
                            "name"         : episode.show_name,
                            "season"       : episode.season,
                            "episode"      : episode.episode,
                            "episode_name" : episode.ep_name,
                            "air_date"     : episode.airdate,
                            "airs"         : episode.airs,
                            "class"        : type,
                            "show_url"     : base_url + "/home/displayShow?show=" + episode.tvdbid,
                        };

                        $("#sickbeard-upcoming > tbody:last").append($("#sickbeard-template").render(vars));
                    });
                }
            });
        });
    };
    CouchPotato = function (params) {
        this.api_key = params.api_key == undefined ? alert("api_key is a required parameter for CouchPotato")
                                                   : params.api_key;
        this.limit   = params.limit   == undefined ? 10
                                                   : params.limit;
        this.url     = params.url     == undefined ? "http://127.0.0.1:5050/"
                                                   : params.url;
        this.debug   = params.debug   == undefined ? 0 : 1;

        if ( this.debug ) {
            console.log("Refreshing CouchPotato");
            console.log(" - api_key: " + this.api_key);
            console.log(" - limit: " + this.limit);
            console.log(" - url: " + this.url);
        }

        // start updating the page while the object is created
        this.refresh();

        // update the couchpotato link and show the table
        $("a[href='http://127.0.0.1:5050/']").attr("href", this.url);
        $("#couchpotato").show();

        return this;
    };
    CouchPotato.prototype.refresh = function () {
        var couchpotato_url = this.url + "api/" + this.api_key +
                              "/movie.list/?status=done&callback_func=?&limit_offset=" + this.limit;
        var debug           = this.debug;

        // clear out any existing recently found movies
        $("#couchpotato-downloads > tbody:last").children().remove();

        if ( debug ) console.log("CouchPotato: querying " + couchpotato_url);

        $.getJSON(couchpotato_url, function (data) {
            if ( debug ) console.log("CouchPotato: found " + data.movies.length + " movies");
            $.each(data.movies, function (id, movie) {
                if ( debug ) console.log("CouchPotato: processing " + movie.library.info.original_title);
                var vars = {
                    "title": movie.library.info.original_title,
                    "quality": movie.profile ? movie.profile.label : "",
                    "release_date": movie.library.info.released,
                };

                $("#couchpotato-downloads > tbody:last").append($("#couchpotato-template").render(vars));
            });
        });
    };

    Headphones = function (params) {
        this.api_key = params.api_key == undefined ? alert("api_key is a required parameter for Headphones")
                                                   : params.api_key;
        this.url     = params.url     == undefined ? "http://127.0.0.1:8181/"
                                                   : params.url;
        this.limit   = params.limit   == undefined ? 10
                                                   : params.limit;
        this.debug   = params.debug   == undefined ? 0 : 1;

        if ( this.debug ) {
            console.log("Refreshing HeadPhones");
            console.log(" - api_key: " + this.api_key);
            console.log(" - limit: " + this.limit);
            console.log(" - url: " + this.url);
        }

        // start updating the page while the object is created
        this.refresh();

        // update the headphones link and show the table
        $("a[href='http://127.0.0.1:8181/']").attr("href", this.url);
        $("#headphones").show();

        return this;
    };
    Headphones.prototype.refresh = function () {
        var base_url       = this.url;
        var headphones_url = base_url + "api/?&cmd=getHistory&callback=?&apikey=" + this.api_key;
        var limit          = this.limit;
        var debug          = this.debug;

        // clear out any existing history
        $("#headphones-downloads > tbody:last").children().remove();

        if ( debug ) console.log("HeadPhones: querying " + headphones_url);

        $.getJSON(headphones_url, function (data) {
            if ( debug ) console.log("HeadPhones: found " + data.length + " downloads. Limit " + limit);

            // the HeadPhones API has no limit, so apply one now before returning the results
            data = data.slice(0,++limit);

            $.each(data, function (id, file) {
                if ( debug ) console.log("HeadPhones: processing " + file.Title);
                var vars = {
                    "status"    : file.Status,
                    "title"     : file.Title,
                    "class"     : file.Status.toLowerCase(),
                    "album_url" : base_url + "albumPage?AlbumID=" + file.AlbumID,
                };

                $("#headphones-downloads > tbody:last").append($("#headphones-template").render(vars));
            });
        });
    };

});
