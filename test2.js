const fs = require('fs');
const { Readable, PassThrough } = require('stream');
const { Client, GatewayIntentBits } = require('discord.js');
const ytdl = require('ytdl-core');


const { processAudio } = require('./audio_processing_setup');
const { runPythonScript } = require('./run_python');
const { play_audio } = require('./voice-commands');

const Discord = require('discord.js');
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  createDiscordJSAdapter,
  EndBehaviorType,
  NoSubscriberBehavior,
  StreamType,
} = require('@discordjs/voice');
const opus = require('@discordjs/opus');
const Prism = require('prism-media');
const AudioMixer = require('audio-mixer');




//const client = new Discord.Client();

const client = new Client({
  intents: Object.values(GatewayIntentBits).filter(Number.isInteger) // ALL Intents
});

// Noiseless stream of audio to send when the bot joins a voice channel
class Silence extends Readable {
  _read() {
    this.push(Buffer.from([0xF8, 0xFF, 0xFE]));
  }
}

const config = JSON.parse(fs.readFileSync('config.json'));

client.on('ready', () => {
  console.log(`Up and running.`);
});

client.on('messageCreate', async (ctx) => {
  if (!ctx.content.startsWith(config.prefix)) return;

  const command = ctx.content.slice(config.prefix.length).split(' ');

  switch (command[0]) {
    case 'join':
      console.log('join');
      client.on('debug', console.log);
      if (ctx.member.voice.channelId) {
        const channel = await client.channels.fetch(ctx.member.voice.channelId);

        const connection = await joinVoiceChannel({
          channelId: channel.id,
          guildId: channel.guild.id,
          adapterCreator: channel.guild.voiceAdapterCreator,
          selfMute: false,
          selfDeaf: false,
        });

        console.log('connection');

        // Create an AudioPlayer instance and play the Silence stream
        const player = createAudioPlayer({
          behaviors: { noSubscriber: NoSubscriberBehavior.Play },
        });
        connection.subscribe(player);
        
        const silenceResource = createAudioResource(new Silence(), { inputType: StreamType.Opus });
        player.play(silenceResource);


        console.log('y');

        ctx.channel.send("I'm listening.. My hotword is **bumblebee**.");
        console.log('x');

        const mixer = new AudioMixer.Mixer({
          channels: 2,
          bitDepth: 16,
          sampleRate: 48000,
          clearInterval: 250,
        });

        connection.receiver.speaking.on('start', (userId) => {
          const standaloneInput = new AudioMixer.Input({
            channels: 2,
            bitDepth: 16,
            sampleRate: 48000,
            volume: 100,
          });
          const audioMixer = mixer;
          audioMixer.addInput(standaloneInput);
          const audio = connection.receiver.subscribe(userId, {
            end: { behavior: EndBehaviorType.AfterSilence },
          });
          const rawStream = new PassThrough();
          audio.pipe(new Prism.opus.Decoder({ rate: 48000, channels: 2, frameSize: 960 })).pipe(rawStream);
          const p = rawStream.pipe(standaloneInput);

          audio.on('end', () => {
            console.log('Stream ended.');
            audio.unpipe(rawStream);
          });

          const resource = createAudioResource(audioMixer, {
            inputType: StreamType.Raw,
          });
          player.play(resource)
        });
      }
      break;
  }
});

client.login(config.token);
