# include-scripts-js
JavaScript code to allow further inclusion of script or css file dependancies
=============================================================================    
`includeScripts()` recursively loads and executes required scripts where they're not already loaded

A check is performed to see if the file is loaded as a script already
if not a script node is created dangling off the same parent node as the currently executing script
and its onload function is constructed to pass on the current executing scripts onload function 
and some payload function which is the body of the dependant script.

It doesn't matter whether the node is loaded synchronously or asynchronously; either way the files
are each loaded once, one at a time, in order of dependency, and are visible to debuggers as if they were
loaded statically.

Furthermore, any file included this way can itself use includeScripts to include further files (thus 
implementing the acyclic directed graph of file dependencies)

__USAGE:__
```javascript
        includeScripts([<file>,<file>,..,<file>], function () {
            // do stuff that depends on included files
        },
        function (filename) {
            // (optional) error handler - do stuff to report that file <filename> wasn't loaded
        });
```
        
__CAVEATS:__
  * All files in the dependency graph are loaded synchronously (in series) so browsers won't leverage multi-core concurrent loading.
  * Each file in the dependency graph makes a hit on its hosting server
           
__NOTE:__
  * Code executed in the 'do stuff' is guaranteed to run _after_ all dependencies are loaded
  * Assumes scripts are running on a browser (modifies the DOM)
  * CSS files can also be included (injects link nodes into the DOM)
  * Any file that appears as script can be included (injects script nodes into the DOM)

<html>
<head>
<title>includescripts.js</title>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<style type="text/css">
.ln { color: rgb(0,0,0); font-weight: normal; font-style: normal; }
.s0 { color: rgb(204,120,50); font-weight: bold; }
.s1 { color: rgb(169,183,198); }
.s2 { color: rgb(106,135,89); }
.s3 { color: rgb(204,120,50); }
.s4 { color: rgb(104,151,187); }
.s5 { color: rgb(128,128,128); }
</style>
</head>
<BODY BGCOLOR="#2b2b2b">
<TABLE CELLSPACING=0 CELLPADDING=5 COLS=1 WIDTH="100%" BGCOLOR="#C0C0C0" >
<TR><TD><CENTER>
<FONT FACE="Arial, Helvetica" COLOR="#000000">
includescripts.js</FONT>
</center></TD></TR></TABLE>
<pre>
<span class="s0">var </span><span class="s1">a = document.getElementsByTagName(</span><span class="s2">'SCRIPT'</span><span class="s1">)</span><span class="s3">,</span><span class="s1"> 
            thisScript = a[a.length - </span><span class="s4">1</span><span class="s1">]</span><span class="s3">,</span><span class="s1"> 
            parent = thisScript.parentElement</span><span class="s3">,</span><span class="s1"> 
            script = missingFiles[</span><span class="s4">0</span><span class="s1">].type === </span><span class="s2">'style' </span><span class="s1">? document.createElement(</span><span class="s2">'LINK'</span><span class="s1">) : document.createElement(</span><span class="s2">'SCRIPT'</span><span class="s1">)</span><span class="s3">;</span><span class="s1"> 
 
        </span><span class="s5">// defer onload / onerror</span><span class="s1"> 
        thisScript.deferredOnload = thisScript.onload</span><span class="s3">;</span><span class="s1"> 
        thisScript.onload = undefined</span><span class="s3">;</span><span class="s1"> 
        thisScript.deferredOnerror = thisScript.onerror</span><span class="s3">;</span><span class="s1"> 
        thisScript.onerror = undefined</span><span class="s3">;</span><span class="s1"> 
 
        </span><span class="s5">// create new included script node</span><span class="s1"> 
        </span><span class="s0">if </span><span class="s1">(missingFiles[</span><span class="s4">0</span><span class="s1">].type === </span><span class="s2">'style'</span><span class="s1">) { 
            script.type = missingFiles[</span><span class="s4">0</span><span class="s1">].type = </span><span class="s2">'text/css'</span><span class="s3">;</span><span class="s1"> 
            script.rel = </span><span class="s2">'stylesheet'</span><span class="s3">;</span><span class="s1"> 
            script.href = missingFiles[</span><span class="s4">0</span><span class="s1">].name</span><span class="s3">;</span><span class="s1"> 
        } </span><span class="s0">else </span><span class="s1">{ 
            script.type = </span><span class="s2">'text/javascript'</span><span class="s3">;</span><span class="s1"> 
            script.src = missingFiles[</span><span class="s4">0</span><span class="s1">].name</span><span class="s3">;</span><span class="s1"> 
        }</span></pre>
</body>
</html>
