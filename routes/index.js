var express = require('express');
const os = require('os');
var router = express.Router();
const path = require('path');

router.use('/', express.static(path.join(__dirname, '../public')));

/* GET home page. */
router.use('/info', function(req, res) {
    var infoObj = {
        "name": "Cameras Discovery",
        "description": "This repo aims at providing all necessary tools to discover cameras on network via Upnp, Onvif, port scan etc.",
        "version": "0.1.0",
        "build": {
            "href": os.environ.get('CI_BUILD_LINK', '-'),
            "name": "SomeBuild No",
        },
        "repo": {
            "name": os.environ.get('CI_REPO_NAME', '-'),
            "href": os.environ.get('CI_REPO_LINK', '-')
        },
        "commit": {
            "href": "os.environ.get('CI_COMMIT_LINK', '-')",
            "author": "os.environ.get('CI_COMMIT_AUTHOR_EMAIL', '-')",
            "message": "os.environment.get('CI_COMMIT_MESSAGE', '-')",
        }
    };
    return res.send(infoObj);
});

router.use('/config', function(req, res) {
    let configObj = {
        "API_VERSION": "xx",
        "APPLICATION_ROOT": "/",
        "BASE_INTERVAL": 11,
        "DEBUG": true,
        "DEFAULT_SYSTEM_TIMEZONE": "GMT",
        "DEFAULT_USER_TIMEZONE": "Asia/Kolkata",
        "ENV": "sexy",
        "EXPLAIN_TEMPLATE_LOADING": false,
        "HOST": "0.0.0.0",
        "HOST_NAME": "api.vedalabs.in"
    };
    return res.json(configObj);
});

router.use('/sitemap', function(req, res) {
    let siteMapObj = {
        "_links": {
            "child": [{
                    "href": "/config",
                    "methods": ["GET", "HEAD", "OPTIONS"], // Optional
                    "title": "config"
                },
                {
                    "href": "/info",
                    "title": "info"
                },
                {
                    "href": "/health",
                    "title": "health"
                },
                {
                    "href": "/ready",
                    "title": "readiness"
                }
            ]
        },
        "_meta": {
            "build": {
                "href": "will get here CI_BUILD_LINK"
            }
        }
    };
    return res.send(siteMapObj);
});

router.use('/streamview', function(req, res) {
    return res.sendFile('stream.html', { root: path.join(__dirname, '../public') });
});

router.use('/discover', function(req, res) {
    return res.sendFile('index.html', { root: path.join(__dirname, '../public') });    
});


// TODO: redirect this route to all info or documentation page.
router.use('/', (req, res) => {
    console.log('root route hit!');
    return res.send({
        "status": "OK"
    })
})

module.exports = router;