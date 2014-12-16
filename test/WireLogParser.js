var should = require('chai').should();
var heredoc = require('heredoc');

var parser = require('../src/js/WireLogParser.js');

var logTextSimply = heredoc(function () {/*
17:25:27.278 [main] DEBUG org.apache.http.wire - http-outgoing-0 >> "GET /api/foo?bar=123&buz=456 HTTP/1.1[\r][\n]"
17:25:27.278 [main] DEBUG org.apache.http.wire - http-outgoing-0 >> "Host: 127.0.0.1:8080[\r][\n]"
17:25:27.278 [main] DEBUG org.apache.http.wire - http-outgoing-0 >> "Connection: Keep-Alive[\r][\n]"
17:25:27.278 [main] DEBUG org.apache.http.wire - http-outgoing-0 >> "User-Agent: Apache-HttpClient/4.3.5 (java 1.5)[\r][\n]"
17:25:27.278 [main] DEBUG org.apache.http.wire - http-outgoing-0 >> "Accept-Encoding: gzip,deflate[\r][\n]"
17:25:27.278 [main] DEBUG org.apache.http.wire - http-outgoing-0 >> "[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-0 << "HTTP/1.1 200 OK[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-0 << "Date: Mon, 20 Oct 2014 08:25:27 GMT[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-0 << "Content-Type: application/json; charset=utf-8[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-0 << "Content-Length: 87[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-0 << "Server: Jetty(9.2.3.v20140905)[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-0 << "[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-0 << "{"code":200,"messages":[],"data":{"foo":[{"bar":123,"buz":456},{"bar":321,"buz":654}]}}"
*/});

var logTextMixed = heredoc(function () {/*
17:25:27.278 [main] DEBUG org.apache.http.wire - http-outgoing-0 >> "GET /api/foo?bar=123&buz=456 HTTP/1.1[\r][\n]"
17:25:27.278 [main] DEBUG org.apache.http.wire - http-outgoing-2 >> "GET /api/bar HTTP/1.1[\r][\n]"
17:25:27.278 [main] DEBUG org.apache.http.wire - http-outgoing-0 >> "Host: 127.0.0.1:8080[\r][\n]"
17:25:27.278 [main] DEBUG org.apache.http.wire - http-outgoing-2 >> "Host: 127.0.0.1:9292[\r][\n]"
17:25:27.278 [main] DEBUG org.apache.http.wire - http-outgoing-0 >> "Connection: Keep-Alive[\r][\n]"
17:25:27.278 [main] DEBUG org.apache.http.wire - http-outgoing-2 >> "User-Agent: Apache-HttpClient/4.3.5 (java 1.5)[\r][\n]"
17:25:27.278 [main] DEBUG org.apache.http.wire - http-outgoing-0 >> "User-Agent: Apache-HttpClient/4.3.5 (java 1.5)[\r][\n]"
17:25:27.278 [main] DEBUG org.apache.http.wire - http-outgoing-2 >> "[\r][\n]"
17:25:27.278 [main] DEBUG org.apache.http.wire - http-outgoing-0 >> "Accept-Encoding: gzip,deflate[\r][\n]"
17:25:27.278 [main] DEBUG org.apache.http.wire - http-outgoing-0 >> "[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-2 << "HTTP/1.1 200 OK[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-0 << "HTTP/1.1 200 OK[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-2 << "Date: Tue, 21 Oct 2014 14:38:11 GMT[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-0 << "Date: Mon, 20 Oct 2014 08:25:27 GMT[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-2 << "Content-Type: application/json; charset=utf-8[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-0 << "Content-Type: application/json; charset=utf-8[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-2 << "Content-Length: 36[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-0 << "Content-Length: 87[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-2 << "Server: Jetty(9.2.3.v20140905)[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-0 << "Server: Jetty(9.2.3.v20140905)[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-2 << "[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-0 << "[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-2 << "{"code":200,"messages":[],"data":{}}"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-0 << "{"code":200,"messages":[],"data":{"foo":[{"bar":123,"buz":456},{"bar":321,"buz":654}]}}"
*/});

var logTextLacked = heredoc(function () {/*
17:25:27.278 [main] DEBUG org.apache.http.wire - http-outgoing-0 >> "GET /api/foo?bar=123&buz=456 HTTP/1.1[\r][\n]"
17:25:27.278 [main] DEBUG org.apache.http.wire - http-outgoing-0 >> "Host: 127.0.0.1:8080[\r][\n]"
17:25:27.278 [main] DEBUG org.apache.http.wire - http-outgoing-0 >> "Connection: Keep-Alive[\r][\n]"
17:25:27.278 [main] DEBUG org.apache.http.wire - http-outgoing-0 >> "User-Agent: Apache-HttpClient/4.3.5 (java 1.5)[\r][\n]"
17:25:27.278 [main] DEBUG org.apache.http.wire - http-outgoing-0 >> "Accept-Encoding: gzip,deflate[\r][\n]"
17:25:27.278 [main] DEBUG org.apache.http.wire - http-outgoing-0 >> "[\r][\n]"
*/});

