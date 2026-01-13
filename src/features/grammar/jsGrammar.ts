// js-syntax-diagrams.ts
//
// ES module that defines the ECMAScript 5.1 grammar as railroad diagrams.
// Based on ECMA-262 5.1 Edition specification.
// Many rules are rendered in diagram-friendly equivalent form (e.g., left recursion -> repetition).

import * as RR from "@prantlf/railroad-diagrams/lib/index.mjs";

// Convenience wrappers ------------------------------------------------------
function callOrNew(Ctor: any, ...args: any[]): any {
  try {
    return Ctor(...args);
  } catch (e: any) {
    if (e instanceof TypeError && /without 'new'/.test(e.message)) {
      return new Ctor(...args);
    }
    throw e;
  }
}

// Wrapped primitives
const Diagram    = (...a: any[]) => callOrNew(RR.Diagram, ...a);
const Sequence   = (...a: any[]) => callOrNew(RR.Sequence, ...a);
const Choice     = (...a: any[]) => callOrNew(RR.Choice, ...a);
const Optional   = (...a: any[]) => callOrNew(RR.Optional, ...a);
const OneOrMore  = (...a: any[]) => callOrNew(RR.OneOrMore, ...a);
const ZeroOrMore = (...a: any[]) => callOrNew(RR.ZeroOrMore, ...a);
const Terminal   = (...a: any[]) => callOrNew(RR.Terminal, ...a);
const NonTerminal = (...a: any[]) => callOrNew(RR.NonTerminal, ...a);
const Stack      = (...a: any[]) => callOrNew(RR.Stack, ...a);
const Comment    = (...a: any[]) => callOrNew(RR.Comment, ...a);

const T  = (s: string) => Terminal(s);
const NT = (s: string) => NonTerminal(s);

// --- Grammar rules (diagram factories) ----------------------------------------

const rules = new Map<string, () => any>();

// ===== §6 Source Text =====

rules.set("SourceCharacter", () =>
  Diagram(Comment("any Unicode code unit"))
);

// ===== §7 Lexical Conventions =====

rules.set("InputElementDiv", () =>
  Diagram(
    Choice(0,
      NT("WhiteSpace"),
      NT("LineTerminator"),
      NT("Comment"),
      NT("Token"),
      NT("DivPunctuator")
    )
  )
);

rules.set("InputElementRegExp", () =>
  Diagram(
    Choice(0,
      NT("WhiteSpace"),
      NT("LineTerminator"),
      NT("Comment"),
      NT("Token"),
      NT("RegularExpressionLiteral")
    )
  )
);

// §7.2 White Space
rules.set("WhiteSpace", () =>
  Diagram(
    Choice(0,
      T("<TAB>"),
      T("<VT>"),
      T("<FF>"),
      T("<SP>"),
      T("<NBSP>"),
      T("<BOM>"),
      T("<USP>")
    )
  )
);

// §7.3 Line Terminators
rules.set("LineTerminator", () =>
  Diagram(
    Choice(0,
      T("<LF>"),
      T("<CR>"),
      T("<LS>"),
      T("<PS>")
    )
  )
);

rules.set("LineTerminatorSequence", () =>
  Diagram(
    Choice(0,
      T("<LF>"),
      Sequence(T("<CR>"), Comment("lookahead ∉ <LF>")),
      T("<LS>"),
      T("<PS>"),
      Sequence(T("<CR>"), T("<LF>"))
    )
  )
);

// §7.4 Comments
rules.set("Comment", () =>
  Diagram(
    Choice(0,
      NT("MultiLineComment"),
      NT("SingleLineComment")
    )
  )
);

rules.set("MultiLineComment", () =>
  Diagram(
    Sequence(
      T("/*"),
      Optional(NT("MultiLineCommentChars")),
      T("*/")
    )
  )
);

rules.set("MultiLineCommentChars", () =>
  Diagram(
    Choice(0,
      Sequence(NT("MultiLineNotAsteriskChar"), Optional(NT("MultiLineCommentChars"))),
      Sequence(T("*"), Optional(NT("PostAsteriskCommentChars")))
    )
  )
);

rules.set("PostAsteriskCommentChars", () =>
  Diagram(
    Choice(0,
      Sequence(NT("MultiLineNotForwardSlashOrAsteriskChar"), Optional(NT("MultiLineCommentChars"))),
      Sequence(T("*"), Optional(NT("PostAsteriskCommentChars")))
    )
  )
);

rules.set("MultiLineNotAsteriskChar", () =>
  Diagram(
    Sequence(NT("SourceCharacter"), Comment("but not *"))
  )
);

rules.set("MultiLineNotForwardSlashOrAsteriskChar", () =>
  Diagram(
    Sequence(NT("SourceCharacter"), Comment("but not / or *"))
  )
);

rules.set("SingleLineComment", () =>
  Diagram(
    Sequence(T("//"), Optional(NT("SingleLineCommentChars")))
  )
);

rules.set("SingleLineCommentChars", () =>
  Diagram(
    Sequence(NT("SingleLineCommentChar"), Optional(NT("SingleLineCommentChars")))
  )
);

