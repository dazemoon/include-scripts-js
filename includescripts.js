/*
    @licstart    The following is the entire license notice for the JavaScript code in this page.

        Copyright(C) 2015 Dariush Azemoon

        The JavaScript code in this page is free software: you can
        redistribute it and/or modify it under the terms of the GNU
        General Public License(GNU GPL) as published by the Free Software
        Foundation, either version 3 of the License, or(at your option)
        any later version.    The code is distributed WITHOUT ANY WARRANTY;
        without even the implied warranty of MERCHANTABILITY or FITNESS
        FOR A PARTICULAR PURPOSE.    See the GNU GPL for more details.

        As additional permission under GNU GPL version 3 section 7, you
        may distribute non-source(e.g., minimized or compacted) forms of
        that code without the copy of the GNU GPL normally required by
        section 4, provided you include this license notice and a URL
        through which recipients can access the Corresponding Source.

    @licend    The above is the entire license notice for the JavaScript code in this page.

    includeScripts() loads and executes scripts if not already loaded

    A check is performed to see if the file is loaded as a script already
    if not a script node is created dangling off the same parent node as the currently executing script
    and its onload function is constructed to pass on the current executing scripts onload function 
    and some payload function which is the body of the dependant script.

    It doesn't matter whether the node is loaded synchronously or asynchronously; either way the files
    are each loaded once, one at a time, in order of dependency, and are visible to debuggers as if they were
    loaded statically.

    Furthermore, any file included this way can itself use includeScripts to include further files (thus 
    implementing the acyclic directed graph of file dependencies)

    USAGE:  includeScripts([<file>,<file>,..,<file>], function () {
                // do stuff that depends on included files
            },
            function (filename) {
                // (optional) error handler - do stuff to report that file <filename> wasn't loaded 
            });

    CAVEATS:  - All files in the dependency graph are loaded synchronously (in series) so browsers won't leverage
                multi-core concurrent loading.
              - Each file in the dependency graph makes a hit on its hosting server

    NOTE:     - Code executed in the 'do stuff' is guaranteed to run AFTER all dependencies are loaded
              - Assumes scripts are running on a browser (modifies the DOM)
              - CSS files can also be included (injects link nodes into the DOM)
              - Any file that appears as script can be included (injects script nodes into the DOM)
*/

/*jslint browser: true, regexp: true, vars: true, plusplus: true*/

function includeScripts(depFiles, onload, onerror) {

    "use strict";

    // helper function to create script nodes
    function createNode(onload, onerror, missingFiles, recurse) {

        // list all script elements
        var a = document.getElementsByTagName('SCRIPT'),
            thisScript = a[a.length - 1],
            parent = thisScript.parentElement,
            script = missingFiles[0].type === 'style' ? document.createElement('LINK') : document.createElement('SCRIPT');

        // defer onload / onerror
        thisScript.deferredOnload = thisScript.onload;
        thisScript.onload = undefined;
        thisScript.deferredOnerror = thisScript.onerror;
        thisScript.onerror = undefined;

        // create new included script node
        if (missingFiles[0].type === 'style') {
            script.type = missingFiles[0].type = 'text/css';
            script.rel = 'stylesheet';
            script.href = missingFiles[0].name;
        } else {
            script.type = 'text/javascript';
            script.src = missingFiles[0].name;
        }
        script.onload = (function (t) {
            return function () {

                // perform chain of onload callbacks or recursively include further scripts
                if (missingFiles.length === 1) {
                    if (!!onload) {
                        onload();
                    }
                } else {
                    recurse();
                }

                if (t.deferredOnload) {
                    t.deferredOnload();
                }
            };
        }(thisScript));

        script.onerror = (function (t) {
            return function () {

                // perform chain of onerror callbacks
                if (onerror) {
                    onerror(script.src);
                }

                if (t.deferredOnerror) {
                    t.deferredOnerror(script.src);
                }
            };
        }(thisScript));

        // load included node
        parent.appendChild(script);
    }

    // Gratefully ripped from GPL 3 licensed code from https://developer.mozilla.org/en-US/docs/Web/API/document.cookie (modified to appease jslint)
    function relPathToAbs(sRelPath) {
        var nUpLn, sDir = "", sPath = location.pathname.replace(/[^\/]*$/, sRelPath.replace(/(\/|^)(?:\.?\/+)+/g, "$1"));
        for (var nEnd, nStart = 0; nEnd = sPath.indexOf("/../", nStart), nEnd > -1; nStart = nEnd + nUpLn) {
            nUpLn = /^\/(?:\.\.\/)*/.exec(sPath.slice(nEnd))[0].length;
            sDir = (sDir + sPath.substring(nStart, nEnd)).replace(new RegExp("(?:\\\/+[^\\\/]*) {0," + ((nUpLn - 1) / 3) + "}$"), "/");
        }
        return sDir + sPath.substr(nStart);
    }

    // compare paths for equality
    function pathsEq(p1, p2) {
        var paths = [p1, p2];
        paths = paths.map(function (x) {
            if (x.substring(0, 7) === 'file://') {
                return x.slice(7);
            }

            return relPathToAbs(x);
        });
        return paths[0] === paths[1];
    }

    // list all script elements and check which ones are missing from our requested list
    var loadedScripts = document.getElementsByTagName('SCRIPT'),
        loadedStyleSheets = document.getElementsByTagName('STYLE'),
        missingFiles = [],
        i,
        j,
        found = false;

    for (i = 0; i < depFiles.length; ++i) {
        found = false;
        for (j = 0; j < loadedScripts.length; ++j) {
            if (loadedScripts[j].src !== "") {
                if (pathsEq(depFiles[i], loadedScripts[j].src)) {
                    found = true;
                    break;
                }
            }
        }
        if (!found) {
            for (j = 0; j < loadedStyleSheets.length; ++j) {
                if (loadedStyleSheets[j].src && loadedStyleSheets[j].src !== "") {
                    if (pathsEq(depFiles[i], loadedStyleSheets[j].src)) {
                        found = true;
                        break;
                    }
                }
            }
        }
        if (!found) {

            // store required file and its type - css files must be .css all others are assumed to be script files
            missingFiles.push({type: depFiles[i].substr(depFiles[i].length - 3) === 'css' ? 'style' : 'script', name: depFiles[i]});
        }
    }

    // check if any scripts are missing - we only need to deal with the first one
    if (missingFiles.length > 0) {

        // call helper function to create sript node
        createNode(
            onload,
            onerror,
            missingFiles,
            function () {

                // this will cause recursion to apply the includeScripts on the next missing file
                includeScripts(depFiles.slice(1), onload, onerror);
            }
        );
    } else {

        // we're good to just go ahead and execute the payload
        if (!!onload) {
            onload();
        }
    }
}