var logTextReUsed = heredoc(function () {/*
17:25:27.278 [main] DEBUG org.apache.http.wire - http-outgoing-0 >> "GET /api/foo?bar=123&buz=456 HTTP/1.1[\r][\n]"
17:25:27.278 [main] DEBUG org.apache.http.wire - http-outgoing-0 >> "Host: 127.0.0.1:8080[\r][\n]"
17:25:27.278 [main] DEBUG org.apache.http.wire - http-outgoing-0 >> "Connection: Keep-Alive[\r][\n]"
17:25:27.278 [main] DEBUG org.apache.http.wire - http-outgoing-0 >> "User-Agent: Apache-HttpClient/4.3.5 (java 1.5)[\r][\n]"
17:25:27.278 [main] DEBUG org.apache.http.wire - http-outgoing-0 >> "Accept-Encoding: gzip,deflate[\r][\n]"
17:25:27.278 [main] DEBUG org.apache.http.wire - http-outgoing-0 >> "[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-0 << "HTTP/1.1 200 OK[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-0 << "Date: Mon, 20 Oct 2014 08:25:27 GMT[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-0 << "Content-Type: application/json; charset=utf-8[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-0 << "Content-Length: 87[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-0 << "Server: Jetty(9.2.3.v20140905)[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-0 << "[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-0 << "{"code":200,"messages":[],"data":{"foo":[{"bar":123,"buz":456},{"bar":321,"buz":654}]}}"
17:25:27.278 [main] DEBUG org.apache.http.wire - http-outgoing-0 >> "GET /api/bar HTTP/1.1[\r][\n]"
17:25:27.278 [main] DEBUG org.apache.http.wire - http-outgoing-0 >> "Host: 127.0.0.1:9292[\r][\n]"
17:25:27.278 [main] DEBUG org.apache.http.wire - http-outgoing-0 >> "User-Agent: Apache-HttpClient/4.3.5 (java 1.5)[\r][\n]"
17:25:27.278 [main] DEBUG org.apache.http.wire - http-outgoing-0 >> "[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-0 << "HTTP/1.1 200 OK[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-0 << "Date: Tue, 21 Oct 2014 14:38:11 GMT[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-0 << "Content-Type: application/json; charset=utf-8[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-0 << "Content-Length: 36[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-0 << "Server: Jetty(9.2.3.v20140905)[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-0 << "[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-0 << "{"code":200,"messages":[],"data":{}}"
17:25:27.278 [main] DEBUG org.apache.http.wire - http-outgoing-0 >> "GET /api/foo?bar=123&buz=456 HTTP/1.1[\r][\n]"
17:25:27.278 [main] DEBUG org.apache.http.wire - http-outgoing-0 >> "Host: 127.0.0.1:9292[\r][\n]"
17:25:27.278 [main] DEBUG org.apache.http.wire - http-outgoing-0 >> "User-Agent: Apache-HttpClient/4.3.5 (java 1.5)[\r][\n]"
17:25:27.278 [main] DEBUG org.apache.http.wire - http-outgoing-0 >> "[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-0 << "HTTP/1.1 200 OK[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-0 << "Date: Tue, 21 Oct 2014 14:38:11 GMT[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-0 << "Content-Type: application/json; charset=utf-8[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-0 << "Content-Length: 36[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-0 << "Server: Jetty(9.2.3.v20140905)[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-0 << "[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-0 << "{"code":200,"messages":[],"data":{}}"
*/});