rules.set("SingleLineCommentChar", () =>
  Diagram(
    Sequence(NT("SourceCharacter"), Comment("but not LineTerminator"))
  )
);

// §7.5 Tokens
rules.set("Token", () =>
  Diagram(
    Choice(0,
      NT("IdentifierName"),
      NT("Punctuator"),
      NT("NumericLiteral"),
      NT("StringLiteral")
    )
  )
);

// §7.6 Identifier Names and Identifiers
rules.set("Identifier", () =>
  Diagram(
    Sequence(NT("IdentifierName"), Comment("but not ReservedWord"))
  )
);

rules.set("IdentifierName", () =>
  Diagram(
    Sequence(
      NT("IdentifierStart"),
      ZeroOrMore(NT("IdentifierPart"))
    )
  )
);

rules.set("IdentifierStart", () =>
  Diagram(
    Choice(0,
      NT("UnicodeLetter"),
      T("$"),
      T("_"),
      Sequence(T("\\"), NT("UnicodeEscapeSequence"))
    )
  )
);

rules.set("IdentifierPart", () =>
  Diagram(
    Choice(0,
      NT("IdentifierStart"),
      NT("UnicodeCombiningMark"),
      NT("UnicodeDigit"),
      NT("UnicodeConnectorPunctuation"),
      T("<ZWNJ>"),
      T("<ZWJ>")
    )
  )
);

rules.set("UnicodeLetter", () =>
  Diagram(
    Comment("Unicode categories Lu, Ll, Lt, Lm, Lo, or Nl")
  )
);

rules.set("UnicodeCombiningMark", () =>
  Diagram(
    Comment("Unicode categories Mn or Mc")
  )
);

rules.set("UnicodeDigit", () =>
  Diagram(
    Comment("Unicode category Nd")
  )
);

rules.set("UnicodeConnectorPunctuation", () =>
  Diagram(
    Comment("Unicode category Pc")
  )
);

// §7.6.1 Reserved Words
rules.set("ReservedWord", () =>
  Diagram(
    Choice(0,
      NT("Keyword"),
      NT("FutureReservedWord"),
      NT("NullLiteral"),
      NT("BooleanLiteral")
    )
  )
);

rules.set("Keyword", () =>
  Diagram(
    Choice(0,
      T("break"), T("do"), T("instanceof"), T("typeof"),
      T("case"), T("else"), T("new"), T("var"),
      T("catch"), T("finally"), T("return"), T("void"),
      T("continue"), T("for"), T("switch"), T("while"),
      T("debugger"), T("function"), T("this"), T("with"),
      T("default"), T("if"), T("throw"),
      T("delete"), T("in"), T("try")
    )
  )
);

rules.set("FutureReservedWord", () =>
  Diagram(
    Choice(0,
      Comment("Normal mode:"),
      T("class"), T("enum"), T("extends"), T("super"),
      T("const"), T("export"), T("import"),
      Comment("Strict mode additions:"),
      T("implements"), T("let"), T("private"), T("public"),
      T("interface"), T("package"), T("protected"), T("static"),
      T("yield")
    )
  )
);

// §7.7 Punctuators
rules.set("Punctuator", () =>
  Diagram(
    Choice(0,
      T("{"), T("}"), T("("), T(")"), T("["), T("]"),
      T("."), T(";"), T(","), T("<"), T(">"), T("<="),
      T(">="), T("=="), T("!="), T("==="), T("!=="),
      T("+"), T("-"), T("*"), T("%"), T("++"), T("--"),
      T("<<"), T(">>"), T(">>>"), T("&"), T("|"), T("^"),
      T("!"), T("~"), T("&&"), T("||"), T("?"), T(":"),
      T("="), T("+="), T("-="), T("*="), T("%="), T("<<="),
      T(">>="), T(">>>="), T("&="), T("|="), T("^=")
    )
  )
);

rules.set("DivPunctuator", () =>
  Diagram(
    Choice(0, T("/"), T("/="))
  )
);

// §7.8 Literals
rules.set("Literal", () =>
  Diagram(
    Choice(0,
      NT("NullLiteral"),
      NT("BooleanLiteral"),
      NT("NumericLiteral"),
      NT("StringLiteral"),
      NT("RegularExpressionLiteral")
    )
  )
);

rules.set("NullLiteral", () =>
  Diagram(T("null"))
);

rules.set("BooleanLiteral", () =>
  Diagram(Choice(0, T("true"), T("false")))
);

// §7.8.3 Numeric Literals
rules.set("NumericLiteral", () =>
  Diagram(
    Choice(0,
      NT("DecimalLiteral"),
      NT("HexIntegerLiteral")
    )
  )
);

rules.set("DecimalLiteral", () =>
  Diagram(
    Choice(0,
      Sequence(NT("DecimalIntegerLiteral"), T("."), Optional(NT("DecimalDigits")), Optional(NT("ExponentPart"))),
      Sequence(T("."), NT("DecimalDigits"), Optional(NT("ExponentPart"))),
      Sequence(NT("DecimalIntegerLiteral"), Optional(NT("ExponentPart")))
    )
  )
);

