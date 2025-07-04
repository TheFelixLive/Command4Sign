import { system, CommandPermissionLevel, CustomCommandParamType, CustomCommandStatus, BlockComponentTypes, world } from "@minecraft/server"
import { ActionFormData  } from "@minecraft/server-ui"


const version_info = {
  name: "Command4Sign",
  version: "v.1.0.0",
  build: "B002",
  release_type: 2, // 0 = Development version (with debug); 1 = Beta version; 2 = Stable version
  unix: 1751634911,
  update_message_period_unix: 15897600, // Normally 6 months = 15897600
  changelog: {
    // new_features
    new_features: [

    ],
    // general_changes
    general_changes: [

    ],
    // bug_fixes
    bug_fixes: [

    ]
  }
}

const links = [
  {name: "§l§5Github:§r", link: "github.com/TheFelixLive/Command4Sign"},
  {name: "§l§8Curseforge:§r", link: "curseforge.com/projects/1299249"},
  {name: "§l§aMcpedl:§r", link: "mcpedl.com/com4sign"}
]

console.log("Hello from " + version_info.name + " - "+version_info.version+" ("+version_info.build+") - Further debugging is "+ (version_info.release_type == 0? "enabled" : "disabled" ) + " by the version")

world.afterEvents.playerSpawn.subscribe((eventData) => {
    let { player } = eventData;

    if (version_info.release_type !== 2) {
      player.sendMessage("§l§7[§fSystem§7]§r "+ player.name +" how is your experiences with "+ version_info.version +"? Does it meet your expectations? Would you like to change something and if so, what? Do you have a suggestion for a new feature? Share it at §l"+links[0].link)
      player.playSound("random.pop")
    }

    // Update popup
    if (!world.getDynamicProperty("com4sign:update_message_unix" || JSON.parse(world.getDynamicProperty("com4sign:update_message_unix")).version !== version_info.version)) {
      world.setDynamicProperty("com4sign:update_message_unix", JSON.stringify({unix: version_info.unix + version_info.update_message_period_unix, version: version_info.version}));
    }

    print(world.getDynamicProperty("com4sign:update_message_unix"))

    if ((Math.floor(Date.now() / 1000)) > (JSON.parse(world.getDynamicProperty("com4sign:update_message_unix")).unix)) {
      let form = new ActionFormData();
      form.title("Update time!");
      form.body("Your current version (" + version_info.version + ") is older than 6 months.\nThere MIGHT be a newer version out. Feel free to update to enjoy the latest features!\n\nCheck out: §7"+links[0].link);
      form.button("Mute");

      const showForm = async () => {
        form.show(player).then((response) => {
          if (response.canceled && response.cancelationReason === "UserBusy") {
            showForm()
          } else {
            if (response.selection === 0) {
              world.setDynamicProperty("com4sign:update_message_unix", JSON.stringify({unix: (Math.floor(Date.now() / 1000)) + version_info.update_message_period_unix, version: version_info.version}));
            }
          }
        });
      };
      showForm();
    }
});

/*------------------------
 Command Registration
-------------------------*/

system.beforeEvents.startup.subscribe((init) => {
    const com_about_sytak = {
        name: "com4sign:about",
        description: "Opens a menu with information about the addon.",
        permissionLevel: CommandPermissionLevel.Any,
    };

    const com_edit_sytak = {
        name: "com4sign:edit",
        description: "Edit the text of a specific sign.",
        permissionLevel: CommandPermissionLevel.GameDirectors,
        mandatoryParameters: [
            { type: CustomCommandParamType.Location, name: "Location of the sign" },
            { type: CustomCommandParamType.String, name: "The text on the sign" }
        ],
    };

    init.customCommandRegistry.registerCommand(com_about_sytak, com_about);
    init.customCommandRegistry.registerCommand(com_edit_sytak, com_edit);
});

/*------------------------
  Custom Command Handler
-------------------------*/

function com_about(origin) {
    const player = origin.sourceEntity;

    system.run(() => {
      dictionary_about_version(player);
    });

    return {
        status: CustomCommandStatus.Success,
    };
}

function com_edit(origin, location, text) {
    const player = origin.sourceEntity;
    const dimension = player.dimension;
    const signBlock = dimension.getBlock({x: location.x, y:location.y, z:location.z});
    const signComponent = signBlock.getComponent(BlockComponentTypes.Sign);

    if (!signComponent) {
      player.sendMessage("§cThe block at "+Math.floor(location.x)+" "+ Math.floor(location.y) +" "+Math.floor(location.z)+" is not a sign.")
      return undefined
    }

    if (signComponent.isWaxed) {
      player.sendMessage("§cThe sign at "+Math.floor(location.x)+" "+ Math.floor(location.y) +" "+Math.floor(location.z)+" is waxed.")
      return undefined
    }


    if (signComponent.getText() == text) {
      player.sendMessage("§cThe sign at "+Math.floor(location.x)+" "+ Math.floor(location.y) +" "+Math.floor(location.z)+" shows already: " + text)
      return undefined
    }

    system.run(() => {
       signComponent.setText(text);
    });

    if (world.gameRules.sendCommandFeedback) {
      world.getAllPlayers().forEach((other_player) => {
        if (other_player === player) {
          player.sendMessage("Edit the sign at "+Math.floor(location.x)+" "+ Math.floor(location.y) +" "+Math.floor(location.z)+" to: " + text)
        } else {
          other_player.sendMessage("§7§o["+ player.name +": Edit the sign at "+Math.floor(location.x)+" "+ Math.floor(location.y) +" "+Math.floor(location.z)+" to: " + text+"]")
        }
      });
    }

    return {
        status: CustomCommandStatus.Success,
    };
}

