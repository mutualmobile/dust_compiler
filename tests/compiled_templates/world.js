(function(){dust.register("world",body_0);function body_0(chk,ctx){return chk.section(ctx.get("person"),ctx,{"block":body_1},null);}function body_1(chk,ctx){return chk.reference(ctx.get("root"),ctx,"h").write(": ").reference(ctx.get("name"),ctx,"h").write(", ").reference(ctx.get("age"),ctx,"h");}return body_0;})();