rules.set("DecimalIntegerLiteral", () =>
  Diagram(
    Choice(0,
      T("0"),
      Sequence(NT("NonZeroDigit"), Optional(NT("DecimalDigits")))
    )
  )
);

rules.set("DecimalDigits", () =>
  Diagram(
    OneOrMore(NT("DecimalDigit"))
  )
);

rules.set("DecimalDigit", () =>
  Diagram(
    Choice(0, T("0"), T("1"), T("2"), T("3"), T("4"), T("5"), T("6"), T("7"), T("8"), T("9"))
  )
);

rules.set("NonZeroDigit", () =>
  Diagram(
    Choice(0, T("1"), T("2"), T("3"), T("4"), T("5"), T("6"), T("7"), T("8"), T("9"))
  )
);

rules.set("ExponentPart", () =>
  Diagram(
    Sequence(NT("ExponentIndicator"), NT("SignedInteger"))
  )
);

rules.set("ExponentIndicator", () =>
  Diagram(Choice(0, T("e"), T("E")))
);

rules.set("SignedInteger", () =>
  Diagram(
    Choice(0,
      NT("DecimalDigits"),
      Sequence(T("+"), NT("DecimalDigits")),
      Sequence(T("-"), NT("DecimalDigits"))
    )
  )
);

rules.set("HexIntegerLiteral", () =>
  Diagram(
    Sequence(
      Choice(0, T("0x"), T("0X")),
      OneOrMore(NT("HexDigit"))
    )
  )
);

rules.set("HexDigit", () =>
  Diagram(
    Choice(0,
      T("0"), T("1"), T("2"), T("3"), T("4"), T("5"), T("6"), T("7"), T("8"), T("9"),
      T("a"), T("b"), T("c"), T("d"), T("e"), T("f"),
      T("A"), T("B"), T("C"), T("D"), T("E"), T("F")
    )
  )
);

// §7.8.4 String Literals
rules.set("StringLiteral", () =>
  Diagram(
    Choice(0,
      Sequence(T('"'), Optional(NT("DoubleStringCharacters")), T('"')),
      Sequence(T("'"), Optional(NT("SingleStringCharacters")), T("'"))
    )
  )
);

rules.set("DoubleStringCharacters", () =>
  Diagram(
    OneOrMore(NT("DoubleStringCharacter"))
  )
);

rules.set("SingleStringCharacters", () =>
  Diagram(
    OneOrMore(NT("SingleStringCharacter"))
  )
);

rules.set("DoubleStringCharacter", () =>
  Diagram(
    Choice(0,
      Sequence(NT("SourceCharacter"), Comment('but not " or \\ or LineTerminator')),
      Sequence(T("\\"), NT("EscapeSequence")),
      NT("LineContinuation")
    )
  )
);

rules.set("SingleStringCharacter", () =>
  Diagram(
    Choice(0,
      Sequence(NT("SourceCharacter"), Comment("but not ' or \\ or LineTerminator")),
      Sequence(T("\\"), NT("EscapeSequence")),
      NT("LineContinuation")
    )
  )
);

rules.set("LineContinuation", () =>
  Diagram(
    Sequence(T("\\"), NT("LineTerminatorSequence"))
  )
);

rules.set("EscapeSequence", () =>
  Diagram(
    Choice(0,
      NT("CharacterEscapeSequence"),
      Sequence(T("0"), Comment("lookahead ∉ DecimalDigit")),
      NT("HexEscapeSequence"),
      NT("UnicodeEscapeSequence")
    )
  )
);

rules.set("CharacterEscapeSequence", () =>
  Diagram(
    Choice(0,
      NT("SingleEscapeCharacter"),
      NT("NonEscapeCharacter")
    )
  )
);

rules.set("SingleEscapeCharacter", () =>
  Diagram(
    Choice(0,
      T("'"), T('"'), T("\\"), T("b"), T("f"), T("n"), T("r"), T("t"), T("v")
    )
  )
);

rules.set("NonEscapeCharacter", () =>
  Diagram(
    Sequence(NT("SourceCharacter"), Comment("but not EscapeCharacter or LineTerminator"))
  )
);

rules.set("EscapeCharacter", () =>
  Diagram(
    Choice(0,
      NT("SingleEscapeCharacter"),
      NT("DecimalDigit"),
      T("x"),
      T("u")
    )
  )
);

rules.set("HexEscapeSequence", () =>
  Diagram(
    Sequence(T("x"), NT("HexDigit"), NT("HexDigit"))
  )
);

rules.set("UnicodeEscapeSequence", () =>
  Diagram(
    Sequence(T("u"), NT("HexDigit"), NT("HexDigit"), NT("HexDigit"), NT("HexDigit"))
  )
);

// §7.8.5 Regular Expression Literals
rules.set("RegularExpressionLiteral", () =>
  Diagram(
    Sequence(
      T("/"),
      NT("RegularExpressionBody"),
      T("/"),
      NT("RegularExpressionFlags")
    )
  )
);

