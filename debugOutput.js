//** That file is for debugging purposes only and I dont hold any responsibility for damaged sight/brain after seeing it. **//
function uglyDebug(stack) {
    var InstructionType = SBPMacro.InstructionType;
    var TokenType = SBPMacro.TokenType;
    var DataType = SBPMacro.DataType;
    var actions = stack.slice();
    var _stack = stack.slice();
    var spaces = "--";
    var indent = "";
    var IndentMinus = [
        1337,
        InstructionType.ENDASSIGN,
        InstructionType.ENDMATH,
        InstructionType.ENDCALL,
        InstructionType.ENDGROUP,
    ]
    var SkipInline = [
        InstructionType.STARTGROUP,
        InstructionType.ADD,
        InstructionType.SUB,
        InstructionType.MULT,
        InstructionType.DIV,
        InstructionType.POW,
        InstructionType.GT, //Greater than
        InstructionType.LT, //Less than
        InstructionType.GOE, //Greater or Equal
        InstructionType.LOE, //Less or equal
        InstructionType.EQ, //Equal
        InstructionType.AND,
        InstructionType.OR,
    ]
    function getKeyFromObject(obj, val) {
        for (var k in obj) {
            if (obj[k] == val) {
                return k;
            }
        }
        return null;
    }

    function isType(t) {
        return getKeyFromObject(DataType, t) == true
    }

    function InsertDebugOps() {
        var pos = -1;
        var stack = {
            shift: function () {
                pos = pos + 1;
                return _stack.shift();
            }
        }

        function pushDebugInstr(instr) {
            if (pos == actions.length) {
                actions.push(instr);
                return;
            }
            actions.splice(pos, 0, instr);
            pos++;
        }
        var pos = 0;
        var compiled = "var _VARIABLES = __ARG_VAR||{};\n"
        var _CMDS = [];

        function compile(op) {
            var compiled = "var _VARIABLES = __ARG_VAR||{};\n"
            var _CMDS = [];
            switch (op) {
                //*Blocks*//
                case InstructionType.STARTGROUP:
                    var inner = "";
                    var o = stack.shift();
                    while (o != InstructionType.ENDGROUP) {
                        inner += compile(o);
                        o = stack.shift();
                    }
                    return "(" + inner + ")";
                case InstructionType.CALLCMD:
                    var cmdname = stack.shift();
                    var o = stack.shift();
                    var args = [];
                    while (o != InstructionType.ENDCALL) {
                        args.push(compile(o));
                        o = stack.shift();
                    }
                    out = "sandbox_" + cmdname + " (";
                    _CMDS.push(cmdname);
                    for (k in args) {
                        out += args[k] + ",";
                    }
                    out = out.substring(0, out.length - 1) + ")";
                    return out;
                    //*MATH*//
                case InstructionType.ADD:
                    var one = compile(stack.shift());
                    var two = compile(stack.shift());
                    pushDebugInstr(InstructionType.ENDMATH);
                    return one + " + " + two
                case InstructionType.SUB:
                    var one = compile(stack.shift());
                    var two = compile(stack.shift());
                    pushDebugInstr(InstructionType.ENDMATH);
                    return one + " - " + two
                case InstructionType.MULT:
                    var one = compile(stack.shift());
                    var two = compile(stack.shift());
                    pushDebugInstr(InstructionType.ENDMATH);
                    return one + " * " + two
                case InstructionType.DIV:
                    var one = compile(stack.shift());
                    var two = compile(stack.shift());
                    pushDebugInstr(InstructionType.ENDMATH);
                    return one + " / " + two
                case InstructionType.POW:
                    var one = compile(stack.shift());
                    var two = compile(stack.shift());
                    pushDebugInstr(InstructionType.ENDMATH);
                    return one + " ^ " + two
                case InstructionType.GT:
                    var one = compile(stack.shift());
                    var two = compile(stack.shift());
                    pushDebugInstr(InstructionType.ENDMATH);
                    return one + " > " + two
                case InstructionType.LT:
                    var one = compile(stack.shift());
                    var two = compile(stack.shift());
                    pushDebugInstr(InstructionType.ENDMATH);
                    return one + " < " + two
                case InstructionType.GOE:
                    var one = compile(stack.shift());
                    var two = compile(stack.shift());
                    pushDebugInstr(InstructionType.ENDMATH);
                    return one + " >= " + two
                case InstructionType.LOE:
                    var one = compile(stack.shift());
                    var two = compile(stack.shift());
                    pushDebugInstr(InstructionType.ENDMATH);
                    return one + " <= " + two
                case InstructionType.EQ:
                    var one = compile(stack.shift());
                    var two = compile(stack.shift());
                    pushDebugInstr(InstructionType.ENDMATH);
                    return one + " == " + two
                case InstructionType.AND:
                    var one = compile(stack.shift());
                    var two = compile(stack.shift());
                    pushDebugInstr(InstructionType.ENDMATH);
                    return one + " && " + two
                case InstructionType.OR:
                    var one = compile(stack.shift());
                    var two = compile(stack.shift());
                    pushDebugInstr(InstructionType.ENDMATH);
                    return one + " || " + two

                    //*END OF MATH*//
                    //*Data Types*//
                case DataType.VARIABLE:
                    var str = stack.shift().toString();
                    str = str.replace("\\", "\\\\");
                    str = str.replace("`", "");
                    return "_VARIABLES[`" + str + "`]";
                case DataType.STRING:
                    return "`" + stack.shift().toString() + "`";
                case DataType.NUMBER:
                    return Number(stack.shift());
                    //*End of Data Types*//
                case InstructionType.ASSIGN:
                    var varname = stack.shift();
                    var o = stack.shift();
                    var val = compile(o);

                    pushDebugInstr(InstructionType.ENDASSIGN);

                    return "_VARIABLES[`" + varname + "`] = " + val;
                default:
                    throw "Unknown _op " + op;
            }
        }
        var op = stack.shift();
        var lastret = null;
        while (op) {
            var code = compile(op) + ";\n";;
            if (stack.length <= 0) {
                code = "return " + code;
            }
            compiled += code;
            op = stack.shift();
        }
        return compiled;

    }
    InsertDebugOps();

    var str = ""

    function getActionName(k) {
        return (getKeyFromObject(InstructionType, actions[k]) || getKeyFromObject(DataType, actions[k])) //+"("+actions[k]+")"
    }

    for (var k = 0; k < actions.length; k++) {
        var v = actions[k];
        if (IndentMinus.indexOf(v) >= 0) //Ends
        {
            indent = indent.substring(spaces.length);
        }

        str = str + indent + getActionName(k);
        if (IndentMinus.indexOf(v) < 0 && !getKeyFromObject(DataType, actions[k])) //Depth increasers
        {
            indent = indent + spaces;
        }

        if (SkipInline.indexOf(v) < 0 && IndentMinus.indexOf(v) < 0) {
            k++;
            str += " " + actions[k];
        }
        str += "\n"
    }
    return str;
}