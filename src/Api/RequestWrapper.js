import { resolve } from 'import-meta-resolve';

const isNode = (typeof window === 'undefined');

let requester = null;
export const getRequester = async () => {
	if(requester === null){
		requester = isNode? (await import(resolve('got-scraping', import.meta.url))).gotScraping : (await import(resolve('axios', import.meta.url))).default();
	}
	return requester;
}

export const get = async () => (await getRequester()).get;
export const post = async () => (await getRequester()).post;