rules.set("RegularExpressionBody", () =>
  Diagram(
    Sequence(NT("RegularExpressionFirstChar"), NT("RegularExpressionChars"))
  )
);

rules.set("RegularExpressionChars", () =>
  Diagram(
    ZeroOrMore(NT("RegularExpressionChar"))
  )
);

rules.set("RegularExpressionFirstChar", () =>
  Diagram(
    Choice(0,
      Sequence(NT("RegularExpressionNonTerminator"), Comment("but not * or \\ or / or [")),
      NT("RegularExpressionBackslashSequence"),
      NT("RegularExpressionClass")
    )
  )
);

rules.set("RegularExpressionChar", () =>
  Diagram(
    Choice(0,
      Sequence(NT("RegularExpressionNonTerminator"), Comment("but not \\ or / or [")),
      NT("RegularExpressionBackslashSequence"),
      NT("RegularExpressionClass")
    )
  )
);

rules.set("RegularExpressionBackslashSequence", () =>
  Diagram(
    Sequence(T("\\"), NT("RegularExpressionNonTerminator"))
  )
);

rules.set("RegularExpressionNonTerminator", () =>
  Diagram(
    Sequence(NT("SourceCharacter"), Comment("but not LineTerminator"))
  )
);

rules.set("RegularExpressionClass", () =>
  Diagram(
    Sequence(T("["), NT("RegularExpressionClassChars"), T("]"))
  )
);

rules.set("RegularExpressionClassChars", () =>
  Diagram(
    ZeroOrMore(NT("RegularExpressionClassChar"))
  )
);

rules.set("RegularExpressionClassChar", () =>
  Diagram(
    Choice(0,
      Sequence(NT("RegularExpressionNonTerminator"), Comment("but not ] or \\")),
      NT("RegularExpressionBackslashSequence")
    )
  )
);

rules.set("RegularExpressionFlags", () =>
  Diagram(
    ZeroOrMore(NT("IdentifierPart"))
  )
);

// ===== §11 Expressions =====

rules.set("PrimaryExpression", () =>
  Diagram(
    Choice(0,
      T("this"),
      NT("Identifier"),
      NT("Literal"),
      NT("ArrayLiteral"),
      NT("ObjectLiteral"),
      Sequence(T("("), NT("Expression"), T(")"))
    )
  )
);

rules.set("ArrayLiteral", () =>
  Diagram(
    Choice(0,
      Sequence(T("["), Optional(NT("Elision")), T("]")),
      Sequence(T("["), NT("ElementList"), T("]")),
      Sequence(T("["), NT("ElementList"), T(","), Optional(NT("Elision")), T("]"))
    )
  )
);

rules.set("ElementList", () =>
  Diagram(
    Sequence(
      Optional(NT("Elision")),
      NT("AssignmentExpression"),
      ZeroOrMore(Sequence(T(","), Optional(NT("Elision")), NT("AssignmentExpression")))
    )
  )
);

rules.set("Elision", () =>
  Diagram(OneOrMore(T(",")))
);

rules.set("ObjectLiteral", () =>
  Diagram(
    Choice(0,
      Sequence(T("{"), T("}")),
      Sequence(T("{"), NT("PropertyNameAndValueList"), T("}")),
      Sequence(T("{"), NT("PropertyNameAndValueList"), T(","), T("}"))
    )
  )
);

rules.set("PropertyNameAndValueList", () =>
  Diagram(
    Sequence(
      NT("PropertyAssignment"),
      ZeroOrMore(Sequence(T(","), NT("PropertyAssignment")))
    )
  )
);

rules.set("PropertyAssignment", () =>
  Diagram(
    Choice(0,
      Sequence(NT("PropertyName"), T(":"), NT("AssignmentExpression")),
      Sequence(T("get"), NT("PropertyName"), T("("), T(")"), T("{"), NT("FunctionBody"), T("}")),
      Sequence(T("set"), NT("PropertyName"), T("("), NT("PropertySetParameterList"), T(")"), T("{"), NT("FunctionBody"), T("}"))
    )
  )
);

rules.set("PropertyName", () =>
  Diagram(
    Choice(0,
      NT("IdentifierName"),
      NT("StringLiteral"),
      NT("NumericLiteral")
    )
  )
);

rules.set("PropertySetParameterList", () =>
  Diagram(NT("Identifier"))
);

rules.set("MemberExpression", () =>
  Diagram(
    Sequence(
      Choice(0,
        NT("PrimaryExpression"),
        NT("FunctionExpression"),
        Sequence(T("new"), NT("MemberExpression"), NT("Arguments"))
      ),
      ZeroOrMore(
        Choice(0,
          Sequence(T("["), NT("Expression"), T("]")),
          Sequence(T("."), NT("IdentifierName"))
        )
      )
    )
  )
);

rules.set("NewExpression", () =>
  Diagram(
    Choice(0,
      NT("MemberExpression"),
      Sequence(T("new"), NT("NewExpression"))
    )
  )
);

