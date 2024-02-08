import { gotScraping } from 'got-scraping';



const channels = {};

export const getChannel = (channelName) => new Promise(async (resolve, reject) => {
	channelName = channelName.toLowerCase();

	if(channelName in channels){

		resolve(channels[channelName]);

	} else {
		gotScraping.get(`https://kick.com/api/v2/channels/${channelName}`)
			.then(({ body }) => {

				try{
					const channel = JSON.parse(body);

					if(channel && channel.chatroom){
						channels[channelName] = channel;

						resolve(channel);
						return;
					}
				} catch (error) {
					//
				}

				reject(new Error(`Could not get kick-channel '${channelName}'`));

			}).catch(reject);
	}
});