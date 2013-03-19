## What is This?

A little landing page for SABnzbd+, Sick Beard, CouchPotato, and Headphones.

In action: http://i.imgur.com/a7Wtzq4.jpg

## Initial Setup

Just add your api key for each application. If you don't use one of them, just comment it out or remove it.

```js
      var sabnzbd = new SABnzbd({
          "api_key" : "1d75b8078d4ba23e06f6ee1217556dda",
      });

      var sickbeard = new SickBeard({
          "api_key" : "1266e092c888d5caeea3f3db59359101",
      });

      var couchpotato = new CouchPotato({
          "api_key" : "284ed2abb2854b5c819fbf11f9c54bce",
      });

      var headphones = new Headphones({
          "api_key" : "9394ed9dd44d0d49413e7afce75f7773",
      });
```

## Default Values

To override default values:
```js
    var application = new Application({
        "api_key" : "1d75b8078d4ba23e06f6ee1217556dda",
        "url"     : "http://hostname:port/path/",
        "limit"   : 20,
    });
```

### SABnzbd+ Parameters
#### url
The base URL for SABnzbd+.

`http://127.0.0.1:8080/`

#### limit
The maximum number of recent downloads to display.

`10`

### Sick Beard Parameters
#### url
The base URL for Sick beard.

`http://127.0.0.1:8081/`

#### limit
The maximum number of upcoming and missed shows to display.

`10`

### Couch Potato Parameters
#### url
The base URL for Couch Potato.

`http://127.0.0.1:5050/`

#### limit
The maximum number of recently found movies to display.

`10`

### Headphones Parameters
#### url
The base URL for Headphones.

`http://127.0.0.1:8181/`