rules.set("CallExpression", () =>
  Diagram(
    Sequence(
      Choice(0,
        Sequence(NT("MemberExpression"), NT("Arguments")),
        Sequence(NT("CallExpression"), NT("Arguments")),
        Sequence(NT("CallExpression"), T("["), NT("Expression"), T("]")),
        Sequence(NT("CallExpression"), T("."), NT("IdentifierName"))
      )
    )
  )
);

rules.set("Arguments", () =>
  Diagram(
    Choice(0,
      Sequence(T("("), T(")")),
      Sequence(T("("), NT("ArgumentList"), T(")"))
    )
  )
);

rules.set("ArgumentList", () =>
  Diagram(
    Sequence(
      NT("AssignmentExpression"),
      ZeroOrMore(Sequence(T(","), NT("AssignmentExpression")))
    )
  )
);

rules.set("LeftHandSideExpression", () =>
  Diagram(
    Choice(0,
      NT("NewExpression"),
      NT("CallExpression")
    )
  )
);

rules.set("PostfixExpression", () =>
  Diagram(
    Sequence(
      NT("LeftHandSideExpression"),
      Optional(Choice(0, T("++"), T("--")))
    )
  )
);

rules.set("UnaryExpression", () =>
  Diagram(
    Choice(0,
      NT("PostfixExpression"),
      Sequence(T("delete"), NT("UnaryExpression")),
      Sequence(T("void"), NT("UnaryExpression")),
      Sequence(T("typeof"), NT("UnaryExpression")),
      Sequence(T("++"), NT("UnaryExpression")),
      Sequence(T("--"), NT("UnaryExpression")),
      Sequence(T("+"), NT("UnaryExpression")),
      Sequence(T("-"), NT("UnaryExpression")),
      Sequence(T("~"), NT("UnaryExpression")),
      Sequence(T("!"), NT("UnaryExpression"))
    )
  )
);

// Binary expression helpers
function chain(base: string, ops: string[]) {
  return Sequence(
    NT(base),
    ZeroOrMore(Sequence(Choice(0, ...ops.map(T)), NT(base)))
  );
}

rules.set("MultiplicativeExpression", () =>
  Diagram(chain("UnaryExpression", ["*", "/", "%"]))
);

rules.set("AdditiveExpression", () =>
  Diagram(chain("MultiplicativeExpression", ["+", "-"]))
);

rules.set("ShiftExpression", () =>
  Diagram(chain("AdditiveExpression", ["<<", ">>", ">>>"]))
);

rules.set("RelationalExpression", () =>
  Diagram(chain("ShiftExpression", ["<", ">", "<=", ">=", "instanceof", "in"]))
);

rules.set("RelationalExpressionNoIn", () =>
  Diagram(chain("ShiftExpression", ["<", ">", "<=", ">=", "instanceof"]))
);

rules.set("EqualityExpression", () =>
  Diagram(chain("RelationalExpression", ["==", "!=", "===", "!=="]))
);

rules.set("EqualityExpressionNoIn", () =>
  Diagram(chain("RelationalExpressionNoIn", ["==", "!=", "===", "!=="]))
);

rules.set("BitwiseANDExpression", () =>
  Diagram(chain("EqualityExpression", ["&"]))
);

rules.set("BitwiseANDExpressionNoIn", () =>
  Diagram(chain("EqualityExpressionNoIn", ["&"]))
);

rules.set("BitwiseXORExpression", () =>
  Diagram(chain("BitwiseANDExpression", ["^"]))
);

rules.set("BitwiseXORExpressionNoIn", () =>
  Diagram(chain("BitwiseANDExpressionNoIn", ["^"]))
);

rules.set("BitwiseORExpression", () =>
  Diagram(chain("BitwiseXORExpression", ["|"]))
);

rules.set("BitwiseORExpressionNoIn", () =>
  Diagram(chain("BitwiseXORExpressionNoIn", ["|"]))
);

rules.set("LogicalANDExpression", () =>
  Diagram(chain("BitwiseORExpression", ["&&"]))
);

rules.set("LogicalANDExpressionNoIn", () =>
  Diagram(chain("BitwiseORExpressionNoIn", ["&&"]))
);

rules.set("LogicalORExpression", () =>
  Diagram(chain("LogicalANDExpression", ["||"]))
);

rules.set("LogicalORExpressionNoIn", () =>
  Diagram(chain("LogicalANDExpressionNoIn", ["||"]))
);

rules.set("ConditionalExpression", () =>
  Diagram(
    Sequence(
      NT("LogicalORExpression"),
      Optional(Sequence(T("?"), NT("AssignmentExpression"), T(":"), NT("AssignmentExpression")))
    )
  )
);

rules.set("ConditionalExpressionNoIn", () =>
  Diagram(
    Sequence(
      NT("LogicalORExpressionNoIn"),
      Optional(Sequence(T("?"), NT("AssignmentExpressionNoIn"), T(":"), NT("AssignmentExpressionNoIn")))
    )
  )
);