var logTextContainsBytes = heredoc(function () {/*
17:25:27.278 [main] DEBUG org.apache.http.wire - http-outgoing-0 >> "GET /api/foo?bar=123&buz=456 HTTP/1.1[\r][\n]"
17:25:27.278 [main] DEBUG org.apache.http.wire - http-outgoing-0 >> "Host: 127.0.0.1:8080[\r][\n]"
17:25:27.278 [main] DEBUG org.apache.http.wire - http-outgoing-0 >> "Connection: Keep-Alive[\r][\n]"
17:25:27.278 [main] DEBUG org.apache.http.wire - http-outgoing-0 >> "User-Agent: Apache-HttpClient/4.3.5 (java 1.5)[\r][\n]"
17:25:27.278 [main] DEBUG org.apache.http.wire - http-outgoing-0 >> "Accept-Encoding: gzip,deflate[\r][\n]"
17:25:27.278 [main] DEBUG org.apache.http.wire - http-outgoing-0 >> "[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-0 << "HTTP/1.1 200 OK[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-0 << "Date: Mon, 20 Oct 2014 08:25:27 GMT[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-0 << "Content-Type: application/json; charset=utf-8[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-0 << "Content-Length: 87[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-0 << "Server: Jetty(9.2.3.v20140905)[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-0 << "[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-0 << "{"code":200,"messages":"[0xe5][0x86][0x86][0xe3][0x81][0x8b][0xe3][0x81][0x8b][0xe3][0x82][0x8a][0xe3][0x81][0xbe][0xe3][0x81][0x99][0xe3][0x80][0x82]"}"
*/});

var logTextPost = heredoc(function () {/*
11:37:08.550 [main] DEBUG org.apache.http.wire - http-outgoing-0 >> "POST /foo/bar HTTP/1.1[\r][\n]"
11:37:08.551 [main] DEBUG org.apache.http.wire - http-outgoing-0 >> "Content-Type: application/json; charset=utf-8[\r][\n]"
11:37:08.551 [main] DEBUG org.apache.http.wire - http-outgoing-0 >> "Content-Length: 42[\r][\n]"
11:37:08.551 [main] DEBUG org.apache.http.wire - http-outgoing-0 >> "Host: example.com[\r][\n]"
11:37:08.551 [main] DEBUG org.apache.http.wire - http-outgoing-0 >> "[\r][\n]"
11:37:08.551 [main] DEBUG org.apache.http.wire - http-outgoing-0 >> "{[\n]"
11:37:08.551 [main] DEBUG org.apache.http.wire - http-outgoing-0 >> "  "Location" : "Japan",[\n]"
11:37:08.551 [main] DEBUG org.apache.http.wire - http-outgoing-0 >> "  "Job" : "Ninja"[\n]"
11:37:08.551 [main] DEBUG org.apache.http.wire - http-outgoing-0 >> "}"
11:37:09.620 [main] DEBUG org.apache.http.wire - http-outgoing-0 << "HTTP/1.1 200 OK[\r][\n]"
11:37:09.620 [main] DEBUG org.apache.http.wire - http-outgoing-0 << "Content-Length: 38[\r][\n]"
11:37:09.620 [main] DEBUG org.apache.http.wire - http-outgoing-0 << "Content-Type: application/json; charset=utf-8[\r][\n]"
11:37:09.621 [main] DEBUG org.apache.http.wire - http-outgoing-0 << "Date: Mon, 27 Oct 2014 02:37:08 GMT[\r][\n]"
11:37:09.621 [main] DEBUG org.apache.http.wire - http-outgoing-0 << "[\r][\n]"
11:37:09.621 [main] DEBUG org.apache.http.wire - http-outgoing-0 << "{"Message":"hello","Status":"Success"}"
*/});

