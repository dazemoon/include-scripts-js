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
        
        NOTE:     - Assumes scripts are running on a browser (modifies the DOM)
                  - CSS files can also be included (injects link nodes into the DOM)
                  - Any file that appears as script can be included (injects script nodes into the DOM)
                  - Modifies the DOM and hits the server for EACH file included
                  - Code executed in the 'do stuff' executes synchronously - after ALL the dependancies have loaded and executed