rules.set("AssignmentExpression", () =>
  Diagram(
    Choice(0,
      NT("ConditionalExpression"),
      Sequence(NT("LeftHandSideExpression"), NT("AssignmentOperator"), NT("AssignmentExpression"))
    )
  )
);

rules.set("AssignmentExpressionNoIn", () =>
  Diagram(
    Choice(0,
      NT("ConditionalExpressionNoIn"),
      Sequence(NT("LeftHandSideExpression"), NT("AssignmentOperator"), NT("AssignmentExpressionNoIn"))
    )
  )
);

rules.set("AssignmentOperator", () =>
  Diagram(
    Choice(0,
      T("="), T("*="), T("/="), T("%="), T("+="), T("-="),
      T("<<="), T(">>="), T(">>>="), T("&="), T("^="), T("|=")
    )
  )
);

rules.set("Expression", () =>
  Diagram(
    Sequence(
      NT("AssignmentExpression"),
      ZeroOrMore(Sequence(T(","), NT("AssignmentExpression")))
    )
  )
);

rules.set("ExpressionNoIn", () =>
  Diagram(
    Sequence(
      NT("AssignmentExpressionNoIn"),
      ZeroOrMore(Sequence(T(","), NT("AssignmentExpressionNoIn")))
    )
  )
);

// ===== §12 Statements =====

rules.set("Statement", () =>
  Diagram(
    Choice(0,
      NT("Block"),
      NT("VariableStatement"),
      NT("EmptyStatement"),
      NT("ExpressionStatement"),
      NT("IfStatement"),
      NT("IterationStatement"),
      NT("ContinueStatement"),
      NT("BreakStatement"),
      NT("ReturnStatement"),
      NT("WithStatement"),
      NT("LabelledStatement"),
      NT("SwitchStatement"),
      NT("ThrowStatement"),
      NT("TryStatement"),
      NT("DebuggerStatement")
    )
  )
);

rules.set("Block", () =>
  Diagram(
    Sequence(T("{"), Optional(NT("StatementList")), T("}"))
  )
);

rules.set("StatementList", () =>
  Diagram(OneOrMore(NT("Statement")))
);

rules.set("VariableStatement", () =>
  Diagram(
    Sequence(T("var"), NT("VariableDeclarationList"), T(";"))
  )
);

rules.set("VariableDeclarationList", () =>
  Diagram(
    Sequence(
      NT("VariableDeclaration"),
      ZeroOrMore(Sequence(T(","), NT("VariableDeclaration")))
    )
  )
);

rules.set("VariableDeclarationListNoIn", () =>
  Diagram(
    Sequence(
      NT("VariableDeclarationNoIn"),
      ZeroOrMore(Sequence(T(","), NT("VariableDeclarationNoIn")))
    )
  )
);

rules.set("VariableDeclaration", () =>
  Diagram(
    Sequence(NT("Identifier"), Optional(NT("Initialiser")))
  )
);

rules.set("VariableDeclarationNoIn", () =>
  Diagram(
    Sequence(NT("Identifier"), Optional(NT("InitialiserNoIn")))
  )
);

rules.set("Initialiser", () =>
  Diagram(
    Sequence(T("="), NT("AssignmentExpression"))
  )
);

rules.set("InitialiserNoIn", () =>
  Diagram(
    Sequence(T("="), NT("AssignmentExpressionNoIn"))
  )
);

rules.set("EmptyStatement", () =>
  Diagram(T(";"))
);

rules.set("ExpressionStatement", () =>
  Diagram(
    Sequence(
      Sequence(NT("Expression"), Comment("lookahead ∉ { or function")),
      T(";")
    )
  )
);

rules.set("IfStatement", () =>
  Diagram(
    Choice(0,
      Sequence(T("if"), T("("), NT("Expression"), T(")"), NT("Statement"), T("else"), NT("Statement")),
      Sequence(T("if"), T("("), NT("Expression"), T(")"), NT("Statement"))
    )
  )
);

rules.set("IterationStatement", () =>
  Diagram(
    Choice(0,
      Sequence(T("do"), NT("Statement"), T("while"), T("("), NT("Expression"), T(")"), T(";")),
      Sequence(T("while"), T("("), NT("Expression"), T(")"), NT("Statement")),
      Sequence(T("for"), T("("), Optional(NT("ExpressionNoIn")), T(";"), Optional(NT("Expression")), T(";"), Optional(NT("Expression")), T(")"), NT("Statement")),
      Sequence(T("for"), T("("), T("var"), NT("VariableDeclarationListNoIn"), T(";"), Optional(NT("Expression")), T(";"), Optional(NT("Expression")), T(")"), NT("Statement")),
      Sequence(T("for"), T("("), NT("LeftHandSideExpression"), T("in"), NT("Expression"), T(")"), NT("Statement")),
      Sequence(T("for"), T("("), T("var"), NT("VariableDeclarationNoIn"), T("in"), NT("Expression"), T(")"), NT("Statement"))
    )
  )
);

