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

describe('WireLogParser', function () {
    describe('#parse', function () {
        describe('parse simple log', function () {
            var p = new parser.WireLogParser();
            var parsed = p.parse(logTextSimply);
            it('should parse rightly', function () {
                parsed.length.should.equal(1);
                Object.keys(parsed[0]).should.deep.equal(['requestLog', 'responseLog']);
                parsed[0].requestLog.logs.should.deep.equal(
                    [
                        {
                            'log': 'GET /api/foo?bar=123&buz=456 HTTP/1.1',
                            'type': 'http-request'
                        },
                        {
                            'log': 'Host: 127.0.0.1:8080',
                            'type': 'header',
                            'headerName': 'Host'
                        },
                        {
                            'log': 'Connection: Keep-Alive',
                            'type': 'header',
                            'headerName': 'Connection'
                        },
                        {
                            'log': 'User-Agent: Apache-HttpClient/4.3.5 (java 1.5)',
                            'type': 'header',
                            'headerName': 'User-Agent'
                        },
                        {
                            'log': 'Accept-Encoding: gzip,deflate',
                            'type': 'header',
                            'headerName': 'Accept-Encoding'
                        },
                        {
                            'log': '',
                            'type': 'body'
                        }
                    ]
                );
                parsed[0].responseLog.logs.should.deep.equal(
                    [
                        {
                            'log': 'HTTP/1.1 200 OK',
                            'type': 'http-response'
                        },
                        {
                            'log': 'Date: Mon, 20 Oct 2014 08:25:27 GMT',
                            'type': 'header',
                            'headerName': 'Date'
                        },
                        {
                            'log': 'Content-Type: application/json; charset=utf-8',
                            'type': 'header',
                            'headerName': 'Content-Type'
                        },
                        {
                            'log': 'Content-Length: 87',
                            'type': 'header',
                            'headerName': 'Content-Length'
                        },
                        {
                            'log': 'Server: Jetty(9.2.3.v20140905)',
                            'type': 'header',
                            'headerName': 'Server'
                        },
                        {
                            'log': '',
                            'type': 'body'
                        },
                        {
                            'log': '{"code":200,"messages":[],"data":{"foo":[{"bar":123,"buz":456},{"bar":321,"buz":654}]}}',
                            'type': 'body'
                        }
                    ]
                );
            });
            it('should to be string rightly', function () {
                parsed[0].requestLog.toString().should.equal(heredoc(function () {/*
GET /api/foo?bar=123&buz=456 HTTP/1.1
Host: 127.0.0.1:8080
Connection: Keep-Alive
User-Agent: Apache-HttpClient/4.3.5 (java 1.5)
Accept-Encoding: gzip,deflate

                */}));
                parsed[0].responseLog.toString().should.equal(heredoc(function () {/*
HTTP/1.1 200 OK
Date: Mon, 20 Oct 2014 08:25:27 GMT
Content-Type: application/json; charset=utf-8
Content-Length: 87
Server: Jetty(9.2.3.v20140905)

{"code":200,"messages":[],"data":{"foo":[{"bar":123,"buz":456},{"bar":321,"buz":654}]}}
                */}));
            });
        });

        var p = new parser.WireLogParser();
        var parsed = p.parse(logTextMixed);
        describe('parse mixed multi log', function () {
            it('should parse rightly', function () {
                parsed.length.should.equal(3);

                parsed[0].requestLog.logs.should.deep.equal(
                    [
                        {
                            'log': 'GET /api/foo?bar=123&buz=456 HTTP/1.1',
                            'type': 'http-request'
                        },
                        {
                            'log': 'Host: 127.0.0.1:8080',
                            'type': 'header',
                            'headerName': 'Host'
                        },
                        {
                            'log': 'Connection: Keep-Alive',
                            'type': 'header',
                            'headerName': 'Connection'
                        },
                        {
                            'log': 'User-Agent: Apache-HttpClient/4.3.5 (java 1.5)',
                            'type': 'header',
                            'headerName': 'User-Agent'
                        },
                        {
                            'log': 'Accept-Encoding: gzip,deflate',
                            'type': 'header',
                            'headerName': 'Accept-Encoding'
                        },
                        {
                            'log': '',
                            'type': 'body'
                        }
                    ]
                );
                parsed[0].responseLog.logs.should.deep.equal(
                    [
                        {
                            'log': 'HTTP/1.1 200 OK',
                            'type': 'http-response'
                        },
                        {
                            'log': 'Date: Mon, 20 Oct 2014 08:25:27 GMT',
                            'type': 'header',
                            'headerName': 'Date'
                        },
                        {
                            'log': 'Content-Type: application/json; charset=utf-8',
                            'type': 'header',
                            'headerName': 'Content-Type'
                        },
                        {
                            'log': 'Content-Length: 87',
                            'type': 'header',
                            'headerName': 'Content-Length'
                        },
                        {
                            'log': 'Server: Jetty(9.2.3.v20140905)',
                            'type': 'header',
                            'headerName': 'Server'
                        },
                        {
                            'log': '',
                            'type': 'body'
                        },
                        {
                            'log': '{"code":200,"messages":[],"data":{"foo":[{"bar":123,"buz":456},{"bar":321,"buz":654}]}}',
                            'type': 'body'
                        }
                    ]
                );

                parsed[1].should.deep.equal({});

                parsed[2].requestLog.logs.should.deep.equal(
                    [
                        {
                            'log': 'GET /api/bar HTTP/1.1',
                            'type': 'http-request'
                        },
                        {
                            'log': 'Host: 127.0.0.1:9292',
                            'type': 'header',
                            'headerName': 'Host'
                        },
                        {
                            'log': 'User-Agent: Apache-HttpClient/4.3.5 (java 1.5)',
                            'type': 'header',
                            'headerName': 'User-Agent'
                        },
                        {
                            'log': '',
                            'type': 'body'
                        }
                    ]
                );

                parsed[2].responseLog.logs.should.deep.equal(
                    [
                        {
                            'log': 'HTTP/1.1 200 OK',
                            'type': 'http-response'
                        },
                        {
                            'log': 'Date: Tue, 21 Oct 2014 14:38:11 GMT',
                            'type': 'header',
                            'headerName': 'Date'
                        },
                        {
                            'log': 'Content-Type: application/json; charset=utf-8',
                            'type': 'header',
                            'headerName': 'Content-Type'
                        },
                        {
                            'log': 'Content-Length: 36',
                            'type': 'header',
                            'headerName': 'Content-Length'
                        },
                        {
                            'log': 'Server: Jetty(9.2.3.v20140905)',
                            'type': 'header',
                            'headerName': 'Server'
                        },
                        {
                            'log': '',
                            'type': 'body'
                        },
                        {
                            'log': '{"code":200,"messages":[],"data":{}}',
                            'type': 'body'
                        }
                    ]
                );
            });
            it('should to be string rightly', function () {
                parsed[0].requestLog.toString().should.equal(heredoc(function () {/*
GET /api/foo?bar=123&buz=456 HTTP/1.1
Host: 127.0.0.1:8080
Connection: Keep-Alive
User-Agent: Apache-HttpClient/4.3.5 (java 1.5)
Accept-Encoding: gzip,deflate

                */}));
                parsed[0].responseLog.toString().should.equal(heredoc(function () {/*
HTTP/1.1 200 OK
Date: Mon, 20 Oct 2014 08:25:27 GMT
Content-Type: application/json; charset=utf-8
Content-Length: 87
Server: Jetty(9.2.3.v20140905)

{"code":200,"messages":[],"data":{"foo":[{"bar":123,"buz":456},{"bar":321,"buz":654}]}}
                */}));

               parsed[2].requestLog.toString().should.equal(heredoc(function () {/*
GET /api/bar HTTP/1.1
Host: 127.0.0.1:9292
User-Agent: Apache-HttpClient/4.3.5 (java 1.5)

               */}));
               parsed[2].responseLog.toString().should.equal(heredoc(function () {/*
HTTP/1.1 200 OK
Date: Tue, 21 Oct 2014 14:38:11 GMT
Content-Type: application/json; charset=utf-8
Content-Length: 36
Server: Jetty(9.2.3.v20140905)

{"code":200,"messages":[],"data":{}}
               */}));
            });
        });
    });
});

