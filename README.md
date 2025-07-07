# Command4Sign
<img src="https://github.com/user-attachments/assets/7ae00df0-9ce3-4aa3-be2e-fb1c1d4684ea" width="1920" height="auto" />


## About
If you are a bit in to command on both Java and Bedrock you probably know that Java allows players to modifier signs with commands but Bedrock players for some reason don't. This addon makes it possible!

# Useige
So it's pretty straight forward just type:
```mcfunction
/edit <x y z> <text>
```
> Just make sure to replace "x y z" with the actual coordinates and "text" well with your text

# Installation
> [!CAUTION]
> Only use this Addon with the following Minecraft versions:
> - v.1.21.90
> - v.1.21.91
> - v.1.21.92
> - v.1.21.93

1. **Download** the latest release for your Minecraft version from [here](https://github.com/TheFelixLive/Command4Sign/releases/latest).
2. **Open** the `.mcpack` or `.mcaddon` file with Minecraft.
3. **Create** a new world OR **edit** an existing world
---
4. **Navigate to**: Behavior packs.
5. **Click on** "Available"
6. **Activate** the Addon
---
7. **Navigate to**: **Experiments**.
8. **Activate** `Beta APIs`
---
9. `Play` or `Create` your World

# Multiple Menu
This add-on supports multiple menus. But what does that actually mean?
If you have at least two add-ons and want to open the menu, they will be displayed simultaneously. With multiple menu, the add-ons can communicate with each other, and only one menu will open. Just look for this icon: <img src="https://github.com/user-attachments/assets/d0c80d7c-e80b-41b1-934b-ee1dfc58d611" width="20" height="auto" />

![Minecraft 07 07 2025 14_29_26](https://github.com/user-attachments/assets/ab0a4f52-1f36-4758-b444-f440b154c365)

> Was captured while the Timer and Command2Hard were active

<details>
<summary>Implication in your addon</summary>
<p>If you want you can copy this code to your own addon to implement the Multiple Menu System. I do my best to describe what function have to be when called.</p>

<pre><code>
/* ─────────────────────────────────────────────────────────
This code is part of the Multiple Menu System by TheFelixLive:
─────────────────────────────────────────────────────────*/

// MUST CHAGE: Addon informations
let addon_name = "My new Addon"
let addon_uuid = 41bc0f18-edc3-427a-a5a8-36dede25df56 // Doesn't have to be a UUID, it just has to be unique
let addon_texture_path = "textures/ui/hardcore/heart"

let main_menu = (player) => {
   your_menu(player); // This function is called when your addon is selected
}

// Make sure that multiple_menu(player) is called by your addon! If multiple_menu isn't enabled, it will automatically open your menu.


// Required models
import { system, world } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui"

// Status
let system_privileges = 2

/* This variable contains the status (or permissions) of your add-on:
2 means the system is not active (no other packs founded);
1 means the system is acting as a host;
0 means the system is acting as a client;
*/



/*------------------------
 Client (an addon only needs to have the client function to be recognizable)
-------------------------*/

system.afterEvents.scriptEventReceive.subscribe(event=> {
   let player = event.sourceEntity

   // Sends the addon information to the host
   if (event.id === "multiple_menu:initialize") {
      world.scoreboard.getObjective("multiple_menu_name").setScore(addon_uuid + "_" + addon_name, 1);
      world.scoreboard.getObjective("multiple_menu_icon").setScore(addon_uuid + "_" + addon_texture_path, 1);
      if (system_privileges == 2) system_privileges = 0;
   }

   // Host Only (which is why system_privileges == 1): Opens the multiple menu, is called by other addons as a back button
   if (event.id === "multiple_menu:open_main" && system_privileges == 1) {
      multiple_menu(player);
   }

   // Will open the main menu of your addon
   if (event.id === "multiple_menu:open_"+addon_uuid) {
      main_menu(player);
   }
})


/*------------------------
 Host
-------------------------*/

let addon_name, addon_id, addon_icon; // When initialized properly, it contains the data of all supported add-ons

system.run(() => {
   initialize_multiple_menu()
});

async function initialize_multiple_menu() {
   // This fallback ensures that even if multiple add-ons could act as host, only one of them will be used as the host.
   try {
      world.scoreboard.addObjective("multiple_menu_name");
      world.scoreboard.addObjective("multiple_menu_icon");
      console.log("Multiple Menu: Initializing Host");
      system_privileges = 1;
   } catch (e) {
      console.log("Multiple Menu: Already Initialized");
      return -1;
   }

   // Requests addon informations. Look into the Client
   world.getDimension("overworld").runCommand("scriptevent multiple_menu:initialize");

   await system.waitTicks(2);
   console.log("Multiple Menu: successfully initialized as Host");

   // Evaluation of the add-on information
   const participants = world.scoreboard.getObjective("multiple_menu_name").getParticipants();
   addon_id = participants.map(p => p.displayName.split("_")[0]);
   addon_name = participants.map(p => p.displayName.split("_").slice(1).join("_"));
   addon_icon = world.scoreboard.getObjective("multiple_menu_icon").getParticipants().map(p => p.displayName.split("_").slice(1).join("_"));

   if (addon_id.length == 1) {
      console.log("Multiple Menu: no other plugin found");
      system_privileges = 2;
   }

   world.scoreboard.removeObjective("multiple_menu_name")
   world.scoreboard.removeObjective("multiple_menu_icon")
}

/*------------------------
 Host Only: Menu
-------------------------*/

function multiple_menu(player) {
   // Skips the multiple_menu
   if (system_privileges == 2) return main_menu(player);

   let form = new ActionFormData();
   let actions = [];

   form.title("Multiple menu v.1.0");
   form.body("Select an addon to open it's menu");

   // Adds every Addon as a button
   addon_name.forEach((name, index) => {
      form.button(name, addon_icon[index]);

      actions.push(() => {
         player.runCommand("scriptevent multiple_menu:open_"+ addon_id[index]);
      });
   });

   form.show(player).then((response) => {
      if (response.selection == undefined ) {
         return -1
      }

      if (actions[response.selection]) {
         actions[response.selection]();
      }
   });
}

</code></pre>

</details>




# License & Attribution
This project is licensed under the [MIT License](./LICENSE).

### Attribution Requirements
1. **Social Media Reviews:**
   - If you share reviews, screenshots, videos, or posts about this project on social media what I would preshade, please include:
     - the project name: **Command4Sign**
     - the official download link: `https://github.com/TheFelixLive/Command4Sign`
     - the creator: **TheFelixLive**

2. **Using Code in Your Own Projects:**
   - You are allowed to use code snippets from this repository in your own projects under the following conditions:
     - The copied code does **not** make up the **majority** of your project.
     - The reused code must be **clearly marked** with a comment in your code, for example:
        ```
        /* ─────────────────────────────────────────────────────────
           This code is part of Command4Sign by TheFelixLive:
           https://github.com/TheFelixLive/Command4Sign
        ─────────────────────────────────────────────────────────*/
        ```

> Thank you for respecting the license terms and supporting this project!