rules.set("ContinueStatement", () =>
  Diagram(
    Choice(0,
      Sequence(T("continue"), T(";")),
      Sequence(T("continue"), Comment("no LineTerminator"), NT("Identifier"), T(";"))
    )
  )
);

rules.set("BreakStatement", () =>
  Diagram(
    Choice(0,
      Sequence(T("break"), T(";")),
      Sequence(T("break"), Comment("no LineTerminator"), NT("Identifier"), T(";"))
    )
  )
);

rules.set("ReturnStatement", () =>
  Diagram(
    Choice(0,
      Sequence(T("return"), T(";")),
      Sequence(T("return"), Comment("no LineTerminator"), NT("Expression"), T(";"))
    )
  )
);

rules.set("WithStatement", () =>
  Diagram(
    Sequence(T("with"), T("("), NT("Expression"), T(")"), NT("Statement"))
  )
);

rules.set("SwitchStatement", () =>
  Diagram(
    Sequence(T("switch"), T("("), NT("Expression"), T(")"), NT("CaseBlock"))
  )
);

rules.set("CaseBlock", () =>
  Diagram(
    Choice(0,
      Sequence(T("{"), Optional(NT("CaseClauses")), T("}")),
      Sequence(T("{"), Optional(NT("CaseClauses")), NT("DefaultClause"), Optional(NT("CaseClauses")), T("}"))
    )
  )
);

rules.set("CaseClauses", () =>
  Diagram(OneOrMore(NT("CaseClause")))
);

rules.set("CaseClause", () =>
  Diagram(
    Sequence(T("case"), NT("Expression"), T(":"), Optional(NT("StatementList")))
  )
);

rules.set("DefaultClause", () =>
  Diagram(
    Sequence(T("default"), T(":"), Optional(NT("StatementList")))
  )
);

rules.set("LabelledStatement", () =>
  Diagram(
    Sequence(NT("Identifier"), T(":"), NT("Statement"))
  )
);

rules.set("ThrowStatement", () =>
  Diagram(
    Sequence(T("throw"), Comment("no LineTerminator"), NT("Expression"), T(";"))
  )
);

rules.set("TryStatement", () =>
  Diagram(
    Choice(0,
      Sequence(T("try"), NT("Block"), NT("Catch")),
      Sequence(T("try"), NT("Block"), NT("Finally")),
      Sequence(T("try"), NT("Block"), NT("Catch"), NT("Finally"))
    )
  )
);

rules.set("Catch", () =>
  Diagram(
    Sequence(T("catch"), T("("), NT("Identifier"), T(")"), NT("Block"))
  )
);

rules.set("Finally", () =>
  Diagram(
    Sequence(T("finally"), NT("Block"))
  )
);

rules.set("DebuggerStatement", () =>
  Diagram(Sequence(T("debugger"), T(";")))
);

// ===== §13 Function Definition =====

rules.set("FunctionDeclaration", () =>
  Diagram(
    Sequence(
      T("function"),
      NT("Identifier"),
      T("("),
      Optional(NT("FormalParameterList")),
      T(")"),
      T("{"),
      NT("FunctionBody"),
      T("}")
    )
  )
);

rules.set("FunctionExpression", () =>
  Diagram(
    Sequence(
      T("function"),
      Optional(NT("Identifier")),
      T("("),
      Optional(NT("FormalParameterList")),
      T(")"),
      T("{"),
      NT("FunctionBody"),
      T("}")
    )
  )
);

rules.set("FormalParameterList", () =>
  Diagram(
    Sequence(
      NT("Identifier"),
      ZeroOrMore(Sequence(T(","), NT("Identifier")))
    )
  )
);

rules.set("FunctionBody", () =>
  Diagram(Optional(NT("SourceElements")))
);

// ===== §14 Program =====

rules.set("Program", () =>
  Diagram(Optional(NT("SourceElements")))
);

rules.set("SourceElements", () =>
  Diagram(OneOrMore(NT("SourceElement")))
);

rules.set("SourceElement", () =>
  Diagram(
    Choice(0,
      NT("Statement"),
      NT("FunctionDeclaration")
    )
  )
);

// --- React/TS integration exports --------------------------------------------

export type SectionId = "source" | "lexical" | "identifiers" | "punctuators" | "literals" | "strings" | "regex" | "expressions" | "statements" | "functions" | "program";
export type RuleName = string;

export const SECTION_ORDER: SectionId[] = [
  "source",
  "lexical",
  "identifiers",
  "punctuators",
  "literals",
  "strings",
  "regex",
  "expressions",
  "statements",
  "functions",
  "program"
];

export const SECTION_TITLES: Record<SectionId, string> = {
  source: "§6 Source Text",
  lexical: "§7 Lexical Conventions",
  identifiers: "§7.6 Identifiers",
  punctuators: "§7.7 Punctuators",
  literals: "§7.8 Literals (Numeric)",
  strings: "§7.8.4 String Literals",
  regex: "§7.8.5 Regular Expression Literals",
  expressions: "§11 Expressions",
  statements: "§12 Statements",
  functions: "§13 Function Definition",
  program: "§14 Program"
};

