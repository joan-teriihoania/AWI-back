const fs = require('fs');

function _getCaller() {
    var originalFunc = Error.prepareStackTrace;

    var callerfile;
    var callerFunction;
    var callerLineNumber;
    var callerColNumber;
    try {
        var err = new Error();
        var currentfile;

        Error.prepareStackTrace = function (err, stack) { return stack; };

        currentfile = err.stack.shift().getFileName();

        while (err.stack.length) {
            let stack = err.stack.shift()
            callerfile = stack.getFileName();
            callerFunction = stack.getFunctionName()
            callerLineNumber = stack.getLineNumber()
            callerColNumber = stack.getColumnNumber()

            if(currentfile !== callerfile) break;
        }
    } catch (e) {}

    Error.prepareStackTrace = originalFunc; 

    callerfile = callerfile ? callerfile : ""
    callerfile = callerfile.split('/')
    callerfile = callerfile[callerfile.length-1]
    callerfile = callerfile.split('\\')
    callerfile = callerfile[callerfile.length-1]

    return `${callerFunction ? callerFunction + "() in " : ""}${callerfile}:${callerLineNumber}:${callerColNumber}`;
}


module.exports = {
    clearLogs: function(){
        try {
            fs.writeFileSync(".data/logs.txt", "")
        } catch {
            return
        }
    },
    getLogs: function(callback){
        fs.readFile(".data/logs.txt", "utf-8", function(err, logs){
            callback(logs ? logs.split('\n') : [])
        })
    },
    log: async function(){
        for (let i = 0; i < arguments.length; i++) {
            const argument = arguments[i];
            let arg = argument.toString().split('\n')
            if(arg.length == 1) {
                arg = arg[0]
                if(arg instanceof Error){
                    module.exports.error(arg)
                    continue
                }

                let l = `[INFO] [${new Date().toLocaleTimeString('fr-FR')}] [${_getCaller()}] ${arg}`
                // fs.appendFile(".data/logs.txt", l + "\n", (err) => {
                //     if(err) console.log(err)
                // })
                console.log(l)
            } else {
                for (let j = 0; j < arg.length; j++) {
                    module.exports.log(arg[j]);
                }
            }
        }
    },
    error: async function(){
        for (let i = 0; i < arguments.length; i++) {
            const argument = arguments[i];
            let arg = argument.toString().split('\n')
            if(arg.length == 1) {
                arg = arg[0]
                if(arg instanceof Error){
                    module.exports.error(arg.toString())
                    continue
                }

                let l = `[ERROR] [${new Date().toLocaleTimeString('fr-FR')}] [${_getCaller()}] ${arg}`
                // fs.appendFile(".data/logs.txt", l + "\n", (err) => {
                //     if(err) console.error(err)
                // })
                console.error(l)
            } else {
                for (let j = 0; j < arg.length; j++) {
                    module.exports.error(arg[j]);
                }
            }
        }
    }
}