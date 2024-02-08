import EventEmitter from 'events';
import WebSocket from "isomorphic-ws";
import KickEvents from "./KickEvents.js";
import {getChannel} from "./Api/KickApi.js";

class KickSocket extends EventEmitter{

	_ws;

	_channel = null;

	constructor() {
		super();

		this._ws = new WebSocket(`wss://ws-us2.pusher.com/app/eb1d5f283081a78b932c?protocol=7&client=js&version=7.6.0&flash=false`);

		this._registerEventListeners();
	}

	_registerEventListeners(){
		// this.getWebSocket().onopen = (data) => this.emit('connect', data);

		this.getWebSocket().onclose = (data) => this.emit('disconnect', data);

		this.getWebSocket().onmessage = (data) => this._handleMessage(data.data);
	}

	_handleMessage(event){
		try{
			event = JSON.parse(event);
			if(typeof event.data === 'string'){
				event.data = JSON.parse(event.data);
			}
			this.emit('data', event);

			const eventName = (event.event in KickEvents)? KickEvents[event.event] : null;
			if(eventName){
				this.emit(eventName, event.data, event);
			}
		} catch (error) {
			this.emit('data', event);
		}
	}



	getWebSocket() {
		return this._ws;
	}

	getChannel() {
		return this._channel;
	}

	subscribeChannel(channelName){
		return new Promise(async (resolve, reject) => {
			const channel = await getChannel(channelName).catch(reject);
			this._channel = channel;

			this.once('error', reject);
			this.once('subscription', () => resolve(channel));
			this._subscribe(`chatrooms.${channel.chatroom.id}.v2`);
		});
	}

	disconnect(){
		this.getWebSocket().close();
	}

	_subscribe(channel){
		this.getWebSocket().send(
			JSON.stringify({
				event: 'pusher:subscribe',
				data: { auth: "", channel }
			})
		);
	}

}

export const createConnection = (channelName) => {
	return new Promise((resolve, reject) => {
		try{
			const kickSocket = new KickSocket();

			kickSocket.once('error', reject);
			kickSocket.once('connect', async () => {
				await kickSocket.subscribeChannel(channelName).catch(reject);
				resolve(kickSocket);
			});
		} catch (error) {
			reject(error);
		}
	});
}