export const SECTION_RULES: Record<SectionId, RuleName[]> = {
  "source": [
    "SourceCharacter"
  ],
  "lexical": [
    "InputElementDiv",
    "InputElementRegExp",
    "WhiteSpace",
    "LineTerminator",
    "LineTerminatorSequence",
    "Comment",
    "MultiLineComment",
    "MultiLineCommentChars",
    "PostAsteriskCommentChars",
    "MultiLineNotAsteriskChar",
    "MultiLineNotForwardSlashOrAsteriskChar",
    "SingleLineComment",
    "SingleLineCommentChars",
    "SingleLineCommentChar",
    "Token"
  ],
  "identifiers": [
    "Identifier",
    "IdentifierName",
    "IdentifierStart",
    "IdentifierPart",
    "UnicodeLetter",
    "UnicodeCombiningMark",
    "UnicodeDigit",
    "UnicodeConnectorPunctuation",
    "ReservedWord",
    "Keyword",
    "FutureReservedWord"
  ],
  "punctuators": [
    "Punctuator",
    "DivPunctuator"
  ],
  "literals": [
    "Literal",
    "NullLiteral",
    "BooleanLiteral",
    "NumericLiteral",
    "DecimalLiteral",
    "DecimalIntegerLiteral",
    "DecimalDigits",
    "DecimalDigit",
    "NonZeroDigit",
    "ExponentPart",
    "ExponentIndicator",
    "SignedInteger",
    "HexIntegerLiteral",
    "HexDigit"
  ],
  "strings": [
    "StringLiteral",
    "DoubleStringCharacters",
    "SingleStringCharacters",
    "DoubleStringCharacter",
    "SingleStringCharacter",
    "LineContinuation",
    "EscapeSequence",
    "CharacterEscapeSequence",
    "SingleEscapeCharacter",
    "NonEscapeCharacter",
    "EscapeCharacter",
    "HexEscapeSequence",
    "UnicodeEscapeSequence"
  ],
  "regex": [
    "RegularExpressionLiteral",
    "RegularExpressionBody",
    "RegularExpressionChars",
    "RegularExpressionFirstChar",
    "RegularExpressionChar",
    "RegularExpressionBackslashSequence",
    "RegularExpressionNonTerminator",
    "RegularExpressionClass",
    "RegularExpressionClassChars",
    "RegularExpressionClassChar",
    "RegularExpressionFlags"
  ],
  "expressions": [
    "PrimaryExpression",
    "ArrayLiteral",
    "ElementList",
    "Elision",
    "ObjectLiteral",
    "PropertyNameAndValueList",
    "PropertyAssignment",
    "PropertyName",
    "PropertySetParameterList",
    "MemberExpression",
    "NewExpression",
    "CallExpression",
    "Arguments",
    "ArgumentList",
    "LeftHandSideExpression",
    "PostfixExpression",
    "UnaryExpression",
    "MultiplicativeExpression",
    "AdditiveExpression",
    "ShiftExpression",
    "RelationalExpression",
    "RelationalExpressionNoIn",
    "EqualityExpression",
    "EqualityExpressionNoIn",
    "BitwiseANDExpression",
    "BitwiseANDExpressionNoIn",
    "BitwiseXORExpression",
    "BitwiseXORExpressionNoIn",
    "BitwiseORExpression",
    "BitwiseORExpressionNoIn",
    "LogicalANDExpression",
    "LogicalANDExpressionNoIn",
    "LogicalORExpression",
    "LogicalORExpressionNoIn",
    "ConditionalExpression",
    "ConditionalExpressionNoIn",
    "AssignmentExpression",
    "AssignmentExpressionNoIn",
    "AssignmentOperator",
    "Expression",
    "ExpressionNoIn"
  ],
  "statements": [
    "Statement",
    "Block",
    "StatementList",
    "VariableStatement",
    "VariableDeclarationList",
    "VariableDeclarationListNoIn",
    "VariableDeclaration",
    "VariableDeclarationNoIn",
    "Initialiser",
    "InitialiserNoIn",
    "EmptyStatement",
    "ExpressionStatement",
    "IfStatement",
    "IterationStatement",
    "ContinueStatement",
    "BreakStatement",
    "ReturnStatement",
    "WithStatement",
    "SwitchStatement",
    "CaseBlock",
    "CaseClauses",
    "CaseClause",
    "DefaultClause",
    "LabelledStatement",
    "ThrowStatement",
    "TryStatement",
    "Catch",
    "Finally",
    "DebuggerStatement"
  ],
  "functions": [
    "FunctionDeclaration",
    "FunctionExpression",
    "FormalParameterList",
    "FunctionBody"
  ],
  "program": [
    "Program",
    "SourceElements",
    "SourceElement"
  ]
};

// Expose safe accessors for React UI.
export function getRuleFactory(name: RuleName): (() => any) | undefined {
  return rules.get(name);
}

export function createRuleDiagram(name: RuleName): any {
  const factory = rules.get(name);
  if (!factory) {
    return Diagram(Comment(`No factory defined for ${name}`));
  }
  return factory();
}
