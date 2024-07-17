let GuiScreen = Java.type("net.minecraft.client.gui.GuiScreen");
let settings = JSON.parse(FileLib.read("RouteLoader", "settings.json"));
let route = [];
let index = 0;
let helpMessage = "\n&d[RouteLoader] &7Help" +
                  "\n\n&dCommand Prefix&7: &a/routeloader &7or &a/rl" +
                  "\n&aload&7: &dLoads &7route from &dclipboard&7." +
                  "\n&asave [filename]&7: &dSaves &7route to &dfile&7." +
                  "\n&aload [filename]&7: &dLoads &7route from &dfile&7." +
                  "\n&aunload&7: &dUnloads &7route." +
                  "\n&anumbers&7: &7Toggles route &dindex visibility&7." +
                  "\n&awidth [x]&7: Sets line width (any integer between 1 and 16)" + 
                  "\n&astyle&7: &dCycles &7render style between &dall points &7and an &dordered sequence&7." +
                  "\n&aback&7: &7Moves pointer &dback one &7index." +
                  "\n&anext&7: &7Moves pointer &dforward one &7index." +
                  "\n&ajumpto [x]&7: &7Moves pointer to the &dx&7th &dindex &7(starting from 1)." +
                  "\n\n&dImportant Things To Remember&7:" +
                  "\n&d1. &7Routes must be an &darray &7in a &dJSON &7format." +
                  "\n&d2. &7Each &dobject &7in the array must at least have an &dx&7, &dy&7, and &dz &7value." +
                  "\n&d3. &7Access the routes folder in &dChatTriggers/modules/RouteLoader/routes&7, accessible using &d/ct files&7."

function drawLine(x1, y1, z1, x2, y2, z2, red, green, blue, alpha, phase, lineWidth) {
    GlStateManager.func_179094_E();
    GL11.glLineWidth(lineWidth);
    GL11.glDisable(GL11.GL_CULL_FACE);
    GL11.glEnable(GL11.GL_BLEND);
    GL11.glBlendFunc(770, 771);
    GL11.glDisable(GL11.GL_TEXTURE_2D);
    GL11.glDepthMask(false);
    if (phase) GL11.glDisable(GL11.GL_DEPTH_TEST);
    Tessellator.begin(3).colorize(red, green, blue, alpha).pos(x1, y1, z1).pos(x2, y2, z2).draw();
    GL11.glEnable(GL11.GL_CULL_FACE);
    GL11.glDisable(GL11.GL_BLEND);
    GL11.glDepthMask(true);
    GL11.glEnable(GL11.GL_TEXTURE_2D);
    if (phase) GL11.glEnable(GL11.GL_DEPTH_TEST);
    GlStateManager.func_179121_F();
};

let renders = register("renderWorld", () => {
    if (settings.style == 1) {
        if (settings.numbers) Tessellator.drawString(1, route[0].x, route[0].y, route[0].z, 16777215, true, 1, true);
        for (let i = 1; i < route.length; i++) {
            if (settings.numbers) Tessellator.drawString(i + 1, route[i].x, route[i].y, route[i].z, 16777215, true, 1, true);
            drawLine(route[i - 1].x, route[i - 1].y, route[i - 1].z, route[i].x, route[i].y, route[i].z, 0.2, 0.92, 0.55, 1, true, settings.width);
        }
    } else {
        let cam = Client.camera;
        let yoffset = 1.62;
        if (Player.isSneaking()) yoffset -= 0.08;
        drawLine(cam.getX(), cam.getY() + yoffset, cam.getZ(), route[index].x, route[index].y, route[index].z, 0.2, 0.92, 0.55, 1, true, settings.width);
        if (settings.numbers) Tessellator.drawString(index + 1, route[index].x, route[index].y, route[index].z, 16777215, true, 1, true);
    }
});

let iupdater = register("step", () => {
    let target = route[index];
    if (Math.abs(Player.x - target.x) < 3 && Math.abs(Player.y - target.y) < 3 && Math.abs(Player.z - target.z) < 3) {
        if (index + 1 == route.length) {
            loaded = false;
            ChatLib.chat("&d[RouteLoader] &aRoute Complete");
        } else {
            index++;
        }
    }
}).setFps(4);

register("command", (action, arg) => {
    if (!action) {
        ChatLib.chat(helpMessage);
        return;
    }
    switch (action.toLowerCase()) {
        case "load":
            if (!arg) {
                route = JSON.parse(GuiScreen.func_146277_j());
                ChatLib.chat("&d[RouteLoader] &7Route Loaded From Clipboard");
            } else {
                if (FileLib.exists("RouteLoader", "routes/" + arg + ".json")) {
                    route = JSON.parse(FileLib.read("RouteLoader", "routes/" + arg + ".json"));
                    ChatLib.chat("&d[RouteLoader] &7Route Loaded From " + arg);
                } else {
                    ChatLib.chat("&d[RouteLoader] &7File Doesn't Exist");
                }
            }
            index = 0;
            renders.register();
            iupdater.register();
            break;
        case "unload":
            ChatLib.chat("&d[RouteLoader] &7Route Unloaded");
            renders.unregister();
            iupdater.unregister();
            break;
        case "next":
            index++;
            break;
        case "back":
            index--;
            break;
        case "save":
            if (FileLib.exists("RouteLoader", "routes/" + arg + ".json")) FileLib.delete("RouteLoader", "routes/" + arg + ".json");
            FileLib.write("RouteLoader", "routes/" + arg + ".json", GuiScreen.func_146277_j(), true);
            ChatLib.chat("&d[RouteLoader] &7Route Saved To " + arg);
            break;
        case "delete":
            FileLib.delete("RouteLoader", "routes/" + arg + ".json");
            ChatLib.chat("&d[RouteLoader] &7Deleted Route " + arg);
        case "jumpto":
            index = arg - 1;
            break;
        case "style":
            if (settings.style == 1) {
                settings.style = 2;
                ChatLib.chat("&d[RouteLoader] &7Style Switched To Sequence");
            } else if (settings.style == 2) {
                settings.style = 1;
                ChatLib.chat("&d[RouteLoader] &7Style Switched To All");
            }
            FileLib.write("RouteLoader", "settings.json", JSON.stringify(settings), true);
            break;
        case "numbers":
            if (settings.numbers) {
                settings.numbers = false;
                ChatLib.chat("&d[RouteLoader] &7Toggled Numbers OFF");
            } else {
                settings.numbers = true;
                ChatLib.chat("&d[RouteLoader] &7Toggled Numbers ON");
            }
            FileLib.write("RouteLoader", "settings.json", JSON.stringify(settings), true);
            break;
        case "width":
            if (isNaN(arg)) {
                ChatLib.chat("&d[RouteLoader] &7Width should be a number.");
            } else {
                settings.width = Math.min(Math.max(Math.round(parseFloat(arg)), 1), 16);
                FileLib.write("RouteLoader", "settings.json", JSON.stringify(settings), true);
                ChatLib.chat("&d[RouteLoader] &7Width set to " + settings.width + ".");
            }
            break;
        default:
            ChatLib.chat(helpMessage);
    }
}).setName("routeloader").setAliases("rl");
