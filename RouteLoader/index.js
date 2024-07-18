let GuiScreen = Java.type("net.minecraft.client.gui.GuiScreen");
let settings = JSON.parse(FileLib.read("RouteLoader", "settings.json"));
let route = [];
let index = 0;
let validColors = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];

function helpMessage() {
    ChatLib.chat("\n" + settings.chatColor + "[RouteLoader] &7Help" +
                 "\n\n" + settings.chatColor + "Command Prefix&7: &a/routeloader &7or &a/rl" +
                 "\n&aload&7: " + settings.chatColor + "Loads &7route from " + settings.chatColor + "clipboard&7." +
                 "\n&asave [filename]&7:" + settings.chatColor + "Saves &7route to " + settings.chatColor + "file&7." +
                 "\n&aload [filename]&7: " + settings.chatColor + "Loads &7route from " + settings.chatColor + "file&7." +
                 "\n&aunload&7: " + settings.chatColor + "Unloads &7route." +
                 "\n&anumbers&7: &7Toggles route " + settings.chatColor + "index visibility&7." +
                 "\n&awidth [x]&7: Sets " + settings.chatColor + "line width &7(any integer between 1 and 16)" + 
                 "\n&achatcolor [x]&7: Sets RouterLoader's " + settings.chatColor + "message color &7(any 1 digit hexadecimal)" + 
                 "\n&astyle&7: " + settings.chatColor + "Cycles &7render style between " + settings.chatColor + "all points &7and an " + settings.chatColor + "ordered sequence&7." +
                 "\n&aback&7: &7Moves pointer " + settings.chatColor + "back one &7index." +
                 "\n&anext&7: &7Moves pointer " + settings.chatColor + "forward one &7index." +
                 "\n&ajumpto [x]&7: &7Moves pointer to the " + settings.chatColor + "x&7th " + settings.chatColor + "index &7(starting from 1)." +
                 "\n\n" + settings.chatColor + "Quick Tips&7:" +
                 "\n&7Routes must be an " + settings.chatColor + "array &7in a " + settings.chatColor + "JSON &7format." +
                 "\n&7Each " + settings.chatColor + "object &7in the array must at least have an " + settings.chatColor + "x&7, " + settings.chatColor + "y&7, and " + settings.chatColor + "z &7value." +
                 "\n&7View the routes in " + settings.chatColor + "ChatTriggers/modules/RouteLoader/routes&7, accessible using " + settings.chatColor + "/ct files&7." +
                 "\n" + settings.chatColor + "RouteLoader &7is better than ColeWeight&7.");
}

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
            ChatLib.chat(settings.chatColor + "[RouteLoader] &aRoute Complete");
            index = 0;
        } else {
            index++;
        }
    }
}).setFps(4);

register("command", (action, arg) => {
    if (!action) {
        helpMessage();
        return;
    }
    switch (action.toLowerCase()) {
        case "load":
            if (!arg) {
                route = JSON.parse(GuiScreen.func_146277_j());
                ChatLib.chat(settings.chatColor + "[RouteLoader] &7Route Loaded From Clipboard");
            } else {
                if (FileLib.exists("RouteLoader", "routes/" + arg + ".json")) {
                    route = JSON.parse(FileLib.read("RouteLoader", "routes/" + arg + ".json"));
                    ChatLib.chat(settings.chatColor + "[RouteLoader] &7Route Loaded From " + arg);
                } else {
                    ChatLib.chat(settings.chatColor + "[RouteLoader] &7File Doesn't Exist");
                }
            }
            index = 0;
            renders.register();
            iupdater.register();
            break;
        case "unload":
            ChatLib.chat(settings.chatColor + "[RouteLoader] &7Route Unloaded");
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
            FileLib.write("RouteLoader", "routes/" + arg + ".json", GuiScreen.func_146277_j(), true);
            ChatLib.chat(settings.chatColor + "[RouteLoader] &7Route Saved To " + arg);
            break;
        case "delete":
            FileLib.delete("RouteLoader", "routes/" + arg + ".json");
            ChatLib.chat(settings.chatColor + "[RouteLoader] &7Deleted Route " + arg);
        case "jumpto":
            index = arg - 1;
            break;
        case "style":
            if (settings.style == 1) {
                settings.style = 2;
                ChatLib.chat(settings.chatColor + "[RouteLoader] &7Style Switched To Sequence");
            } else if (settings.style == 2) {
                settings.style = 1;
                ChatLib.chat(settings.chatColor + "[RouteLoader] &7Style Switched To All");
            }
            FileLib.write("RouteLoader", "settings.json", JSON.stringify(settings), true);
            break;
        case "numbers":
            if (settings.numbers) {
                settings.numbers = false;
                ChatLib.chat(settings.chatColor + "[RouteLoader] &7Toggled Numbers OFF");
            } else {
                settings.numbers = true;
                ChatLib.chat(settings.chatColor + "[RouteLoader] &7Toggled Numbers ON");
            }
            FileLib.write("RouteLoader", "settings.json", JSON.stringify(settings), true);
            break;
        case "width":
            if (isNaN(arg)) {
                ChatLib.chat(settings.chatColor + "[RouteLoader] &7Width should be a number.");
            } else {
                settings.width = Math.min(Math.max(Math.round(parseFloat(arg)), 1), 16);
                FileLib.write("RouteLoader", "settings.json", JSON.stringify(settings), true);
                ChatLib.chat(settings.chatColor + "[RouteLoader] &7Width set to " + settings.width + ".");
            }
            break;
        case "chatcolor":
                if (validColors.includes(arg.toLowerCase())) {
                    settings.chatColor = "&" + arg;
                    ChatLib.chat(settings.chatColor + "[RouteLoader] &7Color has been changed.");
                    FileLib.write("RouteLoader", "settings.json", JSON.stringify(settings), true);
                } else {
                    ChatLib.chat(settings.chatColor + "[RouteLoader] &7Not a one digit hexadecimal.");
                }
                break;
        default:
            helpMessage();
    }
}).setName("routeloader").setAliases("rl");
