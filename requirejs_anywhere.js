/**
* Config var and global storage for requirejs and non-requirejs modules
*/
window.requireHub = {
  main_ready : false,
  onpageDefines : {},
  main_ready_event_name : "main_ready"
};


/**
* Custom requirejs - call require when it's ready
*
* Main script should trigger event with name window.requireHub.main_ready_event_name
* and set window.requireHub.main_ready to true
* 
* @param same as requirejs
*/
var onRequire = function(){    
  if (window.requireHub.main_ready){
    //use direct requirejs    
    require.apply(require,arguments);
  }else{    
    //wait for ready event, then retry   
    var args = arguments; //TODO add in pool to run asynch
    document.addEventListener(window.requireHub.main_ready_event_name,
      function(){ onRequire.apply(null,args); }, false);
  }
};

/**
* Use loaded or not-yet-loaded module return data
*
* Can be used on non rejuirejs callback too
* Can use it on html onclick=""
* Example: useModule('mod_name','func_from_mod', arg1,arg2,...)
* search first in window.requireHub.onpageDefines
* and search with requirejs
*
* @param string module name
* @param string function name
* @param mixed arg1
* @param mixed argN
*/
var useModule = function(){
  var args = Array.prototype.slice.call(arguments);
  var module_name = args.shift();
  var module_resource = args.shift();
  var warn_txt = 'Module "'+module_name+'" will not return anything! \n'+
            'Pass second parameter to execute some inner function! Or load the module before using!'
  if(window.requireHub.onpageDefines.hasOwnProperty(module_name)){  
    //get from local (requireHub)    
    var m = window.requireHub.onpageDefines[module_name];   
    return help_load_module_resource(m,module_resource,args);
  }else{
    //search with requirejs     
    if (window.requireHub.main_ready){
      if(typeof module_resource == 'undefined'){
        console.info('Module "'+module_name+'" may not return anything! [not defined with onpageDefine]'); 
      }
      //direct with requirejs   
      if(require.specified(module_name)){
        // run from already loaded module
        var m = require(module_name);
        return help_load_module_resource(m,module_resource,args);
      }else{
        if(typeof module_resource == 'undefined'){
          console.warn(warn_txt); 
        }
        // load module and run func
        require([module_name],function(m){
          help_load_module_resource(m,module_resource,args);
        });
      }
    }else{
      if(typeof module_resource == 'undefined'){
        console.warn(warn_txt); 
      }     
      // wait for requirejs and try again
      onRequire([module_name],function(m){
          help_load_module_resource(m,module_resource,args);
      });
    }    
  }
};

var help_load_module_resource = function(m, module_resource, args){
  if(typeof m === 'undefined') m = window;
  if(typeof module_resource == 'undefined'){
    return m;
  }else if(typeof m[module_resource] == 'function'){
    return m[module_resource].apply(null,args);
  }else{
    return m[module_resource]; // return mixed
  }
};

/**
* Custom define() method to define a module on the fly (on page)
*
* Use insted of define('module_name',['req_mod_1','req_mod_2'], function(m1,m2){ })
* Use :   onpageDefine('module_name',['req_mod_1','req_mod_2'], function(m1,m2){ }) 
* Push the result in window.requireHub.onpageDefines
* Call it with useModule('module_name','func_to_call',arg1,...)
*
* @param same as requirejs define() 
*/
var onpageDefine = function(){
  var args = Array.prototype.slice.call(arguments);    
  if (window.requireHub.main_ready){      
    var module_name = args.shift();
    var req_libs = args.shift();
    var callback = args.shift();
    require(req_libs,function(){
      var inner_args = Array.prototype.slice.call(arguments);
      var define_value = null;
      if(typeof callback == 'function'){
        define_value = callback.apply(null,inner_args);
      }else if(typeof callback == 'object'){
        define_value = callback;
      }
      window.requireHub.onpageDefines[module_name] = define_value;
    });      
  }else{      
    //wait for ready event, then retry  
    document.addEventListener(window.requireHub.main_ready_event_name,
      function(){ onpageDefine.apply(null,args); }, false);
  }
};