describe('WireLogParser', function () {
    describe('#parse', function () {
        describe('parse simple log', function () {
            var p = new parser.WireLogParser({
                'removeNewLine': true,
                'bePrettyJSON': false,
            });
            var parsed = p.parse(logTextSimply);
            it('should parse rightly', function () {
                Object.keys(parsed).length.should.equal(1);
                parsed['GET /api/foo?bar=123&buz=456 HTTP/1.1'].requestLog.logs.should.deep.equal(
                    [
                        {
                            'log': 'GET /api/foo?bar=123&buz=456 HTTP/1.1',
                            'type': 'http-request',
                            'direction': 'request'
                        },
                        {
                            'log': '127.0.0.1:8080',
                            'type': 'header',
                            'headerName': 'Host',
                            'direction': 'request'
                        },
                        {
                            'log': 'Keep-Alive',
                            'type': 'header',
                            'headerName': 'Connection',
                            'direction': 'request'
                        },
                        {
                            'log': 'Apache-HttpClient/4.3.5 (java 1.5)',
                            'type': 'header',
                            'headerName': 'User-Agent',
                            'direction': 'request'
                        },
                        {
                            'log': 'gzip,deflate',
                            'type': 'header',
                            'headerName': 'Accept-Encoding',
                            'direction': 'request'
                        },
                        {
                            'log': '',
                            'type': 'body',
                            'direction': 'request'
                        }
                    ]
                );
                parsed['GET /api/foo?bar=123&buz=456 HTTP/1.1'].responseLog.logs.should.deep.equal(
                    [
                        {
                            'log': 'HTTP/1.1 200 OK',
                            'type': 'http-response',
                            'direction': 'response'
                        },
                        {
                            'log': 'Mon, 20 Oct 2014 08:25:27 GMT',
                            'type': 'header',
                            'headerName': 'Date',
                            'direction': 'response'
                        },
                        {
                            'log': 'application/json; charset=utf-8',
                            'type': 'header',
                            'headerName': 'Content-Type',
                            'direction': 'response'
                        },
                        {
                            'log': '87',
                            'type': 'header',
                            'headerName': 'Content-Length',
                            'direction': 'response'
                        },
                        {
                            'log': 'Jetty(9.2.3.v20140905)',
                            'type': 'header',
                            'headerName': 'Server',
                            'direction': 'response'
                        },
                        {
                            'log': '',
                            'type': 'body',
                            'direction': 'response'
                        },
                        {
                            'log': '{"code":200,"messages":[],"data":{"foo":[{"bar":123,"buz":456},{"bar":321,"buz":654}]}}',
                            'type': 'body',
                            'direction': 'response'
                        }
                    ]
                );
            });

            it('should to be string rightly', function () {
                parsed['GET /api/foo?bar=123&buz=456 HTTP/1.1'].requestLog.toString().should.equal(heredoc(function () {/*
GET /api/foo?bar=123&buz=456 HTTP/1.1
Host: 127.0.0.1:8080
Connection: Keep-Alive
User-Agent: Apache-HttpClient/4.3.5 (java 1.5)
Accept-Encoding: gzip,deflate

                */}));
                parsed['GET /api/foo?bar=123&buz=456 HTTP/1.1'].responseLog.toString().should.equal(heredoc(function () {/*
HTTP/1.1 200 OK
Date: Mon, 20 Oct 2014 08:25:27 GMT
Content-Type: application/json; charset=utf-8
Content-Length: 87
Server: Jetty(9.2.3.v20140905)

{"code":200,"messages":[],"data":{"foo":[{"bar":123,"buz":456},{"bar":321,"buz":654}]}}
                */}));
            });

            it('should get curl command rightly', function () {
                parsed['GET /api/foo?bar=123&buz=456 HTTP/1.1'].getCurlCmd().should.equal('curl -H "Host: 127.0.0.1:8080" -H "Connection: Keep-Alive" -H "User-Agent: Apache-HttpClient/4.3.5 (java 1.5)" -H "Accept-Encoding: gzip,deflate" 127.0.0.1:8080/api/foo?bar=123&buz=456 -X GET ');
            });
        });

        describe('parse mixed multi log', function () {
            var p = new parser.WireLogParser({
                'removeNewLine': true,
                'bePrettyJSON': false,
            });
            var parsed = p.parse(logTextMixed);
            it('should parse rightly', function () {
                Object.keys(parsed).length.should.equal(2);

                parsed['GET /api/foo?bar=123&buz=456 HTTP/1.1'].requestLog.logs.should.deep.equal(
                    [
                        {
                            'log': 'GET /api/foo?bar=123&buz=456 HTTP/1.1',
                            'type': 'http-request',
                            'direction': 'request'
                        },
                        {
                            'log': '127.0.0.1:8080',
                            'type': 'header',
                            'headerName': 'Host',
                            'direction': 'request'
                        },
                        {
                            'log': 'Keep-Alive',
                            'type': 'header',
                            'headerName': 'Connection',
                            'direction': 'request'
                        },
                        {
                            'log': 'Apache-HttpClient/4.3.5 (java 1.5)',
                            'type': 'header',
                            'headerName': 'User-Agent',
                            'direction': 'request'
                        },
                        {
                            'log': 'gzip,deflate',
                            'type': 'header',
                            'headerName': 'Accept-Encoding',
                            'direction': 'request'
                        },
                        {
                            'log': '',
                            'type': 'body',
                            'direction': 'request'
                        }
                    ]
                );
                parsed['GET /api/foo?bar=123&buz=456 HTTP/1.1'].responseLog.logs.should.deep.equal(
                    [
                        {
                            'log': 'HTTP/1.1 200 OK',
                            'type': 'http-response',
                            'direction': 'response'
                        },
                        {
                            'log': 'Mon, 20 Oct 2014 08:25:27 GMT',
                            'type': 'header',
                            'headerName': 'Date',
                            'direction': 'response'
                        },
                        {
                            'log': 'application/json; charset=utf-8',
                            'type': 'header',
                            'headerName': 'Content-Type',
                            'direction': 'response'
                        },
                        {
                            'log': '87',
                            'type': 'header',
                            'headerName': 'Content-Length',
                            'direction': 'response'
                        },
                        {
                            'log': 'Jetty(9.2.3.v20140905)',
                            'type': 'header',
                            'headerName': 'Server',
                            'direction': 'response'
                        },
                        {
                            'log': '',
                            'type': 'body',
                            'direction': 'response'
                        },
                        {
                            'log': '{"code":200,"messages":[],"data":{"foo":[{"bar":123,"buz":456},{"bar":321,"buz":654}]}}',
                            'type': 'body',
                            'direction': 'response'
                        }
                    ]
                );

                parsed['GET /api/bar HTTP/1.1'].requestLog.logs.should.deep.equal(
                    [
                        {
                            'log': 'GET /api/bar HTTP/1.1',
                            'type': 'http-request',
                            'direction': 'request'
                        },
                        {
                            'log': '127.0.0.1:9292',
                            'type': 'header',
                            'headerName': 'Host',
                            'direction': 'request'
                        },
                        {
                            'log': 'Apache-HttpClient/4.3.5 (java 1.5)',
                            'type': 'header',
                            'headerName': 'User-Agent',
                            'direction': 'request'
                        },
                        {
                            'log': '',
                            'type': 'body',
                            'direction': 'request'
                        }
                    ]
                );

                parsed['GET /api/bar HTTP/1.1'].responseLog.logs.should.deep.equal(
                    [
                        {
                            'log': 'HTTP/1.1 200 OK',
                            'type': 'http-response',
                            'direction': 'response'
                        },
                        {
                            'log': 'Tue, 21 Oct 2014 14:38:11 GMT',
                            'type': 'header',
                            'headerName': 'Date',
                            'direction': 'response'
                        },
                        {
                            'log': 'application/json; charset=utf-8',
                            'type': 'header',
                            'headerName': 'Content-Type',
                            'direction': 'response'
                        },
                        {
                            'log': '36',
                            'type': 'header',
                            'headerName': 'Content-Length',
                            'direction': 'response'
                        },
                        {
                            'log': 'Jetty(9.2.3.v20140905)',
                            'type': 'header',
                            'headerName': 'Server',
                            'direction': 'response'
                        },
                        {
                            'log': '',
                            'type': 'body',
                            'direction': 'response'
                        },
                        {
                            'log': '{"code":200,"messages":[],"data":{}}',
                            'type': 'body',
                            'direction': 'response'
                        }
                    ]
                );
            });

            it('should to be string rightly', function () {
                parsed['GET /api/foo?bar=123&buz=456 HTTP/1.1'].requestLog.toString().should.equal(heredoc(function () {/*
GET /api/foo?bar=123&buz=456 HTTP/1.1
Host: 127.0.0.1:8080
Connection: Keep-Alive
User-Agent: Apache-HttpClient/4.3.5 (java 1.5)
Accept-Encoding: gzip,deflate

                */}));
                parsed['GET /api/foo?bar=123&buz=456 HTTP/1.1'].responseLog.toString().should.equal(heredoc(function () {/*
HTTP/1.1 200 OK
Date: Mon, 20 Oct 2014 08:25:27 GMT
Content-Type: application/json; charset=utf-8
Content-Length: 87
Server: Jetty(9.2.3.v20140905)

{"code":200,"messages":[],"data":{"foo":[{"bar":123,"buz":456},{"bar":321,"buz":654}]}}
                */}));

                parsed['GET /api/bar HTTP/1.1'].requestLog.toString().should.equal(heredoc(function () {/*
GET /api/bar HTTP/1.1
Host: 127.0.0.1:9292
User-Agent: Apache-HttpClient/4.3.5 (java 1.5)

                */}));
                parsed['GET /api/bar HTTP/1.1'].responseLog.toString().should.equal(heredoc(function () {/*
HTTP/1.1 200 OK
Date: Tue, 21 Oct 2014 14:38:11 GMT
Content-Type: application/json; charset=utf-8
Content-Length: 36
Server: Jetty(9.2.3.v20140905)

{"code":200,"messages":[],"data":{}}
                */}));
            });

            it('should check empty or not rightly', function () {
                parsed['GET /api/foo?bar=123&buz=456 HTTP/1.1'].isEmpty().should.equal(false);
                parsed['GET /api/foo?bar=123&buz=456 HTTP/1.1'].requestLog.isEmpty().should.equal(false);
                parsed['GET /api/foo?bar=123&buz=456 HTTP/1.1'].responseLog.isEmpty().should.equal(false);
            });

            it('should get curl command rightly', function () {
                parsed['GET /api/foo?bar=123&buz=456 HTTP/1.1'].getCurlCmd().should.equal('curl -H "Host: 127.0.0.1:8080" -H "Connection: Keep-Alive" -H "User-Agent: Apache-HttpClient/4.3.5 (java 1.5)" -H "Accept-Encoding: gzip,deflate" 127.0.0.1:8080/api/foo?bar=123&buz=456 -X GET ');
                parsed['GET /api/bar HTTP/1.1'].getCurlCmd().should.equal('curl -H "Host: 127.0.0.1:9292" -H "User-Agent: Apache-HttpClient/4.3.5 (java 1.5)" 127.0.0.1:9292/api/bar -X GET ');
            });
        });

        describe('lacked log', function () {
            var p = new parser.WireLogParser({
                'removeNewLine': true,
                'bePrettyJSON': false,
            });
            var parsed = p.parse(logTextLacked);
            it('should check empty or not rightly', function () {
                parsed['GET /api/foo?bar=123&buz=456 HTTP/1.1'].isEmpty().should.equal(false);
                parsed['GET /api/foo?bar=123&buz=456 HTTP/1.1'].requestLog.isEmpty().should.equal(false);
                parsed['GET /api/foo?bar=123&buz=456 HTTP/1.1'].responseLog.isEmpty().should.equal(true);
            });
        });

        describe('connection reusing log', function () {
            var p = new parser.WireLogParser({
                'removeNewLine': true,
                'bePrettyJSON': false,
            });
            var parsed = p.parse(logTextReUsed);

            it('should parse rightly', function () {
                parsed['GET /api/foo?bar=123&buz=456 HTTP/1.1'].requestLog.logs.should.deep.equal(
                    [
                        {
                            'log': 'GET /api/foo?bar=123&buz=456 HTTP/1.1',
                            'type': 'http-request',
                            'direction': 'request'
                        },
                        {
                            'log': '127.0.0.1:9292',
                            'type': 'header',
                            'headerName': 'Host',
                            'direction': 'request'
                        },
                        {
                            'log': 'Apache-HttpClient/4.3.5 (java 1.5)',
                            'type': 'header',
                            'headerName': 'User-Agent',
                            'direction': 'request'
                        },
                        {
                            'log': '',
                            'type': 'body',
                            'direction': 'request'
                        }
                    ]
                );

                parsed['GET /api/bar HTTP/1.1'].responseLog.logs.should.deep.equal(
                    [
                        {
                            'log': 'HTTP/1.1 200 OK',
                            'type': 'http-response',
                            'direction': 'response'
                        },
                        {
                            'log': 'Tue, 21 Oct 2014 14:38:11 GMT',
                            'type': 'header',
                            'headerName': 'Date',
                            'direction': 'response'
                        },
                        {
                            'log': 'application/json; charset=utf-8',
                            'type': 'header',
                            'headerName': 'Content-Type',
                            'direction': 'response'
                        },
                        {
                            'log': '36',
                            'type': 'header',
                            'headerName': 'Content-Length',
                            'direction': 'response'
                        },
                        {
                            'log': 'Jetty(9.2.3.v20140905)',
                            'type': 'header',
                            'headerName': 'Server',
                            'direction': 'response'
                        },
                        {
                            'log': '',
                            'type': 'body',
                            'direction': 'response'
                        },
                        {
                            'log': '{"code":200,"messages":[],"data":{}}',
                            'type': 'body',
                            'direction': 'response'
                        }
                    ]
                );

                parsed['GET /api/bar HTTP/1.1'].requestLog.logs.should.deep.equal(
                    [
                        {
                            'log': 'GET /api/bar HTTP/1.1',
                            'type': 'http-request',
                            'direction': 'request'
                        },
                        {
                            'log': '127.0.0.1:9292',
                            'type': 'header',
                            'headerName': 'Host',
                            'direction': 'request'
                        },
                        {
                            'log': 'Apache-HttpClient/4.3.5 (java 1.5)',
                            'type': 'header',
                            'headerName': 'User-Agent',
                            'direction': 'request'
                        },
                        {
                            'log': '',
                            'type': 'body',
                            'direction': 'request'
                        }
                    ]
                );

                parsed['GET /api/bar HTTP/1.1'].responseLog.logs.should.deep.equal(
                    [
                        {
                            'log': 'HTTP/1.1 200 OK',
                            'type': 'http-response',
                            'direction': 'response'
                        },
                        {
                            'log': 'Tue, 21 Oct 2014 14:38:11 GMT',
                            'type': 'header',
                            'headerName': 'Date',
                            'direction': 'response'
                        },
                        {
                            'log': 'application/json; charset=utf-8',
                            'type': 'header',
                            'headerName': 'Content-Type',
                            'direction': 'response'
                        },
                        {
                            'log': '36',
                            'type': 'header',
                            'headerName': 'Content-Length',
                            'direction': 'response'
                        },
                        {
                            'log': 'Jetty(9.2.3.v20140905)',
                            'type': 'header',
                            'headerName': 'Server',
                            'direction': 'response'
                        },
                        {
                            'log': '',
                            'type': 'body',
                            'direction': 'response'
                        },
                        {
                            'log': '{"code":200,"messages":[],"data":{}}',
                            'type': 'body',
                            'direction': 'response'
                        }
                    ]
                );
            });

            it('should to be string rightly', function () {
                parsed['GET /api/foo?bar=123&buz=456 HTTP/1.1'].requestLog.toString().should.equal(heredoc(function () {/*
GET /api/foo?bar=123&buz=456 HTTP/1.1
Host: 127.0.0.1:9292
User-Agent: Apache-HttpClient/4.3.5 (java 1.5)

                */}));
                parsed['GET /api/foo?bar=123&buz=456 HTTP/1.1'].responseLog.toString().should.equal(heredoc(function () {/*
HTTP/1.1 200 OK
Date: Tue, 21 Oct 2014 14:38:11 GMT
Content-Type: application/json; charset=utf-8
Content-Length: 36
Server: Jetty(9.2.3.v20140905)

{"code":200,"messages":[],"data":{}}
                */}));

                parsed['GET /api/bar HTTP/1.1'].requestLog.toString().should.equal(heredoc(function () {/*
GET /api/bar HTTP/1.1
Host: 127.0.0.1:9292
User-Agent: Apache-HttpClient/4.3.5 (java 1.5)

                */}));
                parsed['GET /api/bar HTTP/1.1'].responseLog.toString().should.equal(heredoc(function () {/*
HTTP/1.1 200 OK
Date: Tue, 21 Oct 2014 14:38:11 GMT
Content-Type: application/json; charset=utf-8
Content-Length: 36
Server: Jetty(9.2.3.v20140905)

{"code":200,"messages":[],"data":{}}
                */}));
            });
        });

        describe('parse simple log with pretty JSON mode', function () {
            var p = new parser.WireLogParser({
                'removeNewLine': true,
                'bePrettyJSON': true,
            });
            it('should to be string rightly pretty', function () {
                var parsed = p.parse(logTextSimply);
                parsed['GET /api/foo?bar=123&buz=456 HTTP/1.1'].requestLog.toString().should.equal(heredoc(function () {/*
GET /api/foo?bar=123&buz=456 HTTP/1.1
Host: 127.0.0.1:8080
Connection: Keep-Alive
User-Agent: Apache-HttpClient/4.3.5 (java 1.5)
Accept-Encoding: gzip,deflate

                */}));
                parsed['GET /api/foo?bar=123&buz=456 HTTP/1.1'].responseLog.toString().should.equal(heredoc(function () {/*
HTTP/1.1 200 OK
Date: Mon, 20 Oct 2014 08:25:27 GMT
Content-Type: application/json; charset=utf-8
Content-Length: 87
Server: Jetty(9.2.3.v20140905)

{
    "code": 200,
    "messages": [],
    "data": {
        "foo": [
            {
                "bar": 123,
                "buz": 456
            },
            {
                "bar": 321,
                "buz": 654
            }
        ]
    }
}
                */}));
            });
        });

        describe('parse simple log with decoding byte string', function () {
            var p = new parser.WireLogParser({
                'removeNewLine': true,
                'decodeBytes': true,
            });

            it('should to be string rightly with decoding', function () {
                var parsed = p.parse(logTextContainsBytes);
                parsed['GET /api/foo?bar=123&buz=456 HTTP/1.1'].requestLog.toString().should.equal(heredoc(function () {/*
GET /api/foo?bar=123&buz=456 HTTP/1.1
Host: 127.0.0.1:8080
Connection: Keep-Alive
User-Agent: Apache-HttpClient/4.3.5 (java 1.5)
Accept-Encoding: gzip,deflate

                */}));
                parsed['GET /api/foo?bar=123&buz=456 HTTP/1.1'].responseLog.toString().should.equal(heredoc(function () {/*
HTTP/1.1 200 OK
Date: Mon, 20 Oct 2014 08:25:27 GMT
Content-Type: application/json; charset=utf-8
Content-Length: 87
Server: Jetty(9.2.3.v20140905)

{"code":200,"messages":"円かかります。"}
                */}));
            });
        });

        describe('post log', function () {
            var p = new parser.WireLogParser({
                'removeNewLine': true,
                'decodeBytes': true,
            });

            it('should get curl command rightly', function () {
                var parsed = p.parse(logTextPost);
                parsed['POST /foo/bar HTTP/1.1'].getCurlCmd().should.equal('curl -H "Content-Type: application/json; charset=utf-8" -H "Content-Length: 42" -H "Host: example.com" example.com/foo/bar -X POST -d "{  \\"Location\\" : \\"Japan\\",  \\"Job\\" : \\"Ninja\\"}"');
            });
        });
    });

    describe('for coverage', function () {
        describe('something inserted after identifier', function () {
            var logTextInsertedSomething = heredoc(function () {/*
17:25:27.278 [main] DEBUG org.apache.http.wire [] - http-outgoing-0 >> "GET /api/foo?bar=123&buz=456 HTTP/1.1[\r][\n]"
17:25:27.278 [main] DEBUG org.apache.http.wire [] - http-outgoing-0 >> "Host: 127.0.0.1:8080[\r][\n]"
17:25:27.278 [main] DEBUG org.apache.http.wire [] - http-outgoing-0 >> "Connection: Keep-Alive[\r][\n]"
17:25:27.278 [main] DEBUG org.apache.http.wire [] - http-outgoing-0 >> "User-Agent: Apache-HttpClient/4.3.5 (java 1.5)[\r][\n]"
17:25:27.278 [main] DEBUG org.apache.http.wire [] - http-outgoing-0 >> "Accept-Encoding: gzip,deflate[\r][\n]"
17:25:27.278 [main] DEBUG org.apache.http.wire [] - http-outgoing-0 >> "[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire [] - http-outgoing-0 << "HTTP/1.1 200 OK[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire [] - http-outgoing-0 << "Date: Mon, 20 Oct 2014 08:25:27 GMT[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire [] - http-outgoing-0 << "Content-Type: application/json; charset=utf-8[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire [] - http-outgoing-0 << "Content-Length: 87[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire [] - http-outgoing-0 << "Server: Jetty(9.2.3.v20140905)[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire [] - http-outgoing-0 << "[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire [] - http-outgoing-0 << "{"code":200,"messages":[],"data":{"foo":[{"bar":123,"buz":456},{"bar":321,"buz":654}]}}"
            */});
            var p = new parser.WireLogParser({
                'removeNewLine': true,
                'bePrettyJSON': false,
            });
            var parsed = p.parse(logTextInsertedSomething);
            it('should parse rightly', function () {
                Object.keys(parsed).length.should.equal(1);
                parsed['GET /api/foo?bar=123&buz=456 HTTP/1.1'].requestLog.logs.should.deep.equal(
                    [
                        {
                            'log': 'GET /api/foo?bar=123&buz=456 HTTP/1.1',
                            'type': 'http-request',
                            'direction': 'request'
                        },
                        {
                            'log': '127.0.0.1:8080',
                            'type': 'header',
                            'headerName': 'Host',
                            'direction': 'request'
                        },
                        {
                            'log': 'Keep-Alive',
                            'type': 'header',
                            'headerName': 'Connection',
                            'direction': 'request'
                        },
                        {
                            'log': 'Apache-HttpClient/4.3.5 (java 1.5)',
                            'type': 'header',
                            'headerName': 'User-Agent',
                            'direction': 'request'
                        },
                        {
                            'log': 'gzip,deflate',
                            'type': 'header',
                            'headerName': 'Accept-Encoding',
                            'direction': 'request'
                        },
                        {
                            'log': '',
                            'type': 'body',
                            'direction': 'request'
                        }
                    ]
                );
                parsed['GET /api/foo?bar=123&buz=456 HTTP/1.1'].responseLog.logs.should.deep.equal(
                    [
                        {
                            'log': 'HTTP/1.1 200 OK',
                            'type': 'http-response',
                            'direction': 'response'
                        },
                        {
                            'log': 'Mon, 20 Oct 2014 08:25:27 GMT',
                            'type': 'header',
                            'headerName': 'Date',
                            'direction': 'response'
                        },
                        {
                            'log': 'application/json; charset=utf-8',
                            'type': 'header',
                            'headerName': 'Content-Type',
                            'direction': 'response'
                        },
                        {
                            'log': '87',
                            'type': 'header',
                            'headerName': 'Content-Length',
                            'direction': 'response'
                        },
                        {
                            'log': 'Jetty(9.2.3.v20140905)',
                            'type': 'header',
                            'headerName': 'Server',
                            'direction': 'response'
                        },
                        {
                            'log': '',
                            'type': 'body',
                            'direction': 'response'
                        },
                        {
                            'log': '{"code":200,"messages":[],"data":{"foo":[{"bar":123,"buz":456},{"bar":321,"buz":654}]}}',
                            'type': 'body',
                            'direction': 'response'
                        }
                    ]
                );
            });
        });
    });
});

