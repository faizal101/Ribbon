/*
 *   This file is part of Ribbon
 *   Copyright (C) 2017-2018 Favna
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, version 3 of the License
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License
 *   along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 *   Additional Terms 7.b and 7.c of GPLv3 apply to this file:
 *       * Requiring preservation of specified reasonable legal notices or
 *         author attributions in that material or in the Appropriate Legal
 *         Notices displayed by works containing it.
 *       * Prohibiting misrepresentation of the origin of that material,
 *         or requiring that modified versions of such material be marked in
 *         reasonable ways as different from the original version.
 */

/**
 * @file Leaderboards RocketLeagueCommand - Shows Rocket League Leaderboard      
 * **Aliases**: `rlstats`, `rocketstats`
 * @module
 * @category leaderboards
 * @name rocketleague
 * @example rocketleague
 * @returns {MessageEmbed} Top 10 ranking players by their amount of wins
 */

const request = require('snekfetch'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {rocketleagueapikey} = require('../../auth.json'),
  {stripIndents} = require('common-tags'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../util.js');

module.exports = class RocketLeagueCommand extends Command {
  constructor (client) {
    super(client, {
      'name': 'rocketleague',
      'memberName': 'rocketleague',
      'group': 'leaderboards',
      'aliases': ['rlstats'],
      'description': 'Shows Rocket League Leaderboard',
      'format': 'BattleTag',
      'examples': ['rocketleague'],
      'guildOnly': false,
      'ownerOnly': true,
      'throttling': {
        'usages': 2,
        'duration': 3
      }
    });
  }

  async run (msg) {
    startTyping(msg);

    try {
      const rocketData = await request.get('https://api.rocketleaguestats.com/v1/leaderboard/stat')
          .set('Authorization', rocketleagueapikey)
          .query('type', 'goals'),
        rocketEmbed = new MessageEmbed(),
        rocketEngine = {
          'names': rocketData.body.map(n => n.displayName).slice(0, 10),
          'wins': rocketData.body.map(w => w.stats.wins).slice(0, 10),
          'mvps': rocketData.body.map(m => m.stats.mvps).slice(0, 10),
          'saves': rocketData.body.map(sa => sa.stats.saves).slice(0, 10),
          'goals': rocketData.body.map(g => g.stats.goals).slice(0, 10),
          'shots': rocketData.body.map(sh => sh.stats.shots).slice(0, 10),
          'assists': rocketData.body.map(a => a.stats.assists).slice(0, 10)
        };

      for (const rank in rocketEngine.names) {
        rocketEmbed.addField(`${parseInt(rank, 10) + 1}: ${rocketEngine.names[rank]}`, stripIndents`
          **Wins**:${rocketEngine.wins[rank]}
          **MVPS**:${rocketEngine.mvps[rank]}
          **Saves**:${rocketEngine.saves[rank]}
          **Goals**:${rocketEngine.goals[rank]}
          **Shots**:${rocketEngine.shots[rank]}
          **Assists**:${rocketEngine.assists[rank]}
          `, true);
      }

      rocketEmbed
        .setTitle('Rocket League Top 10 Players')
        .setDescription('based on goals made by player')
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
        .setThumbnail('https://favna.xyz/images/ribbonhost/rocketleague.png');

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(rocketEmbed);
    } catch (err) {
      console.error(err);
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply('something went wrong while getting Rocket League leaderboard. Try again later');
    }
  }
};