/*------------------------
 general helper functions
-------------------------*/

function print(input) {
  if (version_info.release_type === 0) {
    console.log(version_info.name + " - " + input)
  }
}

function getRelativeTime(diff) {
  let seconds = diff;
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);
  let days = Math.floor(hours / 24);
  let months = Math.floor(days / 30);
  let years = Math.floor(days / 365);

  if (years > 0) {
    return `${years} year${years > 1 ? 's' : ''}`;
  }
  if (months > 0) {
    return `${months} month${months > 1 ? 's' : ''}`;
  }
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''}`;
  }
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  }
  return `a few seconds`;
}



function convertUnixToDate(unixSeconds, utcOffset) {
  const date = new Date(unixSeconds*1000);
  const localDate = new Date(date.getTime() + utcOffset * 60 * 60 * 1000);

  // Format the date (YYYY-MM-DD HH:MM:SS)
  const year = localDate.getUTCFullYear();
  const month = String(localDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(localDate.getUTCDate()).padStart(2, '0');
  const hours = String(localDate.getUTCHours()).padStart(2, '0');
  const minutes = String(localDate.getUTCMinutes()).padStart(2, '0');
  const seconds = String(localDate.getUTCSeconds()).padStart(2, '0');

  return {
    day: day,
    month: month,
    year: year,
    hours: hours,
    minutes: minutes,
    seconds: seconds,
    utcOffset: utcOffset
  };
}



/*------------------------
 Menus
-------------------------*/


function dictionary_about_version(player) {
  let form = new ActionFormData()
  let actions = []
  let build_date = convertUnixToDate(version_info.unix, 0);
  form.title("About")
  form.body(
    "Name: " + version_info.name + "\n" +
    "Version: " + version_info.version + ((Math.floor(Date.now() / 1000)) > (version_info.update_message_period_unix + version_info.unix)? " §a(update time)§r" : " (" + version_info.build + ")") + "\n" +
    "Release type: " + ["dev", "preview", "stable"][version_info.release_type] + "\n" +
    "Build date: " + getRelativeTime(Math.floor(Date.now() / 1000) - version_info.unix, player) +" ago"+

    "\n\n§7© "+ (build_date.year > 2025? "2025 - "+build_date.year : build_date.year )+" TheFelixLive. All rights reserved."
  )

  if (version_info.changelog.new_features.length > 0 || version_info.changelog.general_changes.length > 0 || version_info.changelog.bug_fixes.length > 0) {
    form.button("§9Changelog");
    actions.push(() => {
      dictionary_about_version_changelog(player, build_date)
    });
  }

  form.button("§3Contact");
  actions.push(() => {
    dictionary_contact(player, build_date)
  });

  form.show(player).then((response) => {
    if (response.selection == undefined ) {
      return -1
    }
    if (response.selection !== undefined && actions[response.selection]) {
      actions[response.selection]();
    }
  });
}

function dictionary_contact(player, build_date) {
  let form = new ActionFormData()
  let actions = []
  form.title("Contact")

  form.body("If you need want to report a bug, need help, or have suggestions to improvements to the project, you can reach me via these platforms:\n");

  for (const entry of links) {
    if (entry !== links[0]) form.divider()
    form.label(`${entry.name}\n${entry.link}`);
  }

  form.button("");
  actions.push(() => {
    dictionary_about_version(player, build_date)
  });

  form.show(player).then((response) => {
    if (response.selection == undefined ) {
      return -1
    }
    if (response.selection !== undefined && actions[response.selection]) {
      actions[response.selection]();
    }
  });
}

function dictionary_about_version_changelog(player, build_date) {
  let form = new ActionFormData()
  form.title("Changelog - "+version_info.version)

  const { new_features, general_changes, bug_fixes } = version_info.changelog;
  const hasNew     = new_features.length > 0;
  const hasGeneral = general_changes.length > 0;
  const hasBug     = bug_fixes.length > 0;

  // New Features
  if (hasNew) {
    form.label("§l§bNew Features§r\n");
    new_features.forEach(feature => form.label(`- ${feature}\n`));
    // only draw divider if there's another section after
    if (hasGeneral || hasBug) form.divider();
  }

  // General Changes
  if (hasGeneral) {
    form.label("§l§aGeneral Changes§r\n");
    general_changes.forEach(change => form.label(`- ${change}\n`));
    // only draw divider if Bug Fixes follow
    if (hasBug) form.divider();
  }

  // Bug Fixes
  if (hasBug) {
    form.label("§l§cBug Fixes§r\n");
    bug_fixes.forEach(fix => form.label(`- ${fix}\n`));
  }


  form.label(`§7As of `+ getRelativeTime(Math.floor(Date.now() / 1000) - version_info.unix) + " ago");

  form.button("");

  form.show(player).then((response) => {
    if (response.selection == undefined ) {
      return -1
    }
    if (response.selection == 0) {
      dictionary_about_version(player)
    }
  });
}