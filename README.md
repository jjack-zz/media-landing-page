## What is This?

A little landing page for SABnzbd+, Sick Beard, and CouchPotato.

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
```

## Default Values

### SABnzbd+

`url`   : `http://127.0.0.1:8080/sabnzbd/`
`limit` : `10`

### Sick Beard
`url`   : `http://127.0.0.1:8081/`
`limit` : `10`

### Couch Potato
`url`   : `http://127.0.0.1:5050/`
`limit` : `10`
