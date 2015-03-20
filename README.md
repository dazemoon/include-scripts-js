# include-scripts-js
JavaScript code to allow further inclusion of script or css file dependancies

 includeScripts() loads and executes scripts if they're not already loaded
    
        A check is performed to see if the file is loaded as a script already
        if not a script node is created dangling off the same parent node as the currently executing script
        and its onload function is constructed to pass on the current executing scripts onload function 
        and some payload function which is the body of the dependant script.
        
        It doesn't matter whether the node is loaded synchronously or asynchronously; either way the files
        are each loaded once, one at a time, in order of dependency, and are visible to debuggers as if they were
        loaded statically.
        
        USAGE:  includeScripts([<file>,<file>,..,<file>], function () {
                    // do stuff that depends on included files
                },
                function (filename) {
                    // do stuff to report that file <filename> wasn't loaded 
                });
        
        NOTE:     - external css files can also be included (this injects a link node into the dom)
                  - Modifies the DOM and hits the server for EACH file included
